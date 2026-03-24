import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { mapProductToDto } from '../../lib/mappers';
import { ServiceError } from '../../lib/service-error';
import { assertSubcategoryBelongsToCategory } from '../../lib/validate-subcategory';
import { categoryRepository } from '../../repositories/category.repository';
import { productRepository } from '../../repositories/product.repository';
import { productService } from '../../services/product.service';

const listQuerySchema = z.object({
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  search: z.string().optional(),
});

const createBodySchema = z.object({
  categoryId: z.string(),
  subcategoryId: z.string().optional(),
  title: z.string(),
  price: z.number(),
  currency: z.string().optional(),
  image: z.string(),
  description: z.string().optional(),
  specs: z.unknown().optional(),
  condition: z.string().optional(),
  warranty: z.string().optional(),
  location: z.string().optional(),
});

const updateBodySchema = createBodySchema.partial().extend({
  subcategoryId: z.string().nullable().optional(),
});

export const registerAdminProductsRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/products', async (request, reply) => {
    const parsed = listQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Validation error', errors: parsed.error.flatten() });
    }
    const rows = await productService.getAll(parsed.data);
    return reply.send(rows.map(mapProductToDto));
  });

  fastify.get<{ Params: { id: string } }>('/products/:id', async (request, reply) => {
    const product = await productService.getById(request.params.id);
    return reply.send(mapProductToDto(product));
  });

  fastify.post('/products', async (request, reply) => {
    const body = createBodySchema.parse(request.body);
    const category = await categoryRepository.findById(body.categoryId);
    if (!category) {
      throw new ServiceError(400, 'Category not found');
    }
    await assertSubcategoryBelongsToCategory(body.categoryId, body.subcategoryId);
    const created = await productRepository.create(body);
    const lean = await productRepository.findById(String(created._id));
    if (!lean) {
      throw new ServiceError(500, 'Internal server error');
    }
    return reply.status(201).send(mapProductToDto(lean));
  });

  fastify.put<{ Params: { id: string } }>('/products/:id', async (request, reply) => {
    const body = updateBodySchema.parse(request.body);
    const existing = await productRepository.findById(request.params.id);
    if (!existing) {
      throw new ServiceError(404, 'Not found');
    }
    const nextCategoryId = body.categoryId ?? String(existing.categoryId);
    if (body.categoryId) {
      const category = await categoryRepository.findById(body.categoryId);
      if (!category) {
        throw new ServiceError(400, 'Category not found');
      }
    }
    if (body.subcategoryId !== undefined) {
      await assertSubcategoryBelongsToCategory(nextCategoryId, body.subcategoryId);
    }
    const updated = await productRepository.update(request.params.id, body);
    if (!updated) {
      throw new ServiceError(404, 'Not found');
    }
    return reply.send(mapProductToDto(updated));
  });

  fastify.delete<{ Params: { id: string } }>('/products/:id', async (request, reply) => {
    const removed = await productRepository.remove(request.params.id);
    if (!removed) {
      throw new ServiceError(404, 'Not found');
    }
    return reply.status(204).send();
  });
};
