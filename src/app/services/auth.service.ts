import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  private isAuthenticated = false;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          this.isAuthenticated = true;
          localStorage.setItem('user', JSON.stringify(response.user));
        }),
        catchError((error) => {
          if (error.status === 401) {
            return of(null); // Devuelve null para fallas de autenticación
          }
          return of(null);
        })
      );
  }  

  getRole(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'USER';
  }

  getUserDetails(): Observable<any> {
    return this.http.get<any>('/api/users/me').pipe(
      catchError((error) => {
        console.error('Error al obtener los detalles del usuario:', error);
        return of(null); // Devuelve un Observable con valor `null` en caso de error
      })
    );
  }   

  getUserEmail(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email || '';
  }

  checkSession(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/check-session`, { withCredentials: true })
      .pipe(
        map((response: any) => {
          this.isAuthenticated = response.authenticated;
          if (response.authenticated) {
            localStorage.setItem('user', JSON.stringify(response.user));
          } else {
            localStorage.removeItem('user');
          }
          return response;
        }),
        catchError((err: any) => {
          console.error('Error al verificar la sesión:', err);
          this.isAuthenticated = false;
          localStorage.removeItem('user');
          return of({ authenticated: false });
        })
      );
  }  

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.isAuthenticated = false;
        localStorage.removeItem('user');
        console.log('Sesión cerrada correctamente');
        if (this.router.url !== '/login') {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
      },
    });
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  register(name: string, email: string, password: string): Observable<any> {
    const registerData = { name, email, password };
    return this.http
      .post(`${this.apiUrl}/register`, registerData, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          console.log('Registro exitoso:', response);
        }),
        catchError((error) => {
          console.error('Error en el registro:', error);
          return of(null);
        })
      );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/forgot-password`, { email }, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          console.log('Solicitud de recuperación de contraseña exitosa:', response);
        }),
        catchError((error) => {
          console.error('Error en la recuperación de contraseña:', error);
          return of(null);
        })
      );
  }

  initializeSession(): Promise<boolean> {
    return new Promise((resolve) => {
      this.checkSession().subscribe({
        next: (response) => resolve(response.authenticated),
        error: () => resolve(false),
      });
    });
  }  
  
}
