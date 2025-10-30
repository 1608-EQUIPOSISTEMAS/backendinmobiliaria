export interface TipoTicket {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  icono?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CategoriaTicket {
  id: number;
  tipo_ticket_id: number;
  nombre: string;
  descripcion?: string;
  area_responsable_id?: number;
  requiere_aprobacion: boolean;
  permite_autoasignacion: boolean;
  plantilla_solucion?: string;
  keywords_ia?: string[];
  orden: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  
  // Campos de joins
  tipo_ticket?: string;
  area_responsable?: string;
  subcategorias?: SubcategoriaTicket[];
}

export interface SubcategoriaTicket {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  
  // Campos de joins
  categoria?: string;
}

export interface Prioridad {
  id: number;
  nombre: string;
  nivel: number; // 1=Crítica, 4=Baja
  color: string;
  descripcion?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Urgencia {
  id: number;
  nombre: string;
  nivel: number; // 1=Crítica, 4=Baja
  descripcion?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Impacto {
  id: number;
  nombre: string;
  nivel: number; // 1=Masivo, 4=Individual
  descripcion?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface EstadoTicket {
  id: number;
  nombre: string;
  tipo: 'inicial' | 'proceso' | 'espera' | 'final';
  color: string;
  descripcion?: string;
  permite_cierre: boolean;
  requiere_solucion: boolean;
  orden: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCategoriaDTO {
  tipo_ticket_id: number;
  nombre: string;
  descripcion?: string;
  area_responsable_id?: number;
  requiere_aprobacion?: boolean;
  permite_autoasignacion?: boolean;
  plantilla_solucion?: string;
  keywords_ia?: string[];
  orden?: number;
}

export interface UpdateCategoriaDTO {
  tipo_ticket_id?: number;
  nombre?: string;
  descripcion?: string;
  area_responsable_id?: number;
  requiere_aprobacion?: boolean;
  permite_autoasignacion?: boolean;
  plantilla_solucion?: string;
  keywords_ia?: string[];
  orden?: number;
  activo?: boolean;
}

export interface CategoryResponse extends CategoriaTicket {
  tipo_ticket_nombre: string;
  tipo_ticket_color: string;
  subcategorias_count: number;
  tickets_activos: number;
  tickets_total: number;
}

export interface CategoryFilters {
  tipo_ticket_id?: number;
  area_responsable_id?: number;
  activo?: boolean;
  search?: string;
}