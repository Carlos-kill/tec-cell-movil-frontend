import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, CrearClienteRequest } from '../models/cliente.model';
import { Persona } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/clientes`;

  buscar(texto?: string): Observable<Cliente[]> {
    const params: Record<string, string> = {};
    if (texto) {
        params['buscar'] = texto;
    }
    return this.http.get<Cliente[]>(this.base, { params });
    }
    
  buscarPersonaPorDni(dni: string): Observable<Persona> {
    return this.http.get<Persona>(`${environment.apiUrl}/personas/dni/${dni}`);
  }

  obtener(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.base}/${id}`);
  }

  crear(datos: CrearClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.base, datos);
  }

  cambiarEstado(id: number, estado: boolean): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.base}/${id}/estado`, null, { params: { estado } });
  }
}