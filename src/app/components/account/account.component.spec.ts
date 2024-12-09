import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountComponent } from './account.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Import para ActivatedRoute

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['getUserEmail', 'getUserDetails']);

    await TestBed.configureTestingModule({
      imports: [
        AccountComponent, // Importa el componente standalone
        NavbarComponent, // Importa el componente standalone
        CommonModule,
        HttpClientTestingModule,
        RouterTestingModule, // Proporciona ActivatedRoute
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock }, // Mockea AuthService
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set userEmail on initialization', () => {
    const mockEmail = 'test@example.com';
    authServiceSpy.getUserEmail.and.returnValue(mockEmail);

    fixture.detectChanges(); // Activa ngOnInit()

    expect(component.userEmail).toBe(mockEmail);
    expect(authServiceSpy.getUserEmail).toHaveBeenCalled();
  });

  it('should fetch user details on initialization', () => {
    const mockUserDetails = { name: 'John Doe', role: 'Admin' };
    authServiceSpy.getUserEmail.and.returnValue('test@example.com'); // Mockea el email
    authServiceSpy.getUserDetails.and.returnValue(of(mockUserDetails)); // Mockea la respuesta de getUserDetails

    fixture.detectChanges(); // Activa ngOnInit()

    expect(component.userData).toEqual(mockUserDetails);
    expect(authServiceSpy.getUserDetails).toHaveBeenCalled();
  });

  it('should handle errors when fetching user details', () => {
    spyOn(console, 'error');
    authServiceSpy.getUserEmail.and.returnValue('test@example.com'); // Mockea el email
    authServiceSpy.getUserDetails.and.returnValue(throwError(() => new Error('Error al cargar datos')));

    fixture.detectChanges(); // Activa ngOnInit()

    expect(component.userData).toEqual({});
    expect(console.error).toHaveBeenCalledWith('Error al cargar los datos del usuario:', jasmine.any(Error));
  });

  it('should set userEmail to empty if getUserEmail returns an empty string', () => {
    authServiceSpy.getUserEmail.and.returnValue(''); // Mockea que no hay usuario autenticado
  
    fixture.detectChanges(); // Activa ngOnInit()
  
    expect(component.userEmail).toBe(''); // Espera una cadena vacía
  });  

  it('should handle empty response from getUserDetails gracefully', () => {
    authServiceSpy.getUserEmail.and.returnValue('test@example.com'); // Mockea el email
    authServiceSpy.getUserDetails.and.returnValue(of(null)); // Simula un caso donde el backend no devuelve datos

    fixture.detectChanges(); // Activa ngOnInit()

    expect(component.userData).toEqual({});
  });

  it('should display an alert when editProfile is called', () => {
    spyOn(window, 'alert');
    component.editProfile();
    expect(window.alert).toHaveBeenCalledWith('Funcionalidad para editar el perfil no implementada aún.');
  });

  it('should handle empty response from getUserDetails gracefully', () => {
    authServiceSpy.getUserEmail.and.returnValue('test@example.com'); // Mockea el email
    authServiceSpy.getUserDetails.and.returnValue(of(null)); // Simula un caso donde el backend no devuelve datos
  
    fixture.detectChanges(); // Activa ngOnInit()
  
    expect(component.userData).toEqual({}); // Verifica que no hay datos en el usuario
  });
  
  it('should not break if editProfile is called without alert function', () => {
    spyOn(window, 'alert').and.throwError('Error de alerta'); // Simula un error en el alert
    expect(() => component.editProfile()).not.toThrow(); // Asegura que no lance una excepción
  });  

  it('should not break if editProfile is called without alert function', () => {
    spyOn(window, 'alert').and.throwError('Error de alerta'); // Simula un error en el alert
    expect(() => component.editProfile()).not.toThrow(); // Asegura que no lance una excepción
  });
});
