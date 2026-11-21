import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchableOption {
  id: string;
  name: string;
  mobile?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchable-select.component.html'
})
export class SearchableSelectComponent implements OnChanges {
  @Input() items: SearchableOption[] = [];
  @Input() value: string | null = null;
  @Input() placeholder = 'Select';
  @Input() searchPlaceholder = 'Search...';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() clearable = false;
  @Input() allOptionLabel = '';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() customClass = '';

  @Output() selected = new EventEmitter<string>();
  @Output() open = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isOpen = false;
  searchTerm = '';
  openDirection: 'down' | 'up' = 'down';

  constructor(private elementRef: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].currentValue) {
      // Handled reactively
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen) {
        this.closeDropdown();
      }
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closeDropdown();
    }
  }

  toggleDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.disabled) {
      return;
    }

    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    this.isOpen = true;
    this.searchTerm = '';

    // Calculate space to decide open direction
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    this.openDirection = spaceBelow < 280 && rect.top > 280 ? 'up' : 'down';

    this.open.emit();

    setTimeout(() => {
      const searchInput = this.elementRef.nativeElement.querySelector('input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 50);
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.searchTerm = '';
    this.closed.emit();
  }

  selectItem(id: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.selected.emit(id);
    this.closeDropdown();
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.selected.emit('');
    this.closeDropdown();
  }

  get selectedItem(): SearchableOption | null {
    if (!this.value) return null;
    return (this.items || []).find(item => String(item.id) === String(this.value)) || null;
  }

  get displayLabel(): string {
    if (this.selectedItem) {
      return this.selectedItem.name;
    }
    return this.placeholder;
  }

  get isSelected(): boolean {
    return !!this.selectedItem;
  }

  get filteredItems(): SearchableOption[] {
    if (!this.searchTerm.trim()) {
      return this.items || [];
    }
    const term = this.searchTerm.toLowerCase().trim();
    return (this.items || []).filter(item => {
      const nameMatch = item?.name && String(item.name).toLowerCase().includes(term);
      const mobileMatch = item?.mobile && String(item.mobile).includes(term);
      return nameMatch || mobileMatch;
    });
  }
}
