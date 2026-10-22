import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output} from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { CustomToastService } from 'src/app/core/services/toast.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();
  user$ = this.authService.user$;
  isDropdownOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: CustomToastService
  ) {}

  toggleSidebar(): void {
    this.menuToggle.emit();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isDropdownOpen = false;
    }
  }

  onMenuAction(action: 'profile' | 'password' | 'logout'): void {
    this.isDropdownOpen = false;
    switch (action) {
      case 'profile':
        this.router.navigate(['/settings/profile']);
        break;
      case 'password':
        this.router.navigate(['/settings/change-password']);
        break;
      case 'logout':
        this.logoutUser();
        break;
    }
  }

  logoutUser(): void {
    this.authService.logout()
    .subscribe({
      next:(response) => {
        if(response.success) {
          this.toastService.success(response.message || 'User logout successfully')
          localStorage.removeItem('csrf_token')
          this.authService.clearUser()
          this.router.navigate(['/login'])
        }
      },
      error:(error) => {
        this.toastService.error(error.message || 'Server error')
        localStorage.removeItem('csrf_token')
        this.authService.clearUser()
        this.router.navigate(['/login'])
      }
    })
  }
}
