import { Routes } from '@angular/router';

import { authGuard } from './auth/auth.guard';
import { AuthPage } from './auth/auth-page';
import { DashboardPage } from './dashboard/dashboard-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: AuthPage, data: { mode: 'login' } },
  { path: 'register', component: AuthPage, data: { mode: 'register' } },
  { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
