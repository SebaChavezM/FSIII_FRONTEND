import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService],
    });
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with an empty cart and total of 0', () => {
    expect(service.getCartItems()).toEqual([]);
    expect(service.getCartTotal()).toBe(0);
  });

  it('should calculate cart total correctly', () => {
    const mockCart = [
      { id: 1, price: 100, quantity: 2 },
      { id: 2, price: 200, quantity: 1 },
    ];
    service.updateCart(mockCart);
    expect(service.getCartTotal()).toBe(400);
  });

  it('should add a new item to the cart', () => {
    const mockItem = { id: 1, price: 100, stock: 5 };

    service.addItem(mockItem);

    const cartItems = service.getCartItems();
    expect(cartItems.length).toBe(1);
    expect(cartItems[0].quantity).toBe(1);
    expect(cartItems[0].id).toBe(mockItem.id);
    expect(service.getCartTotal()).toBe(100);
  });

  it('should increase quantity if item already exists in cart', () => {
    const mockItem = { id: 1, price: 100, stock: 5 };

    service.addItem(mockItem);
    service.addItem(mockItem);

    const cartItems = service.getCartItems();
    expect(cartItems[0].quantity).toBe(2);
    expect(service.getCartTotal()).toBe(200);
  });

  it('should not add more items than stock', () => {
    const mockItem = { id: 1, price: 100, stock: 2 };

    service.addItem(mockItem);
    service.addItem(mockItem);
    service.addItem(mockItem); // Exceeds stock

    const cartItems = service.getCartItems();
    expect(cartItems[0].quantity).toBe(2);
    expect(service.getCartTotal()).toBe(200);
  });

  it('should remove an item from the cart', () => {
    const mockCart = [
      { id: 1, price: 100, quantity: 2 },
      { id: 2, price: 200, quantity: 1 },
    ];
    service.updateCart(mockCart);

    service.removeItem(0); // Remove first item

    const cartItems = service.getCartItems();
    expect(cartItems.length).toBe(1);
    expect(cartItems[0].id).toBe(2);
    expect(service.getCartTotal()).toBe(200);
  });

  it('should not throw error when removing an item with an invalid index', () => {
    const mockCart = [{ id: 1, price: 100, quantity: 1 }];
    service.updateCart(mockCart);

    expect(() => service.removeItem(-1)).not.toThrow();
    expect(() => service.removeItem(10)).not.toThrow();

    const cartItems = service.getCartItems();
    expect(cartItems.length).toBe(1); // No cambios
  });

  it('should clear the cart', () => {
    const mockCart = [
      { id: 1, price: 100, quantity: 2 },
      { id: 2, price: 200, quantity: 1 },
    ];
    service.updateCart(mockCart);

    service.clearCart();

    expect(service.getCartItems().length).toBe(0);
    expect(service.getCartTotal()).toBe(0);
  });

  it('should perform checkout', () => {
    const mockCart = [
      { id: 1, price: 100, quantity: 2 },
      { id: 2, price: 200, quantity: 1 },
    ];
    service.updateCart(mockCart);

    service.checkout().subscribe((response) => {
      expect(response).toEqual({ message: 'Checkout successful' });
    });

    const req = httpMock.expectOne('http://localhost:8082/api/products/checkout');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCart);

    req.flush({ message: 'Checkout successful' });
  });

  it('should handle checkout error', () => {
    const mockCart = [
      { id: 1, price: 100, quantity: 2 },
      { id: 2, price: 200, quantity: 1 },
    ];
    service.updateCart(mockCart);

    service.checkout().subscribe({
      next: () => fail('Should have failed with an error'),
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('http://localhost:8082/api/products/checkout');
    expect(req.request.method).toBe('POST');

    req.flush({ message: 'Checkout failed' }, { status: 500, statusText: 'Server Error' });
  });
});
