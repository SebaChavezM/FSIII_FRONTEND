import { TestBed } from '@angular/core/testing';
import { EventService } from './behavior-subject.service';

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventService);
  });

  it('should trigger reloadProducts$', (done) => {
    // Solo suscríbete al siguiente valor emitido después de la llamada
    let isFirstEmission = true; // Ignora la emisión inicial
    service.reloadProducts$.subscribe({
      next: (value) => {
        if (isFirstEmission) {
          isFirstEmission = false; // Marca la primera emisión como ignorada
          return;
        }
        expect(value).toBeTrue(); // Verifica que el valor emitido sea true
        done(); // Finaliza la prueba después de la emisión esperada
      },
    });

    service.triggerReloadProducts(); // Llama al método que emite el valor
  });
});
