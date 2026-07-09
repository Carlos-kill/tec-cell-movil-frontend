import { Persona } from './usuario.model';

export interface Cliente {
  id: number;
  persona: Persona;
  estado: boolean;
  feccre: string;
}

export interface CrearClienteRequest {
  dni: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
}