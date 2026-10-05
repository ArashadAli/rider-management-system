import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-loader.component.html',
  styleUrls: ['./global-loader.component.css']
})
export class GlobalLoaderComponent {

  loading$ = this.loaderService.loading$;

  constructor(
    private loaderService: LoaderService
  ) {}

}