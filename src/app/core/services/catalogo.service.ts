import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TipoEquipo, EstadoOrden, Proveedor } from '../models/catalogos.model';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private http = inject(HttpClient);

  // Tipos de equipo
  listarTiposEquipo(): Observable<TipoEquipo[]> {
    return this.http.get<TipoEquipo[]>(`${environment.apiUrl}/tipos-equipo`);
  }
  crearTipoEquipo(nombre: string): Observable<TipoEquipo> {
    return this.http.post<TipoEquipo>(`${environment.apiUrl}/tipos-equipo`, { nombre });
  }
  actualizarTipoEquipo(id: number, datos: Partial<TipoEquipo>): Observable<TipoEquipo> {
    return this.http.put<TipoEquipo>(`${environment.apiUrl}/tipos-equipo/${id}`, datos);
  }

  // Estados de orden
  listarEstadosOrden(): Observable<EstadoOrden[]> {
    return this.http.get<EstadoOrden[]>(`${environment.apiUrl}/estados-orden`);
  }
  crearEstadoOrden(datos: Partial<EstadoOrden>): Observable<EstadoOrden> {
    return this.http.post<EstadoOrden>(`${environment.apiUrl}/estados-orden`, datos);
  }
  actualizarEstadoOrden(id: number, datos: Partial<EstadoOrden>): Observable<EstadoOrden> {
    return this.http.put<EstadoOrden>(`${environment.apiUrl}/estados-orden/${id}`, datos);
  }
  cambiarActivoEstadoOrden(id: number, activo: boolean): Observable<EstadoOrden> {
    return this.http.patch<EstadoOrden>(`${environment.apiUrl}/estados-orden/${id}/activo`, null, { params: { activo } });
  }

  // Proveedores
  listarProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${environment.apiUrl}/proveedores`);
  }
  crearProveedor(datos: Partial<Proveedor>): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${environment.apiUrl}/proveedores`, datos);
  }
  actualizarProveedor(id: number, datos: Partial<Proveedor>): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${environment.apiUrl}/proveedores/${id}`, datos);
  }
}