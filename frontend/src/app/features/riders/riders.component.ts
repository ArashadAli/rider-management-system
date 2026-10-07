import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RidersService } from 'src/app/core/services/riders.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import {
  Rider,
  CreateRiderResponse
} from 'src/app/core/models/rider-response.model';
import { Subject, of } from 'rxjs';
import { takeUntil, finalize, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { BreadcrumbComponent } from 'src/app/shared/components/breadcrumb/breadcrumb.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-riders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbComponent
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
  pageSize = 5;
  totalPages = 0;
  totalRiders = 0;

  filterForm!: FormGroup;

  sortBy = 'created_at';
  sortOrder = 'desc';

  newRider: CreateRiderResponse = {
    name: '',
    email: '',
    mobile: ''
  };


  showProfileModal = false;
  selectedRider: Rider | null = null;

  constructor(
    private ridersService: RidersService,
    private loaderService: LoaderService,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      availability: [''],
      sortBy: ['created_at'],
      sortOrder: ['desc']
    });

    this.getPaginatedRiders();
    this.setupFilterListeners();

    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {

        const riderId = params.get('id');

        if (riderId) {
          this.openRiderProfile(riderId);
        } else {
          this.showProfileModal = false;
          this.selectedRider = null;
        }

      });
  }

  setupFilterListeners(): void {

    this.filterForm.valueChanges
      .pipe(

        debounceTime(600),

        distinctUntilChanged(
          (previous, current) =>
            JSON.stringify(previous) === JSON.stringify(current)
        ),

        switchMap(filters => {

          this.currentPage = 1;

          // console.log('Filters changed:', filters);

          this.loading = true;
          this.loaderService.show();

          return this.ridersService
            .getPaginatedRiders(
              this.currentPage,
              this.pageSize,
              filters.search,
              filters.status,
              filters.availability,
              filters.sortBy,
              filters.sortOrder
            )
            .pipe(

              catchError(error => {

                console.error(
                  'Failed to fetch riders:',
                  error
                );

                return of(null);
              }),

              finalize(() => {

                this.loading = false;
                this.loaderService.hide();

              })

            );

        }),

        takeUntil(this.destroy$)

      )
      .subscribe(response => {

        if (!response) {
          return;
        }

        if (response.success) {

          this.riders = response.data.riders;

          this.currentPage =
            response.pagination.page;

          this.pageSize =
            response.pagination.limit;

          this.totalRiders =
            response.pagination.total;

          this.totalPages =
            response.pagination.pages;
        }

      });
  }

  getPaginatedRiders(): void {

    const filters = this.filterForm?.value || {};

    this.loading = true;
    this.loaderService.show();

    this.ridersService
      .getPaginatedRiders(
        this.currentPage,
        this.pageSize,
        filters.search || '',
        filters.status || '',
        filters.availability || '',
        filters.sortBy || 'created_at',
        filters.sortOrder || 'desc'
      )
      .pipe(

        takeUntil(this.destroy$),

        finalize(() => {
          this.loading = false;
          this.loaderService.hide();
        }),

        catchError(error => {

          console.error(
            'Failed to fetch riders:',
            error
          );

          return of(null);
        })

      )
      .subscribe(response => {

        if (!response) {
          return;
        }

        if (response.success) {

          this.riders =
            response.data.riders;

          this.currentPage =
            response.pagination.page;

          this.pageSize =
            response.pagination.limit;

          this.totalRiders =
            response.pagination.total;

          this.totalPages =
            response.pagination.pages;
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
            this.getPaginatedRiders();
          }

        },

        error: (error) => {
          console.error('Failed to create rider:', error);
        }
      });
  }

  resetFilters(): void {

    this.currentPage = 1;

    this.filterForm.reset({
      search: '',
      status: '',
      availability: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getPaginatedRiders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getPaginatedRiders();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getPaginatedRiders();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.getPaginatedRiders();
  }

  toggleStatus(rider: Rider): void {

    this.loading = true;
    this.loaderService.show();

    this.ridersService.updateRiderStatus(rider.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.getPaginatedRiders();
        }
      },
      error: (error) => {
        console.error('Failed to update rider status:', error);
        this.loading = false;
        this.loaderService.hide();
      }
    })
  }

  openRiderProfile(riderId: string): void {

    const rider = this.riders.find(
      item => item.id === riderId
    );

    console.log("rider from open profile:", rider);

    if (!rider) {
      return;
    }

    this.selectedRider = rider;
    this.showProfileModal = true;
  }

  closeRiderProfile(): void {

    this.showProfileModal = false;
    this.selectedRider = null;

    this.router.navigate(['/riders']);

  }

  viewRider(rider: Rider): void {

    this.router.navigate([
      '/riders',
      rider.id
    ]);

    this.openRiderProfile(rider.id);

  }

}