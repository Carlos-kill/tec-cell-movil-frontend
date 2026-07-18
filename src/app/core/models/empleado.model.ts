import { Persona } from './persona.model';

export interface Cargo {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Empleado {
  id: number;
  persona: Persona;
  cargo: Cargo;
  fechaIngreso: string;
  estado: boolean;
}

export interface CrearEmpleadoRequest {
  dni: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  cargoId: number;
}