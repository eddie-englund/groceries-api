import { FastifyInstance } from 'fastify';
import { LoginRouter } from './auth/login/login-controller';
const prefix = { prefix: '/api' };

export const registerRoutes = (app: FastifyInstance): void => {
  app.register(LoginRouter, prefix);
};
