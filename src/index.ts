import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { loadConfig } from './config';
import { ServiceError } from './lib/service-error';
import { registerAuthAdmin, verifyAdminAuth } from './plugins/auth-admin';
import { buildVerifyTelegramAuth } from './plugins/auth-telegram';
import { registerCors } from './plugins/cors';
import { registerAdminAuthRoutes } from './routes/admin/auth';
import { registerAdminCategoriesRoutes } from './routes/admin/categories';
import { registerAdminOrdersRoutes } from './routes/admin/orders';
import { registerAdminProductsRoutes } from './routes/admin/products';
import { registerAdminSubcategoriesRoutes } from './routes/admin/subcategories';
import { registerAdminUploadRoutes } from './routes/admin/upload';
import { registerApiCategoriesRoutes } from './routes/api/categories';
import { registerApiDeliveryRoutes } from './routes/api/delivery';
import { registerApiOrdersRoutes } from './routes/api/orders';
import { registerApiPaymentRoutes } from './routes/api/payment';
import { registerApiProductsRoutes } from './routes/api/products';
import { registerApiSubcategoriesRoutes } from './routes/api/subcategories';

const main = async (): Promise<void> => {
  const config = loadConfig();
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  const fastify = Fastify({ logger: true });

  await registerCors(fastify, config);
  await registerAuthAdmin(fastify, config);
  await fastify.register(multipart);

  const verifyTelegram = buildVerifyTelegramAuth(config);

  await fastify.register(
    async (f) => {
      f.addHook('preHandler', verifyTelegram);
      await f.register(registerApiCategoriesRoutes);
      await f.register(registerApiProductsRoutes);
      await f.register(registerApiSubcategoriesRoutes);
      await f.register(registerApiDeliveryRoutes);
      await f.register(registerApiPaymentRoutes);
      await f.register(registerApiOrdersRoutes);
    },
    { prefix: '/api' },
  );

  await fastify.register(async (f) => {
    await registerAdminAuthRoutes(f);
  }, { prefix: '/admin' });

  await fastify.register(
    async (f) => {
      f.addHook('preHandler', verifyAdminAuth);
      await f.register(registerAdminProductsRoutes);
      await f.register(registerAdminSubcategoriesRoutes);
      await f.register(registerAdminCategoriesRoutes);
      await f.register(registerAdminOrdersRoutes);
      await registerAdminUploadRoutes(f, config);
    },
    { prefix: '/admin' },
  );

  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.flatten(),
      });
    }
    if (error instanceof ServiceError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    if (error.name === 'CastError') {
      return reply.status(404).send({ message: 'Not found' });
    }
    const mongoErr = error as unknown as { code?: number };
    if (mongoErr.code === 11000) {
      return reply.status(409).send({ message: 'Already exists' });
    }
    request.log.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  });

  await fastify.listen({ host: '0.0.0.0', port: config.PORT });
};

void main();
