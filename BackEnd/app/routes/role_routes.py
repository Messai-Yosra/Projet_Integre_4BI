from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.role_service import RoleService
from app.middleware.decorators import admin_required

bp = Blueprint('roles', __name__, url_prefix='/api/roles')


@bp.route('', methods=['GET'])
@jwt_required()
def get_roles():
    return jsonify(RoleService.get_all_roles()), 200


@bp.route('/<int:role_id>', methods=['GET'])
@jwt_required()
def get_role(role_id):
    role = RoleService.get_role_by_id(role_id)
    if not role:
        return jsonify({'error': 'Role not found'}), 404
    return jsonify(role), 200


@bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_role():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Role name is required'}), 400
    try:
        role = RoleService.create_role(data)
        return jsonify(role), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 409


@bp.route('/<int:role_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_role(role_id):
    data = request.get_json()
    try:
        role = RoleService.update_role(role_id, data)
        if not role:
            return jsonify({'error': 'Role not found'}), 404
        return jsonify(role), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 409


@bp.route('/<int:role_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_role(role_id):
    success, error = RoleService.delete_role(role_id)
    if not success:
        return jsonify({'error': error}), 400
    return jsonify({'message': 'Role deleted'}), 200


@bp.route('/<int:role_id>/permissions', methods=['POST'])
@jwt_required()
@admin_required
def add_permission(role_id):
    data = request.get_json()
    if not data or not data.get('dashboard_id'):
        return jsonify({'error': 'dashboard_id required'}), 400
    perm = RoleService.add_permission(role_id, data['dashboard_id'])
    if not perm:
        return jsonify({'error': 'Role or dashboard not found'}), 404
    return jsonify(perm), 201


@bp.route('/<int:role_id>/permissions/<int:dashboard_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def remove_permission(role_id, dashboard_id):
    success = RoleService.remove_permission(role_id, dashboard_id)
    if not success:
        return jsonify({'error': 'Permission not found'}), 404
    return jsonify({'message': 'Permission removed'}), 200
