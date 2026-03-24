import type { FastifyInstance } from 'fastify';
import type { Config } from '../../config';
import { createStorageService } from '../../services/storage.service';

export const registerAdminUploadRoutes = async (
  fastify: FastifyInstance,
  config: Config,
): Promise<void> => {
  const storage = createStorageService(config);

  fastify.post('/upload', async (request, reply) => {
    const file = await request.file();
    if (!file) {
      return reply.status(400).send({ message: 'File is required' });
    }
    const buffer = await file.toBuffer();
    const url = await storage.upload(buffer, file.filename);
    return reply.send({ url });
  });
};
