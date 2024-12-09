import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: any[] = []; // Carrito en memoria
  private cartTotal: number = 0; // Total del carrito
  private apiUrl = 'http://localhost:8082/api/products/checkout'; // URL del endpoint

  constructor(private http: HttpClient) {}

  /**
   * Devuelve una copia del carrito.
   */
  getCartItems(): any[] {
    return [...this.cart]; // Devuelve una copia para evitar mutaciones externas
  }

  /**
   * Devuelve el total del carrito.
   */
  getCartTotal(): number {
    return this.cartTotal;
  }

  /**
   * Agrega un producto al carrito.
   */
  addItem(item: any): void {
    const existingItem = this.cart.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      if (existingItem.quantity < item.stock) {
        existingItem.quantity++;
      } else {
        alert(`No puedes agregar más de ${item.stock} unidades al carrito.`);
      }
    } else {
      if (item.stock > 0) {
        this.cart.push({ ...item, quantity: 1 });
      } else {
        alert('Producto sin stock disponible.');
      }
    }
    this.calculateTotal();
  }

  /**
   * Realiza el checkout.
   */
  checkout(): Observable<any> {
    return this.http.post(this.apiUrl, this.cart).pipe(
      catchError((error) => {
        console.error('Error durante el checkout:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Limpia el carrito.
   */
  clearCart(): void {
    this.cart = [];
    this.cartTotal = 0;
  }

  /**
   * Elimina un producto por índice.
   */
  removeItem(index: number): void {
    if (index >= 0 && index < this.cart.length) {
      this.cart.splice(index, 1);
      this.calculateTotal();
    } else {
      console.warn(`Índice ${index} inválido al intentar eliminar.`);
    }
  }

  /**
   * Actualiza el carrito con nuevos datos.
   */
  updateCart(cartItems: any[]): void {
    this.cart = [...cartItems];
    this.calculateTotal();
  }

  /**
   * Calcula el total del carrito.
   */
  private calculateTotal(): void {
    this.cartTotal = this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }
}
