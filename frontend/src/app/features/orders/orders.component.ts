import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../core/services/orders.service';
import { Order } from '../../core/models/order-response.model';

interface Rider {
  id: number;
  name: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  showCreateOrder = false;

  currentPage = 1;

  pageSize = 10;

  totalOrders = 0;

  totalPages = 0;

  hasNext = false;

  hasPrevious = false;

  orders: Order[] = [];

  availableRiders: Rider[] = [
  {
    "id": 1,
    "name": "Ahmed"
  },
  {
    "id": 2,
    "name": "Mohammed"
  },
  {
    "id": 3,
    "name": "Ali"
  }
];

  filters = {
    search: '',
    status: '',
    rider: '',
    date: '',
    sort: 'newest'
  };

  newOrder = {
    order_item: '',
    customer_name: '',
    customer_mobile: '',
    pickup_address: '',
    delivery_address: '',
    amount: 0
  };

  constructor(
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.loadOrders();

    // TODO: Call the rider API here to fetch all available/free riders
    // this.loadAvailableRiders();
  }

  loadOrders(): void {

    this.ordersService
      .getOrders(this.currentPage, this.pageSize)
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
        },

        error: (error) => {
          console.error('Error loading orders:', error);
        }
      });
  }

  openCreateOrder(): void {
    this.showCreateOrder = true;
  }

  closeCreateOrder(): void {
    this.showCreateOrder = false;
  }

  createOrder(): void {

    if (
      !this.newOrder.order_item.trim() ||
      !this.newOrder.customer_name.trim() ||
      !this.newOrder.customer_mobile.trim() ||
      !this.newOrder.pickup_address.trim() ||
      !this.newOrder.delivery_address.trim() ||
      this.newOrder.amount <= 0
    ) {
      alert('Please fill all required fields.');
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;

    if (!mobileRegex.test(this.newOrder.customer_mobile.trim())) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    const orderPayload = {
      order_item: this.newOrder.order_item,
      customer_name: this.newOrder.customer_name,
      customer_mobile: this.newOrder.customer_mobile,
      pickup_address: this.newOrder.pickup_address,
      delivery_address: this.newOrder.delivery_address,
      amount: this.newOrder.amount
    };

    this.ordersService.createOrder(orderPayload).subscribe({
      next: (response) => {

        console.log('Order created successfully:', response);

        this.closeCreateOrder();

        this.resetOrderForm();

        this.currentPage = 1;

        this.loadOrders();
      },

      error: (error) => {
        console.error('Error creating order:', error);
      }
    });
  }

  resetOrderForm(): void {

    this.newOrder = {
      order_item: '',
      customer_name: '',
      customer_mobile: '',
      pickup_address: '',
      delivery_address: '',
      amount: 0
    };
  }

  assignRider(order: Order, riderId: number | null): void {

    if (!riderId) {
      return;
    }

    console.log(
      'Assign rider:',
      riderId,
      'to order:',
      order.order_id
    );

    // TODO: Call assign-rider API here when the rider assignment API is created
  }

  formatDate(date: string | null): string {

    if (!date) {
      return '-';
    }

    const formattedDate = new Date(date);

    return formattedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  applyFilters(): void {
    console.log('Filters:', this.filters);
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

  getStatusClass(status: string): string {

    switch (status) {

      case 'pending':
        return 'pending';

      case 'accepted':
        return 'accepted';

      case 'picked_up':
        return 'picked-up';

      case 'on_the_way':
        return 'on-the-way';

      case 'delivered':
        return 'delivered';

      case 'cancelled':
        return 'cancelled';

      default:
        return '';
    }
  }

  formatStatus(status: string): string {

    switch (status) {

      case 'pending':
        return 'Pending';

      case 'accepted':
        return 'Accepted';

      case 'picked_up':
        return 'Picked Up';

      case 'on_the_way':
        return 'On The Way';

      case 'delivered':
        return 'Delivered';

      case 'cancelled':
        return 'Cancelled';

      default:
        return status;
    }
  }
}