import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:8083/api/search/products';

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8083/api/search/products/${id}`).pipe(
      catchError((error) => {
        console.error('Error al obtener producto por ID desde búsqueda:', error);
        return throwError(() => error);
      })
    );
  }  

  // Buscar productos por query
  searchProducts(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { query }
    });
  }
}
