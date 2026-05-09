import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from app.extensions import db, jwt, migrate
from app.config.config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ── CORS: restrict to allowed origins in production ──────────────────────
    allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:4200').split(',')
    CORS(app, resources={r'/api/*': {'origins': allowed_origins}},
         supports_credentials=True)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # ── Blueprints ────────────────────────────────────────────────────────────
    from app.routes import (auth_routes, user_routes, dashboard_routes,
                            role_routes, notifications_routes, smtp_routes,
                            onboarding_routes)

    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(user_routes.bp)
    app.register_blueprint(dashboard_routes.bp)
    app.register_blueprint(role_routes.bp)
    app.register_blueprint(notifications_routes.bp)
    app.register_blueprint(smtp_routes.bp)
    app.register_blueprint(onboarding_routes.bp)

    # ── Static uploads ────────────────────────────────────────────────────────
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')

    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(upload_folder, filename)

    from app.middleware.error_handler import register_error_handlers
    register_error_handlers(app)

    return app
