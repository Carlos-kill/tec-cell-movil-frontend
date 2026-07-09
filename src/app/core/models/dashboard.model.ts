export interface OrdenResumen {
  codigoUnico: string;
  estadoActual: string;
  clienteNombre: string;
  tecnicoNombre: string;
  fechaIngreso: string;
}

export interface DashboardResponse {
  ordenesPorEstado: Record<string, number>;
  ordenesEnvioTransito: number;
  ordenesEntregadasHoy: number;
  ordenesUrgentes: OrdenResumen[];
}