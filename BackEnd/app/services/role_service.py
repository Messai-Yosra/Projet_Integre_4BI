from app.models import Role
from app.extensions import db

class RoleService:
    @staticmethod
    def get_all_roles():
        roles = Role.query.all()
        return [role.to_dict() for role in roles]
    
    @staticmethod
    def get_role_by_id(role_id):
        role = db.session.get(Role, role_id)
        return role.to_dict() if role else None
    
    @staticmethod
    def create_role(data):
        role = Role(
            name=data['name'],
            description=data.get('description')
        )
        
        db.session.add(role)
        db.session.commit()
        return role.to_dict()
