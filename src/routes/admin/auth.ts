import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Config } from '../../config';
import { AdminModel } from '../../models/admin.model';
import { TelegramAdminModel } from '../../models/telegram-admin.model';
import { buildVerifyTelegramAuth } from '../../plugins/auth-telegram';

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const registerAdminAuthRoutes = async (
  fastify: FastifyInstance,
  config: Config,
): Promise<void> => {
  const verifyTelegram = buildVerifyTelegramAuth(config);

  fastify.post('/login', async (request, reply) => {
    const body = loginBodySchema.parse(request.body);
    const admin = await AdminModel.findOne({ email: body.email }).lean().exec();
    if (!admin) {
      return reply.status(401).send({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(body.password, admin.password);
    if (!match) {
      return reply.status(401).send({ message: 'Invalid credentials' });
    }
    const token = await reply.jwtSign({
      role: 'superadmin',
      adminId: String(admin._id),
      email: admin.email,
    });
    return reply.send({ token, role: 'superadmin' as const });
  });

  fastify.post('/auth/telegram', { preHandler: verifyTelegram }, async (request, reply) => {
    const tgId = request.telegramUser!.id;
    const row = await TelegramAdminModel.findOne({ telegramUserId: tgId }).lean().exec();
    if (!row) {
      return reply.status(403).send({ message: 'Forbidden' });
    }
    const token = await reply.jwtSign({
      role: 'admin',
      telegramUserId: tgId,
    });
    return reply.send({ token, role: 'admin' as const });
  });
};
