import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;

  // URL base para las solicitudes
  private readonly API_URL = 'http://localhost:8081/api/auth/forgot-password';

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  /**
   * Valida si el correo electrónico es válido.
   * @param email Correo electrónico para validar.
   * @returns true si el formato es válido, false de lo contrario.
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Maneja la validación de entrada antes de enviar.
   * @returns true si todas las validaciones pasan, false de lo contrario.
   */
  validateInput(): boolean {
    if (!this.email) {
      this.toastr.error('Por favor, ingrese un correo electrónico.', 'Error');
      return false;
    }
    if (!this.validateEmail(this.email)) {
      this.toastr.error(
        'Por favor, ingrese un correo electrónico válido.',
        'Error'
      );
      return false;
    }
    return true;
  }

  onSubmit(): void {
    if (this.isLoading) {
      return; // Prevent multiple submissions while loading
    }
  
    if (!this.email) {
      this.toastr.error('Por favor, ingrese un correo electrónico.', 'Error');
      return;
    }
  
    if (!this.validateEmail(this.email)) {
      this.toastr.error('Por favor, ingrese un correo electrónico válido.', 'Error');
      return;
    }
  
    this.isLoading = true;
    const payload = { email: this.email };
  
    this.http.post('http://localhost:8081/api/auth/forgot-password', payload).subscribe({
      next: (response: any) => {
        this.toastr.success(
          response.message || 'Solicitud enviada exitosamente.',
          'Éxito'
        );
        this.email = ''; // Reset email input
      },
      error: (error) => {
        let errorMessage = 'Error desconocido.';
        if (error.status === 500) {
          errorMessage = 'Ha ocurrido un error inesperado.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        this.toastr.error(errorMessage, 'Error');
      },
      complete: () => {
        this.isLoading = false; // Reset loading state regardless of success or failure
      },
    });
  }    

  /**
   * Redirige al usuario a la página de inicio de sesión.
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
