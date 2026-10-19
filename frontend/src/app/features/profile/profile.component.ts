import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { BreadcrumbComponent } from 'src/app/shared/components/breadcrumb/breadcrumb.component';
import { CustomToastService } from 'src/app/core/services/toast.service';

import { User } from 'src/app/core/models/auth-response.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  user: User | null = null;
  profileForm = {
    name: '',
    mobile: ''
  };
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  loadingProfile = false;
  loadingPassword = false;

  constructor(
    private authService: AuthService,
    private toastService: CustomToastService
  ) { }

  ngOnInit(): void {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.user = user;
          this.profileForm.name = user.name || '';
          this.profileForm.mobile = user.mobile || '';
        }
      });
    this.authService.ensureProfileLoaded()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () => {
          this.toastService.error('Unable to load profile. Please try again.');
        }
      });
  }

  updateProfile(): void {
    const name = this.profileForm.name.trim();
    const mobile = this.profileForm.mobile.trim();
    if (!name || !mobile) {
      this.toastService.error('Name and mobile number are required.');
      return;
    }
    if (this.loadingProfile) {
      return;
    }
    this.loadingProfile = true;
    this.authService.updateProfile({ name, mobile })
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          if (response.success && response.user) {
            this.authService.setUser(response.user);
            this.toastService.success(response.message || 'Profile updated successfully.');
          }
          else {
            this.toastService.error(response.message || 'Unable to update profile.');
          }
          this.loadingProfile = false;
        },
        error: error => {
          this.toastService.error(error?.error?.message || 'Failed to update profile.');
          this.loadingProfile = false;
        }
      });
  }

  changePassword(): void {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      this.toastService.error('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.toastService.error('New password and confirm password do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      this.toastService.error('New password must be different from the current password.');
      return;
    }
    if (this.loadingPassword) {
      return;
    }
    this.loadingPassword = true;
    this.authService.changePassword({
      currentPassword,
      newPassword
    })
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          if (response.success) {
            this.toastService.success(response.message || 'Password changed successfully.');
            this.passwordForm = {
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            };
            this.showCurrentPassword = false;
            this.showNewPassword = false;
            this.showConfirmPassword = false;
          }
          else {
            this.toastService.error(response.message || 'Unable to change password.');
          }
          this.loadingPassword = false;
        },
        error: error => {
          this.toastService.error(error?.error?.message || 'Failed to change password.');
          this.loadingPassword = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}