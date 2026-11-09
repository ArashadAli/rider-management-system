
import {Component,EventEmitter,Input,OnDestroy,Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-image-upload',
    standalone: true,
    imports: [
        CommonModule,
        LucideAngularModule
    ],
    templateUrl: './image-upload.component.html'
})
export class ImageUploadComponent implements OnDestroy {

    @Input() previewUrl: string | null = null;
    @Input() disabled = false;
    @Input() maxSizeMB = 5;
    @Input() accept = 'image/jpeg,image/png';

    @Output() fileSelected = new EventEmitter<File | null>();

    selectedFile: File | null = null;
    imagePreview: string | null = null;
    errorMessage = '';

    private objectUrl: string | null = null;

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            return;
        }
        const file = input.files[0];
        this.errorMessage = '';
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            this.errorMessage = 'Only JPG and PNG images are allowed.';
            input.value = '';
            return;
        }
        const maxSize = this.maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
            this.errorMessage = `Image size must not exceed ${this.maxSizeMB} MB.`;
            input.value = '';
            return;
        }
        this.clearObjectUrl();
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
        this.objectUrl = this.imagePreview;
        this.fileSelected.emit(file);
    }

    removeImage(): void {
        this.clearObjectUrl();
        this.selectedFile = null;
        this.imagePreview = null;
        this.errorMessage = '';
        this.fileSelected.emit(null);
    }

    get displayImage(): string | null {
        return this.imagePreview || this.previewUrl;
    }

    private clearObjectUrl(): void {
        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl);
            this.objectUrl = null;
        }
    }

    ngOnDestroy(): void {
        this.clearObjectUrl();
    }
}
