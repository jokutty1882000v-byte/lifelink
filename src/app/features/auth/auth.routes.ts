import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@shared/layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login',    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage) },
      { path: 'register', loadComponent: () => import('./register/register.page').then((m) => m.RegisterPage) },
    ],
  },
];
