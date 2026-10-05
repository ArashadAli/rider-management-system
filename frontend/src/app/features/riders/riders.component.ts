import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RidersService } from 'src/app/core/services/riders.service';
import { LoaderService } from 'src/app/core/services/loader.service';

import {
  Rider,
  RiderResponse,
  CreateRiderResponse
} from 'src/app/core/models/rider-response.model';

import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-riders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './riders.component.html',
  styleUrls: ['./riders.component.css']
})

export class RidersComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  riders: Rider[] = [];

  loading = false;
  showCreateModal = false;

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalRiders = 0;

  filters = {
    email: '',
    mobile: '',
    status: '',
    availability: ''
  };

  newRider: CreateRiderResponse = {
    name: '',
    email: '',
    mobile: ''
  };

  constructor(
    private ridersService: RidersService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.getAllRiders();
  }

  getAllRiders(): void {
    this.loaderService.show();
    this.loading = true;

    this.ridersService
      .getAllRiders(this.currentPage, this.pageSize)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loaderService.hide();
          this.loading = false;
        })
      )
      .subscribe({
        next: (response: RiderResponse) => {

          if (response.success) {
            this.riders = response.data.riders;
            this.currentPage = response.pagination.page;
            this.pageSize = response.pagination.limit;
            this.totalRiders = response.pagination.total;
            this.totalPages = response.pagination.pages;
          }

          this.loading = false;
        },

        error: (error) => {
          console.error('Failed to fetch riders:', error);
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {

    // console.log("RidersComponent destroyed");
    this.destroy$.next();
    this.destroy$.complete();
  }

  openCreateModal(): void {
    this.newRider = {
      name: '',
      email: '',
      mobile: ''
    };

    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createRider(): void {

    if (
      !this.newRider.name ||
      !this.newRider.email ||
      !this.newRider.mobile
    ) {
      return;
    }

    this.ridersService
      .createRider(this.newRider)
      .subscribe({
        next: (response) => {

          if (response.success) {
            this.closeCreateModal();
            this.getAllRiders();
          }

        },

        error: (error) => {
          console.error('Failed to create rider:', error);
        }
      });
  }

  applyFilters(): void {
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.filters = {
      email: '',
      mobile: '',
      status: '',
      availability: ''
    };

    this.currentPage = 1;
    this.getAllRiders();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getAllRiders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getAllRiders();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getAllRiders();
    }
  }

  toggleStatus(rider: Rider): void {
    const newStatus =
      rider.status === 'active'
        ? 'inactive'
        : 'active';

    console.log(rider.id, newStatus);
  }
}