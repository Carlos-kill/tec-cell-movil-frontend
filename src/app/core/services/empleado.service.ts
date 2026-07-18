import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empleado, CrearEmpleadoRequest, Cargo } from '../models/empleado.model';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/empleados`;

  listar(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.base);
  }

  buscarPorDni(dni: string): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.base}/dni/${dni}`);
  }

  crear(datos: CrearEmpleadoRequest): Observable<Empleado> {
    return this.http.post<Empleado>(this.base, datos);
  }

  cambiarEstado(id: number, estado: boolean): Observable<Empleado> {
    return this.http.patch<Empleado>(`${this.base}/${id}/estado`, null, { params: { estado } });
  }

  listarCargos(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(`${environment.apiUrl}/cargos`);
  }

  actualizar(id: number, datos: any): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.base}/${id}`, datos);
  }
}