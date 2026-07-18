import { Empleado } from './empleado.model';

export interface Usuario {
  id: number;
  empleado: Empleado;
  usuario: string;
  rol: 'ADMINISTRADOR' | 'TECNICO';
  estado: boolean;
  fechaCreacion: string;
}

export interface CrearUsuarioRequest {
  dni: string;
  usuario: string;
  password: string;
  rol: 'ADMINISTRADOR' | 'TECNICO';
}