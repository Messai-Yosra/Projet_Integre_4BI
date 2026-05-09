from app.extensions import db
from datetime import datetime


class SmtpConfig(db.Model):
    __tablename__ = 'smtp_configs'

    id = db.Column(db.Integer, primary_key=True)
    host = db.Column(db.String(200), nullable=False)
    port = db.Column(db.Integer, default=587)
    use_tls = db.Column(db.Boolean, default=True)
    username = db.Column(db.String(200))
    password = db.Column(db.String(500))
    from_email = db.Column(db.String(200))
    from_name = db.Column(db.String(200), default='AppPI Padel')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, hide_password=True):
        return {
            'id': self.id,
            'host': self.host,
            'port': self.port,
            'use_tls': self.use_tls,
            'username': self.username,
            'password': '***' if hide_password and self.password else (self.password or ''),
            'from_email': self.from_email,
            'from_name': self.from_name,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
