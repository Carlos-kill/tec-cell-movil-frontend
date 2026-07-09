import { Cliente } from './cliente.model';
import { Usuario } from './usuario.model';
import { TipoEquipo, EstadoOrden } from './catalogos.model';

export interface Equipo {
  id: number;
  cliente: Cliente;
  tipoEquipo: TipoEquipo;
  marca?: string;
  modelo?: string;
  numeroSerieImei?: string;
  fallaReportada: string;
  estadoFisicoIngreso?: string;
  accesoriosEntregados?: string;
  fechaRegistro: string;
}

export interface OrdenTrabajo {
  id: number;
  codigoUnico: string;
  equipo: Equipo;
  tecnicoAsignado: Usuario;
  estadoActual: EstadoOrden;
  fechaIngreso: string;
  fechaEntregaEstimada?: string;
  fechaEntregaReal?: string;
  costoTotal: number;
  observaciones?: string;
  creadoPor: Usuario;
}

export interface CrearOrdenRequest {
  dni: string;
  nombreCliente: string;
  apellidoPaternoCliente: string;
  apellidoMaternoCliente?: string;
  telefonoCliente?: string;
  correoCliente?: string;
  tipoEquipoId: number;
  marca?: string;
  modelo?: string;
  numeroSerieImei?: string;
  fallaReportada: string;
  estadoFisicoIngreso?: string;
  accesoriosEntregados?: string;
  tecnicoAsignadoId: number;
  creadoPorUsuarioId: number;
}

export interface HistorialEstadoOrden {
  id: number;
  estado: EstadoOrden;
  usuario: Usuario;
  fechaCambio: string;
  comentario?: string;
}

// La respuesta paginada que devuelve Spring cuando usamos Page<T>
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // página actual (0-indexed)
  size: number;
}