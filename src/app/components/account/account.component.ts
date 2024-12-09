import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  imports: [NavbarComponent, CommonModule],
})
export class AccountComponent implements OnInit {
  userEmail: string = '';
  userData: any = {};

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userEmail = this.authService.getUserEmail();
  
    const userDetails$ = this.authService.getUserDetails();
    if (!userDetails$) {
      console.error('AuthService.getUserDetails() returned undefined.');
      return;
    }
  
    userDetails$.subscribe({
      next: (data) => {
        if (data) {
          this.userData = data;
        } else {
          this.userData = {}; // Establecer un objeto vacío si los datos son nulos
        }
      },
      error: (err) => {
        console.error('Error al cargar los datos del usuario:', err);
      },
    });    
  }  

  editProfile(): void {
    try {
      alert('Funcionalidad para editar el perfil no implementada aún.');
    } catch (error) {
      console.error('Error al mostrar la alerta:', error);
    }
  }
  
}
