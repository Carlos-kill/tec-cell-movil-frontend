export type Rol = 'ADMINISTRADOR' | 'TECNICO';

export interface Persona {
  id: number;
  dni: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  estado: boolean;
  feccre: string;
}

export interface Usuario {
  id: number;
  persona: Persona;
  usuario: string;
  rol: Rol;
  estado: boolean;
  fechaCreacion: string;
}

export interface CrearUsuarioRequest {
  dni: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono?: string;
  correo?: string;
  usuario: string;
  password: string;
  rol: Rol;
}