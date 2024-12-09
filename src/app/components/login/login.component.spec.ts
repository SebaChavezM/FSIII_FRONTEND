import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule, // Para trabajar con formularios
        LoginComponent, // Standalone component debe ir en imports
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize email, password, and errorMessage as empty', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('should navigate to home on successful login', () => {
    const mockResponse = { role: 'USER' };
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.email = 'test@example.com';
    component.password = 'password123';
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.errorMessage).toBe('');
  });

  it('should show error message on invalid credentials', () => {
    authServiceSpy.login.and.returnValue(of(null)); // Simula respuesta inválida

    component.email = 'test@example.com';
    component.password = 'invalidpassword';
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'invalidpassword');
    expect(component.errorMessage).toBe('Credenciales inválidas');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should handle login error response', () => {
    const errorMessage = 'Error en el servidor';
    authServiceSpy.login.and.returnValue(throwError(() => new Error(errorMessage)));

    component.email = 'test@example.com';
    component.password = 'password123';
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(component.errorMessage).toBe(errorMessage);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should not attempt login with empty fields', () => {
    component.email = '';
    component.password = '';
    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Por favor ingrese su correo electrónico y contraseña.');
  });

  it('should clear error message on successful login', () => {
    const mockResponse = { role: 'USER' };
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.errorMessage = 'Error previo';
    component.email = 'test@example.com';
    component.password = 'password123';
    component.onSubmit();

    expect(component.errorMessage).toBe('');
  });

  it('should navigate to register page when goToRegister is called', () => {
    component.goToRegister();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should navigate to forgot password page when goToForgotPassword is called', () => {
    component.goToForgotPassword();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/forgot-password']);
  });

  it('should handle multiple login attempts gracefully', () => {
    const mockResponse = { role: 'USER' };
    authServiceSpy.login.and.returnValue(of(mockResponse));
  
    component.email = 'test@example.com';
    component.password = 'password123';
  
    // Primer intento
    component.onSubmit();
    expect(authServiceSpy.login).toHaveBeenCalledTimes(1);
  
    // Cambiar valores para el segundo intento
    component.email = 'another@example.com';
    component.password = 'anotherpassword123';
    component.onSubmit();
  
    expect(authServiceSpy.login).toHaveBeenCalledTimes(2);
  });  

  it('should not navigate to home if login fails', () => {
    authServiceSpy.login.and.returnValue(of(null));

    component.email = 'test@example.com';
    component.password = 'wrongpassword';
    component.onSubmit();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should reset form on successful login', () => {
    const mockResponse = { role: 'USER' };
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.email = 'test@example.com';
    component.password = 'password123';

    component.onSubmit();

    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should trim email and password before login', () => {
    const mockResponse = { role: 'USER' };
    authServiceSpy.login.and.returnValue(of(mockResponse));
  
    component.email = '   test@example.com   ';
    component.password = '   password123   ';
    component.onSubmit();
  
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });  

  it('should show an error if email format is invalid', () => {
    component.email = 'invalidemail';
    component.password = 'password123';
    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Por favor, ingrese un correo electrónico válido.');
  });

  it('should show an error if email format is invalid', () => {
    component.email = 'invalidemail';
    component.password = 'password123';
    component.onSubmit();
  
    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Por favor, ingrese un correo electrónico válido.');
  });
  
});
