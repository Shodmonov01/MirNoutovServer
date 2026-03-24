import type { FastifyInstance } from 'fastify';
import { mapDeliveryToDto } from '../../lib/mappers';
import { deliveryOptionRepository } from '../../repositories/delivery-option.repository';

export const registerApiDeliveryRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/delivery-options', async (_request, reply) => {
    const rows = await deliveryOptionRepository.findAll();
    return reply.send(rows.map(mapDeliveryToDto));
  });
};
