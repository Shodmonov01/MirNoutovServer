import type { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import { z } from 'zod';
import { isSuperAdminPayload } from '../../lib/admin-jwt';
import { TelegramAdminModel } from '../../models/telegram-admin.model';

const createBodySchema = z.object({
  telegramUserId: z.number().int().positive(),
});

export interface TelegramAdminListItemDto {
  id: string;
  telegramUserId: number;
  createdByAdminId: string;
  createdAt: string;
  updatedAt: string;
}

export const registerAdminTelegramAdminsRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/', async (): Promise<TelegramAdminListItemDto[]> => {
    const rows = await TelegramAdminModel.find().sort({ createdAt: -1 }).lean().exec();
    return rows.map((r) => ({
      id: String(r._id),
      telegramUserId: r.telegramUserId,
      createdByAdminId: String(r.createdByAdminId),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  });

  fastify.post('/', async (request, reply) => {
    const user = request.adminUser;
    if (!user || !isSuperAdminPayload(user)) {
      return reply.status(403).send({ message: 'Forbidden' });
    }
    const body = createBodySchema.parse(request.body);
    const createdByAdminId = new mongoose.Types.ObjectId(user.adminId);
    try {
      const doc = await TelegramAdminModel.create({
        telegramUserId: body.telegramUserId,
        createdByAdminId,
      });
      return reply.status(201).send({
        id: String(doc._id),
        telegramUserId: doc.telegramUserId,
        createdByAdminId: String(doc.createdByAdminId),
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      } satisfies TelegramAdminListItemDto);
    } catch (err: unknown) {
      const code = (err as { code?: number }).code;
      if (code === 11000) {
        return reply.status(409).send({ message: 'Already exists' });
      }
      throw err;
    }
  });

  fastify.delete<{ Params: { telegramUserId: string } }>('/:telegramUserId', async (request, reply) => {
    const raw = request.params.telegramUserId;
    const telegramUserId = Number.parseInt(raw, 10);
    if (!Number.isSafeInteger(telegramUserId) || telegramUserId <= 0) {
      return reply.status(400).send({ message: 'Invalid telegram user id' });
    }
    const res = await TelegramAdminModel.deleteOne({ telegramUserId }).exec();
    if (res.deletedCount === 0) {
      return reply.status(404).send({ message: 'Not found' });
    }
    return reply.status(204).send();
  });
};
