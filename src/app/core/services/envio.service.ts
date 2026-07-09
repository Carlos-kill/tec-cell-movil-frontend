import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnvioExterno, CrearEnvioRequest } from '../models/envio-repuesto.model';

@Injectable({ providedIn: 'root' })
export class EnvioService {
  private http = inject(HttpClient);

  listarPorOrden(ordenId: number): Observable<EnvioExterno[]> {
    return this.http.get<EnvioExterno[]>(`${environment.apiUrl}/ordenes/${ordenId}/envios`);
  }

  listarTodos(): Observable<EnvioExterno[]> {
    return this.http.get<EnvioExterno[]>(`${environment.apiUrl}/envios`);
  }

  registrar(ordenId: number, datos: CrearEnvioRequest): Observable<EnvioExterno> {
    return this.http.post<EnvioExterno>(`${environment.apiUrl}/ordenes/${ordenId}/envios`, datos);
  }

  confirmarLlegada(envioId: number, usuarioId: number): Observable<EnvioExterno> {
    return this.http.patch<EnvioExterno>(`${environment.apiUrl}/envios/${envioId}/confirmar-llegada`, null, {
      params: { usuarioId: String(usuarioId) }
    });
  }

  registrarRetorno(envioId: number, costoReal: number, usuarioId: number): Observable<EnvioExterno> {
    return this.http.patch<EnvioExterno>(`${environment.apiUrl}/envios/${envioId}/retorno`, null, {
      params: { costoReal: String(costoReal), usuarioId: String(usuarioId) }
    });
  }
}