import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    const { name, email, password, confirmPassword } = this.registerData;

    // Verificar si hay campos vacíos
    if (!name || !email || !password || !confirmPassword) {
      alert('Por favor, completa todos los campos antes de continuar.');
      return;
    }

    // Validar contraseñas
    if (!this.validatePassword()) {
      alert('Las contraseñas no coinciden o no cumplen con los requisitos.');
      return;
    }

    // Llamada al servicio de registro
    this.authService.register(name, email, password).subscribe(
      (response) => {
        if (response) {
          alert('Registro exitoso');
          // Reiniciar los datos de registro después de un registro exitoso
          this.resetRegisterData();
          this.router.navigate(['/login']);
        } else {
          alert('Hubo un error al registrarse.');
        }
      },
      (error) => {
        alert('Hubo un error al registrarse.');
      }
    );
  }

  private validatePassword(): boolean {
    const password = this.registerData.password;
    const confirmPassword = this.registerData.confirmPassword;

    const passwordValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(password);

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
