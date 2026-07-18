import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpleadoService } from '../../core/services/empleado.service';
import { Empleado, Cargo } from '../../core/models/empleado.model';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empleados.html',
  styleUrl: './empleados.css',
})
export class Empleados implements OnInit {
  private fb = inject(FormBuilder);
  private empleadoService = inject(EmpleadoService);

  empleados = signal<Empleado[]>([]);
  cargos = signal<Cargo[]>([]);
  cargando = signal(true);
  mostrarFormulario = signal(false);
  guardando = signal(false);
  errorMensaje = signal('');

  form = this.fb.group({
    dni: ['', [Validators.required, Validators.minLength(8)]],
    nombre: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: [''],
    telefono: [''],
    correo: [''],
    direccion: [''],
    cargoId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.cargarEmpleados();
    this.empleadoService.listarCargos().subscribe(c => this.cargos.set(c));
  }

  cargarEmpleados(): void {
    this.cargando.set(true);
    this.empleadoService.listar().subscribe({
      next: (datos) => {
        this.empleados.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirFormulario(): void {
    this.editandoId.set(null);
    this.form.reset();
    this.form.get('dni')?.enable();
    this.errorMensaje.set('');
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.guardando.set(true);
    this.errorMensaje.set('');

    const id = this.editandoId();
    const peticion = id
      ? this.empleadoService.actualizar(id, this.form.getRawValue())
      : this.empleadoService.crear(this.form.value as any);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarFormulario.set(false);
        this.cargarEmpleados();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMensaje.set(err.error?.error ?? 'Error al guardar el empleado');
      },
    });
  }

  toggleEstado(empleado: Empleado): void {
    this.empleadoService.cambiarEstado(empleado.id, !empleado.estado).subscribe(() => {
      this.cargarEmpleados();
    });
  }

  nombreCompleto(empleado: Empleado): string {
    const p = empleado.persona;
    return `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno ?? ''}`.trim();
  }

  editandoId = signal<number | null>(null);

  abrirEditar(empleado: Empleado): void {
    this.editandoId.set(empleado.id);
    this.form.patchValue({
      dni: empleado.persona.dni,
      nombre: empleado.persona.nombre,
      apellidoPaterno: empleado.persona.apellidoPaterno,
      apellidoMaterno: empleado.persona.apellidoMaterno ?? '',
      telefono: empleado.persona.telefono ?? '',
      correo: empleado.persona.correo ?? '',
      direccion: empleado.persona.direccion ?? '',
      cargoId: empleado.cargo.id,
    });
    this.form.get('dni')?.disable();
    this.errorMensaje.set('');
    this.mostrarFormulario.set(true);
  }
}