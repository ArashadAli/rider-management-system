import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Subject,
  of
} from 'rxjs';

import {
  catchError,
  finalize,
  takeUntil
} from 'rxjs/operators';

import {
  RidersService
} from 'src/app/core/services/riders.service';

import {
  CustomToastService
} from 'src/app/core/services/toast.service';

import {
  LoaderService
} from 'src/app/core/services/loader.service';

import {
  Rider
} from 'src/app/core/models/rider-response.model';


@Component({
  selector: 'app-rider-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './rider-form.component.html',
  styleUrls: ['./rider-form.component.css']
})
export class RiderFormComponent
  implements OnInit, OnDestroy {

  @Input() mode: 'create' | 'view' | 'edit' = 'create';

  @Input() riderId: string | null = null;

  @Output() close = new EventEmitter<void>();

  @Output() saved = new EventEmitter<void>();

  riderForm!: FormGroup;

  loading = false;

  selectedImage: File | null = null;

  imagePreview: string | null = null;

  existingImageUrl: string | null = null;

  private destroy$ = new Subject<void>();


  constructor(
    private fb: FormBuilder,
    private ridersService: RidersService,
    private toastService: CustomToastService,
    private loaderService: LoaderService
  ) { }


  ngOnInit(): void {

    this.initializeForm();

    if (
      this.mode === 'view' ||
      this.mode === 'edit'
    ) {

      if (this.riderId) {
        this.getRider(this.riderId);
      }

    }

    if (this.mode === 'view') {
      this.riderForm.disable();
    }

  }


  initializeForm(): void {

    this.riderForm = this.fb.group({

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      mobile: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/)
        ]
      ],

      vehicle_type: [
        '',
        Validators.required
      ],

      vehicle_number: [
        '',
        Validators.required
      ],

      status: [
        'active',
        Validators.required
      ],

      availability: [
        'available',
        Validators.required
      ]

    });

  }


  getRider(id: string): void {

    this.loading = true;

    // this.loaderService.show();

    this.ridersService
      .getRiderById(id)
      .pipe(

        takeUntil(this.destroy$),

        catchError(error => {

          this.toastService.error(
            error?.error?.message ||
            'Failed to fetch rider'
          );

          return of(null);

        }),

        finalize(() => {

          this.loading = false;

          // this.loaderService.hide();

        })

      )
      .subscribe(response => {

        if (!response?.success) {
          return;
        }

        const rider = response.data.rider;

        this.riderForm.patchValue({

          name: rider.name,

          email: rider.email,

          mobile: rider.mobile,

          vehicle_type: rider.vehicle_type,

          vehicle_number: rider.vehicle_number,

          status: rider.status,

          availability: rider.availability

        });

        this.existingImageUrl =
          rider.profile_image_url || null;

        if (this.mode === 'view') {
          this.riderForm.disable();
        }

      });

  }


  onImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const file = input.files[0];

    this.selectedImage = file;

    const reader = new FileReader();

    reader.onload = () => {

      this.imagePreview =
        reader.result as string;

    };

    reader.readAsDataURL(file);

  }


  removeImage(): void {

    this.selectedImage = null;

    this.imagePreview = null;

  }


  isInvalid(controlName: string): boolean {

    const control =
      this.riderForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );

  }


  getErrorMessage(controlName: string): string {

    const control =
      this.riderForm.get(controlName);

    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (control.hasError('email')) {
      return 'Enter a valid email';
    }

    if (control.hasError('pattern')) {

      if (controlName === 'mobile') {
        return 'Mobile number must be 10 digits';
      }

    }

    if (control.hasError('minlength')) {
      return 'Minimum 2 characters required';
    }

    return '';

  }


  enableEdit(): void {
    this.mode = 'edit';
    this.riderForm.enable();
  }


  submit(): void {

    if (this.mode === 'view') {
      return;
    }

    if (this.riderForm.invalid) {

      this.riderForm.markAllAsTouched();

      return;
    }

    if (this.mode === 'create') {
      this.createRider();
    }

    if (this.mode === 'edit') {
      this.createRider();
    }

  }


  createRider(): void {

    const formData =
      this.createFormData();

    this.loading = true;

    // this.loaderService.show();

    this.ridersService
      .createRider(formData)
      .pipe(

        takeUntil(this.destroy$),

        finalize(() => {

          this.loading = false;

          // this.loaderService.hide();

        })

      )
      .subscribe({

        next: response => {

          if (response.success) {

            this.toastService.success(
              response.message
            );

            this.saved.emit();

            this.close.emit();

          }

        },

        error: error => {

          this.toastService.error(
            error?.error?.message ||
            'Failed to create rider'
          );

        }

      });

  }


  updateRider(): void {

    if (!this.riderId) {
      return;
    }

    const formData = this.createFormData();

    this.loading = true;

    // this.loaderService.show();

    this.ridersService.updateRiderById(this.riderId, formData)
      .pipe(takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          // this.loaderService.hide();
        })

      )
      .subscribe({

        next: response => {

          if (response.success) {

            this.toastService.success(
              response.message
            );

            this.saved.emit();

            this.close.emit();

          }

        },

        error: error => {
          this.toastService.error(error?.error?.message || 'Failed to update rider');
        }

      });

  }


  createFormData(): FormData {

    const formData = new FormData();

    const value =
      this.riderForm.getRawValue();

    formData.append(
      'name',
      value.name
    );

    formData.append(
      'email',
      value.email
    );

    formData.append(
      'mobile',
      value.mobile
    );

    formData.append(
      'vehicle_type',
      value.vehicle_type
    );

    formData.append(
      'vehicle_number',
      value.vehicle_number
    );

    formData.append(
      'status',
      value.status
    );

    formData.append(
      'availability',
      value.availability
    );

    if (this.selectedImage) {

      formData.append(
        'profile_image',
        this.selectedImage
      );

    }

    return formData;

  }


  get drawerTitle(): string {

    if (this.mode === 'create') {
      return 'Create Rider';
    }

    if (this.mode === 'edit') {
      return 'Edit Rider';
    }

    return 'Rider Profile';

  }


  get drawerSubtitle(): string {

    if (this.mode === 'create') {
      return 'Add a new rider';
    }

    if (this.mode === 'edit') {
      return 'Update rider information';
    }

    return 'View rider details';

  }


  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }

}