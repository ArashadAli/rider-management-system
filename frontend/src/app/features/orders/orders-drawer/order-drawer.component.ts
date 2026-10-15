import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { OrdersService } from 'src/app/core/services/orders.service';
import { CustomToastService } from 'src/app/core/services/toast.service';
import { EMPTY } from 'rxjs';

@Component({
    selector: 'app-order-drawer',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './order-drawer.component.html'
})
export class OrderDrawerComponent {

    @Input() mode: 'create' | 'view' = 'create';
    @Input() orderId: string | null = null

    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    submitting = false;
    loadingOrder = false;
    orderDetails: any = null;
    newOrder = {
        order_item: '',
        customer_name: '',
        customer_mobile: '',
        pickup_address: '',
        delivery_address: '',
        amount: 0
    };

    constructor(
        private ordersService: OrdersService,
        private toastService: CustomToastService
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes['mode'] || changes['orderId']) {
            if(this.mode === 'view' && this.orderId) {
                this.loadSingleOrder(this.orderId);
            }
            else if(this.mode === 'create') {
                this.resetForm();
                this.orderDetails = null
            }
        }
    }

    loadSingleOrder(orderId: string): void {
        this.loadingOrder = true;
        this.orderDetails = null;

        this.ordersService.getSingleOrder(orderId)
        .pipe(
            catchError((error) => {
                this.toastService.error(error.message || 'Failed to load order details')
                return EMPTY;
            })
        )
        .subscribe({
            next:(response) => {
                if(!response.success) {
                    this.toastService.error(response.message);
                    return;
                }
                const order = response.data;
                this.orderDetails = order;
                this.newOrder = {
                    order_item: order.order_item || '',
                    customer_name: order.customer_name || '',
                    customer_mobile: order.customer_mobile || '',
                    pickup_address: order.pickup_address || '',
                    delivery_address: order.delivery_address || '',
                    amount: Number(order.amount) || 0
                }

                this.loadingOrder = false
            }
        })
    }

    resetForm(): void {
        this.newOrder = {
            order_item: '',
            customer_mobile: '',
            customer_name: '',
            pickup_address: '',
            delivery_address: '',
            amount: 0
        }
    }

    closeDrawer(): void {
        if (!this.submitting) {
            this.close.emit();
        }
    }

    createOrder(): void {

        if(this.mode !== 'create' || this.submitting) return

        const payload = {
            order_item: this.newOrder.order_item.trim(),
            customer_name: this.newOrder.customer_name.trim(),
            customer_mobile: this.newOrder.customer_mobile.trim(),
            pickup_address: this.newOrder.pickup_address.trim(),
            delivery_address: this.newOrder.delivery_address.trim(),
            amount: this.newOrder.amount
        };
        if ( !payload.order_item || !payload.customer_name || !payload.customer_mobile || !payload.pickup_address || !payload.delivery_address || payload.amount <= 0 ) {
            this.toastService.warning('Please fill all required fields.');
            return;
        }

        if (!/^[0-9]{10}$/.test(payload.customer_mobile)) {
            this.toastService.warning('Enter a valid 10-digit mobile number.');
            return;
        }

        this.submitting = true;
        this.ordersService.createOrder(payload)
            .pipe(
                finalize(() => {
                    this.submitting = false;
                })
            )
            .subscribe({
                next: (response) => {
                    if (!response.success) {
                        this.toastService.error( response.message || 'Failed to create order.' );
                        return;
                    }

                    this.toastService.success( response.message || 'Order created successfully.' );
                    this.resetForm();
                    this.close.emit();
                    this.saved.emit();
                },
                error: (error) => {
                    this.toastService.error( error?.error?.message || 'Failed to create order.' );
                }
            });
    }
}
