import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '../../core/services/catalogo.service';
import { TipoEquipo, EstadoOrden, Proveedor } from '../../core/models/catalogos.model';

type Pestana = 'tipos' | 'estados' | 'proveedores';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion implements OnInit {
  private catalogoService = inject(CatalogoService);

  pestanaActiva = signal<Pestana>('tipos');

  tiposEquipo = signal<TipoEquipo[]>([]);
  estadosOrden = signal<EstadoOrden[]>([]);
  proveedores = signal<Proveedor[]>([]);

  nuevoNombre = '';
  nuevoOrdenVisual = 0;
  nuevoContacto = '';
  nuevoTelefono = '';

  // --- Edición: Tipos de Equipo ---
  editandoTipoId = signal<number | null>(null);
  editNombreTipo = '';

  // --- Edición: Estados de Orden ---
  editandoEstadoId = signal<number | null>(null);
  editNombreEstado = '';
  editOrdenVisualEstado = 0;

  // --- Edición: Proveedores ---
  editandoProveedorId = signal<number | null>(null);
  editNombreProveedor = '';
  editContactoProveedor = '';
  editTelefonoProveedor = '';

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.catalogoService.listarTiposEquipo().subscribe(t => this.tiposEquipo.set(t));
    this.catalogoService.listarEstadosOrden().subscribe(e => this.estadosOrden.set(e));
    this.catalogoService.listarProveedores().subscribe(p => this.proveedores.set(p));
  }

  cambiarPestana(p: Pestana): void {
    this.pestanaActiva.set(p);
    this.nuevoNombre = '';
    this.nuevoOrdenVisual = 0;
    this.nuevoContacto = '';
    this.nuevoTelefono = '';
    this.editandoTipoId.set(null);
    this.editandoEstadoId.set(null);
    this.editandoProveedorId.set(null);
  }

  // ===================== TIPOS DE EQUIPO =====================

  agregarTipoEquipo(): void {
    if (!this.nuevoNombre.trim()) return;
    this.catalogoService.crearTipoEquipo(this.nuevoNombre).subscribe(() => {
      this.nuevoNombre = '';
      this.catalogoService.listarTiposEquipo().subscribe(t => this.tiposEquipo.set(t));
    });
  }

  toggleTipoEquipo(tipo: TipoEquipo): void {
    this.catalogoService.actualizarTipoEquipo(tipo.id, { ...tipo, activo: !tipo.activo }).subscribe(() => {
      this.catalogoService.listarTiposEquipo().subscribe(t => this.tiposEquipo.set(t));
    });
  }

  iniciarEdicionTipo(tipo: TipoEquipo): void {
    this.editandoTipoId.set(tipo.id);
    this.editNombreTipo = tipo.nombre;
  }

  cancelarEdicionTipo(): void {
    this.editandoTipoId.set(null);
  }

  guardarEdicionTipo(tipo: TipoEquipo): void {
    if (!this.editNombreTipo.trim()) return;
    this.catalogoService.actualizarTipoEquipo(tipo.id, { nombre: this.editNombreTipo, activo: tipo.activo }).subscribe(() => {
      this.editandoTipoId.set(null);
      this.catalogoService.listarTiposEquipo().subscribe(t => this.tiposEquipo.set(t));
    });
  }

  // ===================== ESTADOS DE ORDEN =====================

  toggleEstadoOrden(estado: EstadoOrden): void {
    this.catalogoService.cambiarActivoEstadoOrden(estado.id, !estado.activo).subscribe(() => {
      this.catalogoService.listarEstadosOrden().subscribe(e => this.estadosOrden.set(e));
    });
  }

  iniciarEdicionEstado(estado: EstadoOrden): void {
    this.editandoEstadoId.set(estado.id);
    this.editNombreEstado = estado.nombre;
    this.editOrdenVisualEstado = estado.ordenVisual;
  }

  cancelarEdicionEstado(): void {
    this.editandoEstadoId.set(null);
  }

  guardarEdicionEstado(estado: EstadoOrden): void {
    if (!this.editNombreEstado.trim()) return;
    this.catalogoService.actualizarEstadoOrden(estado.id, {
      nombre: this.editNombreEstado,
      ordenVisual: this.editOrdenVisualEstado,
      esEstadoFinal: estado.esEstadoFinal,
    }).subscribe(() => {
      this.editandoEstadoId.set(null);
      this.catalogoService.listarEstadosOrden().subscribe(e => this.estadosOrden.set(e));
    });
  }

  // ===================== PROVEEDORES =====================

  agregarProveedor(): void {
    if (!this.nuevoNombre.trim()) return;
    this.catalogoService.crearProveedor({
      nombre: this.nuevoNombre,
      contacto: this.nuevoContacto,
      telefono: this.nuevoTelefono,
    }).subscribe(() => {
      this.nuevoNombre = '';
      this.nuevoContacto = '';
      this.nuevoTelefono = '';
      this.catalogoService.listarProveedores().subscribe(p => this.proveedores.set(p));
    });
  }

  toggleProveedor(prov: Proveedor): void {
    this.catalogoService.actualizarProveedor(prov.id, { ...prov, activo: !prov.activo }).subscribe(() => {
      this.catalogoService.listarProveedores().subscribe(p => this.proveedores.set(p));
    });
  }

  iniciarEdicionProveedor(prov: Proveedor): void {
    this.editandoProveedorId.set(prov.id);
    this.editNombreProveedor = prov.nombre;
    this.editContactoProveedor = prov.contacto ?? '';
    this.editTelefonoProveedor = prov.telefono ?? '';
  }

  cancelarEdicionProveedor(): void {
    this.editandoProveedorId.set(null);
  }

  guardarEdicionProveedor(prov: Proveedor): void {
    if (!this.editNombreProveedor.trim()) return;
    this.catalogoService.actualizarProveedor(prov.id, {
      nombre: this.editNombreProveedor,
      contacto: this.editContactoProveedor,
      telefono: this.editTelefonoProveedor,
      activo: prov.activo,
    }).subscribe(() => {
      this.editandoProveedorId.set(null);
      this.catalogoService.listarProveedores().subscribe(p => this.proveedores.set(p));
    });
  }
}