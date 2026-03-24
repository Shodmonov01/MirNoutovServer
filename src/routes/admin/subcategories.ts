import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { mapSubcategoryToDto } from '../../lib/mappers';
import { ServiceError } from '../../lib/service-error';
import { categoryRepository } from '../../repositories/category.repository';
import { subcategoryRepository } from '../../repositories/subcategory.repository';

const listQuerySchema = z.object({
  categoryId: z.string().optional(),
});

const createBodySchema = z.object({
  categoryId: z.string(),
  name: z.string(),
  image: z.string(),
});

const updateBodySchema = createBodySchema.partial();

export const registerAdminSubcategoriesRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/subcategories', async (request, reply) => {
    const parsed = listQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Validation error', errors: parsed.error.flatten() });
    }
    const rows =
      parsed.data.categoryId !== undefined
        ? await subcategoryRepository.findByCategoryId(parsed.data.categoryId)
        : await subcategoryRepository.findAll();
    return reply.send(rows.map(mapSubcategoryToDto));
  });

  fastify.get<{ Params: { id: string } }>('/subcategories/:id', async (request, reply) => {
    const row = await subcategoryRepository.findById(request.params.id);
    if (!row) {
      throw new ServiceError(404, 'Not found');
    }
    return reply.send(mapSubcategoryToDto(row));
  });

  fastify.post('/subcategories', async (request, reply) => {
    const body = createBodySchema.parse(request.body);
    const category = await categoryRepository.findById(body.categoryId);
    if (!category) {
      throw new ServiceError(400, 'Category not found');
    }
    const created = await subcategoryRepository.create(body);
    const lean = await subcategoryRepository.findById(String(created._id));
    if (!lean) {
      throw new ServiceError(500, 'Internal server error');
    }
    return reply.status(201).send(mapSubcategoryToDto(lean));
  });

  fastify.put<{ Params: { id: string } }>('/subcategories/:id', async (request, reply) => {
    const body = updateBodySchema.parse(request.body);
    if (body.categoryId) {
      const category = await categoryRepository.findById(body.categoryId);
      if (!category) {
        throw new ServiceError(400, 'Category not found');
      }
    }
    const updated = await subcategoryRepository.update(request.params.id, body);
    if (!updated) {
      throw new ServiceError(404, 'Not found');
    }
    return reply.send(mapSubcategoryToDto(updated));
  });

  fastify.delete<{ Params: { id: string } }>('/subcategories/:id', async (request, reply) => {
    const removed = await subcategoryRepository.remove(request.params.id);
    if (!removed) {
      throw new ServiceError(404, 'Not found');
    }
    return reply.status(204).send();
  });
};
