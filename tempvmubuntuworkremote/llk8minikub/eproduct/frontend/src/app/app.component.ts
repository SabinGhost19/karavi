import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'
import { ProductService } from "./product.service";

import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSlideToggleModule, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';

  isLoading = false;
  products = [];

  error: any = null;

  constructor(private productService: ProductService) {

  }

  public toggle(event: MatSlideToggleChange) {
    if (event.checked == true) {
      this.isLoading = true;
      try {
        this.productService.getProducts().subscribe(
          (response) => {
            this.products = (response as any).products;
            this.isLoading = false;
          },
          (error) => { console.log(error); this.error = error.message; }
        )
      } catch (error) {
        console.log(error)
        this.error = "Something went wrong! :(";
        this.isLoading = false;
      }
    } else {
      this.products = [];
      this.error = null;
      this.isLoading = false;
    }
  }
}
