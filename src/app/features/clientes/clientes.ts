import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente.service';
import { Cliente } from '../../core/models/cliente.model';
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);

  clientes = signal<Cliente[]>([]);
  cargando = signal(true);
  mostrarFormulario = signal(false);
  guardando = signal(false);
  errorMensaje = signal('');
  textoBusqueda = '';

  form = this.fb.group({
    dni: ['', [Validators.required, Validators.minLength(8)]],
    nombre: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: [''],
    telefono: [''],
    correo: [''],
    direccion: [''],
  });

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.cargando.set(true);
    this.clienteService.buscar(this.textoBusqueda).subscribe({
      next: (datos) => {
        this.clientes.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onBuscar(): void {
    this.cargarClientes();
  }

  abrirFormulario(): void {
    this.form.reset();
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

    this.clienteService.crear(this.form.value as any).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarFormulario.set(false);
        this.cargarClientes();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMensaje.set(err.error?.error ?? 'Error al crear el cliente');
      },
    });
  }

  nombreCompleto(cliente: Cliente): string {
    const p = cliente.persona;
    return `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno ?? ''}`.trim();
  }
}