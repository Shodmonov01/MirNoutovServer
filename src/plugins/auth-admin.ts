import jwt from '@fastify/jwt';
import type { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import type { Config } from '../config';
import type { AdminJwtPayload } from '../types/admin.types';

export const registerAuthAdmin = async (fastify: FastifyInstance, config: Config): Promise<void> => {
  await fastify.register(jwt, {
    secret: config.JWT_SECRET,
    sign: { expiresIn: config.JWT_EXPIRES_IN },
  });
};

export const verifyAdminAuth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    await request.jwtVerify();
    const payload = request.user as AdminJwtPayload;
    request.adminUser = payload;
  } catch {
    await reply.status(401).send({ message: 'Unauthorized' });
  }
};
