
import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { CustomToastService } from 'src/app/core/services/toast.service';
import { BreadcrumbComponent } from 'src/app/shared/components/breadcrumb/breadcrumb.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BreadcrumbComponent,
        LucideAngularModule
    ],
    templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent implements OnDestroy {

    private destroy$ = new Subject<void>();

    passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    showCurrentPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;
    loadingPassword = false;

    constructor(
        private authService: AuthService,
        private toastService: CustomToastService
    ) { }

    changePassword(): void {
        const { currentPassword, newPassword, confirmPassword } = this.passwordForm;
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.toastService.error('Please fill in all password fields.' );
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
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: response => {
                    if (response.success) {
                        this.toastService.success( response.message || 'Password changed successfully.');
                        this.passwordForm = {
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                        };
                        this.showCurrentPassword = false;
                        this.showNewPassword = false;
                        this.showConfirmPassword = false;
                    } else {
                        this.toastService.error( response.message || 'Unable to change password.');
                    }
                    this.loadingPassword = false;
                },
                error: error => {
                    this.toastService.error( error?.error?.message || 'Failed to change password.');
                    this.loadingPassword = false;
                }
            });
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
