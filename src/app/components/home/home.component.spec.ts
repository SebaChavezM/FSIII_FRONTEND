import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { AuthService } from '../../services/auth.service';
import { CustomScriptsService } from '../../services/custom-scripts.service';
import { CartService } from '../../services/cart.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let customScriptsSpy: jasmine.SpyObj<CustomScriptsService>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['checkSession', 'logout']);
    const customScriptsMock = jasmine.createSpyObj('CustomScriptsService', [
      'initializeToggleScrolled',
      'toggleMobileNavDropdowns',
      'hideMobileNavOnHashLinks',
      'removePreloader',
      'initializeScrollTopButton',
      'correctScrollPositionForHashLinks',
      'initializeNavmenuScrollSpy',
    ]);
    const cartServiceMock = jasmine.createSpyObj('CartService', [
      'getCartItems',
      'updateCart',
      'clearCart',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        HomeComponent, // HomeComponent como standalone
        CommonModule,
        HttpClientTestingModule, // Para servicios que dependen de HttpClient
        RouterTestingModule.withRoutes([]), // Para proporcionar ActivatedRoute
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: CustomScriptsService, useValue: customScriptsMock },
        { provide: CartService, useValue: cartServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => '1' }, // Simula parámetros de ruta
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    customScriptsSpy = TestBed.inject(CustomScriptsService) as jasmine.SpyObj<CustomScriptsService>;
    cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize userEmail on successful session check', () => {
    const mockResponse = { authenticated: true, user: { email: 'test@example.com' } };
    authServiceSpy.checkSession.and.returnValue(of(mockResponse));

    component.ngOnInit();

    expect(authServiceSpy.checkSession).toHaveBeenCalled();
    expect(component.userEmail).toBe('test@example.com');
  });

  it('should set userEmail to null on failed session check', () => {
    authServiceSpy.checkSession.and.returnValue(throwError(() => new Error('Session error')));

    component.ngOnInit();

    expect(authServiceSpy.checkSession).toHaveBeenCalled();
    expect(component.userEmail).toBeNull();
  });

  it('should initialize custom scripts on init', () => {
    component.ngOnInit();

    expect(customScriptsSpy.initializeToggleScrolled).toHaveBeenCalled();
  });

  it('should load cart items and calculate total', () => {
    const mockCartItems = [
      { id: 1, price: 100, quantity: 2 },
      { id: 2, price: 200, quantity: 1 },
    ];
    cartServiceSpy.getCartItems.and.returnValue(mockCartItems);

    component.loadCart();

    expect(cartServiceSpy.getCartItems).toHaveBeenCalled();
    expect(component.cartItems).toEqual(mockCartItems);
    expect(component.cartTotal).toBe(400);
  });

  it('should handle an empty cart gracefully', () => {
    cartServiceSpy.getCartItems.and.returnValue([]);

    component.loadCart();

    expect(cartServiceSpy.getCartItems).toHaveBeenCalled();
    expect(component.cartItems).toEqual([]);
    expect(component.cartTotal).toBe(0);
  });

  it('should handle error when loading cart items', () => {
    spyOn(console, 'error');
    cartServiceSpy.getCartItems.and.throwError('Error al cargar los elementos del carrito');
  
    component.loadCart();
  
    expect(cartServiceSpy.getCartItems).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error al cargar los elementos del carrito:', jasmine.any(Error));
  });

  it('should destroy GLightbox instance on destroy', () => {
    component['glightboxInstance'] = { destroy: jasmine.createSpy('destroy') };

    component.ngOnDestroy();

    expect(component['glightboxInstance'].destroy).toHaveBeenCalled();
  });

  it('should handle null glightboxInstance on destroy', () => {
    component['glightboxInstance'] = null;

    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should handle null AOS instance gracefully', () => {
    spyOn(console, 'warn');
    (window as any).AOS = undefined;

    component['initializeAOS']();

    expect(console.warn).toHaveBeenCalledWith('AOS library is not loaded.');
  });

  it('should handle null GLightbox instance gracefully', () => {
    spyOn(console, 'warn');
    (window as any).GLightbox = undefined;

    component['initializeGLightbox']();

    expect(console.warn).toHaveBeenCalledWith('GLightbox library is not loaded.');
  });

  it('should handle invalid cart item index during removal gracefully', () => {
    component.cartItems = [{ id: 1, price: 100, quantity: 1 }];

    expect(() => component.removeItem(-1)).not.toThrow();
    expect(() => component.removeItem(10)).not.toThrow();
  });

  it('should increase item quantity', () => {
    component.cartItems = [{ id: 1, price: 100, quantity: 1 }];
    component.increaseQuantity(0);
    expect(component.cartItems[0].quantity).toBe(2);
  });
  
  it('should decrease item quantity', () => {
    component.cartItems = [{ id: 1, price: 100, quantity: 2 }];
    component.decreaseQuantity(0);
    expect(component.cartItems[0].quantity).toBe(1);
  });

  it('should handle invalid index during quantity adjustment gracefully', () => {
    component.cartItems = [];
    expect(() => component.increaseQuantity(-1)).not.toThrow();
    expect(() => component.decreaseQuantity(10)).not.toThrow();
  });  
  
});
