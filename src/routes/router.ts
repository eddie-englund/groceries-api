import { FastifyInstance } from 'fastify';
import { LoginRouter } from './auth/login/login-controller';
import { CreateUserRouter } from './users/create-user/create-user-controller';
const prefix = { prefix: '/api' };

export const registerRoutes = (app: FastifyInstance): void => {
  app.register(LoginRouter, prefix);
  app.register(CreateUserRouter, { prefix: prefix.prefix + '/admin' });
};
