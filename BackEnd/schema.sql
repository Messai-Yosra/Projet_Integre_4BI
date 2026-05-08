-- Padel Decision-Support Platform Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS padel_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE padel_platform;

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboards Table
CREATE TABLE IF NOT EXISTS dashboards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard Permissions Table
CREATE TABLE IF NOT EXISTS dashboard_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    dashboard_id INT NOT NULL,
    can_view BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_dashboard (role_id, dashboard_id),
    INDEX idx_role_id (role_id),
    INDEX idx_dashboard_id (dashboard_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Roles
INSERT INTO roles (name, description) VALUES
('Admin', 'Full system access'),
('Direction Générale FIP', 'General Direction FIP'),
('FIP Competitions Director', 'FIP Competitions Director'),
('Brand Head / Marketing Director', 'Brand and Marketing Director'),
('Tournament Commercial Director', 'Tournament Commercial Director')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Insert Default Dashboards
INSERT INTO dashboards (name, slug, description, icon, order_index) VALUES
('Overview', 'overview', 'Overview Dashboard', 'dashboard', 1),
('Operational', 'operational', 'Operational Dashboard', 'settings', 2),
('Equipment', 'equipment', 'Equipment Dashboard', 'inventory', 3),
('Sponsorship', 'sponsorship', 'Sponsorship Dashboard', 'handshake', 4),
('SDG', 'sdg', 'SDG Dashboard', 'eco', 5)
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Insert Dashboard Permissions
-- Admin has access to all dashboards
INSERT INTO dashboard_permissions (role_id, dashboard_id, can_view)
SELECT r.id, d.id, TRUE
FROM roles r
CROSS JOIN dashboards d
WHERE r.name = 'Admin'
ON DUPLICATE KEY UPDATE can_view=TRUE;

-- Direction Générale FIP - Overview only
INSERT INTO dashboard_permissions (role_id, dashboard_id, can_view)
SELECT r.id, d.id, TRUE
FROM roles r
CROSS JOIN dashboards d
WHERE r.name = 'Direction Générale FIP' AND d.slug = 'overview'
ON DUPLICATE KEY UPDATE can_view=TRUE;

-- FIP Competitions Director - Operational only
INSERT INTO dashboard_permissions (role_id, dashboard_id, can_view)
SELECT r.id, d.id, TRUE
FROM roles r
CROSS JOIN dashboards d
WHERE r.name = 'FIP Competitions Director' AND d.slug = 'operational'
ON DUPLICATE KEY UPDATE can_view=TRUE;

-- Brand Head / Marketing Director - Equipment only
INSERT INTO dashboard_permissions (role_id, dashboard_id, can_view)
SELECT r.id, d.id, TRUE
FROM roles r
CROSS JOIN dashboards d
WHERE r.name = 'Brand Head / Marketing Director' AND d.slug = 'equipment'
ON DUPLICATE KEY UPDATE can_view=TRUE;

-- Tournament Commercial Director - Sponsorship and SDG
INSERT INTO dashboard_permissions (role_id, dashboard_id, can_view)
SELECT r.id, d.id, TRUE
FROM roles r
CROSS JOIN dashboards d
WHERE r.name = 'Tournament Commercial Director' AND d.slug IN ('sponsorship', 'sdg')
ON DUPLICATE KEY UPDATE can_view=TRUE;
