
import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, finalize, takeUntil, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { OrdersService } from 'src/app/core/services/orders.service';
import { RidersService } from 'src/app/core/services/riders.service';
import { CustomToastService } from 'src/app/core/services/toast.service';
import { Order } from 'src/app/core/models/order-response.model';
import { AvailableRider } from 'src/app/core/models/rider-response.model';
import { BreadcrumbComponent } from 'src/app/shared/components/breadcrumb/breadcrumb.component';
import { OrderDrawerComponent } from './orders-drawer/order-drawer.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbComponent,
    OrderDrawerComponent
  ],
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  showCreateOrder = false;
  loadingRiders = false;
  assigningOrderId: string | null = null;
  updatingStatusOrderId: string | null = null;
  currentPage : number = 1;
  pageSize = 10;
  totalOrders = 0;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;
  orders: Order[] = [];
  availableRiders: AvailableRider[] = [];
  busyRiders: AvailableRider[] = [];
  loadingBusyRiders = false;
  filters = {
    search: '',
    status: '',
    rider: '',
    date: '',
    sort: 'newest'
  };
  loadingOrders = false;
  hasLoadedAvailableRiders = false;
  hasLoadedBusyRiders = false;

  constructor(
    private ordersService: OrdersService,
    private ridersService: RidersService,
    private toastService: CustomToastService
  ) { 

    this.loadOrders();
  }


  loadOrders(): void {
    this.loadingOrders = true;
    this.ordersService.getOrders(this.currentPage, this.pageSize, this.filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingOrders = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.orders = response.data.orders;
            this.currentPage = response.data.current_page;
            this.pageSize = response.data.page_size;
            this.totalOrders = response.data.total_orders;
            this.totalPages = response.data.total_pages;
            this.hasNext = response.data.has_next;
            this.hasPrevious = response.data.has_previous;
          } 
          else {
            this.toastService.error( response.message || 'Failed to load orders.');
          }
        },
        error: (error) => {
          this.toastService.error(error?.error?.message || 'Failed to load orders.');
        }
      });
  }

  loadAvailableRiders(): void {
    if (this.loadingRiders || this.hasLoadedAvailableRiders) {
      return;
    }
    this.loadingRiders = true;
    this.ridersService.getAvailableRiders()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingRiders = false
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.availableRiders = response.data;
            this.hasLoadedAvailableRiders = true
          } 
          else {
            this.toastService.error(response.message || 'Failed to load available riders.');
          }
        },
        error: (error) => {
          this.toastService.error(error?.error?.message || 'Failed to load available riders.');
        }
      });
  }

  assignRider(order: Order, riderId: string | null): void {
    if (!riderId || this.assigningOrderId) {
      return;
    }
    if (order.rider_id) {
      this.toastService.warning('This order already has an assigned rider.');
      this.loadOrders();
      return;
    }
    this.assigningOrderId = order.order_id;
    this.ordersService.assignOrder(order.order_id, riderId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.assigningOrderId = null;
        })
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.toastService.error(response.message || 'Failed to assign rider.');
            this.loadOrders();
            return;
          }
          this.toastService.success(response.message || 'Rider assigned successfully.');
          this.loadOrders();
          this.loadAvailableRiders();
        },
        error: (error) => {
          this.toastService.error(error?.error?.message || 'Failed to assign rider.');
          this.loadOrders();
        }
      });
  }

  updateOrderStatus(order: Order, status: string): void {
    if ( !status || status === order.status || this.updatingStatusOrderId ) {
      return;
    }
    this.updatingStatusOrderId = order.order_id;
    this.ordersService.updateOrderStatus(order.order_id, status)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.updatingStatusOrderId = null;
        })
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.toastService.error(response.message || 'Failed to update order status.');
            this.loadOrders();
            return;
          }
          this.toastService.success(response.message || 'Order status updated successfully.');
          this.loadOrders();
        },
        error: (error) => {
          this.toastService.error( error?.error?.message || 'Failed to update order status.');
          this.loadOrders();
        }
      });
  }

  openCreateOrder(): void {
    this.showCreateOrder = true;
  }

  closeCreateOrder(): void {
    this.showCreateOrder = false;
  }

  onOrderCreated(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  formatDate(date: string | null): string {
    if (!date) {
      return '-';
    }
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700',
      'rider assigned': 'bg-indigo-50 text-indigo-700',
      assigned: 'bg-indigo-50 text-indigo-700',
      accepted: 'bg-blue-50 text-blue-700',
      picked_up: 'bg-purple-50 text-purple-700',
      on_the_way: 'bg-emerald-50 text-emerald-700',
      delivered: 'bg-green-50 text-green-700',
      cancelled: 'bg-red-50 text-red-700'
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  formatStatus(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pending',
      assigned: 'Rider Assigned',
      accepted: 'Accepted',
      picked_up: 'Picked Up',
      on_the_way: 'On The Way',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      status: '',
      rider: '',
      date: '',
      sort: 'newest'
    };
    this.currentPage = 1;
    this.loadOrders();
  }

  changePageSize(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  previousPage(): void {
    if (this.hasPrevious) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.hasNext) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBusyRiders(): void {
    if (this.loadingBusyRiders || this.hasLoadedBusyRiders) {
      return;
    }
    this.loadingBusyRiders = true;
    this.ridersService.getBusyRiders()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingBusyRiders = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.busyRiders = response.data;
            this.hasLoadedBusyRiders = true
          } 
          else {
            this.toastService.error(response.message || 'Failed to load busy riders.');
          }
        },
        error: (error) => {
          this.toastService.error(error?.error?.message || 'Failed to load busy riders.');
        }
      });
  }
}
