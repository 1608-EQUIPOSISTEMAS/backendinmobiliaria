export class DateUtil {
  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  static addHours(date: Date, hours: number): Date {
    return this.addMinutes(date, hours * 60);
  }

  static addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 86400000);
  }

  static diffInMinutes(date1: Date, date2: Date): number {
    return Math.floor((date2.getTime() - date1.getTime()) / 60000);
  }

  static diffInHours(date1: Date, date2: Date): number {
    return Math.floor(this.diffInMinutes(date1, date2) / 60);
  }

  static diffInDays(date1: Date, date2: Date): number {
    return Math.floor(this.diffInHours(date1, date2) / 24);
  }

  static isExpired(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  static formatDateTime(date: Date): string {
    return date.toISOString().replace('T', ' ').substring(0, 19);
  }

  static formatDate(date: Date): string {
    return date.toISOString().substring(0, 10);
  }

  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

/**
 * Agrega minutos a una fecha
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Agrega horas a una fecha
 */
export function addHours(date: Date, hours: number): Date {
  return addMinutes(date, hours * 60);
}

/**
 * Agrega días a una fecha
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}