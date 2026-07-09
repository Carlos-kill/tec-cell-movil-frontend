import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrdenTrabajo, CrearOrdenRequest, HistorialEstadoOrden, PageResponse } from '../models/orden.model';

export interface FiltrosOrden {
  tecnicoId?: number;
  clienteId?: number;
  tipoEquipoId?: number;
  estadoId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class OrdenService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/ordenes`;

  listar(filtros: FiltrosOrden = {}): Observable<PageResponse<OrdenTrabajo>> {
    const params: Record<string, string> = {};
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = String(value);
      }
    });
    return this.http.get<PageResponse<OrdenTrabajo>>(this.base, { params });
  }

  obtener(id: number): Observable<OrdenTrabajo> {
    return this.http.get<OrdenTrabajo>(`${this.base}/${id}`);
  }

  obtenerPorCodigo(codigo: string): Observable<OrdenTrabajo> {
    return this.http.get<OrdenTrabajo>(`${this.base}/codigo/${codigo}`);
  }

  crear(datos: CrearOrdenRequest): Observable<OrdenTrabajo> {
    return this.http.post<OrdenTrabajo>(this.base, datos);
  }

  cambiarEstado(id: number, estadoId: number, usuarioId: number, comentario?: string): Observable<OrdenTrabajo> {
    const params: Record<string, string> = {
      estadoId: String(estadoId),
      usuarioId: String(usuarioId),
    };
    if (comentario) params['comentario'] = comentario;
    return this.http.patch<OrdenTrabajo>(`${this.base}/${id}/estado`, null, { params });
  }

  obtenerHistorial(id: number): Observable<HistorialEstadoOrden[]> {
    return this.http.get<HistorialEstadoOrden[]>(`${this.base}/${id}/historial`);
  }

  obtenerSiguienteCodigo(): Observable<{ codigo: string }> {
    return this.http.get<{ codigo: string }>(`${this.base}/siguiente-codigo`);
  }

  obtenerSiguientesEstados(id: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/${id}/siguientes-estados`);
  }

  actualizarCostoFinal(ordenId: number, costoManoObra: number): Observable<OrdenTrabajo> {
    return this.http.patch<OrdenTrabajo>(`${environment.apiUrl}/ordenes/${ordenId}/costo-final`, null, {
      params: { costoManoObra: String(costoManoObra) }
    });
  }
}