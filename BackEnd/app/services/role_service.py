from app.models import Role, User, DashboardPermission, Dashboard
from app.extensions import db


class RoleService:
    @staticmethod
    def get_all_roles():
        roles = Role.query.all()
        result = []
        for role in roles:
            r = role.to_dict()
            r['member_count'] = User.query.filter_by(role_id=role.id).count()
            perms = DashboardPermission.query.filter_by(role_id=role.id, can_view=True).all()
            r['dashboard_permissions'] = [
                {
                    'dashboard_id': p.dashboard_id,
                    'dashboard_name': p.dashboard.name if p.dashboard else None,
                    'dashboard_slug': p.dashboard.slug if p.dashboard else None,
                    'can_view': p.can_view
                }
                for p in perms
            ]
            result.append(r)
        return result

    @staticmethod
    def get_role_by_id(role_id):
        role = db.session.get(Role, role_id)
        if not role:
            return None
        r = role.to_dict()
        r['member_count'] = User.query.filter_by(role_id=role.id).count()
        perms = DashboardPermission.query.filter_by(role_id=role.id, can_view=True).all()
        r['dashboard_permissions'] = [
            {
                'dashboard_id': p.dashboard_id,
                'dashboard_name': p.dashboard.name if p.dashboard else None,
                'dashboard_slug': p.dashboard.slug if p.dashboard else None,
                'can_view': p.can_view
            }
            for p in perms
        ]
        members = User.query.filter_by(role_id=role.id).all()
        r['members'] = [u.to_dict() for u in members]
        return r

    @staticmethod
    def create_role(data):
        if Role.query.filter_by(name=data['name']).first():
            raise ValueError('Role name already exists')
        role = Role(name=data['name'], description=data.get('description'))
        db.session.add(role)
        db.session.commit()
        return role.to_dict()

    @staticmethod
    def update_role(role_id, data):
        role = db.session.get(Role, role_id)
        if not role:
            return None
        if 'name' in data and data['name'] != role.name:
            if Role.query.filter_by(name=data['name']).first():
                raise ValueError('Role name already exists')
            role.name = data['name']
        if 'description' in data:
            role.description = data['description']
        db.session.commit()
        return role.to_dict()

    @staticmethod
    def delete_role(role_id):
        role = db.session.get(Role, role_id)
        if not role:
            return False, 'Role not found'
        if User.query.filter_by(role_id=role_id).count() > 0:
            return False, 'Cannot delete a role that has members'
        DashboardPermission.query.filter_by(role_id=role_id).delete()
        db.session.delete(role)
        db.session.commit()
        return True, None

    @staticmethod
    def add_permission(role_id, dashboard_id):
        from app.services.notification_service import NotificationService
        role = db.session.get(Role, role_id)
        dashboard = db.session.get(Dashboard, dashboard_id)
        if not role or not dashboard:
            return None

        existing = DashboardPermission.query.filter_by(
            role_id=role_id, dashboard_id=dashboard_id
        ).first()
        if existing:
            if not existing.can_view:
                existing.can_view = True
                db.session.commit()
            return existing.to_dict()

        perm = DashboardPermission(role_id=role_id, dashboard_id=dashboard_id, can_view=True)
        db.session.add(perm)
        db.session.commit()

        # Notify all users with this role
        users = User.query.filter_by(role_id=role_id, is_active=True).all()
        for user in users:
            NotificationService.notify_privilege_granted(user, dashboard.name)

        return perm.to_dict()

    @staticmethod
    def remove_permission(role_id, dashboard_id):
        from app.services.notification_service import NotificationService
        perm = DashboardPermission.query.filter_by(
            role_id=role_id, dashboard_id=dashboard_id
        ).first()
        if not perm:
            return False

        dashboard = db.session.get(Dashboard, dashboard_id)
        dashboard_name = dashboard.name if dashboard else 'Tableau de bord'

        db.session.delete(perm)
        db.session.commit()

        users = User.query.filter_by(role_id=role_id, is_active=True).all()
        for user in users:
            NotificationService.notify_privilege_revoked(user, dashboard_name)

        return True
