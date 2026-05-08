from app.extensions import db
from datetime import datetime

class DashboardPermission(db.Model):
    __tablename__ = 'dashboard_permissions'
    
    id = db.Column(db.Integer, primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    dashboard_id = db.Column(db.Integer, db.ForeignKey('dashboards.id'), nullable=False)
    can_view = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    role = db.relationship('Role', back_populates='dashboard_permissions')
    dashboard = db.relationship('Dashboard', back_populates='permissions')
    
    __table_args__ = (db.UniqueConstraint('role_id', 'dashboard_id', name='unique_role_dashboard'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'role_id': self.role_id,
            'dashboard_id': self.dashboard_id,
            'can_view': self.can_view,
            'dashboard': self.dashboard.to_dict() if self.dashboard else None
        }
