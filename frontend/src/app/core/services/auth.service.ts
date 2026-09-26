import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import {
  RegisterResponse,
  LoginResponse
} from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private apiService: ApiService) {}

  register(user: any): Observable<RegisterResponse> {
    return this.apiService.post<RegisterResponse>(
      '/users/register',
      user
    );
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>(
      '/users/login',
      credentials
    );
  }
}