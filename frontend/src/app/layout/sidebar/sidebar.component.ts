import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  closeOnMobile(): void {
    if (window.innerWidth <= 768) {
      this.closeSidebar.emit();
    }
  }
}