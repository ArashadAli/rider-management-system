import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { OrderResponse, AllOrdersResponse } from '../models/order-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private apiService: ApiService) {}

  createOrder(orderDetails: any): Observable<OrderResponse> {
    return this.apiService.post<OrderResponse>(
      '/orders/create',
      orderDetails
    );
  }

  getOrders(page: number, limit: number): Observable<OrderResponse> {
    return this.apiService.get<OrderResponse>(
      `/orders/pagination?page=${page}&limit=${limit}`
    );
  }

  getAllOrders(): Observable<AllOrdersResponse> {
    return this.apiService.get<AllOrdersResponse>(
      `/orders/allOrders`
    );
  }

}