import type { FastifyInstance } from 'fastify';
import { mapPaymentToDto } from '../../lib/mappers';
import { paymentOptionRepository } from '../../repositories/payment-option.repository';

export const registerApiPaymentRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/payment-options', async (_request, reply) => {
    const rows = await paymentOptionRepository.findAll();
    return reply.send(rows.map(mapPaymentToDto));
  });
};
