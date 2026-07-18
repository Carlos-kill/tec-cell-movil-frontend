import { Usuario } from './usuario.model';
import { OrdenTrabajo } from './orden.model';

export interface Notificacion {
  id: number;
  usuario: Usuario;
  orden?: OrdenTrabajo;
  generadoPor?: Usuario;
  tipo: string;
  mensaje: string;
  visto: boolean;
  fechaCreacion: string;
}