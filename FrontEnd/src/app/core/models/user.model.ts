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
  last_activity?: string;
  created_at: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  member_count?: number;
  dashboard_permissions?: RolePermission[];
  members?: User[];
  created_at: string;
}

export interface RolePermission {
  dashboard_id: number;
  dashboard_name: string;
  dashboard_slug: string;
  can_view: boolean;
}

export interface Dashboard {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  embed_url?: string;
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

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  unread_count: number;
}

export interface OnboardingProgress {
  id: number;
  user_id: number;
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
  is_dismissed: boolean;
  started_at: string;
  completed_at?: string;
}

export interface SmtpConfig {
  id?: number;
  host: string;
  port: number;
  use_tls: boolean;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  is_active: boolean;
}
