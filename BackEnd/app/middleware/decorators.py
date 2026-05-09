from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.extensions import db


def admin_required(f):
    """Restrict endpoint to Admin role only."""
    @wraps(f)
    def decorated(*args, **kwargs):
        from app.models import User
        user_id = int(get_jwt_identity())
        user = db.session.get(User, user_id)
        if not user or not user.role or user.role.name != 'Admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated


def active_user_required(f):
    """Reject requests from deactivated accounts."""
    @wraps(f)
    def decorated(*args, **kwargs):
        from app.models import User
        user_id = int(get_jwt_identity())
        user = db.session.get(User, user_id)
        if not user or not user.is_active:
            return jsonify({'error': 'Account is inactive'}), 403
        return f(*args, **kwargs)
    return decorated
