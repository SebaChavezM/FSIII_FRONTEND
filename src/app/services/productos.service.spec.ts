import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductosService, Producto } from './productos.service';

describe('ProductosService', () => {
  let service: ProductosService;
  let httpMock: HttpTestingController;

  const mockProducto: Producto = {
    id: 1,
    name: 'Producto 1',
    description: 'Descripción del producto 1',
    price: 100,
    stock: 10,
    imageUrl: 'http://example.com/producto1.jpg',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductosService],
    });

    service = TestBed.inject(ProductosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes HTTP pendientes
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllProductos', () => {
    it('debería obtener todos los productos', () => {
      const mockProductos: Producto[] = [mockProducto, { ...mockProducto, id: 2, name: 'Producto 2' }];

      service.getAllProductos().subscribe((productos) => {
        expect(productos.length).toBe(2);
        expect(productos).toEqual(mockProductos);
      });

      const req = httpMock.expectOne('http://localhost:8082/api/products');
      expect(req.request.method).toBe('GET');
      req.flush(mockProductos);
    });

    it('debería manejar errores al obtener productos', () => {
      service.getAllProductos().subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne('http://localhost:8082/api/products');
      req.flush({ message: 'Error interno del servidor' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('createProducto', () => {
    it('debería crear un producto', () => {
      service.createProducto(mockProducto).subscribe((producto) => {
        expect(producto).toEqual(mockProducto);
      });

      const req = httpMock.expectOne('http://localhost:8082/api/products');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockProducto);
      req.flush(mockProducto);
    });

    it('debería manejar errores al crear un producto', () => {
      service.createProducto(mockProducto).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne('http://localhost:8082/api/products');
      req.flush({ message: 'Error al crear el producto' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateProducto', () => {
    it('debería actualizar un producto existente', () => {
      const updatedProducto = { ...mockProducto, name: 'Producto Actualizado' };

      service.updateProducto(1, updatedProducto).subscribe((producto) => {
        expect(producto).toEqual(updatedProducto);
      });

      const req = httpMock.expectOne('http://localhost:8082/api/products/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedProducto);
      req.flush(updatedProducto);
    });

    it('debería manejar errores al actualizar un producto', () => {
      service.updateProducto(1, mockProducto).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne('http://localhost:8082/api/products/1');
      req.flush({ message: 'Producto no encontrado' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('reduceStock', () => {
    it('debería reducir el stock de un producto', () => {
      service.reduceStock(1, 5).subscribe((response) => {
        expect(response).toBeUndefined(); // La respuesta debe ser `void`
      });

      const req = httpMock.expectOne('http://localhost:8082/api/products/1/reduce-stock?quantity=5');
      expect(req.request.method).toBe('PUT');
      req.flush(null);
    });

    it('debería manejar errores al reducir el stock', () => {
      service.reduceStock(1, 5).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne('http://localhost:8082/api/products/1/reduce-stock?quantity=5');
      req.flush({ message: 'Cantidad inválida' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('deleteProducto', () => {
    it('debería eliminar un producto por ID', () => {
      service.deleteProducto(1).subscribe((response) => {
        expect(response).toBeUndefined(); // La respuesta debe ser `void`
      });

      const req = httpMock.expectOne('http://localhost:8082/api/products/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('debería manejar errores al eliminar un producto', () => {
      service.deleteProducto(1).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne('http://localhost:8082/api/products/1');
      req.flush({ message: 'Producto no encontrado' }, { status: 404, statusText: 'Not Found' });
    });
  });
});
