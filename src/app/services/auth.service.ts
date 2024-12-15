import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  private isAuthenticated = false;

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Inicia sesión y almacena la información del usuario en localStorage.
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true } // Asegura que las cookies se envíen
    );
  }

  /**
   * Actualiza los datos del usuario autenticado.
   * 
   * @param updatedData Objeto con los datos a actualizar: name, direccion y telefono.
   * @returns Observable con la respuesta del backend.
   */
  updateUser(updatedData: { name: string; direccion: string; telefono: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, updatedData, { withCredentials: true }).pipe(
      tap((response: any) => {
        console.log('Datos actualizados correctamente:', response);

        // Actualiza localStorage con los datos actualizados
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...updatedData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }),
      catchError((error) => {
        console.error('Error al actualizar los datos del usuario:', error);
        return throwError(() => error); // Lanza el error para manejarlo en el componente
      })
    );
  }

  /**
   * Obtiene el rol del usuario desde localStorage.
   */
  getRole(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'USER';
  }

  /**
   * Obtiene los detalles del usuario desde el backend.
   */
  getUserDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/me`, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('Error al obtener los detalles del usuario:', error);
        return of(null); // Devuelve null si ocurre un error
      })
    );
  }

  /**
   * Obtiene el correo electrónico del usuario desde localStorage.
   */
  getUserEmail(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email || '';
  }

  /**
   * Verifica la sesión activa del usuario.
   */
  checkSession(): Observable<any> {
    return this.http.get(`${this.apiUrl}/check-session`, { withCredentials: true }).pipe(
      map((response: any) => {
        this.isAuthenticated = response.authenticated;
        if (response.authenticated) {
          localStorage.setItem('user', JSON.stringify(response.user));
        } else {
          this.clearSession(); // Limpia la sesión si no está autenticado
        }
        return response;
      }),
      catchError((err) => {
        console.error('Error al verificar la sesión:', err);
        this.clearSession(); // Limpia la sesión en caso de error
        return of({ authenticated: false });
      })
    );
  }

  /**
   * Cierra la sesión del usuario, eliminando datos locales y redirigiendo.
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.clearSession(); // Limpia los datos locales
        this.router.navigate(['/login']); // Redirige al inicio de sesión
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        this.clearSession(); // Incluso si falla, limpia los datos locales
        this.router.navigate(['/login']);
      },
    });
  }

  /**
   * Comprueba si el usuario está autenticado.
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Registra un nuevo usuario.
   */
  register(name: string, email: string, password: string): Observable<any> {
    const registerData = { name, email, password };
    return this.http.post(`${this.apiUrl}/register`, registerData, { withCredentials: true }).pipe(
      tap((response: any) => {
        console.log('Registro exitoso:', response);
      }),
      catchError((error) => {
        console.error('Error en el registro:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Envía una solicitud para recuperar la contraseña.
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }, { withCredentials: true }).pipe(
      tap((response: any) => {
        console.log('Solicitud de recuperación de contraseña exitosa:', response);
      }),
      catchError((error) => {
        console.error('Error en la recuperación de contraseña:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Inicializa la sesión en el inicio de la aplicación.
   */
  initializeSession(): Promise<boolean> {
    return new Promise((resolve) => {
      this.checkSession().subscribe({
        next: (response) => resolve(response.authenticated),
        error: () => resolve(false),
      });
    });
  }

  /**
   * Limpia la sesión local del usuario.
   */
  private clearSession(): void {
    this.isAuthenticated = false;
    localStorage.removeItem('user'); // Limpia datos almacenados localmente
  }
}
