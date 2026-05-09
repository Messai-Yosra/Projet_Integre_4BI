from app.extensions import db
from datetime import datetime


class Dashboard(db.Model):
    __tablename__ = 'dashboards'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))
    order_index = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    embed_url = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    permissions = db.relationship('DashboardPermission', back_populates='dashboard',
                                  lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'icon': self.icon,
            'order_index': self.order_index,
            'is_active': self.is_active,
            'embed_url': self.embed_url or '',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
