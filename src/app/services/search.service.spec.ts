import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('SearchService', () => {
  let service: SearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SearchService],
    });

    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes HTTP pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all products', () => {
    const mockProducts = [
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
    ];

    service.getAllProducts().subscribe((products) => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne('http://localhost:8083/api/search/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should fetch a product by ID', () => {
    const mockProduct = { id: 1, name: 'Product 1' };

    service.getProductById(1).subscribe((product) => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne('http://localhost:8083/api/search/products/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should handle error when fetching product by ID', () => {
    service.getProductById(1).subscribe({
      next: () => fail('Should have failed with an error'),
      error: (error) => {
        expect(error.status).toBe(404);
      },
    });

    const req = httpMock.expectOne('http://localhost:8083/api/search/products/1');
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'Product not found' }, { status: 404, statusText: 'Not Found' });
  });

  it('should search products by query', () => {
    const mockProducts = [
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
    ];
    const query = 'test';

    service.searchProducts(query).subscribe((products) => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne((req) => 
      req.url === 'http://localhost:8083/api/search/products/search' &&
      req.params.get('query') === query
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should handle error when searching products', () => {
    const query = 'test';

    service.searchProducts(query).subscribe({
      next: () => fail('Should have failed with an error'),
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne((req) => 
      req.url === 'http://localhost:8083/api/search/products/search' &&
      req.params.get('query') === query
    );
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'Search failed' }, { status: 500, statusText: 'Internal Server Error' });
  });
});
