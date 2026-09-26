import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        mobile: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{10}$/)
          ]
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8)
          ]
        ],
        confirm_password: [
          '',
          [
            Validators.required
          ]
        ]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirm_password')?.value;

    if (password !== confirmPassword) {
      control.get('confirm_password')?.setErrors({
        passwordMismatch: true
      });

      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {

    this.successMessage = '';
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const userData = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: (response) => {

        this.isLoading = false;

        if (response.success) {
          this.successMessage = response.message;

          this.registerForm.reset();
        }
      },

      error: (error) => {

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ||
          'Something went wrong. Please try again.';
      }
    });
  }

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get mobile() {
    return this.registerForm.get('mobile');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirm_password');
  }
}