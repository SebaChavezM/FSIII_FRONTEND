import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private apiUrl = 'http://localhost:8082/api/products';

  constructor(private http: HttpClient) {}

  createProducto(producto: any): Observable<any> {
    return this.http.post(this.apiUrl, producto).pipe(
      catchError((error) => {
        console.error('Error al crear producto:', error);
        return throwError(() => error);
      })
    );
  }

  updateProducto(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, producto).pipe(
      catchError((error) => {
        console.error('Error al actualizar producto:', error);
        return throwError(() => error);
      })
    );
  }

  reduceStock(productId: number, quantity: number) {
    return this.http.put(`${this.apiUrl}/${productId}/reduce-stock?quantity=${quantity}`, null);
  }

  deleteProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error al eliminar producto:', error);
        return throwError(() => error);
      })
    );
  }
}
