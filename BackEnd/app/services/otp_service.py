from app.extensions import db
from app.models.otp_token import OtpToken
from app.models.user import User
from app.services.email_service import EmailService
from datetime import datetime


class OtpService:

    @staticmethod
    def request_password_reset(email):
        """Generate OTP and send to email. Returns (success, message)."""
        user = User.query.filter_by(email=email).first()
        if not user:
            # Return success-looking response to prevent email enumeration
            return True, 'Si cet email existe, un code a été envoyé.'

        if not user.is_active:
            return False, 'Compte désactivé.'

        # Invalidate previous unused OTPs for this email
        OtpToken.query.filter_by(
            email=email, purpose='password_reset', is_used=False
        ).update({'is_used': True})
        db.session.commit()

        otp = OtpToken.generate(email, purpose='password_reset')
        db.session.add(otp)
        db.session.commit()

        try:
            EmailService.send_otp(email, otp.token, purpose='password_reset')
        except Exception as e:
            return False, f'Erreur envoi email : {e}'

        return True, 'Code OTP envoyé.'

    @staticmethod
    def verify_otp(email, token, purpose='password_reset'):
        """Verify OTP. Returns (reset_token | None, message)."""
        otp = OtpToken.query.filter_by(
            email=email, token=token, purpose=purpose, is_used=False
        ).order_by(OtpToken.created_at.desc()).first()

        if not otp or not otp.is_valid():
            return None, 'Code invalide ou expiré.'

        otp.is_verified = True
        db.session.commit()
        return otp.reset_token, 'Code vérifié.'

    @staticmethod
    def reset_password(email, reset_token, new_password):
        """Reset password using the verified reset_token. Returns (success, message)."""
        otp = OtpToken.query.filter_by(
            email=email, reset_token=reset_token, purpose='password_reset',
            is_verified=True, is_used=False
        ).first()

        if not otp or not otp.is_valid():
            return False, 'Session de réinitialisation expirée. Recommencez.'

        user = User.query.filter_by(email=email).first()
        if not user:
            return False, 'Utilisateur introuvable.'

        user.set_password(new_password)
        otp.is_used = True
        db.session.commit()
        return True, 'Mot de passe réinitialisé avec succès.'

    @staticmethod
    def request_email_change(user_id, new_email):
        """Send OTP to new_email for email change verification."""
        existing = User.query.filter_by(email=new_email).first()
        if existing:
            return False, 'Cet email est déjà utilisé.'

        OtpToken.query.filter_by(
            email=new_email, purpose='email_change', is_used=False
        ).update({'is_used': True})
        db.session.commit()

        otp = OtpToken.generate(new_email, purpose='email_change')
        db.session.add(otp)
        db.session.commit()

        try:
            EmailService.send_otp(new_email, otp.token, purpose='email_change')
        except Exception as e:
            return False, f'Erreur envoi email : {e}'

        return True, 'Code OTP envoyé au nouvel email.'

    @staticmethod
    def confirm_email_change(user_id, new_email, token):
        """Verify OTP and update user email."""
        otp = OtpToken.query.filter_by(
            email=new_email, token=token, purpose='email_change', is_used=False
        ).order_by(OtpToken.created_at.desc()).first()

        if not otp or not otp.is_valid():
            return False, 'Code invalide ou expiré.'

        user = db.session.get(User, user_id)
        if not user:
            return False, 'Utilisateur introuvable.'

        user.email = new_email
        otp.is_used = True
        db.session.commit()
        return True, 'Email mis à jour avec succès.'
