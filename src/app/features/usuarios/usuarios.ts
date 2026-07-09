import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';

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

  usuarios = signal<Usuario[]>([]);
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
    usuario: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rol: ['TECNICO', Validators.required],
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
    this.form.reset({ rol: 'TECNICO' });
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

    this.usuarioService.crear(this.form.value as any).subscribe({
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

  toggleEstado(usuario: Usuario): void {
    this.usuarioService.cambiarEstado(usuario.id, !usuario.estado).subscribe(() => {
      this.cargarUsuarios();
    });
  }

  nombreCompleto(usuario: Usuario): string {
    const p = usuario.persona;
    return `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno ?? ''}`.trim();
  }
}