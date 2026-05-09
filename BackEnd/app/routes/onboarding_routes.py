from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.onboarding_progress import OnboardingProgress
from app.extensions import db
from datetime import datetime

bp = Blueprint('onboarding', __name__, url_prefix='/api/onboarding')


@bp.route('/progress', methods=['GET'])
@jwt_required()
def get_progress():
    user_id = int(get_jwt_identity())
    progress = OnboardingProgress.query.filter_by(user_id=user_id).first()
    if not progress:
        return jsonify(None), 200
    return jsonify(progress.to_dict()), 200


@bp.route('/progress', methods=['PUT'])
@jwt_required()
def update_progress():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    progress = OnboardingProgress.query.filter_by(user_id=user_id).first()
    if not progress:
        progress = OnboardingProgress(user_id=user_id)
        db.session.add(progress)

    if 'current_step' in data:
        progress.current_step = data['current_step']
    if 'completed_steps' in data:
        progress.completed_steps = data['completed_steps']
    if 'is_dismissed' in data:
        progress.is_dismissed = data['is_dismissed']
    if data.get('is_completed'):
        progress.is_completed = True
        progress.completed_at = datetime.utcnow()

    db.session.commit()
    return jsonify(progress.to_dict()), 200
