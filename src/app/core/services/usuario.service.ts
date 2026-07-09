import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, CrearUsuarioRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/usuarios`;

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.base);
  }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/${id}`);
  }

  crear(datos: CrearUsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.base, datos);
  }

  cambiarEstado(id: number, estado: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.base}/${id}/estado`, null, { params: { estado } });
  }

  cambiarPassword(id: number, nuevaPassword: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}/password`, null, { params: { nuevaPassword } });
  }
}