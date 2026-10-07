export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  'access-token': string;
  user: User;
}

export interface DashboardResponse {
  message: string;
  success: boolean
}

export interface ProfileResponse {
  message: string,
  success: boolean,
  user: User
}

export interface LogoutResponse {
  message: string,
  success: boolean
}

export interface TokenResponse {
  "success": boolean,
  "csrf_token": string
}