import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Importar módulo para mockear HttpClient

describe('AppComponent', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Crear un mock de AuthService
    const authServiceMock = jasmine.createSpyObj('AuthService', ['someMethod']);

    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule], // Agregar HttpClientTestingModule para AuthService
      providers: [{ provide: AuthService, useValue: authServiceMock }], // Mockear AuthService
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'frontend'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('frontend');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Aplicar bindings
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('frontend');
  });
});
