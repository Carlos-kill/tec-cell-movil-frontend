import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenService } from '../../core/services/orden.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { OrdenTrabajo } from '../../core/models/orden.model';

@Component({
  selector: 'app-historial-trabajos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './historial-trabajos.html',
  styleUrl: './historial-trabajos.css',
})
export class HistorialTrabajos implements OnInit {
  private ordenService = inject(OrdenService);
  private catalogoService = inject(CatalogoService);

  ordenes = signal<OrdenTrabajo[]>([]);
  cargando = signal(true);
  textoBusqueda = '';
  estadoEntregadoId: number | null = null;

  ngOnInit(): void {
    // Buscamos el id del estado "Entregado" y con eso filtramos el listado
    this.catalogoService.listarEstadosOrden().subscribe(estados => {
      const entregado = estados.find(e => e.nombre.toLowerCase() === 'entregado');
      this.estadoEntregadoId = entregado?.id ?? null;
      this.cargarHistorial();
    });
  }

  cargarHistorial(): void {
    this.cargando.set(true);
    this.ordenService.listar({ estadoId: this.estadoEntregadoId ?? undefined, size: 100 }).subscribe({
      next: (respuesta) => {
        this.ordenes.set(respuesta.content);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  get ordenesFiltradas(): OrdenTrabajo[] {
    if (!this.textoBusqueda) return this.ordenes();
    const texto = this.textoBusqueda.toLowerCase();
    return this.ordenes().filter(o =>
      o.codigoUnico.toLowerCase().includes(texto) ||
      this.nombreCliente(o).toLowerCase().includes(texto) ||
      this.nombreTecnico(o).toLowerCase().includes(texto)
    );
  }

  nombreCliente(orden: OrdenTrabajo): string {
    const p = orden.equipo.cliente.persona;
    return `${p.nombre} ${p.apellidoPaterno}`;
  }

  nombreTecnico(orden: OrdenTrabajo): string {
    return orden.tecnicoAsignado.empleado.persona.nombre + ' ' + orden.tecnicoAsignado.empleado.persona.apellidoPaterno;
  }
}