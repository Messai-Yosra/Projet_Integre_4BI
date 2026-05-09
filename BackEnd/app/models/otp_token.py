from app.extensions import db
from datetime import datetime, timedelta
import random
import string


class OtpToken(db.Model):
    __tablename__ = 'otp_tokens'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    token = db.Column(db.String(6), nullable=False)
    reset_token = db.Column(db.String(64))  # returned after OTP verification for step-3 auth
    purpose = db.Column(db.String(50), default='password_reset')  # password_reset | email_change
    is_used = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @classmethod
    def generate(cls, email, purpose='password_reset'):
        token = ''.join(random.choices(string.digits, k=6))
        reset_token = ''.join(random.choices(string.ascii_letters + string.digits, k=64))
        expires_at = datetime.utcnow() + timedelta(minutes=15)
        return cls(email=email, token=token, reset_token=reset_token,
                   purpose=purpose, expires_at=expires_at)

    def is_valid(self):
        return not self.is_used and datetime.utcnow() < self.expires_at

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'purpose': self.purpose,
            'is_used': self.is_used,
            'is_verified': self.is_verified,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
