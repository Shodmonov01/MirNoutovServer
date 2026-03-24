import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AdminModel } from '../../models/admin.model';

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const registerAdminAuthRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.post('/login', async (request, reply) => {
    const body = loginBodySchema.parse(request.body);
    const admin = await AdminModel.findOne({ email: body.email }).lean().exec();
    if (!admin) {
      return reply.status(401).send({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(body.password, admin.password);
    if (!match) {
      return reply.status(401).send({ message: 'Invalid credentials' });
    }
    const token = await reply.jwtSign({
      adminId: String(admin._id),
      email: admin.email,
    });
    return reply.send({ token });
  });
};
