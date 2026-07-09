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

  // Campos de "nuevo item" simples (un input por pestaña)
  nuevoNombre = '';
  nuevoOrdenVisual = 0;
  nuevoContacto = '';
  nuevoTelefono = '';

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
  }

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

  agregarEstadoOrden(): void {
    if (!this.nuevoNombre.trim()) return;
    this.catalogoService.crearEstadoOrden({
      nombre: this.nuevoNombre,
      ordenVisual: this.nuevoOrdenVisual,
      esEstadoFinal: false,
    }).subscribe(() => {
      this.nuevoNombre = '';
      this.nuevoOrdenVisual = 0;
      this.catalogoService.listarEstadosOrden().subscribe(e => this.estadosOrden.set(e));
    });
  }

  toggleEstadoOrden(estado: EstadoOrden): void {
    this.catalogoService.cambiarActivoEstadoOrden(estado.id, !estado.activo).subscribe(() => {
      this.catalogoService.listarEstadosOrden().subscribe(e => this.estadosOrden.set(e));
    });
  }

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
}