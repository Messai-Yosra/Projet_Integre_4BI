from app.models import Dashboard, DashboardPermission, User
from app.extensions import db

class DashboardService:
    @staticmethod
    def get_all_dashboards():
        dashboards = Dashboard.query.filter_by(is_active=True).order_by(Dashboard.order_index).all()
        return [dashboard.to_dict() for dashboard in dashboards]
    
    @staticmethod
    def get_user_dashboards(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return []
        
        permissions = DashboardPermission.query.filter_by(
            role_id=user.role_id,
            can_view=True
        ).all()
        
        dashboards = [perm.dashboard.to_dict() for perm in permissions if perm.dashboard.is_active]
        return sorted(dashboards, key=lambda x: x['order_index'])
    
    @staticmethod
    def create_dashboard(data):
        dashboard = Dashboard(
            name=data['name'],
            slug=data['slug'],
            description=data.get('description'),
            icon=data.get('icon'),
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(dashboard)
        db.session.commit()
        return dashboard.to_dict()
    
    @staticmethod
    def update_dashboard(dashboard_id, data):
        dashboard = db.session.get(Dashboard, dashboard_id)
        if not dashboard:
            return None
        
        dashboard.name = data.get('name', dashboard.name)
        dashboard.description = data.get('description', dashboard.description)
        dashboard.icon = data.get('icon', dashboard.icon)
        dashboard.order_index = data.get('order_index', dashboard.order_index)
        dashboard.is_active = data.get('is_active', dashboard.is_active)
        
        db.session.commit()
        return dashboard.to_dict()
