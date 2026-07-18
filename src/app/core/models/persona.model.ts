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