import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  productos: { 
    id: number; 
    name: string; 
    description: string; 
    price: number; 
    stock: number; 
    imageUrl: string 
  }[] = [];
  productForm: FormGroup;
  editForm: FormGroup;
  isAdmin: boolean = false;
  userEmail: string = '';
  searchQuery: string = '';
  selectedProductId: number | null = null;
  selectedProduct: any = null;
  productNames: Set<string> = new Set(); // Para validar nombres duplicados
  private subscription: Subscription = new Subscription();

  constructor(
    private productosService: ProductosService,
    private searchService: SearchService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cartService: CartService,
    private eventService: EventService
  ) {
    // Formulario de creación con validaciones personalizadas
    this.productForm = this.fb.group({
      name: ['', [Validators.required, this.uniqueProductNameValidator.bind(this)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]], // Precio mayor a 0
      stock: [0, [Validators.required, Validators.min(0)]], // Stock no negativo
      imageUrl: ['', Validators.pattern(/https?:\/\/.+/)], // URL válida
    });

    // Formulario de edición con validaciones
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.pattern(/https?:\/\/.+/)],
    });
  }

  ngOnInit(): void {
    this.loadProductos();
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    this.userEmail = this.authService.getUserEmail();

    // Suscribirse al evento para recargar productos
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

  // Cargar productos del servicio
  loadProductos(): void {
    this.productosService.getAllProductos().subscribe({
      next: (productos) => {
        this.productos = productos.map((producto: any) => ({
          ...producto,
          imageUrl: producto.imageUrl || 'https://vscda.org/wp-content/uploads/2017/03/300x300.png', // Imagen por defecto
        }));
        // Almacenar los nombres en un Set para validar duplicados
        this.productNames = new Set(productos.map((producto: any) => producto.name.toLowerCase()));
      },
      error: (err: any) => {
        console.error('Error al cargar los productos:', err);
      },
    });
  }

  // Validación personalizada para nombres duplicados
  uniqueProductNameValidator(control: any) {
    const name = control.value.toLowerCase();
    if (this.productNames.has(name)) {
      return { duplicateName: true }; // Retorna un error si el nombre ya existe
    }
    return null;
  }

  // Buscar productos
  searchProductos(): void {
    if (this.searchQuery.trim()) {
      this.searchService.searchProducts(this.searchQuery).subscribe({
        next: (data) => {
          this.productos = data.map((producto) => ({
            ...producto,
            imageUrl: producto.imageUrl?.trim() || 'https://vscda.org/wp-content/uploads/2017/03/300x300.png',
          }));
        },
        error: (err: any) => {
          console.error('Error al buscar productos:', err);
        },
      });
    } else {
      this.loadProductos();
    }
  }

  // Abrir modal de creación
  openModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('createProductModal')!);
    modal.show();
  }

  // Crear producto
  createProduct(): void {
    if (this.productForm.valid) {
      this.productosService.createProducto(this.productForm.value).subscribe({
        next: () => {
          this.eventService.triggerReloadProducts();
          const modal = bootstrap.Modal.getInstance(document.getElementById('createProductModal')!);
          modal?.hide();
          this.productForm.reset();
        },
        error: (err: any) => {
          console.error('Error al crear producto:', err);
        },
      });
    } else {
      this.productForm.markAllAsTouched(); // Marca todos los campos como tocados
    }
  }

  // Abrir modal de edición
  openEditModal(producto: any): void {
    this.selectedProductId = producto.id;
    this.editForm.patchValue(producto);
    const modal = new bootstrap.Modal(document.getElementById('editProductModal')!);
    modal.show();
  }

  // Actualizar producto
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
        error: (err: any) => {
          console.error('Error al actualizar producto:', err);
        },
      });
    } else {
      this.editForm.markAllAsTouched();
    }
  }

  // Abrir modal de eliminación
  openDeleteModal(producto: any): void {
    this.selectedProduct = producto;
    const modal = new bootstrap.Modal(document.getElementById('deleteProductModal')!);
    modal.show();
  }

  // Eliminar producto
  deleteProduct(): void {
    if (this.selectedProduct) {
      this.productosService.deleteProducto(this.selectedProduct.id).subscribe({
        next: () => {
          this.eventService.triggerReloadProducts();
          const modal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal')!);
          modal?.hide();
          this.selectedProduct = null;
        },
        error: (err: any) => {
          console.error('Error al eliminar producto:', err);
        },
      });
    }
  }

  // Formatear precios
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price).replace(',', '.');
  }

  // Añadir producto al carrito
  addToCart(producto: any): void {
    if (producto.stock === 0) {
      alert('Este producto no tiene stock disponible.');
      return;
    }
    this.cartService.addItem(producto);
    alert(`${producto.name} fue añadido al carrito.`);
  }

  // Cerrar sesión
  logout(): void {
    this.authService.logout();
  }
}
