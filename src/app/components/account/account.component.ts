import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { ToastrService, ToastrModule } from 'ngx-toastr'; // Importar ngx-toastr

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  imports: [NavbarComponent, CommonModule, FormsModule, ToastrModule],
})
export class AccountComponent implements OnInit {
  userEmail: string = '';
  userData: any = {}; // Datos del usuario
  apiUrl: string = 'http://localhost:8081/api/auth/update'; // URL para actualizar el usuario

  constructor(private http: HttpClient, private toastr: ToastrService) {} // Inyectar ToastrService

  ngOnInit(): void {
    // Leer los datos del usuario desde localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Asignar valores iniciales
    this.userEmail = user.email || 'No disponible';
    this.userData = {
      name: user.name || 'No disponible',
      direccion: user.direccion || '',
      telefono: user.telefono || '',
      role: user.role || 'Usuario',
      createdAt: user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'No disponible',
    };
  }

  // Método para actualizar los datos del usuario
  updateUser(): void {
    const updatedData = {
      name: this.userData.name,
      direccion: this.userData.direccion,
      telefono: this.userData.telefono,
    };

    // Enviar datos al servidor para actualizar el usuario
    this.http.put(this.apiUrl, updatedData, { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.toastr.success('Datos actualizados correctamente.', 'Éxito'); // Toast de éxito

        // Actualizar los datos en localStorage
        const updatedUser = {
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          ...updatedData,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Actualizar la interfaz
        this.userData = { ...this.userData, ...updatedData };

        // Cerrar el modal manualmente (si Bootstrap está configurado)
        const modalElement = document.getElementById('editModal');
        if (modalElement) {
          const bootstrap = (window as any).bootstrap;
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
      },
      error: (err) => {
        this.toastr.error('Ocurrió un error al actualizar los datos.', 'Error'); // Toast de error
      },
    });
  }
}
