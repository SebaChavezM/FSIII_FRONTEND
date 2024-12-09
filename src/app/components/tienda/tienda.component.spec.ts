import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TiendaComponent } from './tienda.component'; // Standalone component
import { ProductosService } from '../../services/productos.service';
import { SearchService } from '../../services/search.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { EventService } from '../../services/behavior-subject.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, Subject } from 'rxjs';

describe('TiendaComponent', () => {
  let component: TiendaComponent;
  let fixture: ComponentFixture<TiendaComponent>;
  let productosServiceSpy: jasmine.SpyObj<ProductosService>;
  let searchServiceSpy: jasmine.SpyObj<SearchService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;

  beforeEach(async () => {
    const productosServiceMock = jasmine.createSpyObj('ProductosService', [
      'createProducto',
      'deleteProducto',
      'updateProducto',
    ]);
    const searchServiceMock = jasmine.createSpyObj('SearchService', ['getAllProducts', 'searchProducts']);
    const authServiceMock = jasmine.createSpyObj('AuthService', ['getRole', 'getUserEmail', 'logout']);
    const cartServiceMock = jasmine.createSpyObj('CartService', [
      'addItem',
      'getCartItems',
      'removeItem',
      'getCartTotal',
      'updateCart',
    ]);
    const eventServiceMock = jasmine.createSpyObj('EventService', [], { reloadProducts$: new Subject<boolean>() });

    productosServiceMock.createProducto.and.returnValue(of({}));
    productosServiceMock.deleteProducto.and.returnValue(of(null));
    productosServiceMock.updateProducto.and.returnValue(of(null));

    searchServiceMock.getAllProducts.and.returnValue(of([]));
    searchServiceMock.searchProducts.and.returnValue(of([]));

    authServiceMock.getRole.and.returnValue('USER');
    authServiceMock.getUserEmail.and.returnValue('test@example.com');

    cartServiceMock.getCartItems.and.returnValue([]);
    cartServiceMock.getCartTotal.and.returnValue(0);

    await TestBed.configureTestingModule({
      imports: [
        TiendaComponent, // Standalone component
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: ProductosService, useValue: productosServiceMock },
        { provide: SearchService, useValue: searchServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: EventService, useValue: eventServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TiendaComponent);
    component = fixture.componentInstance;

    productosServiceSpy = TestBed.inject(ProductosService) as jasmine.SpyObj<ProductosService>;
    searchServiceSpy = TestBed.inject(SearchService) as jasmine.SpyObj<SearchService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    eventServiceSpy = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on initialization', () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 100, stock: 10 },
      { id: 2, name: 'Product 2', price: 200, stock: 5 },
    ];
    searchServiceSpy.getAllProducts.and.returnValue(of(mockProducts));

    component.ngOnInit();

    expect(searchServiceSpy.getAllProducts).toHaveBeenCalled();
    expect(component.productos).toEqual(mockProducts);
  });

  it('should add product to cart and update total', () => {
    const mockProduct = { id: 1, name: 'Product 1', price: 100, stock: 10 };
    cartServiceSpy.addItem.and.callFake(() => {
      cartServiceSpy.getCartItems.and.returnValue([{ ...mockProduct, quantity: 1 }]);
      cartServiceSpy.getCartTotal.and.returnValue(100);
    });

    component.addToCart(mockProduct);

    expect(cartServiceSpy.addItem).toHaveBeenCalledWith(mockProduct);
    expect(cartServiceSpy.getCartItems).toHaveBeenCalled();
    expect(cartServiceSpy.getCartTotal).toHaveBeenCalled();
    expect(component.cartTotal).toBe(100);
  });

  it('should handle error while creating product', () => {
    spyOn(console, 'error');
    productosServiceSpy.createProducto.and.returnValue(throwError(() => new Error('Error al crear producto')));

    component.productForm.setValue({
      name: 'New Product',
      description: 'Description',
      price: 100,
      stock: 10,
      imageUrl: 'http://example.com/image.jpg',
    });

    component.createProduct();

    expect(productosServiceSpy.createProducto).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error al crear producto:', jasmine.any(Error));
  });

  it('should handle adding out-of-stock product to cart', () => {
    const mockProduct = { id: 1, name: 'Product 1', price: 100, stock: 0 };
    spyOn(window, 'alert');
  
    component.addToCart(mockProduct);
  
    expect(cartServiceSpy.addItem).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Producto sin stock disponible.');
  });

  it('should load and process products', () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 100, stock: 10, imageUrl: '' },
      { id: 2, name: 'Product 2', price: 200, stock: 5, imageUrl: null },
    ];
    const processedProducts = [
      {
        id: 1,
        name: 'Product 1',
        price: 100,
        stock: 10,
        imageUrl: 'https://vscda.org/wp-content/uploads/2017/03/300x300.png',
      },
      {
        id: 2,
        name: 'Product 2',
        price: 200,
        stock: 5,
        imageUrl: 'https://vscda.org/wp-content/uploads/2017/03/300x300.png',
      },
    ];
  
    searchServiceSpy.getAllProducts.and.returnValue(of(mockProducts));
  
    component.loadProductos();
  
    expect(searchServiceSpy.getAllProducts).toHaveBeenCalled();
    expect(component.productos).toEqual(processedProducts);
  });

  it('should handle error when loading products', () => {
    spyOn(console, 'error');
    searchServiceSpy.getAllProducts.and.returnValue(throwError(() => new Error('Error al cargar los productos')));
  
    component.loadProductos();
  
    expect(searchServiceSpy.getAllProducts).toHaveBeenCalled();
    expect(component.productos).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Error al cargar los productos:', jasmine.any(Error));
  });  
  
});
