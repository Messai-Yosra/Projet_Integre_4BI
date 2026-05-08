# Padel Decision-Support Platform

Enterprise-grade analytics platform with futuristic UI/UX for Padel business intelligence and decision support.

## 🚀 Overview

A complete full-stack application featuring:
- **Backend**: Flask REST API with MySQL database
- **Frontend**: Angular 17 with standalone components
- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based dashboard access control
- **UI/UX**: Modern, futuristic design inspired by Power BI and Tableau
- **Internationalization**: English and French support
- **Responsive**: Works on all devices

## 📁 Project Structure

```
/
├── BackEnd/              # Flask REST API
│   ├── app/
│   │   ├── config/       # Configuration
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── middleware/   # Error handlers
│   ├── seeders/          # Database seeders
│   └── requirements.txt  # Python dependencies
│
└── FrontEnd/             # Angular Application
    ├── src/
    │   ├── app/
    │   │   ├── core/     # Core services & guards
    │   │   ├── layouts/  # Layout components
    │   │   ├── modules/  # Feature modules
    │   │   └── pages/    # Page components
    │   └── assets/       # Static assets & i18n
    └── package.json      # Node dependencies
```

## 🎯 Features

### Backend Features
- ✅ RESTful API architecture
- ✅ JWT authentication & refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ MySQL database with relationships
- ✅ Password hashing with bcrypt
- ✅ Audit logging
- ✅ Error handling middleware
- ✅ CORS enabled
- ✅ User management endpoints
- ✅ Password change functionality

### Frontend Features
- ✅ Angular 17 standalone components
- ✅ Lazy loading & route guards
- ✅ HTTP interceptors for auth
- ✅ Futuristic glassmorphism UI
- ✅ Dark/Light mode toggle
- ✅ Multilingual (EN/FR)
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Power BI embed ready
- ✅ User management (Admin only)
- ✅ Profile management (All roles)
- ✅ Dashboard navigation with 5 Power BI dashboards

## 🔐 User Roles & Dashboard Access

| Role | Accessible Dashboards |
|------|----------------------|
| **Admin** | All Dashboards (Overview, Operational, Equipment, Sponsorship, SDG) |
| **Direction Générale FIP** | Overview |
| **FIP Competitions Director** | Operational |
| **Brand Head / Marketing Director** | Equipment |
| **Tournament Commercial Director** | Sponsorship, SDG |

## 📊 Dashboards

1. **Overview** - Executive summary and key metrics
2. **Operational** - Operational performance analytics
3. **Equipment** - Equipment and brand analytics
4. **Sponsorship** - Sponsorship performance tracking
5. **SDG** - Sustainable Development Goals metrics

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd BackEnd
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Create MySQL database:
```sql
CREATE DATABASE padel_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

6. Seed database:
```bash
python seeders/seed_data.py
```

7. Run the application:
```bash
python run.py
```

Backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd FrontEnd
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
Edit `src/environments/environment.ts` with your backend URL

4. Run development server:
```bash
npm start
```

Frontend will be available at `http://localhost:4200`

## 🔑 Default Credentials

After seeding the database, you can login with these accounts:

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `admin` | `admin123` | Admin | All dashboards + User management |
| `director` | `director123` | Direction Générale FIP | Overview dashboard |
| `competitions` | `comp123` | FIP Competitions Director | Operational dashboard |
| `marketing` | `market123` | Brand Head / Marketing Director | Equipment dashboard |
| `commercial` | `comm123` | Tournament Commercial Director | Sponsorship + SDG dashboards |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
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

## 🎨 UI/UX Features

- **Glassmorphism Effects**: Modern frosted glass design
- **Gradient Backgrounds**: Beautiful color gradients
- **Smooth Animations**: Fluid transitions and interactions
- **Material Icons**: Consistent iconography
- **Responsive Grid**: Adapts to all screen sizes
- **Dark/Light Mode**: User preference persistence
- **Interactive Cards**: Hover effects and animations

## 🌍 Internationalization

The platform supports:
- **English (EN)** - Default language
- **French (FR)** - Full translation

Language can be switched from the navbar and preference is saved locally.

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- HTTP-only token storage
- CORS protection
- SQL injection prevention
- XSS protection
- Route guards
- Role-based authorization

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Production Deployment

### Backend
1. Set `FLASK_ENV=production` in `.env`
2. Use a production WSGI server (gunicorn, uWSGI)
3. Configure proper database credentials
4. Set strong secret keys
5. Enable HTTPS

### Frontend
1. Build for production: `npm run build`
2. Deploy `dist/` folder to web server
3. Configure API URL in environment
4. Enable HTTPS
5. Configure CDN if needed

## 📝 Database Schema

The application uses the following tables:
- `users` - User accounts
- `roles` - User roles
- `dashboards` - Dashboard definitions
- `dashboard_permissions` - Role-dashboard mappings
- `audit_logs` - Activity tracking

## 🤝 Contributing

This is an enterprise application. For modifications:
1. Follow the existing code structure
2. Maintain clean code principles
3. Test thoroughly before deployment
4. Document any changes

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For support and questions, contact the development team.

---

**Built with ❤️ for Padel Decision Support**
