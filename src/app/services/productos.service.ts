import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaz para definir la estructura de un producto
export interface Producto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private apiUrl = 'http://localhost:8082/api/products'; // URL base del backend

  constructor(private http: HttpClient) {}

  // Método para obtener todos los productos
  getAllProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error al obtener productos:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para crear un nuevo producto
  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto).pipe(
      catchError((error) => {
        console.error('Error al crear producto:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para actualizar un producto existente
  updateProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto).pipe(
      catchError((error) => {
        console.error('Error al actualizar producto:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para reducir el stock de un producto
  reduceStock(productId: number, quantity: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${productId}/reduce-stock?quantity=${quantity}`,
      null
    ).pipe(
      catchError((error) => {
        console.error('Error al reducir el stock del producto:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para eliminar un producto por ID
  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error al eliminar producto:', error);
        return throwError(() => error);
      })
    );
  }
}
