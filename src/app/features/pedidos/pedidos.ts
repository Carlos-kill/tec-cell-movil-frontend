import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
    if (!this.textoBusqueda) return this.pedidos();
    const texto = this.textoBusqueda.toLowerCase();
    return this.pedidos().filter(p =>
      p.nombreRepuesto.toLowerCase().includes(texto) ||
      p.proveedor?.nombre.toLowerCase().includes(texto) ||
      p.orden?.codigoUnico.toLowerCase().includes(texto)
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

  cerrarPanel(): void {
    this.mostrarPanel.set(false);
  }

  get sugerenciasFiltradas(): OrdenTrabajo[] {
    const texto = this.codigoOrden.trim().toLowerCase();
    if (!texto) return this.ordenesRecientes();
    return this.ordenesRecientes().filter(o => o.codigoUnico.toLowerCase().includes(texto));
  }

  // Se llama al pasar el mouse o seleccionar una fila: actualiza la vista previa en vivo
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

  marcarInstalado(pedido: PedidoRepuesto, event: Event): void {
    event.preventDefault();
    if (!confirm('¿Confirmas que este repuesto ya fue instalado? Una vez marcado, no se podrá deshacer.')) {
      return;
    }
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) return;
    this.repuestoService.marcarInstalado(pedido.id, true, usuarioId).subscribe({
      next: () => {
        this.cargarPedidos();
        if (pedido.orden) {
          this.avanzarOrdenTrasRepuesto(pedido.orden.id);
        }
      },
      error: (err) => {
        console.error('Error al instalar:', err);
        alert(err.error?.error || 'Error de conexión al marcar como instalado.');
      }
    });
  }

  marcarLlegada(pedido: PedidoRepuesto): void {
    if (!confirm('¿Confirmas que este repuesto ya llegó al local?')) return;
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) return;
    
    this.repuestoService.confirmarLlegada(pedido.id, usuarioId).subscribe({
      next: () => {
        this.cargarPedidos();
      },
      error: (err) => {
        console.error('Error al confirmar llegada:', err);
        alert(err.error?.error || 'Error de conexión');
      }
    });
  }

  private avanzarOrdenTrasRepuesto(ordenId: number): void {
    const usuarioId = this.authService.getUsuarioId();
    const estadoReparacion = this.estados().find(e => e.nombre === 'En reparación');
    if (!usuarioId || !estadoReparacion) return;

    this.ordenService.cambiarEstado(ordenId, estadoReparacion.id, usuarioId, 'Repuesto recibido, continúa reparación')
      .subscribe({
        next: () => {},
        error: () => {}, // transición no válida en este momento — se ignora silenciosamente
      });
  }
}