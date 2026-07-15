import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenService } from '../../../core/services/orden.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { EnvioService } from '../../../core/services/envio.service';
import { RepuestoService } from '../../../core/services/repuesto.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrdenTrabajo, HistorialEstadoOrden } from '../../../core/models/orden.model';
import { EstadoOrden } from '../../../core/models/catalogos.model';
import { EnvioExterno, PedidoRepuesto } from '../../../core/models/envio-repuesto.model';

@Component({
  selector: 'app-orden-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './orden-detalle.html',
  styleUrl: './orden-detalle.css',
})
export class OrdenDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private ordenService = inject(OrdenService);
  private catalogoService = inject(CatalogoService);
  private envioService = inject(EnvioService);
  private repuestoService = inject(RepuestoService);
  private authService = inject(AuthService);

  ordenId = 0;
  orden = signal<OrdenTrabajo | null>(null);
  historial = signal<HistorialEstadoOrden[]>([]);
  todosLosEstados = signal<EstadoOrden[]>([]);
  estadosValidos = signal<EstadoOrden[]>([]);
  envios = signal<EnvioExterno[]>([]);
  repuestos = signal<PedidoRepuesto[]>([]);
  cargando = signal(true);
  cambiandoEstado = signal(false);
  errorEstado = signal('');

  // --- Estado del modal de costo final ---
  mostrarModalCosto = signal(false);
  estadoDestinoPendiente = signal<EstadoOrden | null>(null);
  costoManoObraInput = signal<number | null>(null);
  errorModal = signal('');

  ngOnInit(): void {
    this.ordenId = Number(this.route.snapshot.paramMap.get('id'));
    this.catalogoService.listarEstadosOrden().subscribe(e => this.todosLosEstados.set(e));
    this.cargarTodo();
  }

  get procesoDetenido(): boolean {
    return this.orden()?.estadoActual.esEstadoFinal ?? false;
  }

  get repuestosPendientesLlegada(): boolean {
    return this.repuestos().some(rep => !rep.fechaLlegada);
  }

  get repuestosPendientesInstalar(): boolean {
    return this.repuestos().some(rep => !rep.instalado);
  }

  // --- Cálculos para el desglose del modal ---
  totalRepuestos = computed(() =>
    this.repuestos().reduce((acc, r) => acc + (r.precio ?? 0), 0)
  );

  totalEnvios = computed(() =>
    this.envios().reduce((acc, e) => acc + (e.costoReal ?? e.costoEstimado ?? 0), 0)
  );

  totalEstimadoModal = computed(() =>
    this.totalRepuestos() + this.totalEnvios() + (this.costoManoObraInput() ?? 0)
  );

  cargarTodo(): void {
    this.cargando.set(true);
    this.ordenService.obtener(this.ordenId).subscribe({
      next: (orden) => {
        this.orden.set(orden);
        this.cargando.set(false);
        this.cargarEstadosValidos();
      },
      error: () => this.cargando.set(false),
    });
    this.ordenService.obtenerHistorial(this.ordenId).subscribe(h => this.historial.set(h));
    this.envioService.listarPorOrden(this.ordenId).subscribe(e => this.envios.set(e));
    this.repuestoService.listarPorOrden(this.ordenId).subscribe(r => this.repuestos.set(r));
  }

  cargarEstadosValidos(): void {
    this.ordenService.obtenerSiguientesEstados(this.ordenId).subscribe(nombres => {
      const validos = this.todosLosEstados().filter(e => nombres.includes(e.nombre));
      this.estadosValidos.set(validos);
    });
  }

  nombreCliente(): string {
    const p = this.orden()?.equipo.cliente.persona;
    return p ? `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno ?? ''}`.trim() : '';
  }

  avanzarA(estadoId: number): void {
    if (this.cambiandoEstado()) return;

    const estadoDestino = this.estadosValidos().find(e => e.id === estadoId);
    if (!estadoDestino) return;

    if (estadoDestino.nombre === 'Reparación finalizada') {
      // Abrimos el modal en vez del prompt()
      this.estadoDestinoPendiente.set(estadoDestino);
      this.costoManoObraInput.set(this.orden()?.costoTotal ? null : null);
      this.errorModal.set('');
      this.mostrarModalCosto.set(true);
    } else {
      this.cambiandoEstado.set(true);
      this.errorEstado.set('');
      const usuarioId = this.authService.getUsuarioId();
      if (!usuarioId) return;
      this.ejecutarCambioEstado(estadoId, usuarioId);
    }
  }

  cerrarModalCosto(): void {
    this.mostrarModalCosto.set(false);
    this.estadoDestinoPendiente.set(null);
    this.costoManoObraInput.set(null);
    this.errorModal.set('');
  }

  confirmarCostoYAvanzar(): void {
    const estadoDestino = this.estadoDestinoPendiente();
    const usuarioId = this.authService.getUsuarioId();
    const costo = this.costoManoObraInput();

    if (!estadoDestino || !usuarioId) return;

    if (costo === null || isNaN(costo) || costo < 0) {
      this.errorModal.set('Ingresa un monto válido para la mano de obra.');
      return;
    }

    this.cambiandoEstado.set(true);
    this.errorModal.set('');

    this.ordenService.actualizarCostoFinal(this.ordenId, costo).subscribe({
      next: () => {
        this.mostrarModalCosto.set(false);
        this.ejecutarCambioEstado(estadoDestino.id, usuarioId);
      },
      error: (err) => {
        this.cambiandoEstado.set(false);
        this.errorModal.set(err.error?.error ?? 'Error al actualizar el costo final');
      }
    });
  }

  private ejecutarCambioEstado(estadoId: number, usuarioId: number): void {
    this.ordenService.cambiarEstado(this.ordenId, estadoId, usuarioId).subscribe({
      next: () => {
        this.cambiandoEstado.set(false);
        this.cargarTodo();
      },
      error: (err) => {
        this.cambiandoEstado.set(false);
        this.errorEstado.set(err.error?.error ?? 'Error al cambiar el estado');
      },
    });
  }
}