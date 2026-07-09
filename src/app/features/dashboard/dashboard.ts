import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService } from '../../core/services/reporte.service';
import { DashboardResponse } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private reporteService = inject(ReporteService);

  datos = signal<DashboardResponse | null>(null);
  cargando = signal(true);

  ngOnInit(): void {
    this.reporteService.obtenerDashboard().subscribe({
      next: (respuesta) => {
        this.datos.set(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  // Convierte el objeto ordenesPorEstado en una lista, para poder recorrerlo con @for
  get estadosComoLista() {
    const datos = this.datos();
    if (!datos) return [];
    return Object.entries(datos.ordenesPorEstado).map(([estado, cantidad]) => ({ estado, cantidad }));
  }
}