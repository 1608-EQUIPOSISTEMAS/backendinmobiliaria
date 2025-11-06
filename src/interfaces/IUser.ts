export interface IUser {
  id: number;
  email: string;
  password_hash: string;
  documento_identidad?: string; // ← AGREGADO
  nombre: string;
  apellido: string;
  telefono?: string;
  slack_user_id?: string;
  rol_id: number;
  area_id: number;
  es_tecnico: boolean;
  especialidades?: number[]; // Array de IDs de categorías
  carga_actual: number;
  max_tickets: number;
  disponible: boolean;
  avatar_url?: string;
  ultimo_login?: Date;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  
  // Campos de joins (opcionales)
  rol?: string;
  area?: string;
  nombre_completo?: string;
}

export interface ICreateUser {
  email: string;
  password: string;
  documento_identidad?: string; // ← AGREGADO
  nombre: string;
  apellido: string;
  telefono?: string;
  slack_user_id?: string;
  rol_id: number;
  area_id: number;
  es_tecnico?: boolean;
  especialidades?: number[];
  max_tickets?: number;
  disponible?: boolean; // ← AGREGADO
  avatar_url?: string; // ← AGREGADO
}

export interface IUpdateUser {
  email?: string; // ← AGREGADO (por si necesitas cambiar email)
  documento_identidad?: string; // ← AGREGADO
  nombre?: string;
  apellido?: string;
  telefono?: string;
  slack_user_id?: string;
  rol_id?: number; // ← AGREGADO (cambio de rol)
  area_id?: number;
  es_tecnico?: boolean; // ← AGREGADO
  especialidades?: number[];
  carga_actual?: number; // ← AGREGADO (actualizar carga)
  max_tickets?: number;
  disponible?: boolean;
  avatar_url?: string;
  activo?: boolean; // ← AGREGADO (activar/desactivar)
}

export interface IUserResponse {
  id: number;
  email: string;
  documento_identidad?: string; // ← AGREGADO
  nombre: string;
  apellido: string;
  nombre_completo: string;
  telefono?: string;
  slack_user_id?: string; // ← AGREGADO
  rol: string;
  rol_id: number;
  area: string;
  area_id: number;
  es_tecnico: boolean;
  especialidades?: number[]; // ← AGREGADO
  carga_actual: number;
  max_tickets: number;
  disponible: boolean;
  avatar_url?: string; // ← AGREGADO
  ultimo_login?: Date; // ← AGREGADO
  activo: boolean;
  created_at: Date; // ← AGREGADO
}

export interface IUserFilters {
  rol_id?: number;
  area_id?: number;
  es_tecnico?: boolean;
  disponible?: boolean;
  activo?: boolean;
  search?: string; // Para buscar por nombre, email, documento
}

export interface IUserListResponse {
  users: IUserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}