import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit(): void {
    const emailTrimmed = this.email.trim();
    const passwordTrimmed = this.password.trim();
  
    if (!emailTrimmed || !passwordTrimmed) {
      this.toastr.warning('Por favor, ingresa tu correo electrónico y contraseña.', 'Campos vacíos');
      return;
    }
  
    this.authService.login(emailTrimmed, passwordTrimmed).subscribe({
      next: (response) => {
        if (response && response.role) {
          localStorage.clear(); // Limpiar cualquier dato previo
          localStorage.setItem('user', JSON.stringify(response)); // Guardar datos nuevos
          this.toastr.success('Inicio de sesión exitoso.', 'Éxito');
          this.router.navigate(['/home']); // Redirigir a la página principal
        } else {
          this.toastr.error('Credenciales inválidas. Por favor, verifica tus datos.', 'Error de inicio de sesión');
        }
      },
      error: (err) => {
        const errorMessage = err.message || 'Ocurrió un error durante el inicio de sesión. Inténtalo nuevamente.';
        this.toastr.error(errorMessage, 'Error');
      },
    });
  }   

  // Método para navegar a la página de registro
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Método para navegar a la página de recuperación de contraseña
  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  // Método para limpiar los campos del formulario
  private resetForm(): void {
    this.email = '';
    this.password = '';
  }
}
