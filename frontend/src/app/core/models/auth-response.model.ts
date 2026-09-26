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