
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [
        CommonModule,
        LucideAngularModule
    ],
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent {

    @Input() visible = false;
    @Input() title = 'Are you sure?';
    @Input() message = 'This action cannot be undone.';
    @Input() itemName = '';
    @Input() confirmText = 'Confirm';
    @Input() cancelText = 'Cancel';
    @Input() loading = false;
    @Input() loadingText = 'Processing...';
    @Output() confirmed = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    onConfirm(): void {
        if (this.loading) {
            return;
        }
        this.confirmed.emit();
    }

    onCancel(): void {
        if (this.loading) {
            return;
        }
        this.cancelled.emit();
    }
}
