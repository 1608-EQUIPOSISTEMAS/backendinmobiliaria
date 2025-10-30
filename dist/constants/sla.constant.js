"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLA_ALERT_BEFORE = exports.SLA_RESOLUTION_TIME = exports.SLA_RESPONSE_TIME = void 0;
const priorities_constant_1 = require("./priorities.constant");
// Tiempos en minutos
exports.SLA_RESPONSE_TIME = {
    [priorities_constant_1.PRIORITY_LEVELS.CRITICA]: 15, // 15 minutos
    [priorities_constant_1.PRIORITY_LEVELS.ALTA]: 60, // 1 hora
    [priorities_constant_1.PRIORITY_LEVELS.MEDIA]: 240, // 4 horas
    [priorities_constant_1.PRIORITY_LEVELS.BAJA]: 480, // 8 horas
};
exports.SLA_RESOLUTION_TIME = {
    [priorities_constant_1.PRIORITY_LEVELS.CRITICA]: 240, // 4 horas
    [priorities_constant_1.PRIORITY_LEVELS.ALTA]: 480, // 8 horas
    [priorities_constant_1.PRIORITY_LEVELS.MEDIA]: 1440, // 24 horas
    [priorities_constant_1.PRIORITY_LEVELS.BAJA]: 2880, // 48 horas
};
exports.SLA_ALERT_BEFORE = {
    [priorities_constant_1.PRIORITY_LEVELS.CRITICA]: 5, // 5 minutos antes
    [priorities_constant_1.PRIORITY_LEVELS.ALTA]: 15, // 15 minutos antes
    [priorities_constant_1.PRIORITY_LEVELS.MEDIA]: 60, // 1 hora antes
    [priorities_constant_1.PRIORITY_LEVELS.BAJA]: 120, // 2 horas antes
};
//# sourceMappingURL=sla.constant.js.map