import rateLimit from 'express-rate-limit';
import { config } from '@config/environment.config';

export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  skipSuccessfulRequests: true,
  message: 'Demasiados intentos de inicio de sesión, intente en 15 minutos',
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 solicitudes
  message: 'Límite de solicitudes excedido, intente en 1 minuto',
});

export const rateLimitStrict = strictLimiter;

export const rateLimitModerate = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 solicitudes
  message: 'Límite de solicitudes moderado excedido, intente en 1 minuto',
});