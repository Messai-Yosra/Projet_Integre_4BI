from app.models import User
from app.extensions import db

class UserService:
    @staticmethod
    def get_all_users():
        users = User.query.all()
        return [user.to_dict() for user in users]

    @staticmethod
    def get_user_by_id(user_id):
        user = db.session.get(User, user_id)
        return user.to_dict() if user else None

    @staticmethod
    def create_user(data):
        if User.query.filter_by(username=data['username']).first():
            raise ValueError("Username already exists")
        if User.query.filter_by(email=data['email']).first():
            raise ValueError("Email already exists")

        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            role_id=data['role_id']
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()
        return user.to_dict()

    @staticmethod
    def update_user(user_id, data):
        user = db.session.get(User, user_id)
        if not user:
            return None

        new_email = data.get('email', user.email)
        if new_email != user.email and User.query.filter_by(email=new_email).first():
            raise ValueError("Email already exists")

        user.email = new_email
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.role_id = data.get('role_id', user.role_id)
        user.is_active = data.get('is_active', user.is_active)

        if 'password' in data and data['password']:
            user.set_password(data['password'])

        db.session.commit()
        return user.to_dict()

    @staticmethod
    def delete_user(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return False

        db.session.delete(user)
        db.session.commit()
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
