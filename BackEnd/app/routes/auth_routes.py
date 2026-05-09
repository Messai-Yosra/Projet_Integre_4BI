from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.services.auth_service import AuthService
from app.services.otp_service import OtpService
from app.models import User
from app.extensions import db
from datetime import datetime
import time

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Simple in-memory rate limiter for login (per IP)
_login_attempts: dict = {}
MAX_ATTEMPTS = 10
WINDOW_SECONDS = 60


def _check_rate_limit(ip):
    now = time.time()
    attempts = _login_attempts.get(ip, [])
    # Keep only attempts within the window
    attempts = [t for t in attempts if now - t < WINDOW_SECONDS]
    if len(attempts) >= MAX_ATTEMPTS:
        return False
    attempts.append(now)
    _login_attempts[ip] = attempts
    return True


@bp.route('/login', methods=['POST'])
def login():
    ip = request.remote_addr

    if not _check_rate_limit(ip):
        return jsonify({'error': 'Trop de tentatives. Réessayez dans 1 minute.'}), 429

    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Identifiant et mot de passe requis'}), 400

    result, error = AuthService.login(data['username'], data['password'], ip_address=ip)
    if error:
        return jsonify({'error': error}), 401

    return jsonify(result), 200


@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ['username', 'email', 'password', 'role_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    result, error = AuthService.register(data)
    if error:
        return jsonify({'error': error}), 400
    return jsonify(result), 201


@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    user_id = int(identity)
    user = db.session.get(User, user_id)
    if user:
        user.touch_activity()
        db.session.commit()
    access_token = create_access_token(identity=identity)
    return jsonify({'access_token': access_token}), 200


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200


@bp.route('/verify-admin-password', methods=['POST'])
@jwt_required()
def verify_admin_password():
    """Used by the secure admin zone: confirms current user's password."""
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user or user.role.name != 'Admin':
        return jsonify({'error': 'Admin access required'}), 403
    data = request.get_json()
    if not data or not data.get('password'):
        return jsonify({'error': 'Password required'}), 400
    if not user.check_password(data['password']):
        return jsonify({'error': 'Mot de passe incorrect'}), 401
    return jsonify({'verified': True, 'expires_in': 1800}), 200


# ── Forgot password ──────────────────────────────────────────────────────────

@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({'error': 'Email requis'}), 400
    success, message = OtpService.request_password_reset(data['email'])
    if not success:
        return jsonify({'error': message}), 400
    return jsonify({'message': message}), 200


@bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('token'):
        return jsonify({'error': 'Email et code OTP requis'}), 400
    reset_token, message = OtpService.verify_otp(data['email'], data['token'])
    if not reset_token:
        return jsonify({'error': message}), 400
    return jsonify({'reset_token': reset_token, 'message': message}), 200


@bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('reset_token') or not data.get('new_password'):
        return jsonify({'error': 'Données manquantes'}), 400
    if len(data['new_password']) < 8:
        return jsonify({'error': 'Le mot de passe doit contenir au moins 8 caractères'}), 400
    success, message = OtpService.reset_password(
        data['email'], data['reset_token'], data['new_password']
    )
    if not success:
        return jsonify({'error': message}), 400
    return jsonify({'message': message}), 200
