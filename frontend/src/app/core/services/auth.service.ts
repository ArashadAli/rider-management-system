import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import {
  RegisterResponse,
  LoginResponse,
  ProfileResponse,
  DashboardResponse,
  LogoutResponse,
  TokenResponse
} from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private apiService: ApiService) {}

  register(user: any): Observable<RegisterResponse> {
    return this.apiService.post<RegisterResponse>(
      '/auth/register',
      user
    );
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>(
      '/auth/login',
      credentials
    );
  }

  dashboard(): Observable<DashboardResponse> {
    return this.apiService.get<DashboardResponse>(
      '/users/dashboard',
    )
  }

  profile(): Observable<ProfileResponse> {
    return this.apiService.get<ProfileResponse>(
      '/users/me'
    )
  }

  logout(): Observable<LogoutResponse> {
    return this.apiService.get<LogoutResponse>(
      '/auth/logout'
    )
  }

  getCsrfToken(): Observable<TokenResponse> {
    return this.apiService.get<TokenResponse>(
      '/auth/csrf-token'
    )
  }
}