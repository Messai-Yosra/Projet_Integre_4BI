from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.user_service import UserService

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('', methods=['GET'])
@jwt_required()
def get_users():
    users = UserService.get_all_users()
    return jsonify(users), 200

@bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = UserService.get_user_by_id(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user), 200

@bp.route('', methods=['POST'])
@jwt_required()
def create_user():
    data = request.get_json()

    required_fields = ['username', 'email', 'password', 'role_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        user = UserService.create_user(data)
        return jsonify(user), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 409

@bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    data = request.get_json()
    try:
        user = UserService.update_user(user_id, data)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 409

@bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    success = UserService.delete_user(user_id)
    
    if not success:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'message': 'User deleted successfully'}), 200

@bp.route('/<int:user_id>/password', methods=['PUT'])
@jwt_required()
def change_password(user_id):
    data = request.get_json()
    
    required_fields = ['current_password', 'new_password']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    success = UserService.change_password(user_id, data['current_password'], data['new_password'])
    
    if not success:
        return jsonify({'error': 'Invalid current password or user not found'}), 400
    
    return jsonify({'message': 'Password changed successfully'}), 200
