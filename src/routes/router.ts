import { FastifyInstance } from 'fastify';
import { LoginRouter } from './auth/login/login-controller';
import { CreatelistRouter } from './lists/create-list/create-list-controller';
import { DeleteListRouter } from './lists/delete-list/delete-list-controller';
import { GetListRouter } from './lists/get-list/get-list-controller';
import { CreateUserRouter } from './users/create-user/create-user-controller';
import { GetUserRouter } from './users/get-user/get-user-controller';
const prefix = { prefix: '/api' };
const listRoutePrefix = { prefix: prefix.prefix + '/list' };
const userRoutePrefix = { prefix: prefix.prefix + '/user' };

export const registerRoutes = (app: FastifyInstance): void => {
  app.register(LoginRouter, prefix);
  app.register(CreatelistRouter, listRoutePrefix);
  app.register(GetListRouter, listRoutePrefix);
  app.register(DeleteListRouter, listRoutePrefix);
  app.register(CreateUserRouter, { prefix: prefix.prefix + '/admin' });
  app.register(GetUserRouter, userRoutePrefix);
};
