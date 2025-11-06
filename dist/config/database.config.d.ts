import mysql from 'mysql2/promise';
export declare const pool: mysql.Pool;
export declare const initializeDatabase: () => Promise<void>;
export declare const AppDataSource: {
    pool: mysql.Pool;
};
//# sourceMappingURL=database.config.d.ts.map