
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EMPTY, Subject } from 'rxjs';
import {  catchError, debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { OrdersService } from 'src/app/core/services/orders.service';
import { RidersService } from 'src/app/core/services/riders.service';
import { CustomToastService } from 'src/app/core/services/toast.service';
import { Order } from 'src/app/core/models/order-response.model';
import { AvailableRider } from 'src/app/core/models/rider-response.model';
import { BreadcrumbComponent } from 'src/app/shared/components/breadcrumb/breadcrumb.component';
import { OrderDrawerComponent } from './orders-drawer/order-drawer.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbComponent,
    OrderDrawerComponent,
    LucideAngularModule
  ],
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private loadOrders$ = new Subject<void>();

  showCreateOrder = false;
  order_id: string | null = null
  drawerMode : 'create' | 'view' = 'create'
  deleteConfirmationOpen = false;
  deletingOrderId: string | null = null
  orderToDelete: {order_id: string} | null = null

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
    
  }

  ngOnInit(): void {
    this.loadOrders$
      .pipe(
        debounceTime(600),
        switchMap(() => {
          this.loadingOrders = true;
          return this.ordersService
            .getOrders(this.currentPage, this.pageSize, this.filters)
            .pipe(
              catchError((error) => {
                console.log("Failed to load orders: ", error)
                return EMPTY;
              }),
              finalize(() => {
                this.loadingOrders = false;
              })
            )
        }),
        takeUntil(this.destroy$)
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
      })

      this.loadOrders();
  }

  loadOrders(): void {
    this.loadOrders$.next();
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
          this.refreshRiderLists();
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

    if(status === 'cancelled') {
      const confirm = window.confirm(`Are you sure you want to cancle order ${order.order_id}`)

      if(!confirm) {
        this.loadOrders();
        return;
      }
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
    this.drawerMode = 'create',
    this.order_id = null
    this.showCreateOrder = true;
  }

  closeCreateOrder(): void {
    this.showCreateOrder = false;
    this.order_id = null
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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

  firstPage(): void {
    if(this.currentPage > 1) {
      this.currentPage = 1;
      this.loadOrders();
    }
  }

  lastPage(): void {
    if(this.currentPage < this.totalPages) {
      this.currentPage = this.totalPages;
      this.loadOrders();
    }
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

  openOrderViewDrawer(order_id: string): void{
    this.drawerMode = 'view';
    this.order_id = order_id;
    this.showCreateOrder = true
  }

  refreshRiderLists(): void {
    this.availableRiders = [];
    this.busyRiders = [];
    this.hasLoadedAvailableRiders = false;
    this.hasLoadedBusyRiders = false;
  }

  confirmDeleteOrder(order: {order_id: string}): void {
    this.orderToDelete = order;
    this.deleteConfirmationOpen = true;
  }

  closeDeleteConfirmation(): void {
    if(this.deletingOrderId) return

    this.deleteConfirmationOpen = false
    this.orderToDelete = null;
  }

  deleteSelectedOrder(): void {
    if(!this.orderToDelete || this.deletingOrderId) {
      return
    }
    const orderId = this.orderToDelete.order_id;
    this.deletingOrderId = orderId;
    this.ordersService.deleteOrder(orderId)
    .pipe(
      finalize(() => {
        this.deletingOrderId = null
        this.closeDeleteConfirmation()
      })
    )
    .subscribe({
      next: (response) => {
        if(response.success) {
          this.toastService.success(response.message)
          this.closeDeleteConfirmation();
          this.applyFilters();
        }
      },
      error: (error) => {
        this.toastService.error(error?.error?.message || 'Failed to delete order')
      }
    })
  }
  
}
