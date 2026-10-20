import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { OrderResponse, AllOrdersResponse, RiderResponse, SingleOrderResponse } from '../models/order-response.model';
import { AvailableRiderResponse, AssignRiderResponse } from '../models/rider-response.model';
import { CommonResponse } from '../models/auth-response.model';

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

  getOrders(
    page: number, 
    limit: number,
    filters: {
      search: string,
      status: string,
      rider: string,
      date: string,
      sort: string
    }
  ): Observable<OrderResponse> {

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: filters.search || '',
      status: filters.status || '',
      rider: filters.rider || '',
      date: filters.date || '',
      sort: filters.sort || 'newest'
    })

    return this.apiService.get<OrderResponse>(
      `/orders/pagination?${params.toString()}`
    );
  }

  getAllOrders(): Observable<AllOrdersResponse> {
    return this.apiService.get<AllOrdersResponse>(
      `/orders/allOrders`
    );
  }

  assignOrder(order_id: string, rider_id: string): Observable<AssignRiderResponse> {
    return this.apiService.post<AssignRiderResponse>(
      `/orders/assign-rider/${order_id}`,
      {rider_id}
    )
  }

  updateOrderStatus(order_id: string, status: string): Observable<RiderResponse> {
    return this.apiService.post<RiderResponse>(
      `/orders/update-order-status/${order_id}`,
      {status}
    )
  }

  getSingleOrder(order_id : string): Observable<SingleOrderResponse> {
    return this.apiService.get<SingleOrderResponse>(
      `/orders/single-order/${order_id}`
    )
  }

  deleteOrder(order_id: string): Observable<CommonResponse> {
    return this.apiService.delete<CommonResponse>(
      `/orders/delete-order/${order_id}`
    )
  }

}