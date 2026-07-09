import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { OrdenService } from '../../../core/services/orden.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { AuthService } from '../../../core/services/auth.service';
import { TipoEquipo, EstadoOrden } from '../../../core/models/catalogos.model';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-orden-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orden-crear.html',
  styleUrl: './orden-crear.css',
})
export class OrdenCrear implements OnInit {
  private fb = inject(FormBuilder);
  private ordenService = inject(OrdenService);
  private catalogoService = inject(CatalogoService);
  private usuarioService = inject(UsuarioService);
  private clienteService = inject(ClienteService);
  private authService = inject(AuthService);
  private router = inject(Router);

  tiposEquipo = signal<TipoEquipo[]>([]);
  tecnicos = signal<Usuario[]>([]);
  estadoInicial = signal<EstadoOrden | null>(null);
  codigoTentativo = signal('');
  guardando = signal(false);
  errorMensaje = signal('');
  fechaActual = new Date();

  clienteExistente = signal(false);
  buscandoCliente = signal(false);

  form = this.fb.group({
    dni: ['', [Validators.required, Validators.minLength(8)]],
    nombreCliente: ['', Validators.required],
    apellidoPaternoCliente: ['', Validators.required],
    apellidoMaternoCliente: [''],
    telefonoCliente: [''],
    correoCliente: [''],
    direccionCliente: [''],

    tipoEquipoId: [null as number | null, Validators.required],
    marca: [''],
    modelo: [''],
    numeroSerieImei: [''],
    accesoriosEntregados: [''],
    fallaReportada: ['', Validators.required],
    estadoFisicoIngreso: ['', Validators.required],
    detalleEstadoFisico: [''],

    tecnicoAsignadoId: [null as number | null, Validators.required],
    observaciones: [''],
  });

  ngOnInit(): void {
    this.catalogoService.listarTiposEquipo().subscribe(tipos => this.tiposEquipo.set(tipos));
    this.usuarioService.listar().subscribe(usuarios =>
      this.tecnicos.set(usuarios.filter(u => u.estado))
    );
    this.catalogoService.listarEstadosOrden().subscribe(estados => {
      const ordenados = [...estados].sort((a, b) => a.ordenVisual - b.ordenVisual);
      this.estadoInicial.set(ordenados[0] ?? null);
    });
    this.ordenService.obtenerSiguienteCodigo().subscribe(r => this.codigoTentativo.set(r.codigo));

    // Búsqueda automática por DNI mientras se escribe
    this.form.get('dni')!.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter((dni): dni is string => !!dni && dni.length >= 8),
      switchMap(dni => {
        this.buscandoCliente.set(true);
        return this.clienteService.buscarPersonaPorDni(dni);
      })
    ).subscribe({
      next: (persona) => {
        this.buscandoCliente.set(false);
        this.clienteExistente.set(true);
        this.form.patchValue({
          nombreCliente: persona.nombre,
          apellidoPaternoCliente: persona.apellidoPaterno,
          apellidoMaternoCliente: persona.apellidoMaterno ?? '',
          telefonoCliente: persona.telefono ?? '',
          correoCliente: persona.correo ?? '',
          direccionCliente: persona.direccion ?? '',
        });
      },
      error: () => {
        this.buscandoCliente.set(false);
        this.clienteExistente.set(false);
      },
    });
  }

  seleccionarEstadoFisico(valor: string): void {
    this.form.patchValue({ estadoFisicoIngreso: valor });
  }

  get formTieneAlgoLlenado(): boolean {
    const v = this.form.value;
    return !!(v.dni || v.nombreCliente || v.apellidoPaternoCliente || v.tipoEquipoId || v.fallaReportada);
  }

  get nombreTipoEquipoSeleccionado(): string {
    const id = this.form.value.tipoEquipoId;
    return this.tiposEquipo().find(t => t.id === id)?.nombre ?? '';
  }

  get nombreTecnicoSeleccionado(): string {
    const id = this.form.value.tecnicoAsignadoId;
    const tec = this.tecnicos().find(t => t.id === id);
    return tec ? `${tec.persona.nombre} ${tec.persona.apellidoPaterno}` : '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.errorMensaje.set('No se pudo identificar al usuario actual. Vuelve a iniciar sesión.');
      return;
    }

    this.guardando.set(true);
    this.errorMensaje.set('');

    const estadoFisicoCompleto = this.form.value.detalleEstadoFisico
      ? `${this.form.value.estadoFisicoIngreso}: ${this.form.value.detalleEstadoFisico}`
      : this.form.value.estadoFisicoIngreso;

    const datos = {
      ...this.form.value,
      estadoFisicoIngreso: estadoFisicoCompleto,
      creadoPorUsuarioId: usuarioId,
    };
    delete (datos as any).detalleEstadoFisico;

    this.ordenService.crear(datos as any).subscribe({
      next: (orden) => {
        this.guardando.set(false);
        this.router.navigate(['/ordenes', orden.id]);
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMensaje.set(err.error?.error ?? 'Error al registrar la orden');
      },
    });
  }
}