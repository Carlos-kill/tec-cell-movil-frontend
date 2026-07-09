export interface EnvioExterno {
  id: number;
  tecnicoExternoNombre: string;
  tecnicoExternoContacto?: string;
  fechaEnvio: string;
  costoEstimado?: number;
  costoReal?: number;
  fechaRetornoEsperada?: string;
  fechaRetornoReal?: string;
  observaciones?: string;
  orden?: { id: number; codigoUnico: string };
}

export interface CrearEnvioRequest {
  tecnicoExternoNombre: string;
  tecnicoExternoContacto?: string;
  costoEstimado?: number;
  fechaRetornoEsperada?: string;
  observaciones?: string;
  usuarioId: number;
}

export interface PedidoRepuesto {
  id: number;
  nombreRepuesto: string;
  descripcion?: string;
  fechaSolicitud: string;
  fechaLlegada?: string;
  precio?: number;
  instalado: boolean;
  observaciones?: string;
  proveedor?: { id: number; nombre: string };
  orden?: { id: number; codigoUnico: string };
}

export interface CrearPedidoRepuestoRequest {
  proveedorId: number;
  nombreRepuesto: string;
  descripcion?: string;
  precio?: number;
  usuarioId: number;
}