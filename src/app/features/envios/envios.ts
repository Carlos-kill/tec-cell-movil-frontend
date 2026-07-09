import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnvioService } from '../../core/services/envio.service';
import { OrdenService } from '../../core/services/orden.service';
import { AuthService } from '../../core/services/auth.service';
import { EnvioExterno } from '../../core/models/envio-repuesto.model';
import { OrdenTrabajo } from '../../core/models/orden.model';

@Component({
  selector: 'app-envios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './envios.html',
  styleUrl: './envios.css',
})
export class Envios implements OnInit {
  private fb = inject(FormBuilder);
  private envioService = inject(EnvioService);
  private ordenService = inject(OrdenService);
  private authService = inject(AuthService);

  envios = signal<EnvioExterno[]>([]);
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
    tecnicoExternoNombre: ['', Validators.required],
    tecnicoExternoContacto: [''],
    costoEstimado: [null as number | null],
    fechaRetornoEsperada: [''],
    observaciones: [''],
  });

  ngOnInit(): void {
    this.cargarEnvios();
  }

  cargarEnvios(): void {
    this.cargando.set(true);
    this.envioService.listarTodos().subscribe({
      next: (datos) => {
        this.envios.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  get enviosFiltrados(): EnvioExterno[] {
    if (!this.textoBusqueda) return this.envios();
    const texto = this.textoBusqueda.toLowerCase();
    return this.envios().filter(e =>
      e.tecnicoExternoNombre.toLowerCase().includes(texto) ||
      e.orden?.codigoUnico.toLowerCase().includes(texto)
    );
  }

  estadoEnvio(envio: EnvioExterno): string {
    if (envio.fechaRetornoReal) return 'Retornado';
    return 'En camino / En taller';
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

  registrarEnvio(): void {
    if (this.form.invalid || !this.ordenEncontrada()) return;

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) return;

    this.guardando.set(true);
    this.errorMensaje.set('');

    const datos = { ...this.form.value, usuarioId };

    this.envioService.registrar(this.ordenEncontrada()!.id, datos as any).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarPanel.set(false);
        this.cargarEnvios();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMensaje.set(err.error?.error ?? 'Error al registrar el envío');
      },
    });
  }

  confirmarLlegada(envio: EnvioExterno): void {
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) return;
    this.envioService.confirmarLlegada(envio.id, usuarioId).subscribe(() => {
      this.cargarEnvios();
    });
  }

  registrarRetorno(envio: EnvioExterno): void {
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) return;
    const costoReal = prompt('Costo real del envío (S/):');
    if (costoReal === null) return;
    this.envioService.registrarRetorno(envio.id, Number(costoReal), usuarioId).subscribe(() => {
      this.cargarEnvios();
    });
  }
}