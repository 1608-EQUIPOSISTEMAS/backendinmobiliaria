import { UserRepository } from '@repositories/UserRepository';
import { IUser } from '@interfaces/IUser';

export class TechnicianMatcher {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Sugiere el mejor técnico para un ticket
   */
  async suggestTechnician(
    categoryId: number,
    priorityId: number
  ): Promise<{
    technician: IUser | null;
    score: number;
    reasons: string[];
  }> {
    // Buscar técnicos disponibles con especialidad
    const technicians = await this.userRepository.findTechnicians(categoryId, true);

    if (technicians.length === 0) {
      return {
        technician: null,
        score: 0,
        reasons: ['No hay técnicos disponibles'],
      };
    }

    // Calcular score para cada técnico
    const scoredTechnicians = await Promise.all(
      technicians.map(async (tech) => {
        const score = await this.calculateTechnicianScore(tech, categoryId, priorityId);
        return { technician: tech, ...score };
      })
    );

    // Ordenar por score
    scoredTechnicians.sort((a, b) => b.score - a.score);

    return scoredTechnicians[0];
  }

  /**
   * Calcula el score de un técnico para un ticket
   */
  private async calculateTechnicianScore(
    technician: IUser,
    categoryId: number,
    priorityId: number
  ): Promise<{ score: number; reasons: string[] }> {
    let score = 0;
    const reasons: string[] = [];

    // 1. Especialización (40 puntos)
    if (technician.especialidades && technician.especialidades.includes(categoryId)) {
      score += 40;
      reasons.push('Especializado en esta categoría');
    } else {
      score += 10;
    }

    // 2. Carga de trabajo (30 puntos)
    const loadPercentage = (technician.carga_actual / technician.max_tickets) * 100;
    if (loadPercentage < 30) {
      score += 30;
      reasons.push('Baja carga de trabajo');
    } else if (loadPercentage < 60) {
      score += 20;
      reasons.push('Carga moderada');
    } else if (loadPercentage < 90) {
      score += 10;
      reasons.push('Carga alta');
    } else {
      score += 5;
      reasons.push('Cerca de capacidad máxima');
    }

    // 3. Desempeño histórico (30 puntos)
    const performance = await this.getTechnicianPerformance(technician.id, categoryId);
    score += performance.score;
    if (performance.reason) {
      reasons.push(performance.reason);
    }

    return { score, reasons };
  }

  /**
   * Obtiene el desempeño histórico de un técnico en una categoría
   */
  private async getTechnicianPerformance(
    technicianId: number,
    categoryId: number
  ): Promise<{ score: number; reason: string }> {
    const sql = `
      SELECT 
        COUNT(*) as total_tickets,
        ROUND(AVG(CASE WHEN s.cumple_resolucion = TRUE THEN 100 ELSE 0 END), 0) as sla_compliance,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion
      FROM tickets t
      LEFT JOIN sla_seguimiento s ON t.id = s.ticket_id
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      WHERE t.tecnico_asignado_id = ?
        AND t.categoria_id = ?
        AND t.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `;

    const result = await this.userRepository.queryOne<{
      total_tickets: number;
      sla_compliance: number;
      satisfaccion: number;
    }>(sql, [technicianId, categoryId]);

    if (!result || result.total_tickets === 0) {
      return { score: 15, reason: 'Sin historial en esta categoría' };
    }

    let score = 0;
    let reason = '';

    // Evaluar cumplimiento SLA
    if (result.sla_compliance >= 90) {
      score += 15;
      reason = 'Excelente cumplimiento SLA';
    } else if (result.sla_compliance >= 70) {
      score += 10;
      reason = 'Buen cumplimiento SLA';
    } else {
      score += 5;
      reason = 'Cumplimiento SLA mejorable';
    }

    // Evaluar satisfacción
    if (result.satisfaccion >= 4.5) {
      score += 15;
      reason += ' y alta satisfacción';
    } else if (result.satisfaccion >= 3.5) {
      score += 10;
      reason += ' y buena satisfacción';
    } else {
      score += 5;
    }

    return { score, reason };
  }

  /**
   * Obtiene lista de técnicos recomendados con scores
   */
  async getTopTechnicians(
    categoryId: number,
    priorityId: number,
    limit: number = 5
  ): Promise<
    Array<{
      technician: IUser;
      score: number;
      reasons: string[];
    }>
  > {
    const technicians = await this.userRepository.findTechnicians(categoryId, true);

    const scoredTechnicians = await Promise.all(
      technicians.map(async (tech) => {
        const score = await this.calculateTechnicianScore(tech, categoryId, priorityId);
        return { technician: tech, ...score };
      })
    );

    return scoredTechnicians.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}