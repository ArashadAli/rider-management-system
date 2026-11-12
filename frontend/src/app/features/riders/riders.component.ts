import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RidersService } from 'src/app/core/services/riders.service';
import { Rider } from 'src/app/core/models/rider-response.model';
import { Subject, of } from 'rxjs';
import { takeUntil, finalize, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { BreadcrumbComponent } from 'src/app/shared/components/breadcrumb/breadcrumb.component';
import { CustomToastService } from 'src/app/core/services/toast.service';
import { RiderFormComponent } from './rider-form/rider-form.component';
import { LucideAngularModule } from 'lucide-angular';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';


@Component({
  selector: 'app-riders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbComponent,
    RiderFormComponent,
    LucideAngularModule,
    PaginationComponent,
    ConfirmationDialogComponent
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
  showFilters = false;
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
    private fb: FormBuilder,
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
  }

  setupFilterListeners(): void {

    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
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
                return of(null);
              }),
              finalize(() => {
                this.loading = false;
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
          this.currentPage = response.pagination.page;
          this.pageSize = response.pagination.limit;
          this.totalRiders = response.pagination.total;
          this.totalPages = response.pagination.pages;
        }
      });
  }

  getPaginatedRiders(): void {

    const filters = this.filterForm?.value || {};
    this.loading = true;
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
        }),
        catchError(error => {
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response?.success) {
          return;
        }
        this.riders = response.data.riders;
        this.currentPage = response.pagination.page;
        this.pageSize = response.pagination.limit;
        this.totalRiders = response.pagination.total;
        this.totalPages = response.pagination.pages;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  get activeFilterCount(): number {
    if (!this.filterForm) {
      return 0;
    }
    let count = 0;
    const values = this.filterForm.value;
    if (values.search && values.search.trim()) count++;
    if (values.status) count++;
    if (values.availability) count++;
    if (values.sortBy && values.sortBy !== 'created_at') count++;
    if (values.sortOrder && values.sortOrder !== 'desc') count++;
    return count;
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

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.getPaginatedRiders();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getPaginatedRiders();
  }


  toggleStatus(rider: Rider): void {
    this.loading = true;
    this.ridersService.updateRiderStatus(rider.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message)
          this.getPaginatedRiders();
        }
      },
      error: (error) => {
        this.loading = false;
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
            this.toastService.success(response.message || 'Rider deleted successfully.', 'Success');
            this.showDeleteConfirmation = false;
            this.selectedRiderToDelete = null;
            if (this.riders.length === 1 && this.currentPage > 1) {
              this.currentPage--;
            }
            this.getPaginatedRiders();
          }
        },
        error: (error) => {
          console.error('Failed to delete rider:', error);
        }
      });
  }

  toggleActionMenu(riderId: string): void {
    this.openActionMenuId = this.openActionMenuId === riderId ? null : riderId;
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

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.openActionMenuId) this.openActionMenuId = null
  }

}