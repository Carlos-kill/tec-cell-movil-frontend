import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RepuestoService } from '../../core/services/repuesto.service';
import { OrdenService } from '../../core/services/orden.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { AuthService } from '../../core/services/auth.service';
import { PedidoRepuesto } from '../../core/models/envio-repuesto.model';
import { OrdenTrabajo } from '../../core/models/orden.model';
import { Proveedor } from '../../core/models/catalogos.model';
import { EstadoOrden } from '../../core/models/catalogos.model';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css',
})
export class Pedidos implements OnInit {
  private fb = inject(FormBuilder);
  private repuestoService = inject(RepuestoService);
  private ordenService = inject(OrdenService);
  private catalogoService = inject(CatalogoService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  pedidos = signal<PedidoRepuesto[]>([]);
  proveedores = signal<Proveedor[]>([]);
  estados = signal<EstadoOrden[]>([]);
  cargando = signal(true);
  textoBusqueda = '';

  mostrarPanel = signal(false);
  codigoOrden = '';
  ordenesRecientes = signal<OrdenTrabajo[]>([]);
  buscandoOrden = signal(false);
  ordenEncontrada = signal<OrdenTrabajo | null>(null);
  errorBusquedaOrden = signal('');
  guardando = signal(false);
  errorMensaje = signal('');
  mostrarModalLlegada = signal(false);
  pedidoParaLlegada = signal<PedidoRepuesto | null>(null);
  guardandoLlegada = signal(false);
  errorLlegada = signal('');
  mostrarModalInstalado = signal(false);
  pedidoParaInstalado = signal<PedidoRepuesto | null>(null);
  guardandoInstalado = signal(false);
  errorInstalado = signal('');

  form = this.fb.group({
    proveedorId: [null as number | null, Validators.required],
    nombreRepuesto: ['', Validators.required],
    descripcion: [''],
    precio: [null as number | null],
  });

  ngOnInit(): void {
    this.catalogoService.listarProveedores().subscribe(p => this.proveedores.set(p));
    this.catalogoService.listarEstadosOrden().subscribe(e => this.estados.set(e));
    this.cargarPedidos();

    this.route.queryParamMap.subscribe(params => {
      const ordenId = params.get('ordenId');
      if (ordenId) {
        this.abrirPanelConOrden(Number(ordenId));
      }
    });
  }

  cargarPedidos(): void {
    this.cargando.set(true);
    this.repuestoService.listarTodos().subscribe({
      next: (datos) => {
        this.pedidos.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  get pedidosFiltrados(): PedidoRepuesto[] {
    let lista = this.pedidos();

    if (this.textoBusqueda) {
      const texto = this.textoBusqueda.toLowerCase();
      lista = lista.filter(p =>
        p.nombreRepuesto.toLowerCase().includes(texto) ||
        p.proveedor?.nombre.toLowerCase().includes(texto) ||
        p.orden?.codigoUnico.toLowerCase().includes(texto)
      );
    }

    return [...lista].sort((a, b) =>
      new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
    );
  }

  abrirPanel(): void {
    this.mostrarPanel.set(true);
    this.codigoOrden = '';
    this.ordenEncontrada.set(null);
    this.errorBusquedaOrden.set('');
    this.errorMensaje.set('');
    this.form.reset();

    this.ordenService.listar({ size: 10 }).subscribe(respuesta => {
      this.ordenesRecientes.set(respuesta.content.filter(o => !o.estadoActual.esEstadoFinal));
    });
  }

  abrirPanelConOrden(ordenId: number): void {
    this.mostrarPanel.set(true);
    this.codigoOrden = '';
    this.ordenEncontrada.set(null);
    this.errorBusquedaOrden.set('');
    this.errorMensaje.set('');
    this.form.reset();
    this.buscandoOrden.set(true);

    this.ordenService.obtener(ordenId).subscribe({
      next: (orden) => {
        this.ordenEncontrada.set(orden);
        this.codigoOrden = orden.codigoUnico;
        this.buscandoOrden.set(false);
        this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
      },
      error: () => {
        this.errorBusquedaOrden.set('No se pudo cargar la orden seleccionada.');
        this.buscandoOrden.set(false);
      },
    });

    this.ordenService.listar({ size: 10 }).subscribe(respuesta => {
      this.ordenesRecientes.set(respuesta.content.filter(o => !o.estadoActual.esEstadoFinal));
    });
  }

  cerrarPanel(): void {
    this.mostrarPanel.set(false);
  }

  get sugerenciasFiltradas(): OrdenTrabajo[] {
    const texto = this.codigoOrden.trim().toLowerCase();
    if (!texto) return this.ordenesRecientes();
    return this.ordenesRecientes().filter(o => o.codigoUnico.toLowerCase().includes(texto));
  }

  previsualizar(orden: OrdenTrabajo): void {
    this.ordenEncontrada.set(orden);
  }

  buscarOrden(): void {
    if (!this.codigoOrden.trim()) return;
    this.buscandoOrden.set(true);
    this.errorBusquedaOrden.set('');
    this.ordenService.obtenerPorCodigo(this.codigoOrden.trim()).subscribe({
      next: (orden) => {
        this.ordenEncontrada.set(orden);
        this.buscandoOrden.set(false);
      },
      error: () => {
        this.errorBusquedaOrden.set('No se encontró una orden con ese código.');
        this.buscandoOrden.set(false);
      },
    });
  }

  nombreCliente(orden: OrdenTrabajo): string {
    const p = orden.equipo.cliente.persona;
    return `${p.nombre} ${p.apellidoPaterno}`;
  }

  registrarPedido(): void {
    if (this.form.invalid || !this.ordenEncontrada()) return;

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) return;

    this.guardando.set(true);
    this.errorMensaje.set('');

    const datos = { ...this.form.value, usuarioId };

    this.repuestoService.registrar(this.ordenEncontrada()!.id, datos as any).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarPanel.set(false);
        this.cargarPedidos();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMensaje.set(err.error?.error ?? 'Error al registrar el pedido');
      },
    });
  }

  abrirModalLlegada(pedido: PedidoRepuesto): void {
    this.pedidoParaLlegada.set(pedido);
    this.errorLlegada.set('');
    this.mostrarModalLlegada.set(true);
  }

  cerrarModalLlegada(): void {
    this.mostrarModalLlegada.set(false);
    this.pedidoParaLlegada.set(null);
  }

  confirmarLlegadaModal(): void {
    const pedido = this.pedidoParaLlegada();
    const usuarioId = this.authService.getUsuarioId();
    if (!pedido || !usuarioId) return;

    this.guardandoLlegada.set(true);
    this.errorLlegada.set('');

    this.repuestoService.confirmarLlegada(pedido.id, usuarioId).subscribe({
      next: () => {
        this.guardandoLlegada.set(false);
        this.mostrarModalLlegada.set(false);
        this.cargarPedidos();
      },
      error: (err) => {
        this.guardandoLlegada.set(false);
        this.errorLlegada.set(err.error?.error ?? 'Error al confirmar la llegada');
      },
    });
  }

  abrirModalInstalado(pedido: PedidoRepuesto): void {
    this.pedidoParaInstalado.set(pedido);
    this.errorInstalado.set('');
    this.mostrarModalInstalado.set(true);
  }

  cerrarModalInstalado(): void {
    this.mostrarModalInstalado.set(false);
    this.pedidoParaInstalado.set(null);
  }

  confirmarInstaladoModal(): void {
    const pedido = this.pedidoParaInstalado();
    const usuarioId = this.authService.getUsuarioId();
    if (!pedido || !usuarioId) return;

    this.guardandoInstalado.set(true);
    this.errorInstalado.set('');

    this.repuestoService.marcarInstalado(pedido.id, true, usuarioId).subscribe({
      next: () => {
        this.guardandoInstalado.set(false);
        this.mostrarModalInstalado.set(false);
        this.cargarPedidos();
        if (pedido.orden) {
          this.avanzarOrdenTrasRepuesto(pedido.orden.id);
        }
      },
      error: (err) => {
        this.guardandoInstalado.set(false);
        this.errorInstalado.set(err.error?.error ?? 'Error al marcar como instalado');
      },
    });
  }

  private avanzarOrdenTrasRepuesto(ordenId: number): void {
    const usuarioId = this.authService.getUsuarioId();
    const estadoReparacion = this.estados().find(e => e.nombre === 'En reparación');
    if (!usuarioId || !estadoReparacion) return;

    this.ordenService.cambiarEstado(ordenId, estadoReparacion.id, usuarioId, 'Repuesto recibido, continúa reparación')
      .subscribe({
        next: () => {},
        error: () => {},
      });
  }
}