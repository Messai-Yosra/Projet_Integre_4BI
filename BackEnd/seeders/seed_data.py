import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models import Role, Dashboard, DashboardPermission, User

def seed_database():
    app = create_app()
    
    with app.app_context():
        print("Creating tables...")
        db.create_all()
        
        print("Seeding roles...")
        roles_data = [
            {'name': 'Admin', 'description': 'Full system access'},
            {'name': 'Direction Générale FIP', 'description': 'General Direction FIP'},
            {'name': 'FIP Competitions Director', 'description': 'FIP Competitions Director'},
            {'name': 'Brand Head / Marketing Director', 'description': 'Brand and Marketing Director'},
            {'name': 'Tournament Commercial Director', 'description': 'Tournament Commercial Director'}
        ]
        
        roles = {}
        for role_data in roles_data:
            if not Role.query.filter_by(name=role_data['name']).first():
                role = Role(**role_data)
                db.session.add(role)
                db.session.flush()
                roles[role_data['name']] = role
            else:
                roles[role_data['name']] = Role.query.filter_by(name=role_data['name']).first()
        
        db.session.commit()
        print(f"Created {len(roles)} roles")
        
        print("Seeding dashboards...")
        dashboards_data = [
            {'name': 'Overview', 'slug': 'overview', 'description': 'Overview Dashboard', 'icon': 'dashboard', 'order_index': 1},
            {'name': 'Operational', 'slug': 'operational', 'description': 'Operational Dashboard', 'icon': 'settings', 'order_index': 2},
            {'name': 'Equipment', 'slug': 'equipment', 'description': 'Equipment Dashboard', 'icon': 'inventory', 'order_index': 3},
            {'name': 'Sponsorship', 'slug': 'sponsorship', 'description': 'Sponsorship Dashboard', 'icon': 'handshake', 'order_index': 4},
            {'name': 'SDG', 'slug': 'sdg', 'description': 'SDG Dashboard', 'icon': 'eco', 'order_index': 5}
        ]
        
        dashboards = {}
        for dash_data in dashboards_data:
            if not Dashboard.query.filter_by(slug=dash_data['slug']).first():
                dashboard = Dashboard(**dash_data)
                db.session.add(dashboard)
                db.session.flush()
                dashboards[dash_data['slug']] = dashboard
            else:
                dashboards[dash_data['slug']] = Dashboard.query.filter_by(slug=dash_data['slug']).first()
        
        db.session.commit()
        print(f"Created {len(dashboards)} dashboards")
        
        print("Seeding dashboard permissions...")
        permissions_mapping = {
            'Admin': ['overview', 'operational', 'equipment', 'sponsorship', 'sdg'],
            'Direction Générale FIP': ['overview'],
            'FIP Competitions Director': ['operational'],
            'Brand Head / Marketing Director': ['equipment'],
            'Tournament Commercial Director': ['sponsorship', 'sdg']
        }
        
        for role_name, dashboard_slugs in permissions_mapping.items():
            role = roles[role_name]
            for slug in dashboard_slugs:
                dashboard = dashboards[slug]
                
                existing = DashboardPermission.query.filter_by(
                    role_id=role.id,
                    dashboard_id=dashboard.id
                ).first()
                
                if not existing:
                    permission = DashboardPermission(
                        role_id=role.id,
                        dashboard_id=dashboard.id,
                        can_view=True
                    )
                    db.session.add(permission)
        
        db.session.commit()
        print("Dashboard permissions created")
        
        print("Creating default users...")
        
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@padel.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'password': 'admin123',
                'role': 'Admin'
            },
            {
                'username': 'director',
                'email': 'director@fip.com',
                'first_name': 'Jean',
                'last_name': 'Dupont',
                'password': 'director123',
                'role': 'Direction Générale FIP'
            },
            {
                'username': 'competitions',
                'email': 'competitions@fip.com',
                'first_name': 'Marie',
                'last_name': 'Martin',
                'password': 'comp123',
                'role': 'FIP Competitions Director'
            },
            {
                'username': 'marketing',
                'email': 'marketing@padel.com',
                'first_name': 'Pierre',
                'last_name': 'Bernard',
                'password': 'market123',
                'role': 'Brand Head / Marketing Director'
            },
            {
                'username': 'commercial',
                'email': 'commercial@padel.com',
                'first_name': 'Sophie',
                'last_name': 'Dubois',
                'password': 'comm123',
                'role': 'Tournament Commercial Director'
            }
        ]
        
        for user_data in users_data:
            if not User.query.filter_by(username=user_data['username']).first():
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    role_id=roles[user_data['role']].id
                )
                user.set_password(user_data['password'])
                db.session.add(user)
                print(f"Created user: {user_data['username']} (password: {user_data['password']})")
            else:
                print(f"User {user_data['username']} already exists")
        
        db.session.commit()
        print("\nDatabase seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
