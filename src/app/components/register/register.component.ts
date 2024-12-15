import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule],
})
export class RegisterComponent {
  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onRegister(): void {
    const { name, email, password, confirmPassword } = this.registerData;

    // Verificar si hay campos vacíos
    if (!name || !email || !password || !confirmPassword) {
      this.toastr.warning('Por favor, completa todos los campos antes de continuar.', 'Campos vacíos');
      return;
    }

    // Validar el formato del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.toastr.warning('Por favor, ingresa un correo electrónico válido.', 'Correo inválido');
      return;
    }

    // Validar contraseñas
    if (!this.validatePassword()) {
      this.toastr.warning(
        'Las contraseñas no coinciden o no cumplen con los requisitos.',
        'Contraseña inválida'
      );
      return;
    }

    // Llamada al servicio de registro
    this.authService.register(name, email, password).subscribe({
      next: (response) => {
        if (response) {
          this.toastr.success('Registro exitoso. Ahora puedes iniciar sesión.', 'Éxito');
          this.resetRegisterData();
          this.router.navigate(['/login']); // Redirigir al inicio de sesión
        } else {
          this.toastr.error('Hubo un error al registrarse. Inténtalo nuevamente.', 'Error');
        }
      },
      error: (err) => {
        this.toastr.error(err.message || 'Ocurrió un error inesperado. Inténtalo nuevamente.', 'Error');
      },
    });
  }

  /**
   * Validar contraseñas: coincidencia y requisitos mínimos.
   */
  private validatePassword(): boolean {
    const password = this.registerData.password;
    const confirmPassword = this.registerData.confirmPassword;

    // Validar longitud y requisitos de la contraseña
    const passwordValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(password);

    // Verificar si las contraseñas coinciden
    return passwordValid && password === confirmPassword;
  }

  /**
   * Reinicia los datos del formulario de registro.
   */
  private resetRegisterData(): void {
    this.registerData = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
  }
}
