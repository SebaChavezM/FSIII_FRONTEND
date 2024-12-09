import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CustomScriptsService } from '../../services/custom-scripts.service';
import { CartService } from '../../services/cart.service';
import { NavbarComponent } from "../navbar/navbar.component";

declare var bootstrap: any;
declare var AOS: any;
declare var GLightbox: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private glightboxInstance: any;
  userEmail: string | null = null;
  cartItems: any[] = [];
  cartTotal: number = 0;

  constructor(
    private authService: AuthService,
    private customScriptsService: CustomScriptsService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.authService.checkSession().subscribe({
      next: (response: any) => {
        if (response.authenticated) {
          this.userEmail = response.user.email;
        } else {
          this.userEmail = null;
        }
      },
      error: () => {
        this.userEmail = null;
      },
    });

    this.initializeAOS();
    this.initializeGLightbox();

    this.customScriptsService.initializeToggleScrolled();

    this.loadCart();
  }

  ngOnDestroy(): void {
    this.destroyGLightbox();
  }

  private initializeAOS(): void {
    try {
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 600,
          easing: 'ease-in-out',
          once: true,
          mirror: false,
        });
      } else {
        console.warn('AOS library is not loaded.');
      }
    } catch (error) {
      console.error('Error initializing AOS:', error);
    }
  }

  private initializeGLightbox(): void {
    try {
      if (typeof GLightbox !== 'undefined') {
        this.glightboxInstance = GLightbox({ selector: '.glightbox' });
      } else {
        console.warn('GLightbox library is not loaded.');
      }
    } catch (error) {
      console.error('Error initializing GLightbox:', error);
    }
  }

  private destroyGLightbox(): void {
    try {
      if (this.glightboxInstance && typeof this.glightboxInstance.destroy === 'function') {
        this.glightboxInstance.destroy();
      }
    } catch (error) {
      console.error('Error destroying GLightbox instance:', error);
    }
  }

  loadCart(): void {
    try {
      this.cartItems = this.cartService.getCartItems();
      this.calculateTotal();
    } catch (error) {
      console.error('Error al cargar los elementos del carrito:', error);
    }
  }  

  increaseQuantity(index: number): void {
    if (index >= 0 && index < this.cartItems.length) {
      this.cartItems[index].quantity++;
      this.calculateTotal();
    }
  }

  decreaseQuantity(index: number): void {
    if (index >= 0 && index < this.cartItems.length) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--;
        this.calculateTotal();
      }
    }
  }

  removeItem(index: number): void {
    if (index >= 0 && index < this.cartItems.length) {
      this.cartItems.splice(index, 1);
      this.cartService.updateCart(this.cartItems);
      this.calculateTotal();
    }
  }

  calculateTotal(): void {
    this.cartTotal = this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  checkout(): void {
    try {
      this.cartService.clearCart();
      this.cartItems = [];
      this.calculateTotal();

      const toastElement = document.getElementById('checkoutToast');
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  }

  logout(): void {
    try {
      this.authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
