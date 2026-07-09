import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

const TOKEN_KEY = 'tcm_token';
const ROL_KEY = 'tcm_rol';
const NOMBRE_KEY = 'tcm_nombre';
const ID_KEY = 'tcm_id';

@Injectable({ providedIn: 'root' })
export class AuthService {

  usuarioActual = signal<{ id: number; nombreCompleto: string; rol: string } | null>(this.cargarSesionGuardada());

  constructor(private http: HttpClient, private router: Router) {}

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciales).pipe(
      tap(respuesta => {
        localStorage.setItem(TOKEN_KEY, respuesta.token);
        localStorage.setItem(ROL_KEY, respuesta.rol);
        localStorage.setItem(NOMBRE_KEY, respuesta.nombreCompleto);
        localStorage.setItem(ID_KEY, String(respuesta.id));
        this.usuarioActual.set({ id: respuesta.id, nombreCompleto: respuesta.nombreCompleto, rol: respuesta.rol });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROL_KEY);
    localStorage.removeItem(NOMBRE_KEY);
    localStorage.removeItem(ID_KEY);
    this.usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRol(): string | null {
    return localStorage.getItem(ROL_KEY);
  }

  getUsuarioId(): number | null {
    const id = localStorage.getItem(ID_KEY);
    return id ? Number(id) : null;
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  esAdministrador(): boolean {
    return this.getRol() === 'ADMINISTRADOR';
  }

  private cargarSesionGuardada(): { id: number; nombreCompleto: string; rol: string } | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const rol = localStorage.getItem(ROL_KEY);
    const nombre = localStorage.getItem(NOMBRE_KEY);
    const id = localStorage.getItem(ID_KEY);
    if (token && rol && nombre && id) {
      return { id: Number(id), nombreCompleto: nombre, rol };
    }
    return null;
  }
}