import { BaseRepository } from '@repositories/base/BaseRepository';

export class TimeEstimator extends BaseRepository<any> {
  /**
   * Estima el tiempo de resolución basado en tickets históricos similares
   */
  async estimateResolutionTime(
    categoryId: number,
    priorityId: number
  ): Promise<number> {
    const sql = `
      SELECT ROUND(AVG(tiempo_resolucion_minutos), 0) as tiempo_estimado
      FROM tickets
      WHERE categoria_id = ?
        AND prioridad_id = ?
        AND fecha_resolucion IS NOT NULL
        AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `;

    const result = await this.queryOne<{ tiempo_estimado: number }>(sql, [
      categoryId,
      priorityId,
    ]);

    // Si no hay datos históricos, usar tiempos por defecto según prioridad
    if (!result || !result.tiempo_estimado) {
      const defaultTimes: { [key: number]: number } = {
        1: 240, // Crítica: 4 horas
        2: 480, // Alta: 8 horas
        3: 1440, // Media: 24 horas
        4: 2880, // Baja: 48 horas
      };
      return defaultTimes[priorityId] || 1440;
    }

    return result.tiempo_estimado;
  }

  /**
   * Estima tiempo de primera respuesta
   */
  async estimateResponseTime(categoryId: number): Promise<number> {
    const sql = `
      SELECT ROUND(AVG(tiempo_respuesta_minutos), 0) as tiempo_estimado
      FROM tickets
      WHERE categoria_id = ?
        AND fecha_primera_respuesta IS NOT NULL
        AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `;

    const result = await this.queryOne<{ tiempo_estimado: number }>(sql, [categoryId]);

    return result?.tiempo_estimado || 60; // Default: 1 hora
  }

  /**
   * Obtiene estadísticas de tiempo por categoría y prioridad
   */
  async getTimeStatistics(categoryId: number, priorityId: number): Promise<{
    tiempo_minimo: number;
    tiempo_promedio: number;
    tiempo_maximo: number;
    mediana: number;
    total_tickets: number;
  }> {
    const sql = `
      SELECT 
        MIN(tiempo_resolucion_minutos) as tiempo_minimo,
        ROUND(AVG(tiempo_resolucion_minutos), 0) as tiempo_promedio,
        MAX(tiempo_resolucion_minutos) as tiempo_maximo,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE categoria_id = ?
        AND prioridad_id = ?
        AND fecha_resolucion IS NOT NULL
        AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `;

    const result = await this.queryOne<any>(sql, [categoryId, priorityId]);

    // Calcular mediana
    const medianaSql = `
      SELECT tiempo_resolucion_minutos as mediana
      FROM tickets
      WHERE categoria_id = ?
        AND prioridad_id = ?
        AND fecha_resolucion IS NOT NULL
        AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      ORDER BY tiempo_resolucion_minutos
      LIMIT 1 OFFSET ?
    `;

    const totalTickets = result?.total_tickets || 0;
    const offset = Math.floor(totalTickets / 2);
    const medianaResult = await this.queryOne<{ mediana: number }>(medianaSql, [
      categoryId,
      priorityId,
      offset,
    ]);

    return {
      tiempo_minimo: result?.tiempo_minimo || 0,
      tiempo_promedio: result?.tiempo_promedio || 0,
      tiempo_maximo: result?.tiempo_maximo || 0,
      mediana: medianaResult?.mediana || 0,
      total_tickets: totalTickets,
    };
  }
}