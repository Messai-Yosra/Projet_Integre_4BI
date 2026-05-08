from flask import Flask
from flask_cors import CORS
from app.extensions import db, jwt, migrate
from app.config.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    from app.routes import auth_routes, user_routes, dashboard_routes, role_routes
    
    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(user_routes.bp)
    app.register_blueprint(dashboard_routes.bp)
    app.register_blueprint(role_routes.bp)
    
    from app.middleware.error_handler import register_error_handlers
    register_error_handlers(app)
    
    return app
