import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

  sidebarOpen = false;

  userName = 'Arashad Ali';

  constructor(
    private authService: AuthService
  ) {}

  get userInitial(): string {
    return this.userName
      ? this.userName.charAt(0).toUpperCase()
      : 'U';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  logoutUser(): void {

    this.authService.logout().subscribe({

      next: (response) => {
        console.log('Logout successful', response);
      },

      error: (error) => {
        console.error('Logout failed', error);
      }

    });

  }
}