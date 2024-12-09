import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Crear mocks para los servicios
    const authServiceMock = jasmine.createSpyObj('AuthService', ['register']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    // Configurar TestBed
    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent, // Importar el componente standalone aquí
        FormsModule, // Importar FormsModule para manejo de formularios
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    // Crear componente y obtener instancias de los mocks
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges(); // Detectar cambios iniciales
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize registerData with empty values', () => {
    expect(component.registerData).toEqual({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  });

  it('should validate passwords correctly', () => {
    // Caso válido
    component.registerData.password = 'Valid@123';
    component.registerData.confirmPassword = 'Valid@123';
    expect((component as any).validatePassword()).toBeTrue();

    // Caso inválido (contraseña no cumple con requisitos)
    component.registerData.password = 'Invalid';
    component.registerData.confirmPassword = 'Invalid';
    expect((component as any).validatePassword()).toBeFalse();

    // Caso inválido (contraseñas no coinciden)
    component.registerData.password = 'Valid@123';
    component.registerData.confirmPassword = 'Mismatch@123';
    expect((component as any).validatePassword()).toBeFalse();
  });

  it('should call register on valid form submission', () => {
    component.registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Valid@123',
      confirmPassword: 'Valid@123',
    };

    // Mockear respuesta exitosa de registro
    authServiceSpy.register.and.returnValue(of({ message: 'User registered successfully' }));

    component.onRegister();

    expect(authServiceSpy.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'Valid@123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should alert and not call register if passwords are invalid', () => {
    spyOn(window, 'alert'); // Espiar el método alert
    component.registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Invalid',
      confirmPassword: 'Invalid',
    };

    component.onRegister();

    expect(authServiceSpy.register).not.toHaveBeenCalled(); // No debería llamarse si las contraseñas no son válidas
    expect(routerSpy.navigate).not.toHaveBeenCalled(); // No debería navegar
    expect(window.alert).toHaveBeenCalledWith('Las contraseñas no coinciden o no cumplen con los requisitos.');
  });

  it('should handle registration errors', () => {
    spyOn(window, 'alert'); // Espiar el método alert
    component.registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Valid@123',
      confirmPassword: 'Valid@123',
    };

    // Mockear respuesta de error del servicio de registro
    authServiceSpy.register.and.returnValue(throwError(() => new Error('Registration error')));

    component.onRegister();

    expect(authServiceSpy.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'Valid@123');
    expect(window.alert).toHaveBeenCalledWith('Hubo un error al registrarse.');
  });

  it('should reset registerData after successful registration', () => {
    component.registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Valid@123',
      confirmPassword: 'Valid@123',
    };

    // Mockear respuesta exitosa de registro
    authServiceSpy.register.and.returnValue(of({ message: 'User registered successfully' }));

    component.onRegister();

    expect(component.registerData).toEqual({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  });

  it('should handle empty fields gracefully', () => {
    spyOn(window, 'alert'); // Espiar el método alert
    component.registerData = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    component.onRegister();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Por favor, completa todos los campos antes de continuar.');
  });
});
