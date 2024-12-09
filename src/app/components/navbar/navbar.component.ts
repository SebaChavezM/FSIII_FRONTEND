import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  userEmail: string = '';
  cartItems: any[] = [];
  cartTotal: number = 0;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userEmail = this.authService.getUserEmail();
    this.cartItems = this.cartService.getCartItems();
    this.calculateTotal();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  }

  increaseQuantity(index: number): void {
    const item = this.cartItems[index];
    if (item.quantity < item.stock) {
      item.quantity++;
      this.calculateTotal();
    } else {
      console.error(`No puedes agregar más de ${item.stock} unidades de este producto.`);
    }
  }

  decreaseQuantity(index: number): void {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity--;
      this.calculateTotal();
    }
  }

  removeItem(index: number): void {
    if (index >= 0 && index < this.cartItems.length) {
      this.cartService.removeItem(index);
      this.cartItems = this.cartService.getCartItems();
      this.calculateTotal();
    } else {
      console.warn(`Índice ${index} inválido al intentar eliminar.`);
    }
  }

  calculateTotal(): void {
    this.cartTotal = this.cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  checkout(): void {
    this.cartService.checkout().subscribe({
      next: (response) => {
        console.log('Compra realizada con éxito:', response);
        this.cartService.clearCart();
        this.cartItems = this.cartService.getCartItems();
        this.calculateTotal();
        console.log('Compra realizada con éxito');
      },
      error: (error) => {
        console.error('Error durante el checkout:', error);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
