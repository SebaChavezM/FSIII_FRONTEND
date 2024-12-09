import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { TiendaComponent } from './components/tienda/tienda.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { AccountComponent } from './components/account/account.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'tienda', component: TiendaComponent },
  { path: 'producto/:id', component: ProductDetailComponent },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
