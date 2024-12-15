import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductosService } from '../../services/productos.service';
import { EventService } from '../../services/behavior-subject.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let searchService: jasmine.SpyObj<SearchService>;
  let authService: jasmine.SpyObj<AuthService>;
  let cartService: jasmine.SpyObj<CartService>;
  let productosService: jasmine.SpyObj<ProductosService>;
  let eventService: jasmine.SpyObj<EventService>;

  const mockProduct = {
    id: 1,
    name: 'Producto 1',
    description: 'Descripción del producto',
    price: 1000,
    stock: 10,
    imageUrl: 'http://example.com/product.jpg',
  };

  beforeEach(async () => {
    const searchServiceSpy = jasmine.createSpyObj('SearchService', ['getProductById']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserEmail', 'logout']);
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['addItem']);
    const productosServiceSpy = jasmine.createSpyObj('ProductosService', ['updateProducto']);
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['triggerReloadProducts']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: SearchService, useValue: searchServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: ProductosService, useValue: productosServiceSpy },
        { provide: EventService, useValue: eventServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;

    searchService = TestBed.inject(SearchService) as jasmine.SpyObj<SearchService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    productosService = TestBed.inject(ProductosService) as jasmine.SpyObj<ProductosService>;
    eventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;

    authService.getUserEmail.and.returnValue('test@example.com');
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería obtener el correo del usuario y cargar el producto si el ID es válido', () => {
      searchService.getProductById.and.returnValue(of(mockProduct));

      component.ngOnInit();

      expect(component.userEmail).toBe('test@example.com');
      expect(searchService.getProductById).toHaveBeenCalledWith(1);
      expect(component.product).toEqual(mockProduct);
    });

    it('debería manejar errores al cargar un producto', () => {
      searchService.getProductById.and.returnValue(throwError(() => new Error('Producto no encontrado')));

      spyOn(console, 'error');

      component.ngOnInit();

      expect(component.product).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith('Error al cargar el producto:', jasmine.any(Error));
    });

    it('debería manejar un ID de producto no válido', async () => {
      await TestBed.resetTestingModule().configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ProductDetailComponent);
      component = fixture.componentInstance;

      spyOn(console, 'error');

      component.ngOnInit();

      expect(component.product).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith('ID de producto no válido');
    });
  });

  describe('formatPrice', () => {
    it('debería formatear el precio correctamente', () => {
      const formattedPrice = component.formatPrice(1000);
      expect(formattedPrice).toBe('$1.000');
    });
  });

  describe('addToCart', () => {
    it('debería añadir el producto al carrito si hay stock disponible', () => {
      component.product = mockProduct;

      spyOn(component, 'showToast');

      component.addToCart();

      expect(cartService.addItem).toHaveBeenCalledWith(mockProduct);
      expect(component.showToast).toHaveBeenCalledWith('Producto añadido al carrito', 'success');
    });

    it('debería mostrar un mensaje de error si no hay stock', () => {
      component.product = { ...mockProduct, stock: 0 };

      spyOn(component, 'showToast');

      component.addToCart();

      expect(cartService.addItem).not.toHaveBeenCalled();
      expect(component.showToast).toHaveBeenCalledWith('Producto sin stock disponible', 'error');
    });
  });

  describe('buyNow', () => {
    it('debería procesar la compra si hay stock disponible', () => {
      productosService.updateProducto.and.returnValue(of({ ...mockProduct, stock: 9 }));

      component.product = { ...mockProduct, stock: 10 };

      spyOn(component, 'showToast');

      component.buyNow();

      expect(productosService.updateProducto).toHaveBeenCalledWith(1, { ...mockProduct, stock: 9 });
      expect(component.product.stock).toBe(9);
      expect(eventService.triggerReloadProducts).toHaveBeenCalled();
      expect(component.showToast).toHaveBeenCalledWith('Compra realizada con éxito', 'success');
    });

    it('debería manejar errores al procesar la compra', () => {
      productosService.updateProducto.and.returnValue(throwError(() => new Error('Error de red')));

      component.product = { ...mockProduct, stock: 10 };

      spyOn(component, 'showToast');
      spyOn(console, 'error');

      component.buyNow();

      expect(console.error).toHaveBeenCalledWith('Error al procesar la compra:', jasmine.any(Error));
      expect(component.showToast).toHaveBeenCalledWith('Error al procesar la compra', 'error');
    });
  });

  describe('showToast', () => {
    it('debería mostrar un mensaje en un toast', () => {
      const toastElement = document.createElement('div');
      toastElement.id = 'successToast';
      document.body.appendChild(toastElement);

      component.showToast('Producto añadido al carrito', 'success');

      expect(toastElement.textContent).toBe('Producto añadido al carrito');
    });
  });

  describe('logout', () => {
    it('debería llamar al método logout del AuthService', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
    });
  });
});
