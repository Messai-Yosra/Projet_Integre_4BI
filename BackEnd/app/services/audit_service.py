from app.extensions import db
from app.models.audit_log import AuditLog
from datetime import datetime


class AuditService:
    @staticmethod
    def log(user_id, action, resource=None, resource_id=None, details=None, ip_address=None):
        try:
            entry = AuditLog(
                user_id=user_id,
                action=action,
                resource=resource,
                resource_id=resource_id,
                details=details,
                ip_address=ip_address,
                created_at=datetime.utcnow()
            )
            db.session.add(entry)
            db.session.commit()
        except Exception as e:
            # Audit failures must never break the main request
            db.session.rollback()
            print(f'[AuditService] Failed to log action: {e}')

    @staticmethod
    def get_recent(limit=50):
        entries = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(limit).all()
        return [e.to_dict() for e in entries]
