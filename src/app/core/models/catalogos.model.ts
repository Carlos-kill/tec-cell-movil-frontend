export interface TipoEquipo {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface EstadoOrden {
  id: number;
  nombre: string;
  ordenVisual: number;
  esEstadoFinal: boolean;
  activo: boolean;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  activo: boolean;
}