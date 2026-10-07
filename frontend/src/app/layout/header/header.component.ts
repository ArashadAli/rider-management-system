import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

  @Output() menuToggle = new EventEmitter<void>();

  userName = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getProfile();
  }

  getProfile(): void {
    this.authService.profile().subscribe({
      next: (response) => {
        this.userName = response.user.name;
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
    this.menuToggle.emit();
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