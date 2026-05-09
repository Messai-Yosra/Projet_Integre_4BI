from app.extensions import db
from app.models.notification import Notification


class NotificationService:

    @staticmethod
    def create(user_id, title, message=None, notif_type='info'):
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type
        )
        db.session.add(notif)
        db.session.commit()
        return notif.to_dict()

    @staticmethod
    def get_user_notifications(user_id, limit=30):
        notifs = (Notification.query
                  .filter_by(user_id=user_id)
                  .order_by(Notification.created_at.desc())
                  .limit(limit)
                  .all())
        unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
        return {
            'notifications': [n.to_dict() for n in notifs],
            'unread_count': unread_count
        }

    @staticmethod
    def mark_read(notification_id, user_id):
        notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
        if not notif:
            return False
        notif.is_read = True
        db.session.commit()
        return True

    @staticmethod
    def mark_all_read(user_id):
        Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
        db.session.commit()

    @staticmethod
    def notify_role_change(user, old_role_name, new_role_name):
        NotificationService.create(
            user.id,
            title='Rôle modifié',
            message=f'Votre rôle a été changé de « {old_role_name} » à « {new_role_name} ».',
            notif_type='info'
        )

    @staticmethod
    def notify_privilege_granted(user, dashboard_name):
        NotificationService.create(
            user.id,
            title='Accès accordé',
            message=f'Vous avez maintenant accès au tableau de bord « {dashboard_name} ».',
            notif_type='success'
        )

    @staticmethod
    def notify_privilege_revoked(user, dashboard_name):
        NotificationService.create(
            user.id,
            title='Accès révoqué',
            message=f'Votre accès au tableau de bord « {dashboard_name} » a été retiré.',
            notif_type='warning'
        )

    @staticmethod
    def notify_welcome(user):
        NotificationService.create(
            user.id,
            title='Bienvenue sur AppPI Padel !',
            message='Votre compte est prêt. Découvrez vos tableaux de bord.',
            notif_type='success'
        )
