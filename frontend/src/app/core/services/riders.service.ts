import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { CreateRiderResponse, OneRiderResponse, RiderResponse } from '../models/rider-response.model';

@Injectable({
  providedIn: 'root'
})
export class RidersService {

  constructor(private apiService: ApiService) {}

  createRider(riderDetails: CreateRiderResponse): Observable<OneRiderResponse> {
    return this.apiService.post<OneRiderResponse>(
      '/riders/create',
      riderDetails
    );
  }

  getAllRiders(page: number = 1, limit: number = 10): Observable<RiderResponse> {
    return this.apiService.get<RiderResponse>(
      `/riders/allRiders?page=${page}&limit=${limit}`
    );
  }

}