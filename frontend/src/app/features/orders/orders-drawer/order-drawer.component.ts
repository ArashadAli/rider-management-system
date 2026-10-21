import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { OrdersService } from 'src/app/core/services/orders.service';
import { CustomToastService } from 'src/app/core/services/toast.service';
import { EMPTY } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-order-drawer',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
    templateUrl: './order-drawer.component.html'
})
export class OrderDrawerComponent implements OnChanges {

    @Input() mode: 'create' | 'view' = 'create';
    @Input() orderId: string | null = null

    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    orderForm: FormGroup

    submitting = false;
    loadingOrder = false;
    orderDetails: any = null;
    showConfirmation = false;

    constructor(
        private ordersService: OrdersService,
        private toastService: CustomToastService,
        private fb: FormBuilder
    ) {
        this.orderForm = this.fb.group({
            order_item: ['', Validators.required],
            customer_name: ['', Validators.required],
            customer_mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
            pickup_address: ['', Validators.required],
            delivery_address: ['', Validators.required],
            amount: [null, [Validators.required, Validators.min(0.01)]]
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['mode'] || changes['orderId']) {
            if (this.mode === 'view' && this.orderId) {
                this.showConfirmation = false
                this.loadSingleOrder(this.orderId);
            }
            else if (this.mode === 'create') {
                this.resetForm();
                this.orderDetails = null
                this.showConfirmation = false
            }
        }
    }

    get f() {
        return this.orderForm.controls;
    }

    loadSingleOrder(orderId: string): void {
        this.loadingOrder = true;
        this.orderDetails = null;

        this.ordersService.getSingleOrder(orderId)
            .pipe(
                catchError((error) => {
                    this.toastService.error(error.message || 'Failed to load order details')
                    return EMPTY;
                }),
                finalize(() => {
                    this.loadingOrder = false;
                })
            )
            .subscribe({
                next: (response) => {
                    if (!response.success) {
                        this.toastService.error(response.message);
                        return;
                    }
                    const order = response.data;
                    this.orderDetails = order;
                    this.orderForm.patchValue({
                        order_item: order.order_item || '',
                        customer_name: order.customer_name || '',
                        customer_mobile: order.customer_mobile || '',
                        pickup_address: order.pickup_address || '',
                        delivery_address: order.delivery_address || '',
                        amount: Number(order.amount) || null
                    })

                    this.orderForm.markAsPristine();
                    this.orderForm.markAsUntouched();

                    this.loadingOrder = false
                }
            })
    }

    resetForm(): void {
        this.orderForm.reset({
            order_item: '',
            customer_name: '',
            customer_mobile: '',
            pickup_address: '',
            delivery_address: '',
            amount: null
        })

        this.orderForm.markAsPristine();
        this.orderForm.markAsUntouched();
    }

    closeDrawer(): void {
        if (!this.submitting) {
            this.showConfirmation = false;
            this.close.emit();
        }
    }

    requestCreateConfirmation(): void {
        if(this.mode !== 'create' || this.submitting) return
        
        if(this.orderForm.invalid) {
            this.orderForm.markAllAsTouched();
            return;
        }

        const values = this.orderForm.getRawValue();
        const textFields = [
            'order_item',
            'customer_name',
            'customer_mobile',
            'pickup_address',
            'delivery_address'
        ]

        const hasBlankField = textFields.some(field => !String(values[field] ?? '').trim())
        if(hasBlankField) {
            textFields.forEach(field => {
                const control = this.orderForm.get(field);
                if(control && !String(control.value ?? '').trim()) {
                    control.setErrors({...control.errors, required: true})
                    control.markAsTouched();
                }
            })
            return
        }
        this.showConfirmation = true;
    }

    confirmCreateOrder(): void {

        if (this.mode !== 'create' || this.submitting || !this.showConfirmation || this.orderForm.invalid) return

        const values = this.orderForm.getRawValue();

        const payload = {
            order_item: values.order_item.trim(),
            customer_name: values.customer_name.trim(),
            customer_mobile: values.customer_mobile.trim(),
            pickup_address: values.pickup_address.trim(),
            delivery_address: values.delivery_address.trim(),
            amount: Number(values.amount)
        };
        this.showConfirmation = false;
        this.submitting = true

        this.ordersService.createOrder(payload)
            .pipe(
                finalize(() => {
                    this.submitting = false;
                })
            )
            .subscribe({
                next: (response) => {
                    if (!response.success) {
                        this.toastService.error(response.message || 'Failed to create order.');
                        return;
                    }

                    this.toastService.success(response.message || 'Order created successfully.');
                    this.resetForm();
                    this.close.emit();
                    this.saved.emit();
                },
                error: (error) => {
                    this.toastService.error(error?.error?.message || 'Failed to create order.');
                }
            });
    }

    cancelConfirmation(): void {
        if(!this.submitting) {
            this.showConfirmation = false;
        }
    }
}
