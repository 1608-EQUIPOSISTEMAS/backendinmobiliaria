import { Request, Response, NextFunction } from 'express';
export declare class CategoryController {
    private repository;
    constructor();
    /**
     * Listar todas las categorías
     * GET /api/categories
     */
    listCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener categoría por ID
     * GET /api/categories/:id
     */
    getCategoryById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Listar tipos de ticket
     * GET /api/categories/types
     */
    listTypes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Listar prioridades
     * GET /api/categories/priorities
     */
    listPriorities: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Listar estados de ticket
     * GET /api/categories/states
     */
    listStates: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Listar urgencias
     * GET /api/categories/urgencies
     */
    listUrgencies: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Listar impactos
     * GET /api/categories/impacts
     */
    listImpacts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Listar áreas
     * GET /api/categories/areas
     */
    listAreas: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Crear nueva categoría
     * POST /api/categories
     */
    createCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Actualizar categoría
     * PATCH /api/categories/:id
     */
    updateCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Desactivar categoría
     * DELETE /api/categories/:id
     */
    deleteCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener subcategorías de una categoría
     * GET /api/categories/:id/subcategories
     */
    getSubcategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener estadísticas de una categoría
     * GET /api/categories/:id/stats
     */
    getCategoryStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=CategoryController.d.ts.map