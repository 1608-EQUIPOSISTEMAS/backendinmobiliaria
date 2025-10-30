export interface IUser {
  id: number;
  email: string;
  password_hash: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  slack_user_id?: string;
  rol_id: number;
  area_id: number;
  es_tecnico: boolean;
  especialidades?: number[];
  carga_actual: number;
  max_tickets: number;
  disponible: boolean;
  avatar_url?: string;
  ultimo_login?: Date;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateUser {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  slack_user_id?: string;
  rol_id: number;
  area_id: number;
  es_tecnico?: boolean;
  especialidades?: number[];
  max_tickets?: number;
}

export interface IUpdateUser {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  slack_user_id?: string;
  area_id?: number;
  especialidades?: number[];
  max_tickets?: number;
  disponible?: boolean;
  avatar_url?: string;
}

export interface IUserResponse {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  nombre_completo: string;
  telefono?: string;
  rol: string;
  area: string;
  es_tecnico: boolean;
  carga_actual: number;
  max_tickets: number;
  disponible: boolean;
  activo: boolean;
}