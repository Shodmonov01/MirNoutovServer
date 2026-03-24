import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { orderService } from '../../services/order.service';

const createBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
  phone: z.string().min(9),
  address: z.object({
    district: z.string(),
    street: z.string(),
    apartment: z.string(),
    floor: z.string(),
  }),
  deliveryId: z.string(),
  paymentId: z.string(),
  comments: z.string().optional(),
});

export const registerApiOrdersRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.post('/orders', async (request, reply) => {
    const body = createBodySchema.parse(request.body);
    const telegramUser = request.telegramUser;
    if (!telegramUser) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }
    const result = await orderService.create(body, telegramUser.id);
    return reply.status(201).send(result);
  });
};
