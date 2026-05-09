import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.user_service import UserService
from app.services.otp_service import OtpService
from app.middleware.decorators import admin_required

bp = Blueprint('users', __name__, url_prefix='/api/users')


@bp.route('', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    return jsonify(UserService.get_all_users()), 200


@bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    caller_id = int(get_jwt_identity())
    # Users can only see themselves unless Admin
    from app.models import User
    from app.extensions import db
    caller = db.session.get(User, caller_id)
    if caller and caller.role and caller.role.name != 'Admin' and caller_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    user = UserService.get_user_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user), 200


@bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    data = request.get_json()
    required_fields = ['username', 'email', 'password', 'role_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    try:
        actor_id = int(get_jwt_identity())
        user = UserService.create_user(data, actor_id=actor_id, ip_address=request.remote_addr)
        return jsonify(user), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 409


@bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    caller_id = int(get_jwt_identity())
    from app.models import User
    from app.extensions import db
    caller = db.session.get(User, caller_id)
    is_admin = caller and caller.role and caller.role.name == 'Admin'
    # Non-admins can only edit themselves, and cannot change role_id
    if not is_admin and caller_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    data = request.get_json()
    if not is_admin:
        data.pop('role_id', None)
        data.pop('is_active', None)
    try:
        user = UserService.update_user(user_id, data, actor_id=caller_id,
                                       ip_address=request.remote_addr)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 409


@bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    actor_id = int(get_jwt_identity())
    if actor_id == user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    success = UserService.delete_user(user_id, actor_id=actor_id,
                                      ip_address=request.remote_addr)
    if not success:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'message': 'User deleted successfully'}), 200


@bp.route('/<int:user_id>/password', methods=['PUT'])
@jwt_required()
def change_password(user_id):
    caller_id = int(get_jwt_identity())
    if caller_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    data = request.get_json()
    required_fields = ['current_password', 'new_password']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    success = UserService.change_password(user_id, data['current_password'], data['new_password'])
    if not success:
        return jsonify({'error': 'Mot de passe actuel incorrect'}), 400
    return jsonify({'message': 'Mot de passe mis à jour'}), 200


@bp.route('/<int:user_id>/photo', methods=['POST'])
@jwt_required()
def upload_photo(user_id):
    caller_id = int(get_jwt_identity())
    from app.models import User
    from app.extensions import db
    caller = db.session.get(User, caller_id)
    is_admin = caller and caller.role and caller.role.name == 'Admin'
    if not is_admin and caller_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    if 'photo' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['photo']
    if not file.filename:
        return jsonify({'error': 'No file selected'}), 400
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    url, error = UserService.save_profile_image(user_id, file, upload_folder)
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'profile_image': url}), 200


# ── Email change with OTP ─────────────────────────────────────────────────────

@bp.route('/request-email-change', methods=['POST'])
@jwt_required()
def request_email_change():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data or not data.get('new_email'):
        return jsonify({'error': 'New email required'}), 400
    success, message = OtpService.request_email_change(user_id, data['new_email'])
    if not success:
        return jsonify({'error': message}), 400
    return jsonify({'message': message}), 200


@bp.route('/confirm-email-change', methods=['PUT'])
@jwt_required()
def confirm_email_change():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data or not data.get('new_email') or not data.get('token'):
        return jsonify({'error': 'New email and OTP token required'}), 400
    success, message = OtpService.confirm_email_change(user_id, data['new_email'], data['token'])
    if not success:
        return jsonify({'error': message}), 400
    return jsonify({'message': message}), 200
