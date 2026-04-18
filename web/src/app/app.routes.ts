import { Routes } from '@angular/router';
import { auditUserGuard } from './core/audit-user.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'app',
    canActivate: [auditUserGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuarios.component').then(
            (m) => m.UsuariosComponent
          )
      },
      {
        path: 'tarjetas',
        loadComponent: () =>
          import('./features/tarjetas/tarjetas.component').then(
            (m) => m.TarjetasComponent
          )
      },
      {
        path: 'estaciones',
        loadComponent: () =>
          import('./features/estaciones/estaciones.component').then(
            (m) => m.EstacionesComponent
          )
      },
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./features/vehiculos/vehiculos.component').then(
            (m) => m.VehiculosComponent
          )
      },
      {
        path: 'rutas',
        loadComponent: () =>
          import('./features/rutas/rutas.component').then((m) => m.RutasComponent)
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
