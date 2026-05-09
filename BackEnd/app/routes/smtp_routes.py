from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.smtp_config import SmtpConfig
from app.services.email_service import EmailService
from app.middleware.decorators import admin_required
from app.extensions import db

bp = Blueprint('smtp', __name__, url_prefix='/api/admin/smtp')


@bp.route('', methods=['GET'])
@jwt_required()
@admin_required
def get_config():
    config = SmtpConfig.query.filter_by(is_active=True).first()
    if not config:
        return jsonify(None), 200
    return jsonify(config.to_dict()), 200


@bp.route('', methods=['PUT'])
@jwt_required()
@admin_required
def save_config():
    data = request.get_json()
    required = ['host', 'port', 'from_email']
    if not all(f in data for f in required):
        return jsonify({'error': 'host, port and from_email are required'}), 400

    config = SmtpConfig.query.filter_by(is_active=True).first()
    if config:
        config.host = data['host']
        config.port = int(data['port'])
        config.use_tls = data.get('use_tls', True)
        config.username = data.get('username', config.username)
        # Only update password if a new one is supplied (not the masked '***')
        new_pwd = data.get('password', '')
        if new_pwd and new_pwd != '***':
            config.password = new_pwd
        config.from_email = data['from_email']
        config.from_name = data.get('from_name', config.from_name)
    else:
        config = SmtpConfig(
            host=data['host'],
            port=int(data['port']),
            use_tls=data.get('use_tls', True),
            username=data.get('username'),
            password=data.get('password'),
            from_email=data['from_email'],
            from_name=data.get('from_name', 'AppPI Padel')
        )
        db.session.add(config)

    db.session.commit()
    return jsonify(config.to_dict()), 200


@bp.route('/test', methods=['POST'])
@jwt_required()
@admin_required
def test_config():
    data = request.get_json()
    to_email = data.get('to_email') if data else None
    if not to_email:
        return jsonify({'error': 'to_email required'}), 400
    try:
        EmailService.send_test(to_email)
        return jsonify({'message': 'Email de test envoyé avec succès'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
