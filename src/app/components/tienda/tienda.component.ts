import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../services/productos.service';
import { SearchService } from '../../services/search.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { CartService } from '../../services/cart.service';
import { EventService } from '../../services/behavior-subject.service';
import { Subscription } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css'],
})
export class TiendaComponent implements OnInit, OnDestroy {
  productos: any[] = [];
  productForm: FormGroup;
  editForm: FormGroup;
  isAdmin: boolean = false;
  userEmail: string = '';
  searchQuery: string = '';
  selectedProductId: number | null = null;
  selectedProduct: any = null;
  cartItems: any[] = []; // Agregada propiedad para los items del carrito
  cartTotal: number = 0; // Agregada propiedad para el total del carrito
  private subscription: Subscription = new Subscription();

  constructor(
    private productosService: ProductosService,
    private searchService: SearchService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cartService: CartService,
    private eventService: EventService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.pattern(/https?:\/\/.+/)],
    });

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.pattern(/https?:\/\/.+/)],
    });
  }

  ngOnInit(): void {
    this.loadProductos();
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    this.userEmail = this.authService.getUserEmail();

    this.subscription.add(
      this.eventService.reloadProducts$.subscribe((reload) => {
        if (reload) {
          this.loadProductos();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadProductos(): void {
    this.searchService.getAllProducts().subscribe({
      next: (products) => {
        this.productos = products.map((product) => ({
          ...product,
          imageUrl: product.imageUrl || 'https://vscda.org/wp-content/uploads/2017/03/300x300.png',
        }));
      },
      error: (err) => {
        console.error('Error al cargar los productos:', err);
      },
    });
  }  

  searchProductos(): void {
    if (this.searchQuery.trim()) {
      this.searchService.searchProducts(this.searchQuery).subscribe({
        next: (data) => {
          this.productos = data.map((producto) => ({
            ...producto,
            imageUrl: producto.imageUrl?.trim() || 'https://vscda.org/wp-content/uploads/2017/03/300x300.png',
          }));
        },
        error: (err) => {
          console.error('Error al buscar productos:', err);
        },
      });
    } else {
      this.loadProductos();
    }
  }

  openModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('createProductModal')!);
    modal.show();
  }

  createProduct(): void {
    if (this.productForm.valid) {
      this.productosService.createProducto(this.productForm.value).subscribe({
        next: () => {
          this.eventService.triggerReloadProducts();
          const modal = bootstrap.Modal.getInstance(document.getElementById('createProductModal')!);
          modal?.hide();
          this.productForm.reset();
        },
        error: (err) => {
          console.error('Error al crear producto:', err);
        },
      });
    }
  }

  openDeleteModal(producto: any): void {
    this.selectedProduct = producto;
    const modal = new bootstrap.Modal(document.getElementById('deleteProductModal')!);
    modal.show();
  }

  deleteProduct(): void {
    if (this.selectedProduct) {
      this.productosService.deleteProducto(this.selectedProduct.id).subscribe({
        next: () => {
          this.eventService.triggerReloadProducts();
          const modal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal')!);
          modal?.hide();
          this.selectedProduct = null;

          const toastElement = document.getElementById('successToast')!;
          const toast = new bootstrap.Toast(toastElement);
          toast.show();
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
        },
      });
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price).replace(',', '.');
  }

  openEditModal(producto: any): void {
    this.selectedProductId = producto.id;
    this.editForm.patchValue(producto);
    const modal = new bootstrap.Modal(document.getElementById('editProductModal')!);
    modal.show();
  }

  updateProduct(): void {
    if (this.editForm.valid && this.selectedProductId) {
      this.productosService.updateProducto(this.selectedProductId, this.editForm.value).subscribe({
        next: () => {
          this.eventService.triggerReloadProducts();
          const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal')!);
          modal?.hide();
          this.editForm.reset();
          this.selectedProductId = null;
        },
        error: (err) => {
          console.error('Error al actualizar producto:', err);
        },
      });
    }
  }

  addToCart(producto: any): void {
    if (producto.stock === 0) {
      alert('Producto sin stock disponible.');
      return;
    }
    this.cartService.addItem(producto);
    this.cartItems = this.cartService.getCartItems(); // Actualizar el carrito local
    this.cartTotal = this.cartService.getCartTotal(); // Recalcular el total
    const toastElement = document.getElementById('cartAddToast')!;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }
  
  removeItem(index: number): void {
    this.cartService.removeItem(index);
  }  

  logout(): void {
    this.authService.logout();
  }
}
