
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
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
    @Input() maxSizeMB = 2;
    @Input() accept = 'image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png';

    @Output() fileSelected = new EventEmitter<File | null>();

    @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

    selectedFile: File | null = null;
    imagePreview: string | null = null;
    errorMessage = '';

    private activeReader: FileReader | null = null;
    private readToken = 0;

    constructor(private cdr: ChangeDetectorRef) {}

    onFileInputClick(event: Event): void {
        const input = event.target as HTMLInputElement;
        input.value = '';
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            return;
        }
        const file = input.files[0];
        this.errorMessage = '';

        const extension = file.name.split('.').pop()?.toLowerCase();
        const validExtensions = ['jpg', 'jpeg', 'png'];
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const isValidFormat = validMimeTypes.includes(file.type) || validExtensions.includes(extension || '');

        if (!isValidFormat) {
            this.errorMessage = 'Only JPG, JPEG and PNG images are allowed.';
            input.value = '';
            return;
        }
        const maxSize = this.maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
            this.errorMessage = `Image size must not exceed ${this.maxSizeMB} MB.`;
            input.value = '';
            return;
        }

        this.abortActiveReader();
        this.selectedFile = file;
        const currentToken = ++this.readToken;
        const reader = new FileReader();
        this.activeReader = reader;

        reader.onload = () => {
            if (currentToken !== this.readToken) {
                return;
            }
            let result = typeof reader.result === 'string' ? reader.result : null;
            if (result && !result.startsWith('data:image/')) {
                const base64Index = result.indexOf(';base64,');
                if (base64Index !== -1) {
                    const mime = extension === 'png' ? 'image/png' : 'image/jpeg';
                    result = `data:${mime}${result.slice(base64Index)}`;
                }
            }
            this.imagePreview = result;
            this.activeReader = null;
            this.cdr.markForCheck();
        };

        reader.onerror = () => {
            if (currentToken !== this.readToken) {
                return;
            }
            this.errorMessage = 'Unable to preview the selected image.';
            this.activeReader = null;
            this.cdr.markForCheck();
        };

        reader.readAsDataURL(file);
        this.fileSelected.emit(file);
    }

    removeImage(): void {
        this.reset();
        this.fileSelected.emit(null);
    }

    /** Clears the selected file and preview without emitting an event. */
    reset(): void {
        this.readToken++;
        this.abortActiveReader();
        this.selectedFile = null;
        this.imagePreview = null;
        this.errorMessage = '';
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
    }

    get displayImage(): string | null {
        return this.imagePreview || this.previewUrl;
    }

    private abortActiveReader(): void {
        if (this.activeReader && this.activeReader.readyState === FileReader.LOADING) {
            this.activeReader.abort();
        }
        this.activeReader = null;
    }

    ngOnDestroy(): void {
        this.readToken++;
        this.abortActiveReader();
    }
}
