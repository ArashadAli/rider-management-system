import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { get } from 'http';

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
export class LayoutComponent implements OnInit {

  sidebarOpen = false;

  userName = '';
  userInfo: any

  constructor(
    private authService: AuthService,
    private route: Router
  ) {

  }

  ngOnInit(): void {
    this.getAll()
  }



  getAll() {
    this.authService.profile().subscribe({
      next: (response) => {
        this.userInfo = response;
        this.userName = this.userInfo.user.name
      },
      error: (error) => {
        console.error('Profile failed', error);
      }
    });
  }

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
        if (response.success) this.route.navigate(['/login'])
      },

      error: (error) => {
        console.error('Logout failed', error);
      }

    });

  }
}