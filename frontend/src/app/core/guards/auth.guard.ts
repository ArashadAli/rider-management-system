import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {

    return this.authService.ensureProfileLoaded().pipe(
      map(isAuthenticated => {
        if(isAuthenticated) {
          return true;
        }
        this.router.navigate(['/login'])
        return false;
      }),
      catchError(() => {
        this.authService.clearUser()
        this.router.navigate(['/login'])
        return of(false)
      })
    )
  }
}