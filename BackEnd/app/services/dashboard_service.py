from app.models import Dashboard, DashboardPermission, User
from app.extensions import db
from app.services.audit_service import AuditService


class DashboardService:
    @staticmethod
    def get_all_dashboards():
        dashboards = Dashboard.query.order_by(Dashboard.order_index).all()
        return [d.to_dict() for d in dashboards]

    @staticmethod
    def get_active_dashboards():
        dashboards = Dashboard.query.filter_by(is_active=True).order_by(Dashboard.order_index).all()
        return [d.to_dict() for d in dashboards]

    @staticmethod
    def get_user_dashboards(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return []
        permissions = DashboardPermission.query.filter_by(
            role_id=user.role_id, can_view=True
        ).all()
        dashboards = [p.dashboard.to_dict() for p in permissions if p.dashboard and p.dashboard.is_active]
        return sorted(dashboards, key=lambda x: x['order_index'])

    @staticmethod
    def create_dashboard(data, actor_id=None, ip_address=None):
        dashboard = Dashboard(
            name=data['name'],
            slug=data['slug'],
            description=data.get('description'),
            icon=data.get('icon'),
            order_index=data.get('order_index', 0),
            embed_url=data.get('embed_url', '')
        )
        db.session.add(dashboard)
        db.session.commit()

        AuditService.log(actor_id, 'create_dashboard', 'dashboard', dashboard.id,
                         f'Created dashboard {dashboard.name}', ip_address)
        return dashboard.to_dict()

    @staticmethod
    def update_dashboard(dashboard_id, data, actor_id=None, ip_address=None):
        dashboard = db.session.get(Dashboard, dashboard_id)
        if not dashboard:
            return None

        dashboard.name = data.get('name', dashboard.name)
        dashboard.slug = data.get('slug', dashboard.slug)
        dashboard.description = data.get('description', dashboard.description)
        dashboard.icon = data.get('icon', dashboard.icon)
        dashboard.order_index = data.get('order_index', dashboard.order_index)
        dashboard.is_active = data.get('is_active', dashboard.is_active)
        dashboard.embed_url = data.get('embed_url', dashboard.embed_url)

        db.session.commit()
        AuditService.log(actor_id, 'update_dashboard', 'dashboard', dashboard_id,
                         f'Updated dashboard {dashboard.name}', ip_address)
        return dashboard.to_dict()

    @staticmethod
    def delete_dashboard(dashboard_id, actor_id=None, ip_address=None):
        dashboard = db.session.get(Dashboard, dashboard_id)
        if not dashboard:
            return False
        name = dashboard.name
        db.session.delete(dashboard)
        db.session.commit()
        AuditService.log(actor_id, 'delete_dashboard', 'dashboard', dashboard_id,
                         f'Deleted dashboard {name}', ip_address)
        return True
