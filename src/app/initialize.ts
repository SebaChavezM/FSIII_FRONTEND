import { AuthService } from './services/auth.service';

export function initializeApp(authService: AuthService): Promise<void> {
  return new Promise((resolve, reject) => {
    authService.checkSession().subscribe({
      next: (response) => {
        if (response.authenticated) {
          console.log('Sesión válida:', response);
          resolve(); // Sesión activa
        } else {
          console.warn('Sesión no válida. Redirigiendo al login.');
          window.location.href = '/login';
          reject(new Error('No active session'));
        }
      },
      error: (err) => {
        console.error('Error al verificar la sesión:', err);
        window.location.href = '/login';
        reject(err);
      },
    });
  });
}
