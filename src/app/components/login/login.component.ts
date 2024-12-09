import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = ''; // Reinicia el mensaje de error
  
    // Recortar email y password
    const emailTrimmed = this.email.trim();
    const passwordTrimmed = this.password.trim();
  
    // Validar campos vacíos
    if (!emailTrimmed || !passwordTrimmed) {
      this.errorMessage = 'Por favor ingrese su correo electrónico y contraseña.';
      return;
    }
  
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      this.errorMessage = 'Por favor, ingrese un correo electrónico válido.';
      return;
    }
  
    this.authService.login(emailTrimmed, passwordTrimmed).subscribe(
      (response) => {
        if (response && response.role) {
          this.router.navigate(['/home']);
          this.errorMessage = '';
          this.email = '';
          this.password = '';
        } else {
          this.errorMessage = 'Credenciales inválidas';
        }
      },
      (error) => {
        this.errorMessage = error.message || 'Credenciales inválidas';
      }
    );
  }  

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
