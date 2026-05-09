from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.dashboard_service import DashboardService
from app.middleware.decorators import admin_required

bp = Blueprint('dashboards', __name__, url_prefix='/api/dashboards')


@bp.route('', methods=['GET'])
@jwt_required()
def get_dashboards():
    """Admin view: all dashboards including inactive."""
    from app.models import User
    from app.extensions import db
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if user and user.role and user.role.name == 'Admin':
        return jsonify(DashboardService.get_all_dashboards()), 200
    return jsonify(DashboardService.get_active_dashboards()), 200


@bp.route('/my-dashboards', methods=['GET'])
@jwt_required()
def get_my_dashboards():
    user_id = int(get_jwt_identity())
    return jsonify(DashboardService.get_user_dashboards(user_id)), 200


@bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_dashboard():
    data = request.get_json()
    required_fields = ['name', 'slug']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    actor_id = int(get_jwt_identity())
    dashboard = DashboardService.create_dashboard(data, actor_id=actor_id,
                                                  ip_address=request.remote_addr)
    return jsonify(dashboard), 201


@bp.route('/<int:dashboard_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_dashboard(dashboard_id):
    data = request.get_json()
    actor_id = int(get_jwt_identity())
    dashboard = DashboardService.update_dashboard(dashboard_id, data, actor_id=actor_id,
                                                  ip_address=request.remote_addr)
    if not dashboard:
        return jsonify({'error': 'Dashboard not found'}), 404
    return jsonify(dashboard), 200


@bp.route('/<int:dashboard_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_dashboard(dashboard_id):
    actor_id = int(get_jwt_identity())
    success = DashboardService.delete_dashboard(dashboard_id, actor_id=actor_id,
                                                ip_address=request.remote_addr)
    if not success:
        return jsonify({'error': 'Dashboard not found'}), 404
    return jsonify({'message': 'Dashboard deleted'}), 200
