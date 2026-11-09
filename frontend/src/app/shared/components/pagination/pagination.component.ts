
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {

  @Input() currentPage = 1;
  @Input() totalPages = 0;
  @Input() pageSize = 10;
  @Input() loading = false;

  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get hasPrevious(): boolean {
    return this.currentPage > 1;
  }

  get hasNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  firstPage(): void {
    if (this.hasPrevious && !this.loading) {
      this.pageChange.emit(1);
    }
  }

  previousPage(): void {
    if (this.hasPrevious && !this.loading) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.hasNext && !this.loading) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  lastPage(): void {
    if (this.hasNext && !this.loading) {
      this.pageChange.emit(this.totalPages);
    }
  }

  onPageSizeChange(size: number): void {
    if (!this.loading && size !== this.pageSize) {
      this.pageSizeChange.emit(Number(size));
    }
  }
}
