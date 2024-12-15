import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const cartServiceMock = jasmine.createSpyObj('CartService', [
      'getCartItems',
      'removeItem',
      'checkout',
      'clearCart',
    ]);
    const authServiceMock = jasmine.createSpyObj('AuthService', [
      'getUserEmail',
      'logout',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule.forRoot([]),
        NavbarComponent,
      ],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;

    cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    cartServiceSpy.getCartItems.and.returnValue([]);
    authServiceSpy.getUserEmail.and.returnValue('test@example.com');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user email and cart items on ngOnInit', () => {
    const mockCartItems = [
      { id: 1, price: 100, quantity: 2, stock: 10 },
      { id: 2, price: 200, quantity: 1, stock: 5 },
    ];
    cartServiceSpy.getCartItems.and.returnValue(mockCartItems);

    component.ngOnInit();

    expect(component.userEmail).toBe('test@example.com');
    expect(component.cartItems).toEqual(mockCartItems);
    expect(component.cartTotal).toBe(400);
  });

  it('should increase item quantity', () => {
    component.cartItems = [{ id: 1, price: 100, quantity: 1, stock: 5 }];
    component.increaseQuantity(0);

    expect(component.cartItems[0].quantity).toBe(2);
    expect(component.cartTotal).toBe(200);
  });

  it('should not increase quantity beyond stock limit', () => {
    component.cartItems = [{ id: 1, price: 100, quantity: 5, stock: 5 }];
    spyOn(console, 'error');
    component.increaseQuantity(0);

    expect(component.cartItems[0].quantity).toBe(5);
    expect(console.error).toHaveBeenCalledWith(
      'No puedes agregar más de 5 unidades de este producto.'
    );
  });

  it('should decrease item quantity', () => {
    component.cartItems = [{ id: 1, price: 100, quantity: 2, stock: 5 }];
    component.decreaseQuantity(0);

    expect(component.cartItems[0].quantity).toBe(1);
    expect(component.cartTotal).toBe(100);
  });

  it('should not decrease quantity below 1', () => {
    component.cartItems = [{ id: 1, price: 100, quantity: 1, stock: 5 }];
    component.decreaseQuantity(0);

    expect(component.cartItems[0].quantity).toBe(1);
    expect(component.cartTotal).toBe(100);
  });

  it('should remove an item from the cart', () => {
    component.cartItems = [
      { id: 1, price: 100, quantity: 2, stock: 5 },
      { id: 2, price: 200, quantity: 1, stock: 5 },
    ];

    cartServiceSpy.removeItem.and.callFake((index: number) => {
      component.cartItems.splice(index, 1);
    });

    component.removeItem(0);

    expect(component.cartItems.length).toBe(1);
    expect(component.cartItems[0].id).toBe(2);
  });

  it('should display an error if removeItem index is invalid', () => {
    spyOn(console, 'warn');
    component.removeItem(-1);

    expect(console.warn).toHaveBeenCalledWith(
      'Índice -1 inválido al intentar eliminar.'
    );
  });

  it('should clear the cart after successful checkout', () => {
    cartServiceSpy.checkout.and.returnValue(of({ message: 'Checkout successful' }));
    cartServiceSpy.getCartItems.and.returnValue([]);

    component.checkout();

    expect(cartServiceSpy.clearCart).toHaveBeenCalled();
    expect(component.cartItems.length).toBe(0);
    expect(component.cartTotal).toBe(0);
  });

  it('should handle checkout errors', () => {
    cartServiceSpy.checkout.and.returnValue(throwError(() => new Error('Checkout failed')));
    spyOn(console, 'error');

    component.checkout();

    expect(console.error).toHaveBeenCalledWith('Error durante el checkout:', jasmine.any(Error));
  });

  it('should format price correctly', () => {
    const formattedPrice = component.formatPrice(1234.56);

    // Asegúrate de usar el formato del método (es-CL o en-US)
    expect(formattedPrice).toBe('$1.235'); // Formato es-CL
  });

  it('should handle invalid indices in removeItem gracefully', () => {
    spyOn(console, 'warn');
    component.removeItem(-1); // Índice no válido

    expect(console.warn).toHaveBeenCalledWith(
      'Índice -1 inválido al intentar eliminar.'
    );

    component.removeItem(10); // Índice fuera de rango
    expect(console.warn).toHaveBeenCalledWith(
      'Índice 10 inválido al intentar eliminar.'
    );
  });

  it('should recalculate total when cart items are updated', () => {
    component.cartItems = [
      { id: 1, price: 100, quantity: 1, stock: 5 },
      { id: 2, price: 200, quantity: 2, stock: 5 },
    ];

    component.calculateTotal();

    expect(component.cartTotal).toBe(500);
  });

  it('should call logout from authService', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
