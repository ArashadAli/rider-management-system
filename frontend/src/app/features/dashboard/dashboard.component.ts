import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';

import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { OrdersService } from 'src/app/core/services/orders.service';
import { AllOrdersResponse, Order } from 'src/app/core/models/order-response.model';

interface DashboardStats {
  totalOrders: number;
  activeRiders: number;
  pendingOrders: number;
  deliveredOrders: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  orders: Order[] = [];

  stats: DashboardStats = {
    totalOrders: 0,
    activeRiders: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  };

  recentOrders: Order[] = [];

  isLoading = false;

  /*
   * Demo rider data.
   *
   * Replace this with your Riders API later.
   */
  riderStats = {
    totalRiders: 12,
    activeRiders: 8,
    inactiveRiders: 4
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private loaderService: LoaderService,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {

    this.loaderService.show();
    this.isLoading = true;

    this.ordersService
      .getAllOrders()
      .pipe(
        takeUntil(this.destroy$),

        finalize(() => {
          this.loaderService.hide();
          this.isLoading = false;
        })
      )
      .subscribe({

        next: (response: AllOrdersResponse) => {

          // console.log('Dashboard orders:', response);

          if (response.success && response.data) {

            this.orders = response.data;

            this.calculateDashboardStats();

            this.getRecentOrders();

          }

        },

        error: (error) => {

          console.error(
            'Dashboard orders fetching error:',
            error
          );

        }

      });
  }

  calculateDashboardStats(): void {

    const pendingOrders = this.orders.filter(
      order =>
        order.status?.toLowerCase() === 'pending'
    );

    const deliveredOrders = this.orders.filter(
      order =>
        order.status?.toLowerCase() === 'delivered'
    );

    this.stats = {

      totalOrders: this.orders.length,

      activeRiders: this.riderStats.activeRiders,

      pendingOrders: pendingOrders.length,

      deliveredOrders: deliveredOrders.length

    };
  }

getRecentOrders(): void {

  this.recentOrders = [...this.orders]
    .sort((a, b) => {

      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;

      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

      return dateB - dateA;
    })
    .slice(0, 5);

}

  getStatusCount(status: string): number {

    return this.orders.filter(
      order =>
        order.status?.toLowerCase() === status.toLowerCase()
    ).length;
  }

  getStatusPercentage(status: string): number {

    if (!this.orders.length) {
      return 0;
    }

    const count = this.getStatusCount(status);

    return Math.round(
      (count / this.orders.length) * 100
    );
  }

  getStatusBarWidth(status: string): string {

    return `${this.getStatusPercentage(status)}%`;
  }

  getOrderAmount(): number {

    return this.orders.reduce(
      (total, order) =>
        total + Number(order.amount || 0),
      0
    );
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

  getActivityText(order: Order): string {

    switch (order.status?.toLowerCase()) {

      case 'delivered':
        return 'Order delivered successfully';

      case 'pending':
        return 'Order is pending';

      case 'assigned':
        return 'Rider assigned to order';

      case 'cancelled':
        return 'Order was cancelled';

      default:
        return 'Order status updated';
    }
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