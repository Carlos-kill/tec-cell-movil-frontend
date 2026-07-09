import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PedidoRepuesto, CrearPedidoRepuestoRequest } from '../models/envio-repuesto.model';

@Injectable({ providedIn: 'root' })
export class RepuestoService {
  private http = inject(HttpClient);

  listarPorOrden(ordenId: number): Observable<PedidoRepuesto[]> {
    return this.http.get<PedidoRepuesto[]>(`${environment.apiUrl}/ordenes/${ordenId}/repuestos`);
  }

  listarTodos(): Observable<PedidoRepuesto[]> {
    return this.http.get<PedidoRepuesto[]>(`${environment.apiUrl}/repuestos`);
  }

  registrar(ordenId: number, datos: CrearPedidoRepuestoRequest): Observable<PedidoRepuesto> {
    return this.http.post<PedidoRepuesto>(`${environment.apiUrl}/ordenes/${ordenId}/repuestos`, datos);
  }

  confirmarLlegada(id: number, usuarioId: number): Observable<PedidoRepuesto> {
    return this.http.patch<PedidoRepuesto>(`${environment.apiUrl}/repuestos/${id}/llegada`, null, {
      params: { usuarioId: String(usuarioId) }
    });
  }
  
  marcarInstalado(id: number, instalado: boolean, usuarioId: number): Observable<PedidoRepuesto> {
    return this.http.patch<PedidoRepuesto>(`${environment.apiUrl}/repuestos/${id}/instalado`, null, {
      params: { 
        instalado: String(instalado),
        usuarioId: String(usuarioId)
      }
    });
  }
}