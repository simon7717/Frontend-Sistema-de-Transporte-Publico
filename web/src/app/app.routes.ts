import { Routes } from '@angular/router';
import { auditUserGuard } from './core/audit-user.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login').then((m) => m.LoginComponent)
  },
  {
    path: 'app',
    canActivate: [auditUserGuard],
    loadComponent: () =>
      import('./features/shell/main-layout').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuarios-list').then((m) => m.UsuariosListComponent)
      },
      {
        path: 'tarjetas',
        loadComponent: () =>
          import('./features/tarjetas/tarjetas-list').then((m) => m.TarjetasListComponent)
      },
      {
        path: 'estaciones',
        loadComponent: () =>
          import('./features/estaciones/estaciones-list').then((m) => m.EstacionesListComponent)
      },
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./features/vehiculos/vehiculos-list').then((m) => m.VehiculosListComponent)
      },
      {
        path: 'rutas',
        loadComponent: () =>
          import('./features/rutas/rutas-list').then((m) => m.RutasListComponent)
      },
      {
        path: 'viajes',
        loadComponent: () =>
          import('./features/viajes/viajes.component').then((m) => m.ViajesComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

