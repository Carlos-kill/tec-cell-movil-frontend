export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  token: string;
  rol: 'ADMINISTRADOR' | 'TECNICO';
  nombreCompleto: string;
}