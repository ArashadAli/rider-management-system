
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule
    ],
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnChanges {

    @Input() visible = false;
    @Input() title = 'Are you sure?';
    @Input() message = 'This action cannot be undone.';
    @Input() itemName = '';
    @Input() confirmText = 'Confirm';
    @Input() cancelText = 'Cancel';
    @Input() loading = false;
    @Input() loadingText = 'Processing...';
    @Input() icon = 'trash-2';
    @Input() showWarningText = true;
    @Input() showReasonInput = false;
    @Input() reasonLabel = 'Reason';
    @Input() reasonPlaceholder = 'Enter reason...';
    @Input() reasonRequired = true;
    @Input() reasonMaxLength = 500;
    @Input() quickReasons: string[] = [];
    @Output() confirmed = new EventEmitter<string>();
    @Output() cancelled = new EventEmitter<void>();

    reason = '';
    reasonTouched = false;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            this.reason = '';
            this.reasonTouched = false;
        }
    }

    selectQuickReason(item: string): void {
        if (this.loading) {
            return;
        }
        this.reason = item;
        this.reasonTouched = false;
    }

    get hasReasonError(): boolean {
        return this.showReasonInput && this.reasonRequired && this.reasonTouched && !this.reason.trim();
    }

    onConfirm(): void {
        if (this.loading) {
            return;
        }
        if (this.showReasonInput) {
            const trimmed = this.reason.trim();
            if (this.reasonRequired && !trimmed) {
                this.reasonTouched = true;
                return;
            }
            this.confirmed.emit(trimmed);
            return;
        }
        this.confirmed.emit('');
    }

    onCancel(): void {
        if (this.loading) {
            return;
        }
        this.cancelled.emit();
    }
}
