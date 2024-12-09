import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let httpMock: HttpTestingController;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Creamos spies para los servicios que usaremos
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ForgotPasswordComponent, // Importamos el componente standalone
      ],
      providers: [
        { provide: ToastrService, useValue: toastrSpy }, // Mock de ToastrService
        { provide: Router, useValue: routerSpyObj }, // Mock de Router
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    toastrServiceSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify(); // Verificamos que no haya solicitudes HTTP pendientes
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize email as an empty string', () => {
    expect(component.email).toBe('');
  });

  it('should validate correct email format', () => {
    expect(component.validateEmail('test@example.com')).toBeTrue();
    expect(component.validateEmail('invalid-email')).toBeFalse();
    expect(component.validateEmail('')).toBeFalse();
  });

  it('should show validation error if email is empty', () => {
    component.email = '';
    component.onSubmit();

    expect(toastrServiceSpy.error).toHaveBeenCalledWith(
      'Por favor, ingrese un correo electrónico.',
      'Error'
    );
  });

  it('should show validation error if email format is invalid', () => {
    component.email = 'invalid-email';
    component.onSubmit();

    expect(toastrServiceSpy.error).toHaveBeenCalledWith(
      'Por favor, ingrese un correo electrónico válido.',
      'Error'
    );
  });

  it('should call the API and show success toast on successful form submission', () => {
    const mockResponse = { message: 'Email enviado correctamente' };
    component.email = 'test@example.com';

    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8081/api/auth/forgot-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com' });

    req.flush(mockResponse);

    expect(toastrServiceSpy.success).toHaveBeenCalledWith(
      'Email enviado correctamente',
      'Éxito'
    );
    expect(component.email).toBe(''); // Asegura que el campo email se reinicia
    expect(component.isLoading).toBeFalse(); // Asegura que isLoading vuelva a false
  });

  it('should handle server errors gracefully', () => {
    component.email = 'test@example.com';

    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8081/api/auth/forgot-password');
    req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Server Error' });

    expect(toastrServiceSpy.error).toHaveBeenCalledWith(
      'Ha ocurrido un error inesperado.',
      'Error'
    );
    expect(component.isLoading).toBeFalse(); // Asegura que isLoading vuelva a false
  });

  it('should not allow multiple submissions while loading', () => {
    component.email = 'test@example.com';
    component.isLoading = true; // Simulamos que ya se está cargando

    component.onSubmit();

    const req = httpMock.match('http://localhost:8081/api/auth/forgot-password');
    expect(req.length).toBe(0); // No debería haber solicitudes pendientes
  });

  it('should navigate to login page on goToLogin()', () => {
    component.goToLogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
