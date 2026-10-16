import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  RegisterResponse,
  LoginResponse,
  ProfileResponse,
  DashboardResponse,
  LogoutResponse,
  TokenResponse,
  User,
  CommonResponse
} from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject = new BehaviorSubject<User | null>(null)

  user$ = this.userSubject.asObservable();

  constructor(private apiService: ApiService) {}

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  private profileLoaded = false;

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

  ensureProfileLoaded(): Observable<boolean> {
    if(this.profileLoaded && this.currentUser) {
      return of(true)
    }

    return this.profile().pipe(
      map(response => {
        if(response.success && response.user) {
          this.userSubject.next(response.user)
          this.profileLoaded = true;
          return true;
        }
        return false;
      })
    )
  }

  setUser(user: User | null): void {
    this.userSubject.next(user);
    this.profileLoaded = true;
  }

  clearUser(): void {
    this.userSubject.next(null);
    this.profileLoaded = false;
  }

  changePassword(credentials: any): Observable<CommonResponse> {
    return this.apiService.put<CommonResponse>(
      '/users/change-password',
      credentials
    )
  }

  updateProfile(userDetails: any): Observable<ProfileResponse>{
    return this.apiService.put<ProfileResponse>(
      '/users/update-profile',
      userDetails
    )
  }
}