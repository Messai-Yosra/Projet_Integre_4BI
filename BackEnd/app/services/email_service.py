import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class EmailService:

    @staticmethod
    def _get_config():
        from app.models.smtp_config import SmtpConfig
        return SmtpConfig.query.filter_by(is_active=True).first()

    @staticmethod
    def send(to_email, subject, html_body, plain_body=None):
        config = EmailService._get_config()
        if not config:
            raise ValueError('No active SMTP configuration found.')

        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f'{config.from_name} <{config.from_email}>'
        msg['To'] = to_email

        if plain_body:
            msg.attach(MIMEText(plain_body, 'plain', 'utf-8'))
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))

        context = ssl.create_default_context()
        try:
            if config.use_tls:
                with smtplib.SMTP(config.host, config.port) as server:
                    server.ehlo()
                    server.starttls(context=context)
                    server.ehlo()
                    if config.username and config.password:
                        server.login(config.username, config.password)
                    server.sendmail(config.from_email, to_email, msg.as_string())
            else:
                with smtplib.SMTP(config.host, config.port) as server:
                    if config.username and config.password:
                        server.login(config.username, config.password)
                    server.sendmail(config.from_email, to_email, msg.as_string())
        except Exception as e:
            raise RuntimeError(f'Email send failed: {e}')

    @staticmethod
    def send_otp(to_email, otp_code, purpose='password_reset'):
        if purpose == 'password_reset':
            subject = 'AppPI – Code de vérification pour réinitialisation du mot de passe'
            html = f"""
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
                        background:#0f172a;color:#f1f5f9;border-radius:12px;">
              <div style="text-align:center;margin-bottom:24px;">
                <span style="font-size:2.5rem;">🎾</span>
                <h2 style="color:#667eea;margin:8px 0 0;">AppPI Padel</h2>
              </div>
              <h3 style="font-size:1.25rem;margin-bottom:8px;">Réinitialisation du mot de passe</h3>
              <p style="color:#cbd5e1;margin-bottom:24px;">
                Utilisez le code ci-dessous pour réinitialiser votre mot de passe.
                Ce code expire dans <strong>15 minutes</strong>.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <span style="display:inline-block;font-size:2.5rem;font-weight:800;
                             letter-spacing:12px;background:linear-gradient(135deg,#667eea,#764ba2);
                             -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                             padding:16px 32px;border:2px solid rgba(102,126,234,0.3);
                             border-radius:12px;">{otp_code}</span>
              </div>
              <p style="color:#94a3b8;font-size:0.85rem;text-align:center;">
                Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail.
              </p>
            </div>"""
        else:
            subject = 'AppPI – Code de vérification pour changement d\'email'
            html = f"""
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
                        background:#0f172a;color:#f1f5f9;border-radius:12px;">
              <h3 style="color:#667eea;">Vérification du nouvel email</h3>
              <p style="color:#cbd5e1;">Votre code de vérification :</p>
              <div style="text-align:center;margin:24px 0;">
                <span style="font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#667eea;">
                  {otp_code}
                </span>
              </div>
              <p style="color:#94a3b8;font-size:0.85rem;">Expire dans 15 minutes.</p>
            </div>"""
        EmailService.send(to_email, subject, html)

    @staticmethod
    def send_welcome(to_email, first_name, username, temp_password=None):
        subject = 'Bienvenue sur AppPI Padel Platform'
        pwd_line = f'<p>Mot de passe temporaire : <strong>{temp_password}</strong></p>' \
                   if temp_password else ''
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
                    background:#0f172a;color:#f1f5f9;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:2.5rem;">🎾</span>
            <h2 style="color:#667eea;">AppPI Padel</h2>
          </div>
          <h3>Bienvenue, {first_name or username} !</h3>
          <p style="color:#cbd5e1;">Votre compte a été créé avec succès.</p>
          <p>Nom d'utilisateur : <strong>{username}</strong></p>
          {pwd_line}
          <p style="color:#94a3b8;font-size:0.85rem;margin-top:24px;">
            Connectez-vous sur la plateforme et modifiez votre mot de passe dès que possible.
          </p>
        </div>"""
        try:
            EmailService.send(to_email, subject, html)
        except Exception:
            pass  # Welcome email is non-critical

    @staticmethod
    def send_test(to_email):
        subject = 'AppPI – Test de configuration SMTP'
        html = """
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
                    background:#0f172a;color:#f1f5f9;border-radius:12px;">
          <h3 style="color:#10b981;">✅ Configuration SMTP opérationnelle</h3>
          <p style="color:#cbd5e1;">
            Ce message confirme que votre serveur SMTP est correctement configuré
            dans AppPI Padel Platform.
          </p>
        </div>"""
        EmailService.send(to_email, subject, html)
