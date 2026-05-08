from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.dashboard_service import DashboardService

bp = Blueprint('dashboards', __name__, url_prefix='/api/dashboards')

@bp.route('', methods=['GET'])
@jwt_required()
def get_dashboards():
    dashboards = DashboardService.get_all_dashboards()
    return jsonify(dashboards), 200

@bp.route('/my-dashboards', methods=['GET'])
@jwt_required()
def get_my_dashboards():
    user_id = int(get_jwt_identity())
    dashboards = DashboardService.get_user_dashboards(user_id)
    return jsonify(dashboards), 200

@bp.route('', methods=['POST'])
@jwt_required()
def create_dashboard():
    data = request.get_json()
    
    required_fields = ['name', 'slug']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    dashboard = DashboardService.create_dashboard(data)
    return jsonify(dashboard), 201

@bp.route('/<int:dashboard_id>', methods=['PUT'])
@jwt_required()
def update_dashboard(dashboard_id):
    data = request.get_json()
    dashboard = DashboardService.update_dashboard(dashboard_id, data)
    
    if not dashboard:
        return jsonify({'error': 'Dashboard not found'}), 404
    
    return jsonify(dashboard), 200
