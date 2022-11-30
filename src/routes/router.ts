import { FastifyInstance } from 'fastify';
import { LoginRouter } from './auth/login/login-controller';
import { CreatelistRouter } from './lists/create-list/create-list-controller';
import { CreateUserRouter } from './users/create-user/create-user-controller';
const prefix = { prefix: '/api' };

export const registerRoutes = (app: FastifyInstance): void => {
  app.register(LoginRouter, prefix);
  app.register(CreatelistRouter, { prefix: prefix.prefix + '/list' });
  app.register(CreateUserRouter, { prefix: prefix.prefix + '/admin' });
};
