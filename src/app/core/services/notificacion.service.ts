import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notificacion } from '../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/notificaciones`;

  listar(usuarioId: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.base, { params: { usuarioId: String(usuarioId) } });
  }

  contarNoVistas(usuarioId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/no-vistas/count`, { params: { usuarioId: String(usuarioId) } });
  }

  marcarVistas(usuarioId: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/marcar-vistas`, null, { params: { usuarioId: String(usuarioId) } });
  }
}