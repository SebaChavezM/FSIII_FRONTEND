import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductosService } from '../../services/productos.service';
import { EventService } from '../../services/behavior-subject.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let searchServiceSpy: jasmine.SpyObj<SearchService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let productosServiceSpy: jasmine.SpyObj<ProductosService>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;

  beforeEach(async () => {
    const searchServiceMock = jasmine.createSpyObj('SearchService', ['getProductById']);
    const authServiceMock = jasmine.createSpyObj('AuthService', ['getUserEmail', 'logout']);
    const cartServiceMock = jasmine.createSpyObj('CartService', [
      'getCartItems', // Método necesario para NavbarComponent
      'addItem',
      'removeItem',
      'clearCart',
    ]);
    const productosServiceMock = jasmine.createSpyObj('ProductosService', ['updateProducto']);
    const eventServiceMock = jasmine.createSpyObj('EventService', ['triggerReloadProducts']);

    // Configurar valores de retorno para los mocks
    cartServiceMock.getCartItems.and.returnValue([
      { id: 1, name: 'Product A', price: 100, quantity: 2, stock: 10 },
    ]);
    authServiceMock.getUserEmail.and.returnValue('test@example.com');

    await TestBed.configureTestingModule({
      imports: [
        ProductDetailComponent, // Componente standalone
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: SearchService, useValue: searchServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: ProductosService, useValue: productosServiceMock },
        { provide: EventService, useValue: eventServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;

    searchServiceSpy = TestBed.inject(SearchService) as jasmine.SpyObj<SearchService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    productosServiceSpy = TestBed.inject(ProductosService) as jasmine.SpyObj<ProductosService>;
    eventServiceSpy = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch product details on initialization', () => {
    const mockProduct = { id: 1, name: 'Test Product', price: 100, stock: 10 };
    searchServiceSpy.getProductById.and.returnValue(of(mockProduct));

    component.ngOnInit();

    expect(searchServiceSpy.getProductById).toHaveBeenCalledWith(1);
    expect(component.product).toEqual(mockProduct);
  });

  it('should handle missing product gracefully', () => {
    searchServiceSpy.getProductById.and.returnValue(of(null));
    spyOn(console, 'error');

    component.ngOnInit();

    expect(searchServiceSpy.getProductById).toHaveBeenCalledWith(1);
    expect(component.product).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith('Producto no encontrado');
  });

  it('should add product to cart when stock is available', () => {
    const mockProduct = { id: 1, name: 'Test Product', price: 100, stock: 10 };
    component.product = mockProduct;

    spyOn(component, 'showToast');

    component.addToCart();

    expect(cartServiceSpy.addItem).toHaveBeenCalledWith(mockProduct);
    expect(component.showToast).toHaveBeenCalledWith('Producto añadido al carrito', 'success');
  });

  it('should process "buy now" when stock is available', () => {
    const mockProduct = { id: 1, name: 'Test Product', price: 100, stock: 10 };
    component.product = mockProduct;

    spyOn(component, 'showToast');

    productosServiceSpy.updateProducto.and.returnValue(of(mockProduct));

    component.buyNow();

    expect(productosServiceSpy.updateProducto).toHaveBeenCalledWith(1, {
      ...mockProduct,
      stock: 9,
    });
    expect(eventServiceSpy.triggerReloadProducts).toHaveBeenCalled();
    expect(component.showToast).toHaveBeenCalledWith('Compra realizada con éxito', 'success');
  });

  it('should format price correctly', () => {
    const formattedPrice = component.formatPrice(1234.56);
    expect(formattedPrice).toBe('$1,234.56');
  });
});
