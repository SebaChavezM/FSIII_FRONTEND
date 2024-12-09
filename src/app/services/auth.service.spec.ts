import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerSpyObj }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes HTTP pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and store user in localStorage', () => {
    const mockResponse = { user: { email: 'test@example.com', role: 'USER' } };

    service.login('test@example.com', 'password123').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const storedUser = JSON.parse(localStorage.getItem('user')!);
    expect(storedUser.email).toBe('test@example.com');
    expect(storedUser.role).toBe('USER');
  });

  it('should handle failed login attempts', () => {
    service.login('test@example.com', 'wrongpassword').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should handle unauthenticated session check', () => {
    service.checkSession().subscribe((response) => {
      expect(response.authenticated).toBeFalse();
      expect(localStorage.getItem('user')).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8081/api/auth/check-session');
    expect(req.request.method).toBe('GET');
    req.flush({ authenticated: false });
  });

  it('should handle session initialization successfully', async () => {
    const mockResponse = { authenticated: true, user: { email: 'test@example.com', role: 'USER' } };
  
    // Mockea el servicio HTTP
    service.checkSession().subscribe((response) => {
      expect(response.authenticated).toBeTrue();
    });
  
    // Simula la respuesta del backend
    const req = httpMock.expectOne('http://localhost:8081/api/auth/check-session');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  
    // Llama a initializeSession y verifica el resultado
    const isInitialized = await service.initializeSession();
    expect(isInitialized).toBeTrue();
  });  

  it('should register a new user', () => {
    const mockResponse = { message: 'User registered successfully' };

    service.register('Test User', 'test@example.com', 'password123').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8081/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should handle register error', () => {
    service.register('Test User', 'test@example.com', 'password123').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8081/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Registration failed' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle forgot password request', () => {
    const mockResponse = { message: 'Password reset email sent' };

    service.forgotPassword('test@example.com').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8081/api/auth/forgot-password');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should handle forgot password error gracefully', () => {
    service.forgotPassword('test@example.com').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8081/api/auth/forgot-password');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Reset failed' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should retrieve user role from localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));
    expect(service.getRole()).toBe('ADMIN');
  });

  it('should retrieve user email from localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }));
    expect(service.getUserEmail()).toBe('test@example.com');
  });

  it('should logout and navigate to login', () => {
    service.logout();

    const req = httpMock.expectOne('http://localhost:8081/api/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush(null);

    expect(localStorage.getItem('user')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle logout error gracefully', () => {
    spyOn(console, 'error');

    service.logout();

    const req = httpMock.expectOne('http://localhost:8081/api/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Logout failed' }, { status: 500, statusText: 'Server Error' });

    expect(console.error).toHaveBeenCalledWith('Error al cerrar sesión:', jasmine.any(Object));
  });
});
