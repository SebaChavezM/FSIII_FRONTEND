import { TestBed } from '@angular/core/testing';
import { ProductosService } from './productos.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ProductosService', () => {
  let service: ProductosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductosService],
    });

    service = TestBed.inject(ProductosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a product', () => {
    const mockProducto = { name: 'Test Product', price: 100 };
    const mockResponse = { id: 1, ...mockProducto };

    service.createProducto(mockProducto).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8082/api/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockProducto);

    req.flush(mockResponse);
  });

  it('should update a product', () => {
    const mockProducto = { name: 'Updated Product', price: 150 };
    const mockResponse = { id: 1, ...mockProducto };

    service.updateProducto(1, mockProducto).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8082/api/products/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockProducto);

    req.flush(mockResponse);
  });

  it('should reduce stock for a product', () => {
    service.reduceStock(1, 5).subscribe((response) => {
      expect(response).toBeNull(); // Assuming the API returns no content
    });

    const req = httpMock.expectOne('http://localhost:8082/api/products/1/reduce-stock?quantity=5');
    expect(req.request.method).toBe('PUT');

    req.flush(null);
  });

  it('should delete a product', () => {
    service.deleteProducto(1).subscribe((response) => {
      expect(response).toBeNull(); // Assuming the API returns no content
    });

    const req = httpMock.expectOne('http://localhost:8082/api/products/1');
    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });

  it('should handle create product error', () => {
    const mockProducto = { name: 'Test Product', price: 100 };

    service.createProducto(mockProducto).subscribe({
      next: () => fail('Should have failed with an error'),
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('http://localhost:8082/api/products');
    expect(req.request.method).toBe('POST');

    req.flush({ message: 'Create failed' }, { status: 500, statusText: 'Server Error' });
  });

  it('should handle update product error', () => {
    const mockProducto = { name: 'Updated Product', price: 150 };

    service.updateProducto(1, mockProducto).subscribe({
      next: () => fail('Should have failed with an error'),
      error: (error) => {
        expect(error.status).toBe(404);
      },
    });

    const req = httpMock.expectOne('http://localhost:8082/api/products/1');
    expect(req.request.method).toBe('PUT');

    req.flush({ message: 'Update failed' }, { status: 404, statusText: 'Not Found' });
  });

  it('should handle delete product error', () => {
    service.deleteProducto(1).subscribe({
      next: () => fail('Should have failed with an error'),
      error: (error) => {
        expect(error.status).toBe(403);
      },
    });

    const req = httpMock.expectOne('http://localhost:8082/api/products/1');
    expect(req.request.method).toBe('DELETE');

    req.flush({ message: 'Delete failed' }, { status: 403, statusText: 'Forbidden' });
  });
});
