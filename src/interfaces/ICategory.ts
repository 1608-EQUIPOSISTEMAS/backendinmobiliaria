export interface ICategory {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  tipo_ticket_id: number;
  requiere_adjunto: boolean;
  tiempo_respuesta_default?: number;
  tiempo_resolucion_default?: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ISubcategory {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICategoryResponse extends ICategory {
  tipo_ticket: string;
  subcategorias?: ISubcategory[];
}