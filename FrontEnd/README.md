# Padel Decision-Support Platform - Frontend

Angular 17 standalone application with futuristic UI/UX for the Padel Decision-Support Platform.

## Features

- **Modern Angular Architecture**: Standalone components, lazy loading, route guards
- **Futuristic UI/UX**: Glassmorphism, gradients, smooth animations
- **Role-Based Access**: Dynamic dashboard visibility based on user roles
- **Multilingual**: English and French support with ngx-translate
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switcher with persistent preferences
- **JWT Authentication**: Secure token-based authentication
- **HTTP Interceptors**: Automatic token injection

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update `src/environments/environment.ts` with your backend API URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

### 3. Run Development Server

```bash
npm start
```

The application will be available at `http://localhost:4200`

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── core/                 # Core services, guards, interceptors
│   │   ├── guards/           # Route guards (auth)
│   │   ├── interceptors/     # HTTP interceptors
│   │   ├── models/           # TypeScript interfaces
│   │   └── services/         # Core services (auth, dashboard)
│   ├── layouts/              # Layout components
│   │   └── main-layout/      # Main application layout
│   ├── modules/              # Feature modules
│   │   └── auth/             # Authentication module
│   ├── pages/                # Page components
│   │   ├── home/             # Home page
│   │   └── dashboard-view/   # Dashboard view page
│   ├── app.component.ts      # Root component
│   ├── app.config.ts         # Application configuration
│   └── app.routes.ts         # Application routes
├── assets/
│   └── i18n/                 # Translation files (en.json, fr.json)
├── environments/             # Environment configurations
└── styles.css                # Global styles

## Key Features

### Authentication
- Login with username/password
- JWT token management
- Automatic token refresh
- Protected routes with auth guard

### Dashboard System
- 5 Power BI-ready dashboards:
  - Overview
  - Operational
  - Equipment
  - Sponsorship
  - SDG
- Role-based dashboard access
- KPI cards with metrics
- Chart placeholders
- Power BI embed containers

### UI Components
- Sidebar navigation with collapse
- Top navbar with user menu
- Language switcher (EN/FR)
- Dark/Light mode toggle
- Notification dropdown
- Responsive design

### Internationalization
- English and French translations
- Dynamic language switching
- Persistent language preference

## Default Credentials

After seeding the backend database:
- **Username**: admin
- **Password**: admin123

## Role-Dashboard Mapping

| Role | Accessible Dashboards |
|------|----------------------|
| Admin | All Dashboards |
| Direction Générale FIP | Overview |
| FIP Competitions Director | Operational |
| Brand Head / Marketing Director | Equipment |
| Tournament Commercial Director | Sponsorship, SDG |

## Technologies

- Angular 17 (Standalone Components)
- TypeScript
- RxJS
- ngx-translate
- CSS3 (Custom Properties, Animations)
- Material Icons

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
