import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AccountComponent } from './account.component';
import { FormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
  let httpMock: HttpTestingController;
  let toastrService: ToastrService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        HttpClientTestingModule,
        CommonModule,
        FormsModule,
        ToastrModule.forRoot(),
      ],
      providers: [
        ToastrService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'test' } } }, // Mock para ActivatedRoute
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    toastrService = TestBed.inject(ToastrService);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería inicializar los datos del usuario desde localStorage', () => {
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
        direccion: 'Test Address',
        telefono: '123456789',
        role: 'Admin',
        createdAt: '2023-12-01T00:00:00Z',
      };

      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));

      component.ngOnInit();

      expect(component.userEmail).toBe(mockUser.email);
      expect(component.userData.name).toBe(mockUser.name);
      expect(component.userData.direccion).toBe(mockUser.direccion);
      expect(component.userData.telefono).toBe(mockUser.telefono);
      expect(component.userData.role).toBe(mockUser.role);
      expect(component.userData.createdAt).toBe('1 de diciembre de 2023');
    });

    it('debería manejar usuarios no existentes en localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      component.ngOnInit();

      expect(component.userEmail).toBe('No disponible');
      expect(component.userData.name).toBe('No disponible');
    });
  });

  describe('updateUser', () => {
    it('debería enviar datos al servidor y actualizar localStorage', () => {
      const updatedData = {
        name: 'Updated Name',
        direccion: 'Updated Address',
        telefono: '987654321',
      };

      spyOn(localStorage, 'getItem').and.returnValue(
        JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          direccion: 'Test Address',
          telefono: '123456789',
          role: 'Admin',
        })
      );

      spyOn(localStorage, 'setItem');

      component.userData = updatedData;

      component.updateUser();

      const req = httpMock.expectOne('http://localhost:8081/api/auth/update');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);

      req.flush(updatedData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({
          email: 'test@example.com',
          name: 'Updated Name',
          direccion: 'Updated Address',
          telefono: '987654321',
          role: 'Admin',
        })
      );

      expect(component.userData.name).toBe(updatedData.name);
    });

    it('debería manejar errores del servidor y mostrar un mensaje de error', () => {
      const updatedData = {
        name: 'Updated Name',
        direccion: 'Updated Address',
        telefono: '987654321',
      };

      spyOn(toastrService, 'error');

      component.userData = updatedData;

      component.updateUser();

      const req = httpMock.expectOne('http://localhost:8081/api/auth/update');
      expect(req.request.method).toBe('PUT');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });

      expect(toastrService.error).toHaveBeenCalledWith(
        'Ocurrió un error al actualizar los datos.',
        'Error'
      );
    });
  });

  describe('UI Interactions', () => {
    it('debería actualizar los datos cuando el formulario es enviado', () => {
      component.userData.name = 'New Name';
      component.userData.direccion = 'New Address';
      component.userData.telefono = '111222333';

      const button = fixture.debugElement.query(By.css('button'));
      button.triggerEventHandler('click', null);

      const req = httpMock.expectOne('http://localhost:8081/api/auth/update');
      expect(req.request.body).toEqual({
        name: 'New Name',
        direccion: 'New Address',
        telefono: '111222333',
      });

      req.flush({ success: true });
    });
  });
});
