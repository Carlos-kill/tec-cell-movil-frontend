import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenService } from '../../../core/services/orden.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { OrdenTrabajo } from '../../../core/models/orden.model';
import { EstadoOrden } from '../../../core/models/catalogos.model';

@Component({
  selector: 'app-ordenes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ordenes-list.html',
  styleUrl: './ordenes-list.css',
})
export class OrdenesList implements OnInit {
  private ordenService = inject(OrdenService);
  private catalogoService = inject(CatalogoService);

  ordenes = signal<OrdenTrabajo[]>([]);
  estados = signal<EstadoOrden[]>([]);
  cargando = signal(true);
  totalPaginas = signal(0);
  paginaActual = signal(0);

  filtroEstadoId: number | null = null;

  ngOnInit(): void {
    this.catalogoService.listarEstadosOrden().subscribe(estados => this.estados.set(estados));
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.cargando.set(true);
    this.ordenService.listar({
      estadoId: this.filtroEstadoId ?? undefined,
      page: this.paginaActual(),
      size: 10,
    }).subscribe({
      next: (respuesta) => {
        this.ordenes.set(respuesta.content);
        this.totalPaginas.set(respuesta.totalPages);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onFiltroChange(): void {
    this.paginaActual.set(0);
    this.cargarOrdenes();
  }

  irAPagina(pagina: number): void {
    this.paginaActual.set(pagina);
    this.cargarOrdenes();
  }

  nombreCliente(orden: OrdenTrabajo): string {
    const p = orden.equipo.cliente.persona;
    return `${p.nombre} ${p.apellidoPaterno}`;
  }

  nombreTecnico(orden: OrdenTrabajo): string {
    return orden.tecnicoAsignado.empleado.persona.nombre;
  }
}