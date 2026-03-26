import type { FastifyInstance } from 'fastify';
import type { AdminMeResponse } from '../../types/admin.types';

export const registerAdminMeRoute = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/me', async (request, reply) => {
    const u = request.adminUser;
    if (!u) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }
    if (u.role === 'superadmin') {
      return { role: u.role, email: u.email } satisfies AdminMeResponse;
    }
    return { role: u.role, telegramUserId: u.telegramUserId } satisfies AdminMeResponse;
  });
};
