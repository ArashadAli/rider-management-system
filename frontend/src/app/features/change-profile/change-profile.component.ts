import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { CustomToastService } from 'src/app/core/services/toast.service';
import { BreadcrumbComponent } from 'src/app/shared/components/breadcrumb/breadcrumb.component';
import { User } from 'src/app/core/models/auth-response.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-change-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbComponent,
    LucideAngularModule
  ],
  templateUrl: './change-profile.component.html'
})
export class ChangeProfileComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  user: User | null = null;

  profileForm = {
    name: '',
    mobile: ''
  };

  loadingProfile = false;

  constructor(
    private authService: AuthService,
    private toastService: CustomToastService
  ) {}

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
      .pipe(takeUntil(this.destroy$))
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
