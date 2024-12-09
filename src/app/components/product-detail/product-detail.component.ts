import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductosService } from '../../services/productos.service';
import { EventService } from '../../services/behavior-subject.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  imports: [NavbarComponent, CommonModule],
})
export class ProductDetailComponent implements OnInit {
  product: any;
  userEmail: string = '';

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    private authService: AuthService,
    private cartService: CartService,
    private productosService: ProductosService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.userEmail = this.authService.getUserEmail();
    const productId = this.route.snapshot.paramMap.get('id');

    if (productId) {
      this.searchService.getProductById(+productId)?.subscribe({
        next: (data) => {
          if (data) {
            this.product = data;
          } else {
            console.error('Producto no encontrado');
            this.product = undefined;
          }
        },
        error: (err) => {
          console.error('Error al cargar el producto:', err);
          this.product = undefined;
        },
      });
    } else {
      console.error('ID de producto no válido');
      this.product = undefined;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  }

  addToCart(): void {
    if (this.product?.stock > 0) {
      this.cartService.addItem(this.product);
      this.showToast('Producto añadido al carrito', 'success');
    } else {
      this.showToast('Producto sin stock disponible', 'error');
    }
  }

  buyNow(): void {
    if (this.product?.stock > 0) {
      this.productosService
        .updateProducto(this.product.id, { ...this.product, stock: this.product.stock - 1 })
        .subscribe({
          next: () => {
            this.product.stock -= 1;
            this.eventService.triggerReloadProducts();
            this.showToast('Compra realizada con éxito', 'success');
          },
          error: (err) => {
            console.error('Error al procesar la compra:', err);
            this.showToast('Error al procesar la compra', 'error');
          },
        });
    } else {
      this.showToast('Producto sin stock disponible', 'error');
    }
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const toastElement = document.getElementById(
      type === 'success' ? 'successToast' : 'errorToast'
    )!;
    if (toastElement) {
      toastElement.textContent = message;
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
