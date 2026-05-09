import os
from werkzeug.utils import secure_filename
from app.models import User
from app.extensions import db
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def _allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


class UserService:
    @staticmethod
    def get_all_users():
        users = User.query.order_by(User.created_at.desc()).all()
        return [user.to_dict() for user in users]

    @staticmethod
    def get_user_by_id(user_id):
        user = db.session.get(User, user_id)
        return user.to_dict() if user else None

    @staticmethod
    def create_user(data, actor_id=None, ip_address=None):
        if User.query.filter_by(username=data['username']).first():
            raise ValueError('Username already exists')
        if User.query.filter_by(email=data['email']).first():
            raise ValueError('Email already exists')

        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            role_id=data['role_id'],
            is_active=data.get('is_active', True)
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()

        NotificationService.notify_welcome(user)

        # Send welcome email (non-blocking)
        try:
            from app.services.email_service import EmailService
            EmailService.send_welcome(user.email, user.first_name, user.username, data['password'])
        except Exception:
            pass

        AuditService.log(actor_id, 'create_user', 'user', user.id,
                         f'Created user {user.username}', ip_address)

        return user.to_dict()

    @staticmethod
    def update_user(user_id, data, actor_id=None, ip_address=None):
        user = db.session.get(User, user_id)
        if not user:
            return None

        new_email = data.get('email', user.email)
        if new_email != user.email and User.query.filter_by(email=new_email).first():
            raise ValueError('Email already exists')

        old_role_id = user.role_id
        user.email = new_email
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.role_id = data.get('role_id', user.role_id)
        user.is_active = data.get('is_active', user.is_active)

        if 'password' in data and data['password']:
            user.set_password(data['password'])

        db.session.commit()

        # Notify on role change
        if old_role_id != user.role_id:
            from app.models import Role
            old_role = db.session.get(Role, old_role_id)
            new_role = db.session.get(Role, user.role_id)
            if old_role and new_role:
                NotificationService.notify_role_change(
                    user, old_role.name, new_role.name
                )

        AuditService.log(actor_id, 'update_user', 'user', user_id,
                         f'Updated user {user.username}', ip_address)

        return user.to_dict()

    @staticmethod
    def delete_user(user_id, actor_id=None, ip_address=None):
        user = db.session.get(User, user_id)
        if not user:
            return False
        username = user.username
        db.session.delete(user)
        db.session.commit()
        AuditService.log(actor_id, 'delete_user', 'user', user_id,
                         f'Deleted user {username}', ip_address)
        return True

    @staticmethod
    def change_password(user_id, current_password, new_password):
        user = db.session.get(User, user_id)
        if not user:
            return False
        if not user.check_password(current_password):
            return False
        user.set_password(new_password)
        db.session.commit()
        return True

    @staticmethod
    def save_profile_image(user_id, file, upload_folder):
        user = db.session.get(User, user_id)
        if not user:
            return None, 'User not found'

        if not _allowed_file(file.filename):
            return None, 'File type not allowed'

        os.makedirs(upload_folder, exist_ok=True)

        # Remove old image if present
        if user.profile_image:
            old_path = os.path.join(upload_folder, os.path.basename(user.profile_image))
            if os.path.exists(old_path):
                os.remove(old_path)

        filename = secure_filename(f'user_{user_id}_{file.filename}')
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        user.profile_image = f'/uploads/{filename}'
        db.session.commit()
        return user.profile_image, None
