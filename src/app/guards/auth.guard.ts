import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.checkSession().pipe(
      map((response) => {
        if (response.authenticated) {
          return true;
        } else {
          // Navegar al login solo si no está autenticado
          if (this.router.url !== '/login') {
            this.router.navigate(['/login']);
          }
          return false;
        }
      })
    );
  }
  
}
