import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let toastrService: ToastrService;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
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

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastrService = TestBed.inject(ToastrService);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('onRegister', () => {
    it('debería mostrar advertencia si hay campos vacíos', () => {
      spyOn(toastrService, 'warning');

      component.registerData = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      };
      component.onRegister();

      expect(toastrService.warning).toHaveBeenCalledWith(
        'Por favor, completa todos los campos antes de continuar.',
        'Campos vacíos'
      );
    });

    it('debería mostrar advertencia si el correo es inválido', () => {
      spyOn(toastrService, 'warning');

      component.registerData = {
        name: 'Test User',
        email: 'invalidemail',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      component.onRegister();

      expect(toastrService.warning).toHaveBeenCalledWith(
        'Por favor, ingresa un correo electrónico válido.',
        'Correo inválido'
      );
    });

    it('debería mostrar advertencia si las contraseñas no coinciden', () => {
      spyOn(toastrService, 'warning');

      component.registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password1234!',
      };
      component.onRegister();

      expect(toastrService.warning).toHaveBeenCalledWith(
        'Las contraseñas no coinciden o no cumplen con los requisitos.',
        'Contraseña inválida'
      );
    });

    it('debería registrar al usuario si los datos son válidos', () => {
      spyOn(toastrService, 'success');
      authService.register.and.returnValue(of({ success: true }));

      component.registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      component.onRegister();

      expect(authService.register).toHaveBeenCalledWith(
        'Test User',
        'test@example.com',
        'Password123!'
      );
      expect(toastrService.success).toHaveBeenCalledWith(
        'Registro exitoso. Ahora puedes iniciar sesión.',
        'Éxito'
      );
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('debería mostrar un error si ocurre un problema durante el registro', () => {
      spyOn(toastrService, 'error');
      authService.register.and.returnValue(
        throwError(() => new Error('Error interno del servidor'))
      );

      component.registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      component.onRegister();

      expect(toastrService.error).toHaveBeenCalledWith(
        'Error interno del servidor',
        'Error'
      );
    });
  });

  describe('validatePassword', () => {
    it('debería devolver true si las contraseñas coinciden y cumplen con los requisitos', () => {
      component.registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      expect((component as any).validatePassword()).toBeTrue();
    });

    it('debería devolver false si las contraseñas no coinciden', () => {
      component.registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password1234!',
      };

      expect((component as any).validatePassword()).toBeFalse();
    });

    it('debería devolver false si la contraseña no cumple los requisitos', () => {
      component.registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
        confirmPassword: 'short',
      };

      expect((component as any).validatePassword()).toBeFalse();
    });
  });

  describe('resetRegisterData', () => {
    it('debería reiniciar los datos del formulario de registro', () => {
      component.registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      (component as any).resetRegisterData();

      expect(component.registerData).toEqual({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    });
  });

  describe('UI Interactions', () => {
    it('debería llamar a onRegister cuando se hace clic en el botón de registro', () => {
      // Espiar el método onRegister
      spyOn(component, 'onRegister');
      
      // Seleccionar el botón de registro
      const button = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Simular un clic en el botón
      button.nativeElement.click(); // Simula el clic en el botón
      
      // Detectar cambios en la vista después del clic
      fixture.detectChanges();
      
      // Comprobar que se haya llamado a onRegister
      expect(component.onRegister).toHaveBeenCalled();
    });
  });
  
});
