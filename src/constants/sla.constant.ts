import { PRIORITY_LEVELS } from './priorities.constant';

// Tiempos en minutos
export const SLA_RESPONSE_TIME = {
  [PRIORITY_LEVELS.CRITICA]: 15, // 15 minutos
  [PRIORITY_LEVELS.ALTA]: 60, // 1 hora
  [PRIORITY_LEVELS.MEDIA]: 240, // 4 horas
  [PRIORITY_LEVELS.BAJA]: 480, // 8 horas
};

export const SLA_RESOLUTION_TIME = {
  [PRIORITY_LEVELS.CRITICA]: 240, // 4 horas
  [PRIORITY_LEVELS.ALTA]: 480, // 8 horas
  [PRIORITY_LEVELS.MEDIA]: 1440, // 24 horas
  [PRIORITY_LEVELS.BAJA]: 2880, // 48 horas
};

export const SLA_ALERT_BEFORE = {
  [PRIORITY_LEVELS.CRITICA]: 5, // 5 minutos antes
  [PRIORITY_LEVELS.ALTA]: 15, // 15 minutos antes
  [PRIORITY_LEVELS.MEDIA]: 60, // 1 hora antes
  [PRIORITY_LEVELS.BAJA]: 120, // 2 horas antes
};