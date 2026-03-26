import jwt from '@fastify/jwt';
import type { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import type { Config } from '../config';
import { normalizeAdminJwtPayload, isSuperAdminPayload } from '../lib/admin-jwt';

export const registerAuthAdmin = async (fastify: FastifyInstance, config: Config): Promise<void> => {
  await fastify.register(jwt, {
    secret: config.JWT_SECRET,
    sign: { expiresIn: config.JWT_EXPIRES_IN },
  });
};

export const verifyAdminAuth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    await request.jwtVerify();
    const normalized = normalizeAdminJwtPayload(request.user);
    if (!normalized) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }
    request.adminUser = normalized;
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
};

export const verifySuperAdmin = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const p = request.adminUser;
  if (!p || !isSuperAdminPayload(p)) {
    return reply.status(403).send({ message: 'Forbidden' });
  }
};
