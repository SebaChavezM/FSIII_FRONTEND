import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root', // Esto asegura que el servicio esté disponible a nivel global
})
export class EventService {
  private reloadProductsSource = new BehaviorSubject<boolean>(false);
  reloadProducts$ = this.reloadProductsSource.asObservable();

  triggerReloadProducts(): void {
    this.reloadProductsSource.next(true);
  }
}
