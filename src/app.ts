import fastify, { FastifyInstance } from 'fastify';
import { either } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';
import helmet from '@fastify/helmet';
import { logger } from './index';

export const initFastify = (): Either<Error, FastifyInstance> => {
  const app = fastify();
  app.register(helmet)

  try {
    app.listen({
      port: parseInt(process.env.APP_PORT),
      host: '0.0.0.0',
    });
    logger.info(`Listening to port ${process.env.APP_PORT}`);

    return either.right(app);
  } catch (e: any) {
    return either.left(e);
  }
};
