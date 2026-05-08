"""
Script to create MySQL database and setup initial schema
"""
import mysql.connector
from mysql.connector import Error
import sys

def create_database():
    """Create the app_padel database in MySQL"""
    try:
        # Connect to MySQL server (without specifying database)
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=''  # Change this if you have a password
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create database if it doesn't exist
            cursor.execute("CREATE DATABASE IF NOT EXISTS app_padel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print("✓ Database 'app_padel' created successfully!")
            
            # Use the database
            cursor.execute("USE app_padel")
            
            # Create tables
            print("\n📋 Creating tables...")
            
            # Roles table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS roles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            print("  ✓ Table 'roles' created")
            
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(80) NOT NULL UNIQUE,
                    email VARCHAR(120) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    profile_image VARCHAR(255),
                    is_active BOOLEAN DEFAULT TRUE,
                    role_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
                    INDEX idx_username (username),
                    INDEX idx_email (email),
                    INDEX idx_role_id (role_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            print("  ✓ Table 'users' created")
            
            # Dashboards table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS dashboards (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    slug VARCHAR(100) NOT NULL UNIQUE,
                    description TEXT,
                    icon VARCHAR(50),
                    order_index INT DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_slug (slug),
                    INDEX idx_order (order_index)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            print("  ✓ Table 'dashboards' created")
            
            # Dashboard permissions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS dashboard_permissions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    role_id INT NOT NULL,
                    dashboard_id INT NOT NULL,
                    can_view BOOLEAN DEFAULT TRUE,
                    can_edit BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                    FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_role_dashboard (role_id, dashboard_id),
                    INDEX idx_role_id (role_id),
                    INDEX idx_dashboard_id (dashboard_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            print("  ✓ Table 'dashboard_permissions' created")
            
            # Audit logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    action VARCHAR(100) NOT NULL,
                    entity_type VARCHAR(50),
                    entity_id INT,
                    details TEXT,
                    ip_address VARCHAR(45),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                    INDEX idx_user_id (user_id),
                    INDEX idx_action (action),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            print("  ✓ Table 'audit_logs' created")
            
            connection.commit()
            print("\n✅ All tables created successfully!")
            
            cursor.close()
            connection.close()
            
            return True
            
    except Error as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up MySQL database for Padel Platform\n")
    print("=" * 60)
    
    success = create_database()
    
    if success:
        print("\n" + "=" * 60)
        print("\n✅ Database setup completed!")
        print("\n📝 Next steps:")
        print("   1. Update BackEnd/.env with MySQL connection:")
        print("      DATABASE_URL=mysql+pymysql://root:@localhost/app_padel")
        print("   2. Run: python seeders/seed_data.py")
        print("\n" + "=" * 60)
    else:
        print("\n❌ Database setup failed!")
        sys.exit(1)
