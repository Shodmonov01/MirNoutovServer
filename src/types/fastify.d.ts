import type { AdminJwtPayload } from './admin.types';
import type { TelegramUser } from './telegram.types';

declare module 'fastify' {
  interface FastifyRequest {
    telegramUser?: TelegramUser;
    adminUser?: AdminJwtPayload;
  }
}
