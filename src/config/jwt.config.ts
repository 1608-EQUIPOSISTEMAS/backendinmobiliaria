import { config } from './environment.config';

export const jwtConfig = {
  secret: config.jwt.secret,
  expiresIn: config.jwt.expiresIn as string | number, // '24h' o 86400
  refreshExpiresIn: config.jwt.refreshExpiresIn as string | number, // '30d' o 2592000
  algorithm: 'HS256' as const,
  issuer: 'ticket-system',
  audience: 'ticket-system-users',
};