import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from 'src/app/core/services/loader.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './global-loader.component.html',
  styleUrls: ['./global-loader.component.css']
})
export class GlobalLoaderComponent {

  loading$ = this.loaderService.loading$;

  constructor(
    private loaderService: LoaderService
  ) {}

}