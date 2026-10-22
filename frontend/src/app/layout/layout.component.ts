import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { GlobalLoaderComponent } from '../shared/components/global-loader/global-loader.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    GlobalLoaderComponent,
    CommonModule
  ],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {

  sidebarOpen = false;
  sidebarExpanded = false;

  toggleSidebar(): void {
    if(window.innerWidth < 1024) {
      this.sidebarOpen = !this.sidebarOpen
    }
    else {
      this.sidebarExpanded = !this.sidebarExpanded
    }
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  @HostListener('window:resize')
    onWindowResize(): void {
      if(window.innerWidth >= 1024) {
        this.sidebarOpen = false
      }
    }

}