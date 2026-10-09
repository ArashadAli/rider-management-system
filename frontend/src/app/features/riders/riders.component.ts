import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RidersService } from 'src/app/core/services/riders.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import {
  Rider
} from 'src/app/core/models/rider-response.model';
import { Subject, of } from 'rxjs';
import { takeUntil, finalize, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { BreadcrumbComponent } from 'src/app/shared/components/breadcrumb/breadcrumb.component';
import { ActivatedRoute, Router } from '@angular/router';

import { CustomToastService } from 'src/app/core/services/toast.service';
import { RiderFormComponent } from './rider-form/rider-form.component';


@Component({
  selector: 'app-riders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbComponent,
    RiderFormComponent
  ],
  templateUrl: './riders.component.html',
  styleUrls: ['./riders.component.css']
})

export class RidersComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  riders: Rider[] = [];

  loading = false;
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalRiders = 0;

  filterForm!: FormGroup;

  sortBy = 'created_at';
  sortOrder = 'desc';

  drawerOpen = false;

  drawerMode: 'create' | 'view' | 'edit' = 'create';

  selectedRiderId: string | null = null;

  openActionMenuId: string | null = null;
  showDeleteConfirmation = false;
  selectedRiderToDelete: Rider | null = null;
  deletingRider = false;

  constructor(
    private ridersService: RidersService,
    private loaderService: LoaderService,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: CustomToastService
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
          this.drawerMode = 'view';
          this.selectedRiderId = riderId;
          this.drawerOpen = true;
        } else {
          this.drawerOpen = false;
          this.selectedRiderId = null;
        }

      });
  }

  setupFilterListeners(): void {

    this.filterForm.valueChanges
      .pipe(

        debounceTime(300),

        distinctUntilChanged(
          (previous, current) =>
            JSON.stringify(previous) === JSON.stringify(current)
        ),

        switchMap(filters => {

          this.currentPage = 1;

          this.loading = true;

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
                // this.loaderService.hide();

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
    // this.loaderService.show();

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
          // this.loaderService.hide();
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

        if (!response?.success) {
          return;
        }

        // this.toastService.success(response.message)

        this.riders = response.data.riders;

        this.currentPage = response.pagination.page;

        this.pageSize = response.pagination.limit;

        this.totalRiders = response.pagination.total;

        this.totalPages = response.pagination.pages;

      });
  }

  ngOnDestroy(): void {

    // console.log("RidersComponent destroyed");
    this.destroy$.next();
    this.destroy$.complete();
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
    // this.loaderService.show();

    this.ridersService.updateRiderStatus(rider.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message)
          this.getPaginatedRiders();
        }
      },
      error: (error) => {
        console.error('Failed to update rider status:', error);
        this.loading = false;
        // this.loaderService.hide();
      }
    })
  }

  openCreateDrawer(): void {
    this.drawerMode = 'create';
    this.selectedRiderId = null;
    this.drawerOpen = true;
  }

  openViewDrawer(rider: Rider): void {
    this.drawerMode = 'view';
    this.selectedRiderId = rider.id;
    this.drawerOpen = true;
  }

  openEditDrawer(rider: Rider): void {
    this.drawerMode = 'edit';
    this.selectedRiderId = rider.id;
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selectedRiderId = null;
  }

  viewRider(rider: Rider): void {
    // this.router.navigate(['/riders', rider.id]);

    this.openViewDrawer(rider);
  }



  confirmDeleteRider(): void {
    const rider = this.selectedRiderToDelete;

    if (!rider || this.deletingRider) {
      return;
    }

    this.deletingRider = true;

    this.ridersService.deleteRiderById(rider.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.deletingRider = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.toastService.success(
              response.message || 'Rider deleted successfully.',
              'Success'
            );

            this.showDeleteConfirmation = false;
            this.selectedRiderToDelete = null;
            
            if (this.riders.length === 1 && this.currentPage > 1) {
              this.currentPage--;
            }

            this.getPaginatedRiders();
          } else {
            this.toastService.error(
              response?.message || 'Unable to delete rider.',
              'Error'
            );
          }
        },
        error: (error) => {
          console.error('Failed to delete rider:', error);

        }
      });
  }


  toggleActionMenu(riderId: string): void {
    this.openActionMenuId =
      this.openActionMenuId === riderId ? null : riderId;
  }

  closeActionMenu(): void {
    this.openActionMenuId = null;
  }

  onViewRider(rider: Rider): void {
    this.closeActionMenu();
    this.viewRider(rider);
  }

  onEditRider(rider: Rider): void {
    this.closeActionMenu();
    this.openEditDrawer(rider);
  }

  openDeleteConfirmation(rider: Rider): void {
    this.closeActionMenu();
    this.selectedRiderToDelete = rider;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    if (this.deletingRider) {
      return;
    }

    this.showDeleteConfirmation = false;
    this.selectedRiderToDelete = null;
  }

}