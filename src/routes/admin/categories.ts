import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { mapCategoryToDto } from '../../lib/mappers';
import { ServiceError } from '../../lib/service-error';
import { categoryRepository } from '../../repositories/category.repository';

const createBodySchema = z.object({
  name: z.string(),
  image: z.string(),
});

const updateBodySchema = createBodySchema.partial();

export const registerAdminCategoriesRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/categories', async (_request, reply) => {
    const rows = await categoryRepository.findAll();
    return reply.send(rows.map(mapCategoryToDto));
  });

  fastify.post('/categories', async (request, reply) => {
    const body = createBodySchema.parse(request.body);
    const created = await categoryRepository.create(body);
    const lean = await categoryRepository.findById(String(created._id));
    if (!lean) {
      throw new ServiceError(500, 'Internal server error');
    }
    return reply.status(201).send(mapCategoryToDto(lean));
  });

  fastify.put<{ Params: { id: string } }>('/categories/:id', async (request, reply) => {
    const body = updateBodySchema.parse(request.body);
    const updated = await categoryRepository.update(request.params.id, body);
    if (!updated) {
      throw new ServiceError(404, 'Not found');
    }
    return reply.send(mapCategoryToDto(updated));
  });

  fastify.delete<{ Params: { id: string } }>('/categories/:id', async (request, reply) => {
    const removed = await categoryRepository.remove(request.params.id);
    if (!removed) {
      throw new ServiceError(404, 'Not found');
    }
    return reply.status(204).send();
  });
};
