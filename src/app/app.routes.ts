import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.Login)
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'ordenes',
        loadComponent: () => import('./features/ordenes/ordenes-list/ordenes-list').then(m => m.OrdenesList)
      },
      {
        path: 'ordenes/nueva',
        loadComponent: () => import('./features/ordenes/orden-crear/orden-crear').then(m => m.OrdenCrear)
      },
      {
        path: 'ordenes/:id',
        loadComponent: () => import('./features/ordenes/orden-detalle/orden-detalle').then(m => m.OrdenDetalle)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/pedidos/pedidos').then(m => m.Pedidos)
      },
      {
        path: 'envios',
        loadComponent: () => import('./features/envios/envios').then(m => m.Envios)
      },
      {
        path: 'historial-trabajos',
        loadComponent: () => import('./features/historial-trabajos/historial-trabajos').then(m => m.HistorialTrabajos)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/clientes').then(m => m.Clientes)
      },
      {
        path: 'empleados',
        canActivate: [adminGuard], // Protegido solo para administradores
        loadComponent: () => import('./features/empleados/empleados').then(m => m.Empleados)
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/usuarios/usuarios').then(m => m.Usuarios)
      },
      {
        path: 'configuracion',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/configuracion/configuracion').then(m => m.Configuracion)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];