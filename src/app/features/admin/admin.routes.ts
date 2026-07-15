import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@shared/layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', loadComponent: () => import('./overview/overview.page').then((m) => m.AdminOverviewPage) },
      { path: 'users',    loadComponent: () => import('./users/users.page').then((m) => m.AdminUsersPage) },
      { path: 'requests', loadComponent: () => import('./requests/requests.page').then((m) => m.AdminRequestsPage) },
    ],
  },
];
