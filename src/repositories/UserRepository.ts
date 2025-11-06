import { BaseRepository } from './base/BaseRepository';
import { IUser, ICreateUser, IUpdateUser } from '@interfaces/IUser';
import { logger } from '@utils/logger.util';
import { AppError } from '@middleware/error.middleware';
import crypto from 'crypto';

export class UserRepository extends BaseRepository<IUser> {
  private table = 'usuarios';

  async findByEmail(email: string): Promise<IUser | null> {
    const sql = `SELECT * FROM ${this.table} WHERE email = ? AND activo = 1 LIMIT 1`;
    return this.queryOne<IUser>(sql, [email]);
  }

  async findUserById(id: number): Promise<IUser | null> {
    return super.findById<IUser>(this.table, id);
  }

  async findAllUsers(): Promise<IUser[]> {
    const sql = `
      SELECT u.*, r.nombre as rol_nombre, a.nombre as area_nombre
      FROM ${this.table} u
      INNER JOIN roles r ON u.rol_id = r.id
      INNER JOIN areas a ON u.area_id = a.id
      WHERE u.activo = 1
      ORDER BY u.nombre, u.apellido
    `;
    const [rows] = await this.query<IUser[]>(sql);
    return rows;
  }

  async create(data: ICreateUser): Promise<number> {
    const insertData: any = {
      email: data.email,
      password_hash: data.password,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono || null,
      slack_user_id: data.slack_user_id || null,
      rol_id: data.rol_id,
      area_id: data.area_id,
      es_tecnico: data.es_tecnico || false,
      especialidades: data.especialidades ? JSON.stringify(data.especialidades) : null,
      max_tickets: data.max_tickets || 10,
      carga_actual: 0,
      disponible: true,
      activo: true,
    };
    return this.insert(this.table, insertData);
  }

  async updateUser(id: number, data: IUpdateUser): Promise<boolean> {
    const updateData: any = {
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      slack_user_id: data.slack_user_id,
      area_id: data.area_id,
      especialidades: data.especialidades ? JSON.stringify(data.especialidades) : undefined,
      max_tickets: data.max_tickets,
      disponible: data.disponible,
      avatar_url: data.avatar_url,
      updated_at: new Date(),
    };
    
    // Remover undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    return this.update(this.table, id, updateData);
  }

  async deactivate(id: number): Promise<boolean> {
    return this.softDelete(this.table, id);
  }

  async updateLastLogin(id: number): Promise<boolean> {
    const sql = `UPDATE ${this.table} SET ultimo_login = NOW() WHERE id = ?`;
    const result = await this.execute(sql, [id]);
    return result.affectedRows > 0;
  }

  async findTechnicians(
    categoryId?: number,
    available: boolean = true
  ): Promise<IUser[]> {
    let sql = `
      SELECT * FROM ${this.table}
      WHERE es_tecnico = 1 AND activo = 1
    `;
    const params: any[] = [];

    if (available) {
      sql += ` AND disponible = 1 AND carga_actual < max_tickets`;
    }

    if (categoryId) {
      sql += ` AND JSON_CONTAINS(especialidades, ?, '$')`;
      params.push(JSON.stringify(categoryId));
    }

    sql += ` ORDER BY carga_actual ASC, RAND() LIMIT 10`;

    const [rows] = await this.query<IUser[]>(sql, params);
    return rows;
  }

  async updateCarga(userId: number, increment: number): Promise<boolean> {
    const sql = `
      UPDATE ${this.table} 
      SET carga_actual = GREATEST(carga_actual + ?, 0)
      WHERE id = ?
    `;
    const result = await this.execute(sql, [increment, userId]);
    return result.affectedRows > 0;
  }

  async findBySlackUserId(slackUserId: string): Promise<IUser | null> {
    const sql = `SELECT * FROM ${this.table} WHERE slack_user_id = ? AND activo = 1 LIMIT 1`;
    return this.queryOne<IUser>(sql, [slackUserId]);
  }

  async findByRole(roleId: number): Promise<IUser[]> {
    const sql = `SELECT * FROM ${this.table} WHERE rol_id = ? AND activo = TRUE`;
    const [rows] = await this.query<IUser[]>(sql, [roleId]);
    return rows;
  }

  /**
   * Buscar usuarios con filtros y paginación
   */
  async findAllWithFilters(filters: any = {}): Promise<any> {
    let whereConditions: string[] = ['1=1'];
    let params: any[] = [];

    if (filters.rol_id) {
      whereConditions.push('u.rol_id = ?');
      params.push(filters.rol_id);
    }

    if (filters.area_id) {
      whereConditions.push('u.area_id = ?');
      params.push(filters.area_id);
    }

    if (filters.es_tecnico !== undefined) {
      whereConditions.push('u.es_tecnico = ?');
      params.push(filters.es_tecnico);
    }

    if (filters.activo !== undefined) {
      whereConditions.push('u.activo = ?');
      params.push(filters.activo);
    }

    const whereClause = whereConditions.join(' AND ');
    const page = filters.page || 1;
    const limit = filters.limit || 25;

    return await this.paginate(
      `${this.table} u
       INNER JOIN roles r ON u.rol_id = r.id
       INNER JOIN areas a ON u.area_id = a.id`,
      page,
      limit,
      `u.id, u.email, u.nombre, u.apellido, u.telefono, u.slack_user_id,
       u.rol_id, u.area_id, u.es_tecnico, u.carga_actual, u.max_tickets,
       u.disponible, u.activo, u.ultimo_login, u.created_at,
       r.nombre as rol_nombre, a.nombre as area_nombre`,
      whereClause,
      params,
      'u.nombre ASC'
    );
  }

  async findUserByDocumento(documento: string): Promise<IUser | null> {
  const sql = `
    SELECT 
      u.id, u.email, u.documento_identidad, u.nombre, u.apellido,
      u.rol_id, u.area_id, u.activo,
      r.nombre as rol,
      a.nombre as area
    FROM usuarios u
    INNER JOIN roles r ON u.rol_id = r.id
    INNER JOIN areas a ON u.area_id = a.id
    WHERE u.documento_identidad = ?
    AND u.activo = 1
    LIMIT 1
  `;

  return await this.queryOne<IUser>(sql, [documento]);
  }

  /**
   * Guardar refresh token
   */
  async saveRefreshToken(
    userId: number,
    token: string,
    ipAddress: string,
    userAgent?: string,
    deviceInfo?: any
  ): Promise<boolean> {
    try {
      // Generar hash SHA256 del token
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // Calcular fecha de expiración (7 días)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Usar el tipo any o Record<string, any> para evitar conflicto de tipos
      const data: Record<string, any> = {
        usuario_id: userId,
        token: token,
        token_hash: tokenHash,
        ip_address: ipAddress,
        user_agent: userAgent || null,
        dispositivo_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
        fecha_expiracion: expiresAt,
        activo: 1,
        revocado: 0
      };
      
      // Usar el método execute directamente para evitar conflicto de tipos
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      const columns = keys.join(', ');
      const sql = `INSERT INTO refresh_tokens (${columns}) VALUES (${placeholders})`;
      await this.execute(sql, values);
      
      logger.info(`✅ Refresh token guardado para usuario: ${userId}`);
      return true;
    } catch (error: any) {
      logger.error('Error al guardar refresh token:', error);
      throw new AppError('Error al guardar token', 500);
    }
  }

  /**
   * Verificar refresh token
   */
  async verifyRefreshToken(userId: number, token: string): Promise<boolean> {
    // Generar hash del token para comparar
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const sql = `
      SELECT id 
      FROM refresh_tokens 
      WHERE usuario_id = ? 
      AND token_hash = ? 
      AND revocado = 0 
      AND activo = 1
      AND fecha_expiracion > NOW()
      LIMIT 1
    `;
    
    const result = await this.queryOne<any>(sql, [userId, tokenHash]);
    return result !== null;
  }

  /**
   * Revocar refresh tokens de un usuario
   */
  async revokeRefreshTokens(userId: number, reason?: string): Promise<boolean> {
    const sql = `
      UPDATE refresh_tokens 
      SET revocado = 1, 
          fecha_revocacion = NOW(),
          motivo_revocacion = ?
      WHERE usuario_id = ? 
      AND revocado = 0
    `;
    
    const result = await this.execute(sql, [reason || 'Logout', userId]);
    return result.affectedRows > 0;
  }

  /**
   * Limpiar tokens expirados
   */
  async cleanExpiredTokens(): Promise<number> {
    const sql = `
      DELETE FROM refresh_tokens 
      WHERE fecha_expiracion < NOW() 
      OR created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    const result = await this.execute(sql);
    return result.affectedRows;
  }

  /**
   * Buscar usuario por documento de identidad
   */
  async findByDocumento(documento: string): Promise<IUser | null> {
    const sql = `
      SELECT 
        u.*,
        r.nombre as rol,
        a.nombre as area
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      LEFT JOIN areas a ON u.area_id = a.id
      WHERE u.documento_identidad = ? 
      AND u.activo = 1
      LIMIT 1
    `;
    
    const user = await this.queryOne<IUser>(sql, [documento]);
    
    // Si el usuario tiene especialidades en JSON string, parsearlo
    if (user && user.especialidades && typeof user.especialidades === 'string') {
      try {
        user.especialidades = JSON.parse(user.especialidades as any);
      } catch (e) {
        // Si falla el parse, dejar como está
      }
    }
    
    return user;
  }

  /**
   * Verificar si un documento está registrado
   */
  async documentoExists(documento: string): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count 
      FROM usuarios 
      WHERE documento_identidad = ? 
      AND activo = 1
    `;
    
    const result = await this.queryOne<{ count: number }>(sql, [documento]);
    return result ? result.count > 0 : false;
  }

  /**
   * Actualizar documento de identidad de un usuario
   */
  async updateDocumento(userId: number, documento: string): Promise<boolean> {
    // Primero verificar que el documento no esté en uso
    const existingUser = await this.findByDocumento(documento);
    if (existingUser && existingUser.id !== userId) {
      throw new AppError('El documento ya está registrado por otro usuario', 409);
    }

    const sql = `
      UPDATE usuarios 
      SET documento_identidad = ?, 
          updated_at = NOW() 
      WHERE id = ?
    `;
    
    const result = await this.execute(sql, [documento, userId]);
    return result.affectedRows > 0;
  }

  /**
   * Buscar usuarios por documento parcial (para búsquedas)
   */
  async searchByDocumento(documentoParcial: string): Promise<IUser[]> {
    const sql = `
      SELECT 
        u.id,
        u.documento_identidad,
        u.nombre,
        u.apellido,
        u.email,
        r.nombre as rol,
        a.nombre as area
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      LEFT JOIN areas a ON u.area_id = a.id
      WHERE u.documento_identidad LIKE ?
      AND u.activo = 1
      ORDER BY u.nombre, u.apellido
      LIMIT 10
    `;
    
    const [users] = await this.query<IUser[]>(sql, [`%${documentoParcial}%`]);
    return users;
  }
}