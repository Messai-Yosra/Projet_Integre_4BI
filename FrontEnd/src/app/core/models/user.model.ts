export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
  is_active: boolean;
  role_id: number;
  role: Role;
  created_at: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Dashboard {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
