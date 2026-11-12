import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { CustomToastService } from 'src/app/core/services/toast.service';
import { BreadcrumbComponent } from 'src/app/shared/components/breadcrumb/breadcrumb.component';
import { User } from 'src/app/core/models/auth-response.model';
import { LucideAngularModule } from 'lucide-angular';
import { ImageUploadComponent } from 'src/app/shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-change-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbComponent,
    LucideAngularModule,
    ImageUploadComponent
  ],
  templateUrl: './change-profile.component.html'
})
export class ChangeProfileComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  user: User | null = null;
  selectedImage: File | null = null;

  @ViewChild(ImageUploadComponent) imageUpload?: ImageUploadComponent;

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
    if (this.loadingProfile){
      return;
    }
    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobile', mobile);
    if (this.selectedImage) {
      formData.append('profile_image', this.selectedImage);
    }
    this.loadingProfile = true;
    this.authService.updateProfile(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          if (response.success && response.user) {
            this.authService.setUser(response.user);
            this.selectedImage = null;
            this.imageUpload?.reset();
            this.toastService.success(response.message || 'Profile updated successfully.');
          }
          this.loadingProfile = false;
        },
        error: error => {
          this.loadingProfile = false;
        }
      });
  }

  onImageSelected(file: File | null): void {
    this.selectedImage = file;
  }

  revertChanges(): void {
    this.profileForm.name = this.user?.name || '';
    this.profileForm.mobile = this.user?.mobile || '';
    this.selectedImage = null;
    this.imageUpload?.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
