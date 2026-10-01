import { Injectable } from "@angular/core";
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http'
import { catchError, Observable, throwError } from "rxjs";
import { Router } from "@angular/router";

@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const csrfToken = this.getCookie("csrf_access_token");

    let authReq = req.clone({
      withCredentials: true
    });

    if (csrfToken) {
      authReq = authReq.clone({
        setHeaders: {
          "X-CSRF-TOKEN": csrfToken
        }
      });
    }

    return next.handle(authReq);
  }

  private getCookie(name: string): string | null {

    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split("=");

      if (key === name) {
        return decodeURIComponent(value);
      }
    }

    return null;
  }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private router : Router) {}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error : HttpErrorResponse) => {

                if(error.status === 401) {
                    this.router.navigate(['/login'])
                }

                return throwError(() => error)
            })
        )
    }
}