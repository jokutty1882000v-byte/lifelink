import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { adminGuard } from '@core/guards/admin.guard';

/**
 * Top-level routes. Each feature is lazy-loaded to keep the initial bundle small.
 * Concrete routes are filled in as features are built in later phases.
 */
export const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'splash' },

  {
    path: 'splash',
    loadComponent: () =>
      import('@features/splash/splash.page').then((m) => m.SplashPage),
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  {
    path: '',
    loadComponent: () =>
      import('@shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',      loadComponent: () => import('@features/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'search',         loadComponent: () => import('@features/search/search.page').then((m) => m.SearchPage) },
      { path: 'donors/:id',     loadComponent: () => import('@features/donor-detail/donor-detail.page').then((m) => m.DonorDetailPage) },
      { path: 'request',        loadComponent: () => import('@features/request/request.page').then((m) => m.RequestPage) },
      { path: 'hospitals',      loadComponent: () => import('@features/hospitals/hospitals.page').then((m) => m.HospitalsPage) },
      { path: 'blood-banks',    loadComponent: () => import('@features/blood-banks/blood-banks.page').then((m) => m.BloodBanksPage) },
      { path: 'ai-chat',        loadComponent: () => import('@features/ai-chat/ai-chat.page').then((m) => m.AiChatPage) },
      { path: 'notifications',  loadComponent: () => import('@features/notifications/notifications.page').then((m) => m.NotificationsPage) },
      { path: 'history',        loadComponent: () => import('@features/history/history.page').then((m) => m.HistoryPage) },
      { path: 'profile',        loadComponent: () => import('@features/profile/profile.page').then((m) => m.ProfilePage) },
      { path: 'settings',       loadComponent: () => import('@features/settings/settings.page').then((m) => m.SettingsPage) },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
