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

import { CustomToastService } from "../services/toast.service";

@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const csrfToken = localStorage.getItem('csrf_token');

    // console.log("CSRF Token:", csrfToken);
    // console.log("COOKIES:", document.cookie);

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

    // console.log("req headers:", authReq.headers);

    return next.handle(authReq);
  }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private toastService: CustomToastService
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(

      catchError((error: HttpErrorResponse) => {

        // Get backend message
        const message =
          error.error?.message ||
          'Something went wrong. Please try again.';

        switch (error.status) {

          case 400:

            this.toastService.error(
              message,
              'Bad Request'
            );

            break;


          case 401:

            localStorage.removeItem('csrf_token');

            this.toastService.error(
              message || 'Please login again.',
              'Unauthorized'
            );

            this.router.navigate(['/login']);

            break;


          case 403:

            this.toastService.error(
              message || 'You do not have permission.',
              'Access Denied'
            );

            break;


          case 404:

            this.toastService.error(
              message,
              'Not Found'
            );

            break;


          case 409:

            this.toastService.error(
              message,
              'Conflict'
            );

            break;


          case 422:

            this.toastService.error(
              message,
              'Validation Error'
            );

            break;


          case 500:

            this.toastService.error(
              message,
              'Server Error'
            );

            break;


          case 0:

            this.toastService.error(
              'Unable to connect to the server.',
              'Network Error'
            );

            break;


          default:

            this.toastService.error(
              message,
              'Error'
            );

            break;
        }
        // Send error back to component
        return throwError(() => error);
      })
    );
  }
}