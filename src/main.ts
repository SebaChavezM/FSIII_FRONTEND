import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './app/services/auth.service';

async function initializeApplication(authService: AuthService) {
  const isAuthenticated = await authService.initializeSession();

  if (!isAuthenticated && window.location.pathname !== '/login') {
    window.location.href = '/login';
    return;
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-bottom-right',
        preventDuplicates: true,
      })
    ),
  ],
})
  .then((app) => {
    const injector = app.injector;
    const authService = injector.get(AuthService);

    return initializeApplication(authService);
  })
  .catch((err) => console.error('Error durante la inicialización:', err));
