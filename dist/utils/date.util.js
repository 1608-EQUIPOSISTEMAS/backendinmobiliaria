"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtil = void 0;
exports.formatDuration = formatDuration;
exports.addMinutes = addMinutes;
exports.addHours = addHours;
exports.addDays = addDays;
class DateUtil {
    static addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
    }
    static addHours(date, hours) {
        return this.addMinutes(date, hours * 60);
    }
    static addDays(date, days) {
        return new Date(date.getTime() + days * 86400000);
    }
    static diffInMinutes(date1, date2) {
        return Math.floor((date2.getTime() - date1.getTime()) / 60000);
    }
    static diffInHours(date1, date2) {
        return Math.floor(this.diffInMinutes(date1, date2) / 60);
    }
    static diffInDays(date1, date2) {
        return Math.floor(this.diffInHours(date1, date2) / 24);
    }
    static isExpired(date) {
        return date.getTime() < Date.now();
    }
    static formatDateTime(date) {
        return date.toISOString().replace('T', ' ').substring(0, 19);
    }
    static formatDate(date) {
        return date.toISOString().substring(0, 10);
    }
    static parseDate(dateString) {
        return new Date(dateString);
    }
}
exports.DateUtil = DateUtil;
function formatDuration(minutes) {
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
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}
/**
 * Agrega horas a una fecha
 */
function addHours(date, hours) {
    return addMinutes(date, hours * 60);
}
/**
 * Agrega días a una fecha
 */
function addDays(date, days) {
    return new Date(date.getTime() + days * 86400000);
}
//# sourceMappingURL=date.util.js.map