# Padel Platform API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All endpoints except `/auth/login` and `/auth/register` require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### POST /auth/login
Login with username and password.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@padel.com",
    "first_name": "Admin",
    "last_name": "User",
    "profile_image": null,
    "is_active": true,
    "role": {
      "id": 1,
      "name": "Admin",
      "description": "Full system access",
      "created_at": "2024-01-01T00:00:00"
    },
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

---

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "role_id": 2
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "username": "newuser",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true,
  "role": {...},
  "created_at": "2024-01-01T00:00:00"
}
```

---

### POST /auth/refresh
Refresh access token using refresh token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### GET /auth/me
Get current authenticated user.

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@padel.com",
  "first_name": "Admin",
  "last_name": "User",
  "profile_image": null,
  "is_active": true,
  "role": {...},
  "created_at": "2024-01-01T00:00:00"
}
```

---

## User Endpoints

### GET /users
Get all users.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@padel.com",
    "first_name": "Admin",
    "last_name": "User",
    "is_active": true,
    "role": {...},
    "created_at": "2024-01-01T00:00:00"
  }
]
```

---

### GET /users/:id
Get user by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@padel.com",
  "first_name": "Admin",
  "last_name": "User",
  "is_active": true,
  "role": {...},
  "created_at": "2024-01-01T00:00:00"
}
```

---

### POST /users
Create a new user.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role_id": 2
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "username": "newuser",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true,
  "role": {...},
  "created_at": "2024-01-01T00:00:00"
}
```

---

### PUT /users/:id
Update user.

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role_id": 3,
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "username": "newuser",
  "email": "newemail@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "is_active": true,
  "role": {...},
  "created_at": "2024-01-01T00:00:00"
}
```

---

### DELETE /users/:id
Delete user.

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Role Endpoints

### GET /roles
Get all roles.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Admin",
    "description": "Full system access",
    "created_at": "2024-01-01T00:00:00"
  },
  {
    "id": 2,
    "name": "Direction Générale FIP",
    "description": "General Direction FIP",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

---

### GET /roles/:id
Get role by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Admin",
  "description": "Full system access",
  "created_at": "2024-01-01T00:00:00"
}
```

---

### POST /roles
Create a new role.

**Request Body:**
```json
{
  "name": "New Role",
  "description": "Role description"
}
```

**Response (201 Created):**
```json
{
  "id": 6,
  "name": "New Role",
  "description": "Role description",
  "created_at": "2024-01-01T00:00:00"
}
```

---

## Dashboard Endpoints

### GET /dashboards
Get all dashboards.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Overview",
    "slug": "overview",
    "description": "Overview Dashboard",
    "icon": "dashboard",
    "order_index": 1,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

---

### GET /dashboards/my-dashboards
Get dashboards accessible to current user based on their role.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Overview",
    "slug": "overview",
    "description": "Overview Dashboard",
    "icon": "dashboard",
    "order_index": 1,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

---

### POST /dashboards
Create a new dashboard.

**Request Body:**
```json
{
  "name": "New Dashboard",
  "slug": "new-dashboard",
  "description": "Dashboard description",
  "icon": "analytics",
  "order_index": 6
}
```

**Response (201 Created):**
```json
{
  "id": 6,
  "name": "New Dashboard",
  "slug": "new-dashboard",
  "description": "Dashboard description",
  "icon": "analytics",
  "order_index": 6,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

---

### PUT /dashboards/:id
Update dashboard.

**Request Body:**
```json
{
  "name": "Updated Dashboard",
  "description": "Updated description",
  "icon": "chart",
  "order_index": 7,
  "is_active": false
}
```

**Response (200 OK):**
```json
{
  "id": 6,
  "name": "Updated Dashboard",
  "slug": "new-dashboard",
  "description": "Updated description",
  "icon": "chart",
  "order_index": 7,
  "is_active": false,
  "created_at": "2024-01-01T00:00:00"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
