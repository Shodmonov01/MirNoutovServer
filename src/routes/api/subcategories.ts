import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { mapSubcategoryToDto } from '../../lib/mappers';
import { subcategoryRepository } from '../../repositories/subcategory.repository';

const listQuerySchema = z.object({
  categoryId: z.string(),
});

export const registerApiSubcategoriesRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/subcategories', async (request, reply) => {
    const parsed = listQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Validation error', errors: parsed.error.flatten() });
    }
    const rows = await subcategoryRepository.findByCategoryId(parsed.data.categoryId);
    return reply.send(rows.map(mapSubcategoryToDto));
  });
};
