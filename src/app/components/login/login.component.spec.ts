import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let toastrService: ToastrService;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, ToastrModule.forRoot()],
      declarations: [],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        ToastrService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastrService = TestBed.inject(ToastrService);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('onSubmit', () => {
    it('debería mostrar advertencia si los campos están vacíos', () => {
      spyOn(toastrService, 'warning');

      component.email = '';
      component.password = '';
      component.onSubmit();

      expect(toastrService.warning).toHaveBeenCalledWith(
        'Por favor, ingresa tu correo electrónico y contraseña.',
        'Campos vacíos'
      );
    });

    it('debería llamar al servicio AuthService.login con los datos ingresados', () => {
      spyOn(toastrService, 'success');
      const mockResponse = { role: 'User', name: 'Test User', email: 'test@example.com' };
      authService.login.and.returnValue(of(mockResponse));

      component.email = 'test@example.com';
      component.password = 'password123';
      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(toastrService.success).toHaveBeenCalledWith('Inicio de sesión exitoso.', 'Éxito');
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('debería manejar credenciales inválidas', () => {
      spyOn(toastrService, 'error');
      authService.login.and.returnValue(of({}));

      component.email = 'test@example.com';
      component.password = 'wrongpassword';
      component.onSubmit();

      expect(toastrService.error).toHaveBeenCalledWith(
        'Credenciales inválidas. Por favor, verifica tus datos.',
        'Error de inicio de sesión'
      );
    });

    it('debería manejar errores durante el inicio de sesión', () => {
      spyOn(toastrService, 'error');
      authService.login.and.returnValue(
        throwError(() => new Error('Error interno del servidor'))
      );

      component.email = 'test@example.com';
      component.password = 'password123';
      component.onSubmit();

      expect(toastrService.error).toHaveBeenCalledWith(
        'Error interno del servidor',
        'Error'
      );
    });
  });

  describe('goToRegister', () => {
    it('debería navegar a la página de registro', () => {
      component.goToRegister();
      expect(router.navigate).toHaveBeenCalledWith(['/register']);
    });
  });

  describe('goToForgotPassword', () => {
    it('debería navegar a la página de recuperación de contraseña', () => {
      component.goToForgotPassword();
      expect(router.navigate).toHaveBeenCalledWith(['/forgot-password']);
    });
  });

  describe('resetForm', () => {
    it('debería limpiar los campos del formulario', () => {
      (component as any).resetForm();
      expect(component.email).toBe('');
      expect(component.password).toBe('');
    });
  });

  describe('UI Interactions', () => {
    it('debería enviar el formulario cuando se hace clic en el botón de inicio de sesión', () => {
      spyOn(component, 'onSubmit');
      const button = fixture.debugElement.query(By.css('button[type="submit"]'));
      button.triggerEventHandler('click', null);

      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('debería llamar a goToRegister cuando se hace clic en el botón de registro', () => {
      spyOn(component, 'goToRegister');
      const button = fixture.debugElement.query(By.css('.register-link'));
      button.triggerEventHandler('click', null);

      expect(component.goToRegister).toHaveBeenCalled();
    });

    it('debería llamar a goToForgotPassword cuando se hace clic en el enlace de recuperación de contraseña', () => {
      spyOn(component, 'goToForgotPassword');
      const button = fixture.debugElement.query(By.css('.forgot-password-link'));
      button.triggerEventHandler('click', null);

      expect(component.goToForgotPassword).toHaveBeenCalled();
    });
  });
});
