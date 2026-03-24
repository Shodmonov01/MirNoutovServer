import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import type { Config } from '../config';

/** `*` — все origin; иначе один URL или несколько через запятую (например клиент + админка на разных портах). */
const resolveCorsOrigin = (raw: string): boolean | string | string[] => {
  if (raw === '*') {
    return true;
  }
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length === 0) {
    throw new Error('CORS_ORIGIN: укажите хотя бы один origin или *');
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return parts;
};

export const registerCors = async (fastify: FastifyInstance, config: Config): Promise<void> => {
  await fastify.register(cors, {
    origin: resolveCorsOrigin(config.CORS_ORIGIN),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
  });
};
