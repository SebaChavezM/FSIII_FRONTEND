import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Crear spies para AuthService y Router
    authServiceSpy = jasmine.createSpyObj('AuthService', ['checkSession']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation if session is authenticated', (done) => {
    const mockSession = { authenticated: true };
    authServiceSpy.checkSession.and.returnValue(of(mockSession));

    guard.canActivate().subscribe((canActivate) => {
      expect(canActivate).toBeTrue();
      expect(authServiceSpy.checkSession).toHaveBeenCalled();
      done();
    });
  });

  it('should navigate to login if session is not authenticated', (done) => {
    const mockSession = { authenticated: false };
    authServiceSpy.checkSession.and.returnValue(of(mockSession));

    guard.canActivate().subscribe((canActivate) => {
      expect(canActivate).toBeFalse();
      expect(authServiceSpy.checkSession).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('should navigate to login if checkSession throws an error', (done) => {
    authServiceSpy.checkSession.and.returnValue(of({ authenticated: false }));

    guard.canActivate().subscribe((canActivate) => {
      expect(canActivate).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
