import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {

  @Input() sidebarOpen = false;

  @Output() closeSidebar = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) { }

  closeOnMobile(): void {
    if (window.innerWidth <= 768) {
      this.closeSidebar.emit();
    }
  }
  logoutUser(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        if (response.success) {
          localStorage.removeItem('csrf_token');
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Logout failed', error);
        localStorage.removeItem('csrf_token');
        this.router.navigate(['/login']);
      }
    });
  }

}