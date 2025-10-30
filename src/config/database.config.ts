import mysql from 'mysql2/promise';
import { config } from './environment.config';

// Pool de conexiones global
export const pool = mysql.createPool({
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
  charset: 'utf8mb4',
  timezone: '+00:00',
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
};

// Exportar para compatibilidad (no se usa más TypeORM)
export const AppDataSource = { pool };