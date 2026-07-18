import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { Notificacion } from '../../../core/models/notificacion.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  authService = inject(AuthService);
  private notificacionService = inject(NotificacionService);
  private router = inject(Router);

  menuAbierto = signal(false);

  panelNotificacionesAbierto = signal(false);
  notificaciones = signal<Notificacion[]>([]);
  noVistasCount = signal(0);
  cargandoNotificaciones = signal(false);

  ngOnInit(): void {
    this.actualizarConteoNoVistas();
    setInterval(() => this.actualizarConteoNoVistas(), 30000);
  }

  private actualizarConteoNoVistas(): void {
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) return;
    this.notificacionService.contarNoVistas(usuarioId).subscribe(r => this.noVistasCount.set(r.count));
  }

  toggleNotificaciones(): void {
    this.panelNotificacionesAbierto.update(v => !v);
    if (this.panelNotificacionesAbierto()) {
      this.cargarNotificaciones();
    }
  }

  cerrarNotificaciones(): void {
    this.panelNotificacionesAbierto.set(false);
  }

  private cargarNotificaciones(): void {
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) return;
    this.cargandoNotificaciones.set(true);
    this.notificacionService.listar(usuarioId).subscribe({
      next: (datos) => {
        this.notificaciones.set(datos);
        this.cargandoNotificaciones.set(false);
        if (this.noVistasCount() > 0) {
          this.notificacionService.marcarVistas(usuarioId).subscribe(() => this.noVistasCount.set(0));
        }
      },
      error: () => this.cargandoNotificaciones.set(false),
    });
  }

  irAOrden(notif: Notificacion): void {
    this.cerrarNotificaciones();
    if (notif.orden) {
      this.router.navigate(['/ordenes', notif.orden.id]);
    }
  }

  toggleMenu(): void {
    this.menuAbierto.update(v => !v);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  obtenerIniciales(): string {
    const usuario = this.authService.usuarioActual();
    if (!usuario || !usuario.nombreCompleto) return 'TC';
    return usuario.nombreCompleto
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}