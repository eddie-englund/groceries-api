import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginResponseSchema, loginSchema } from './login-schema';

export const LoginRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      body: loginSchema,
      response: {
        200: loginResponseSchema,
      },
    },
    handler: (req, reply) => {
      reply.send({ msg: 'Success', statusCode: 200, data: { jwt: 'owo' } });
    },
  });
};
