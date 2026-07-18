import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { EmpleadoService } from '../../core/services/empleado.service';
import { Usuario } from '../../core/models/usuario.model';
import { Empleado } from '../../core/models/empleado.model';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private empleadoService = inject(EmpleadoService);
  private router = inject(Router);
  private authService = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  mostrarFormulario = signal(false);
  guardando = signal(false);
  errorMensaje = signal('');
  mostrarModalPassword = signal(false);
  usuarioSeleccionado = signal<Usuario | null>(null);

  // Estado de la búsqueda de empleado por DNI
  buscandoEmpleado = signal(false);
  empleadoEncontrado = signal<Empleado | null>(null);
  errorBusquedaDni = signal('');

  formBusqueda = this.fb.group({
    dni: ['', [Validators.required, Validators.minLength(8)]],
  });

  form = this.fb.group({
    usuario: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rol: ['TECNICO', Validators.required],
  });

  formPassword = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuarioService.listar().subscribe({
      next: (datos) => {
        this.usuarios.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirFormulario(): void {
    this.formBusqueda.reset();
    this.form.reset({ rol: 'TECNICO' });
    this.empleadoEncontrado.set(null);
    this.errorBusquedaDni.set('');
    this.errorMensaje.set('');
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  buscarEmpleado(): void {
    if (this.formBusqueda.invalid) return;
    const dni = this.formBusqueda.value.dni!;

    this.buscandoEmpleado.set(true);
    this.errorBusquedaDni.set('');
    this.empleadoEncontrado.set(null);

    this.empleadoService.buscarPorDni(dni).subscribe({
      next: (empleado) => {
        this.buscandoEmpleado.set(false);
        this.empleadoEncontrado.set(empleado);
      },
      error: (err) => {
        this.buscandoEmpleado.set(false);
        this.errorBusquedaDni.set(err.error?.error ?? 'Empleado no encontrado. Debe registrarlo primero en el módulo de Empleados.');
      },
    });
  }

  cambiarDni(): void {
    this.empleadoEncontrado.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.empleadoEncontrado()) return;

    this.guardando.set(true);
    this.errorMensaje.set('');

    const datos = {
      dni: this.empleadoEncontrado()!.persona.dni,
      usuario: this.form.value.usuario,
      password: this.form.value.password,
      rol: this.form.value.rol,
    };

    this.usuarioService.crear(datos as any).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarFormulario.set(false);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMensaje.set(err.error?.error ?? 'Error al crear el usuario');
      },
    });
  }

  nombreCompleto2(empleado: Empleado): string {
    const p = empleado.persona;
    return `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno ?? ''}`.trim();
  }

  toggleEstado(usuario: Usuario): void {
    this.usuarioService.cambiarEstado(usuario.id, !usuario.estado).subscribe(() => {
      this.cargarUsuarios();
    });
  }

  nombreCompleto(usuario: Usuario): string {
    const p = usuario.empleado.persona;
    return `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno ?? ''}`.trim();
  }

  abrirCambiarPassword(usuario: Usuario): void {
    this.usuarioSeleccionado.set(usuario);
    this.formPassword.reset();
    this.mostrarModalPassword.set(true);
  }

  guardarPassword(): void {
    if (this.formPassword.invalid || !this.usuarioSeleccionado()) return;

    this.guardando.set(true);
    const nuevaPass = this.formPassword.value.password!;
    const idModificado = this.usuarioSeleccionado()!.id;

    this.usuarioService.cambiarPassword(idModificado, nuevaPass).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarModalPassword.set(false);

        const miPropioId = this.authService.getUsuarioId();

        if (miPropioId === idModificado) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          alert('Contraseña actualizada con éxito');
        }
      },
      error: (err) => {
        this.guardando.set(false);
        alert(err.error?.error ?? 'Error al actualizar contraseña');
      }
    });
  }
}