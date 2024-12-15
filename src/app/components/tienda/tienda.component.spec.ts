import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TiendaComponent } from './tienda.component';
import { ProductosService } from '../../services/productos.service';
import { SearchService } from '../../services/search.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { EventService } from '../../services/behavior-subject.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('TiendaComponent', () => {
  let component: TiendaComponent;
  let fixture: ComponentFixture<TiendaComponent>;
  let productosService: jasmine.SpyObj<ProductosService>;
  let searchService: jasmine.SpyObj<SearchService>;
  let authService: jasmine.SpyObj<AuthService>;
  let cartService: jasmine.SpyObj<CartService>;
  let eventService: jasmine.SpyObj<EventService>;

  beforeEach(async () => {
    const productosServiceSpy = jasmine.createSpyObj('ProductosService', [
      'getAllProductos',
      'createProducto',
      'updateProducto',
      'deleteProducto',
    ]);
    const searchServiceSpy = jasmine.createSpyObj('SearchService', ['searchProducts']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getRole', 'getUserEmail', 'logout']);
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['getCartItems', 'clearCart', 'addItem']);
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['triggerReloadProducts'], {
      reloadProducts$: of(true),
    });

    // Mockeamos los métodos para devolver un Observable
    productosServiceSpy.getAllProductos.and.returnValue(of([]));
    productosServiceSpy.createProducto.and.returnValue(of({}));
    productosServiceSpy.updateProducto.and.returnValue(of({}));
    productosServiceSpy.deleteProducto.and.returnValue(of({}));
    searchServiceSpy.searchProducts.and.returnValue(of([]));
    cartServiceSpy.getCartItems.and.returnValue([
      { id: 1, name: 'Producto 1', price: 100, quantity: 2 },
    ]);
    cartServiceSpy.clearCart.and.stub();
    authServiceSpy.getRole.and.returnValue('ADMIN');
    authServiceSpy.getUserEmail.and.returnValue('admin@example.com');

    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), CommonModule, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: ProductosService, useValue: productosServiceSpy },
        { provide: SearchService, useValue: searchServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: EventService, useValue: eventServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TiendaComponent);
    component = fixture.componentInstance;
    productosService = TestBed.inject(ProductosService) as jasmine.SpyObj<ProductosService>;
    searchService = TestBed.inject(SearchService) as jasmine.SpyObj<SearchService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    eventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;

    // Inicializamos los formularios del componente
    component.productForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      price: new FormControl(0),
      stock: new FormControl(0),
      imageUrl: new FormControl(''),
    });

    component.editForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      price: new FormControl(0),
      stock: new FormControl(0),
      imageUrl: new FormControl(''),
    });

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería cargar los productos y configurarse como admin si el usuario lo es', () => {
      component.ngOnInit();

      expect(productosService.getAllProductos).toHaveBeenCalled();
      expect(component.isAdmin).toBeTrue();
      expect(component.userEmail).toBe('admin@example.com');
    });
  });

  describe('createProduct', () => {
    it('debería crear un producto si el formulario es válido', () => {
      const mockProduct = {
        id: 1,
        name: 'Producto Nuevo',
        description: 'Descripción',
        price: 100,
        stock: 10,
        imageUrl: 'http://example.com/image.jpg',
      };

      component.productForm.setValue({
        name: 'Producto Nuevo',
        description: 'Descripción',
        price: 100,
        stock: 10,
        imageUrl: 'http://example.com/image.jpg',
      });

      component.createProduct();

      expect(productosService.createProducto).toHaveBeenCalledWith(component.productForm.value);
    });

    it('debería marcar el formulario como tocado si no es válido', () => {
      component.productForm.setValue({
        name: '',
        description: '',
        price: -1,
        stock: -1,
        imageUrl: '',
      });

      component.createProduct();

      expect(component.productForm.invalid).toBeTrue();
    });
  });

  describe('addToCart', () => {
    it('debería añadir un producto al carrito si tiene stock', () => {
      const mockProduct = { id: 1, name: 'Producto', stock: 10, price: 100, description: 'Test', imageUrl: 'http://example.com/image.jpg' };

      component.addToCart(mockProduct);

      expect(cartService.addItem).toHaveBeenCalledWith(mockProduct);
    });

    it('debería mostrar una alerta si el producto no tiene stock', () => {
      const mockProduct = { id: 1, name: 'Producto', stock: 0, price: 100, description: 'Test', imageUrl: 'http://example.com/image.jpg' };

      spyOn(window, 'alert');

      component.addToCart(mockProduct);

      expect(window.alert).toHaveBeenCalledWith('Este producto no tiene stock disponible.');
    });
  });
});
