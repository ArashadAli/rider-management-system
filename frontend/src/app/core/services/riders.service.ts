import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  CreateRiderResponse,
  OneRiderResponse,
  RiderResponse,
  UpdateRiderStatusResponse
} from '../models/rider-response.model';

@Injectable({
  providedIn: 'root'
})
export class RidersService {

  constructor(
    private apiService: ApiService
  ) {}

  createRider(riderDetails: CreateRiderResponse): Observable<OneRiderResponse> {
    
    return this.apiService.post<OneRiderResponse>(
      '/riders/create',
      riderDetails
    );
  }

  getPaginatedRiders(
    page: number = 1,
    limit: number = 5,
    search: string = '',
    status: string = '',
    availability: string = '',
    sortBy: string = 'created_at',
    sortOrder: string = 'desc'
  ): Observable<RiderResponse> {

    let url =
      `/riders/paginate?page=${page}&limit=${limit}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }

    if (availability) {
      url += `&availability=${encodeURIComponent(availability)}`;
    }

    if (sortBy) {
      url += `&sort_by=${encodeURIComponent(sortBy)}`;
    }

    if (sortOrder) {
      url += `&sort_order=${encodeURIComponent(sortOrder)}`;
    }

    return this.apiService.get<RiderResponse>(url);
  }

  updateRiderStatus(riderId: string): Observable<UpdateRiderStatusResponse> {

    return this.apiService.patch<UpdateRiderStatusResponse>(
      `/riders/rider-action/${riderId}`,
      {}
    );
  }
}