import type { FastifyInstance } from 'fastify';
import { mapCategoryToDto } from '../../lib/mappers';
import { categoryRepository } from '../../repositories/category.repository';

export const registerApiCategoriesRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/categories', async (_request, reply) => {
    const rows = await categoryRepository.findAll();
    const body = rows.map(mapCategoryToDto);
    return reply.send(body);
  });
};
