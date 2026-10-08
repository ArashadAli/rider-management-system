import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderService } from 'src/app/core/services/loader.service';
import { DashboardService } from 'src/app/core/services/dashboard.service';

import { Subject } from 'rxjs';
import { takeUntil, finalize, retry } from 'rxjs/operators';

import {
  DashboardData,
  DashboardOrder,
  DashboardRider
} from 'src/app/core/models/dashboard-response.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  dashboard: DashboardData | null = null;

  recentOrders: DashboardOrder[] = [];
  recentRiders: DashboardRider[] = [];

  isLoading = false;

  constructor(
    private loaderService: LoaderService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loaderService.show();
    this.isLoading = true;

    this.dashboardService
      .getDashboardStats()
      .pipe(
        retry(2),
        takeUntil(this.destroy$),
        finalize(() => {
          this.loaderService.hide();
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.dashboard = response.data;
            this.recentOrders = response.data.recent_orders;
            this.recentRiders = response.data.recent_riders;
          }
        },
        error: (error) => {
          console.error(
            'Dashboard fetching error:',
            error
          );
        }
      });
  }

  getOrderStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-50 text-green-700';

      case 'pending':
        return 'bg-amber-50 text-amber-700';

      case 'cancelled':
        return 'bg-red-50 text-red-700';

      case 'assigned':
        return 'bg-blue-50 text-blue-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getRiderStatusClass(status: string): string {
    return status?.toLowerCase() === 'active'
      ? 'bg-green-50 text-green-700'
      : 'bg-red-50 text-red-700';
  }

  getAvailabilityClass(availability: string): string {
    return availability?.toLowerCase() === 'available'
      ? 'bg-green-50 text-green-700'
      : 'bg-gray-100 text-gray-700';
  }

  formatDate(date: string | null): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}