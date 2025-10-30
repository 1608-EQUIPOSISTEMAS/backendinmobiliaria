export declare class DateUtil {
    static addMinutes(date: Date, minutes: number): Date;
    static addHours(date: Date, hours: number): Date;
    static addDays(date: Date, days: number): Date;
    static diffInMinutes(date1: Date, date2: Date): number;
    static diffInHours(date1: Date, date2: Date): number;
    static diffInDays(date1: Date, date2: Date): number;
    static isExpired(date: Date): boolean;
    static formatDateTime(date: Date): string;
    static formatDate(date: Date): string;
    static parseDate(dateString: string): Date;
}
export declare function formatDuration(minutes: number): string;
/**
 * Agrega minutos a una fecha
 */
export declare function addMinutes(date: Date, minutes: number): Date;
/**
 * Agrega horas a una fecha
 */
export declare function addHours(date: Date, hours: number): Date;
/**
 * Agrega días a una fecha
 */
export declare function addDays(date: Date, days: number): Date;
//# sourceMappingURL=date.util.d.ts.map