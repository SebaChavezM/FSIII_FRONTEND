import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER',
    direccion: 'Address',
    telefono: '123456789',
  };

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: routerSpyObj }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear(); // Limpia el localStorage después de cada prueba
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('debería enviar los datos correctos al iniciar sesión', () => {
      const mockResponse = { token: '12345', user: mockUser };

      service.login('john@example.com', 'password').subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'john@example.com', password: 'password' });
      req.flush(mockResponse);
    });
  });

  describe('updateUser', () => {
    it('debería actualizar los datos del usuario y almacenarlos en localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      const updatedData = { name: 'Jane Doe', direccion: 'New Address', telefono: '987654321' };

      service.updateUser(updatedData).subscribe((response) => {
        expect(response).toEqual({ success: true });
        const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
        expect(updatedUser.name).toBe('Jane Doe');
        expect(updatedUser.direccion).toBe('New Address');
        expect(updatedUser.telefono).toBe('987654321');
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/update');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);
      req.flush({ success: true });
    });

    it('debería manejar errores al actualizar los datos del usuario', () => {
      service.updateUser({ name: 'Jane', direccion: '', telefono: '' }).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/update');
      req.flush({ message: 'Error interno' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getRole', () => {
    it('debería devolver el rol del usuario desde localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      const role = service.getRole();
      expect(role).toBe('USER');
    });

    it('debería devolver "USER" si no hay un rol en localStorage', () => {
      localStorage.removeItem('user');
      const role = service.getRole();
      expect(role).toBe('USER');
    });
  });

  describe('checkSession', () => {
    it('debería verificar la sesión activa y guardar el usuario en localStorage si está autenticado', () => {
      const mockResponse = { authenticated: true, user: mockUser };

      service.checkSession().subscribe((response) => {
        expect(response.authenticated).toBeTrue();
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        expect(storedUser).toEqual(mockUser);
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/check-session');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('debería limpiar la sesión si no está autenticado', () => {
      spyOn(service as any, 'clearSession').and.callThrough();

      service.checkSession().subscribe((response) => {
        expect(response.authenticated).toBeFalse();
        expect(localStorage.getItem('user')).toBeNull();
        expect(service.isLoggedIn()).toBeFalse();
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/check-session');
      req.flush({ authenticated: false });
    });

    it('debería manejar errores y limpiar la sesión', () => {
      spyOn(service as any, 'clearSession').and.callThrough();

      service.checkSession().subscribe((response) => {
        expect(response.authenticated).toBeFalse();
        expect(localStorage.getItem('user')).toBeNull();
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/check-session');
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('logout', () => {
    it('debería cerrar sesión y redirigir al inicio de sesión', () => {
      spyOn(service as any, 'clearSession').and.callThrough();

      service.logout();

      const req = httpMock.expectOne('http://localhost:8081/api/auth/logout');
      expect(req.request.method).toBe('POST');
      req.flush({});

      expect(service['clearSession']).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('debería manejar errores al cerrar sesión y aun así redirigir', () => {
      spyOn(service as any, 'clearSession').and.callThrough();

      service.logout();

      const req = httpMock.expectOne('http://localhost:8081/api/auth/logout');
      req.error(new ErrorEvent('Network error'));

      expect(service['clearSession']).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('forgotPassword', () => {
    it('debería enviar una solicitud de recuperación de contraseña', () => {
      service.forgotPassword('john@example.com').subscribe((response) => {
        expect(response).toEqual({ success: true });
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/forgot-password');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'john@example.com' });
      req.flush({ success: true });
    });
  });
});
