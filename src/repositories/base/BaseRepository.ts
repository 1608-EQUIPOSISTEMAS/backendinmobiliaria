import { Pool, RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise';
import mysql from 'mysql2/promise';

import { config } from '@config/environment.config';

export class BaseRepository<T> {
  public pool: Pool;

  constructor() {
    // Crear pool de conexiones directamente
    this.pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.username,
      password: config.database.password,
      database: config.database.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }

  public async query<R = RowDataPacket[]>(
    sql: string,
    params?: any[]
  ): Promise<[R, FieldPacket[]]> {
    return this.pool.execute<R & RowDataPacket[]>(sql, params);
  }

  public async queryOne<R = RowDataPacket>(
    sql: string,
    params?: any[]
  ): Promise<R | null> {
    const [rows] = await this.query<R[]>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  public async execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
    const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
    return result;
  }

  public async insert(table: string, data: Partial<T>): Promise<number> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const result = await this.execute(sql, values);
    return result.insertId;
  }

public async update(
    table: string,
    id: number,
    data: Partial<T> | Record<string, any>
  ): Promise<boolean> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key) => `${key} = ?`).join(', ');

    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    const result = await this.execute(sql, [...values, id]);
    return result.affectedRows > 0;
  }

  public async delete(table: string, id: number): Promise<boolean> {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const result = await this.execute(sql, [id]);
    return result.affectedRows > 0;
  }

  public async softDelete(table: string, id: number): Promise<boolean> {
    const sql = `UPDATE ${table} SET activo = 0, updated_at = NOW() WHERE id = ?`;
    const result = await this.execute(sql, [id]);
    return result.affectedRows > 0;
  }

  public async findById<R = T>(
    table: string,
    id: number,
    columns = '*'
  ): Promise<R | null> {
    const sql = `SELECT ${columns} FROM ${table} WHERE id = ? LIMIT 1`;
    return this.queryOne<R>(sql, [id]);
  }

  public async findAll<R = T>(
    table: string,
    columns = '*',
    orderBy = 'id DESC'
  ): Promise<R[]> {
    const sql = `SELECT ${columns} FROM ${table} ORDER BY ${orderBy}`;
    const [rows] = await this.query<R[]>(sql);
    return rows;
  }

  public async paginate<R = T>(
    table: string,
    page: number = 1,
    limit: number = 25,
    columns = '*',
    where = '1=1',
    params: any[] = [],
    orderBy = 'id DESC'
  ): Promise<{ data: R[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    // Obtener total
    const countSql = `SELECT COUNT(*) as total FROM ${table} WHERE ${where}`;
    const totalResult = await this.queryOne<{ total: number }>(countSql, params);
    const total = totalResult?.total || 0;

    // Obtener datos
    const dataSql = `SELECT ${columns} FROM ${table} WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const [rows] = await this.query<R[]>(dataSql, [...params, limit, offset]);

    return {
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  public buildWhereClause(filters: Record<string, any>): {
    where: string;
    params: any[];
  } {
    const conditions: string[] = [];
    const params: any[] = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    });

    return {
      where: conditions.length > 0 ? conditions.join(' AND ') : '1=1',
      params,
    };
  }
}