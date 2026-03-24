import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { mapOrderToDto } from '../../lib/mappers';
import { ServiceError } from '../../lib/service-error';
import { orderRepository } from '../../repositories/order.repository';

const listQuerySchema = z.object({
  status: z.string().optional(),
});

const patchStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'delivering', 'done', 'cancelled']),
});

export const registerAdminOrdersRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/orders', async (request, reply) => {
    const parsed = listQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Validation error', errors: parsed.error.flatten() });
    }
    const rows = await orderRepository.findAll({ status: parsed.data.status });
    return reply.send(rows.map(mapOrderToDto));
  });

  fastify.get<{ Params: { id: string } }>('/orders/:id', async (request, reply) => {
    const order = await orderRepository.findById(request.params.id);
    if (!order) {
      throw new ServiceError(404, 'Not found');
    }
    return reply.send(mapOrderToDto(order));
  });

  fastify.patch<{ Params: { id: string } }>('/orders/:id/status', async (request, reply) => {
    const body = patchStatusSchema.parse(request.body);
    const updated = await orderRepository.updateStatus(request.params.id, body.status);
    if (!updated) {
      throw new ServiceError(404, 'Not found');
    }
    return reply.send(mapOrderToDto(updated));
  });
};
