import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, SimpleChanges, OnChanges, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { OrdersService } from 'src/app/core/services/orders.service';
import { CustomToastService } from 'src/app/core/services/toast.service';
import { EMPTY } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

export interface TimelineStep {
    key: string;
    label: string;
    description: string;
    status: 'completed' | 'current' | 'upcoming' | 'cancelled';
    timestamp?: string | null;
    note?: string | null;
}

@Component({
    selector: 'app-order-drawer',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ConfirmationDialogComponent],
    templateUrl: './order-drawer.component.html'
})
export class OrderDrawerComponent implements OnInit, OnChanges, OnDestroy {

    @Input() mode: 'create' | 'view' = 'create';
    @Input() orderId: string | null = null

    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    orderForm: FormGroup

    submitting = false;
    loadingOrder = false;
    orderDetails: any = null;
    showConfirmation = false;
    timelineSteps: TimelineStep[] = [];

    constructor(
        private ordersService: OrdersService,
        private toastService: CustomToastService,
        private fb: FormBuilder,
        private renderer: Renderer2
    ) {
        this.orderForm = this.fb.group({
            order_item: ['', Validators.required],
            customer_name: ['', Validators.required],
            customer_mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/), Validators.maxLength(10)]],
            pickup_address: ['', Validators.required],
            delivery_address: ['', Validators.required],
            amount: [null, [Validators.required, Validators.min(0.01)]]
        })
    }

    ngOnInit(): void {
        this.renderer.addClass(document.body, 'overflow-hidden');
    }

    ngOnDestroy(): void {
        this.renderer.removeClass(document.body, 'overflow-hidden');
    }

    limitMobileLength(event: Event): void {
        const input = event.target as HTMLInputElement;
        // Allow only digits and maximum 10 characters
        const value = input.value.replace(/\D/g, '').slice(0, 10);
        input.value = value;
        this.orderForm.get('customer_mobile')?.setValue(value);
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
                    this.buildTimeline(order);
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

    buildTimeline(order: any): void {
        if (!order) {
            this.timelineSteps = [];
            return;
        }

        const isCancelled = order.status === 'cancelled';
        const history: any[] = order.history || [];

        const historyMap = new Map<string, any>();
        history.forEach((h: any) => {
            if (h.to_status) {
                historyMap.set(h.to_status, h);
            }
        });

        if (isCancelled) {
            const pendingEntry = historyMap.get('pending');
            const cancelEntry = historyMap.get('cancelled');
            this.timelineSteps = [
                {
                    key: 'pending',
                    label: 'Order Placed',
                    description: 'Order created in system',
                    status: 'completed',
                    timestamp: pendingEntry?.changed_at || order.created_at,
                    note: pendingEntry?.changed_by || null
                },
                {
                    key: 'cancelled',
                    label: 'Order Cancelled',
                    description: 'Order was cancelled',
                    status: 'cancelled',
                    timestamp: cancelEntry?.changed_at || null,
                    note: cancelEntry?.changed_by || 'Cancelled while pending'
                }
            ];
            return;
        }

        const standardStages = [
            { key: 'pending', label: 'Order Placed', desc: 'Order received and logged' },
            { key: 'assigned', label: 'Rider Assigned', desc: order.rider_name ? `Assigned to ${order.rider_name}` : 'Awaiting rider allocation' },
            { key: 'accepted', label: 'Order Accepted', desc: 'Rider confirmed delivery request' },
            { key: 'picked_up', label: 'Picked Up', desc: 'Package picked up from merchant' },
            { key: 'on_the_way', label: 'On The Way', desc: 'Rider in transit to customer' },
            { key: 'delivered', label: 'Delivered', desc: 'Package delivered to recipient' }
        ];

        const stageOrder = ['pending', 'assigned', 'accepted', 'picked_up', 'on_the_way', 'delivered'];
        const currentIdx = stageOrder.indexOf(order.status);

        this.timelineSteps = standardStages.map((stage, idx) => {
            const historyEntry = historyMap.get(stage.key);
            let stepStatus: 'completed' | 'current' | 'upcoming' = 'upcoming';

            if (idx < currentIdx || (idx === currentIdx && order.status === 'delivered')) {
                stepStatus = 'completed';
            } else if (idx === currentIdx) {
                stepStatus = 'current';
            } else {
                stepStatus = 'upcoming';
            }

            return {
                key: stage.key,
                label: stage.label,
                description: stage.desc,
                status: stepStatus,
                timestamp: historyEntry?.changed_at || (idx === 0 ? order.created_at : null),
                note: historyEntry?.changed_by || null
            };
        });
    }

    getStatusBadgeClass(status: string): string {
        const classes: Record<string, string> = {
            pending: 'bg-amber-50 text-amber-700',
            assigned: 'bg-indigo-50 text-indigo-700',
            accepted: 'bg-blue-50 text-blue-700',
            picked_up: 'bg-purple-50 text-purple-700',
            on_the_way: 'bg-emerald-50 text-emerald-700',
            delivered: 'bg-green-50 text-green-700',
            cancelled: 'bg-red-50 text-red-700'
        };
        return classes[status] || 'bg-gray-100 text-gray-700';
    }

    formatStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            pending: 'Pending',
            assigned: 'Assigned',
            accepted: 'Accepted',
            picked_up: 'Picked Up',
            on_the_way: 'On The Way',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };
        return labels[status] || (status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-');
    }

    resetForm(): void {
        this.timelineSteps = [];
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
        if (this.mode !== 'create' || this.submitting) return

        if (this.orderForm.invalid) {
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
        if (hasBlankField) {
            textFields.forEach(field => {
                const control = this.orderForm.get(field);
                if (control && !String(control.value ?? '').trim()) {
                    control.setErrors({ ...control.errors, required: true })
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
                }
            });
    }

    cancelConfirmation(): void {
        if (!this.submitting) {
            this.showConfirmation = false;
        }
    }
}
