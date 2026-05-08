from app.models import User
from app.extensions import db
from flask_jwt_extended import create_access_token, create_refresh_token

class AuthService:
    @staticmethod
    def login(username, password):
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return None, "Invalid credentials"
        
        if not user.is_active:
            return None, "Account is inactive"
        
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, None
    
    @staticmethod
    def register(data):
        if User.query.filter_by(username=data['username']).first():
            return None, "Username already exists"
        
        if User.query.filter_by(email=data['email']).first():
            return None, "Email already exists"
        
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
        
        return user.to_dict(), None
