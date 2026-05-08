from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.role_service import RoleService

bp = Blueprint('roles', __name__, url_prefix='/api/roles')

@bp.route('', methods=['GET'])
@jwt_required()
def get_roles():
    roles = RoleService.get_all_roles()
    return jsonify(roles), 200

@bp.route('/<int:role_id>', methods=['GET'])
@jwt_required()
def get_role(role_id):
    role = RoleService.get_role_by_id(role_id)
    
    if not role:
        return jsonify({'error': 'Role not found'}), 404
    
    return jsonify(role), 200

@bp.route('', methods=['POST'])
@jwt_required()
def create_role():
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Role name is required'}), 400
    
    role = RoleService.create_role(data)
    return jsonify(role), 201
