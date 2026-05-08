# Padel Decision-Support Platform - Backend

Flask REST API with MySQL database for the Padel Decision-Support Platform.

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the database credentials in `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=padel_platform
DB_USER=root
DB_PASSWORD=your_password
```

### 3. Create MySQL Database

```sql
CREATE DATABASE padel_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Seed Database

```bash
python seeders/seed_data.py
```

This will create:
- All database tables
- 5 roles (Admin, Direction Générale FIP, FIP Competitions Director, Brand Head / Marketing Director, Tournament Commercial Director)
- 5 dashboards (Overview, Operational, Equipment, Sponsorship, SDG)
- Dashboard permissions based on roles
- Default admin user (username: `admin`, password: `admin123`)

### 5. Run the Application

```bash
python run.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/<id>` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/<id>` - Update user
- `DELETE /api/users/<id>` - Delete user

### Roles
- `GET /api/roles` - Get all roles
- `GET /api/roles/<id>` - Get role by ID
- `POST /api/roles` - Create role

### Dashboards
- `GET /api/dashboards` - Get all dashboards
- `GET /api/dashboards/my-dashboards` - Get user's accessible dashboards
- `POST /api/dashboards` - Create dashboard
- `PUT /api/dashboards/<id>` - Update dashboard

## Role-Dashboard Mapping

| Role | Accessible Dashboards |
|------|----------------------|
| Admin | All Dashboards |
| Direction Générale FIP | Overview |
| FIP Competitions Director | Operational |
| Brand Head / Marketing Director | Equipment |
| Tournament Commercial Director | Sponsorship, SDG |

## Database Schema

- **users** - User accounts
- **roles** - User roles
- **dashboards** - Dashboard definitions
- **dashboard_permissions** - Role-based dashboard access
- **audit_logs** - Activity tracking

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Role-based authorization
- CORS enabled
- Error handling middleware
