import { validateSession } from './../../../util/validate-session';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export const ValidateSessionRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/validate-session',
    handler: async (req, reply) => validateSession(req, reply, false),
  });
};
