from app.extensions import db
from datetime import datetime
import json


class OnboardingProgress(db.Model):
    __tablename__ = 'onboarding_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'),
                        unique=True, nullable=False)
    current_step = db.Column(db.Integer, default=0)
    completed_steps_json = db.Column(db.Text, default='[]')
    is_completed = db.Column(db.Boolean, default=False)
    is_dismissed = db.Column(db.Boolean, default=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    user = db.relationship('User', back_populates='onboarding')

    @property
    def completed_steps(self):
        try:
            return json.loads(self.completed_steps_json or '[]')
        except Exception:
            return []

    @completed_steps.setter
    def completed_steps(self, value):
        self.completed_steps_json = json.dumps(value)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'current_step': self.current_step,
            'completed_steps': self.completed_steps,
            'is_completed': self.is_completed,
            'is_dismissed': self.is_dismissed,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
