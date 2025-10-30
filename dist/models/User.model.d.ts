export interface User {
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
    rol?: string;
    area?: string;
    nombre_completo?: string;
}
export interface CreateUserDTO {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    rol_id: number;
    area_id: number;
    es_tecnico?: boolean;
    especialidades?: number[];
    max_tickets?: number;
    disponible?: boolean;
    avatar_url?: string;
}
export interface UpdateUserDTO {
    email?: string;
    nombre?: string;
    apellido?: string;
    telefono?: string;
    slack_user_id?: string;
    rol_id?: number;
    area_id?: number;
    es_tecnico?: boolean;
    especialidades?: number[];
    carga_actual?: number;
    max_tickets?: number;
    disponible?: boolean;
    avatar_url?: string;
    activo?: boolean;
}
export interface UserFilters {
    rol_id?: number;
    area_id?: number;
    es_tecnico?: boolean;
    disponible?: boolean;
    activo?: boolean;
    search?: string;
}
export interface UserResponse {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    nombre_completo: string;
    telefono?: string;
    rol: string;
    rol_id: number;
    area: string;
    area_id: number;
    es_tecnico: boolean;
    especialidades?: string[];
    carga_actual: number;
    max_tickets: number;
    disponible: boolean;
    avatar_url?: string;
    ultimo_login?: Date;
    activo: boolean;
    created_at: Date;
}
//# sourceMappingURL=User.model.d.ts.map