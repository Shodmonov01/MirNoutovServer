import crypto from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Config } from '../config';

export const buildVerifyTelegramAuth = (config: Config) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const header = request.headers['x-telegram-init-data'];
    if (!header || typeof header !== 'string') {
      await reply.status(401).send({ message: 'Unauthorized' });
      return;
    }
    try {
      const params = new URLSearchParams(header);
      const hash = params.get('hash');
      if (!hash) {
        await reply.status(401).send({ message: 'Unauthorized' });
        return;
      }
      const keys = [...params.keys()]
        .filter((k) => k !== 'hash')
        .sort();
      const dataCheckString = keys
        .map((k) => {
          const v = params.get(k);
          return `${k}=${v ?? ''}`;
        })
        .join('\n');
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(config.BOT_TOKEN).digest();
      const checkHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
      const hashBuffer = Buffer.from(hash, 'hex');
      const checkBuffer = Buffer.from(checkHash, 'hex');
      if (hashBuffer.length !== checkBuffer.length || !crypto.timingSafeEqual(hashBuffer, checkBuffer)) {
        await reply.status(401).send({ message: 'Unauthorized' });
        return;
      }
      const userStr = params.get('user');
      if (!userStr) {
        await reply.status(401).send({ message: 'Unauthorized' });
        return;
      }
      const user = JSON.parse(userStr) as { id: number; first_name: string; username?: string };
      request.telegramUser = {
        id: user.id,
        first_name: user.first_name,
        username: user.username,
      };
    } catch {
      await reply.status(401).send({ message: 'Unauthorized' });
    }
  };
};
