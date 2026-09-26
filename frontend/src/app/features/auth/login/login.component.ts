import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'login-page',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required
        ]
      ],

      rememberMe: [false]
    });
  }

  onSubmit(): void {

    this.successMessage = '';
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({

      next: (response) => {

        this.isLoading = false;

          if(response.success) this.router.navigate(['/dashboard'])
          else this.router.navigate(['/login'])
      },

      error: (error) => {

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ||
          'Invalid email or password.';
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe');
  }
}