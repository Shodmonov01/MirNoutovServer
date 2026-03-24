import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { mapProductToDto } from '../../lib/mappers';
import { productService } from '../../services/product.service';

const listQuerySchema = z.object({
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  search: z.string().optional(),
});

export const registerApiProductsRoutes = async (fastify: FastifyInstance): Promise<void> => {
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
};
