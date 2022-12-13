import { StatusResponses, ZodValidationErrorResponse } from './util/zod-response';
import fastify, { FastifyInstance } from 'fastify';
import { either } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';
import helmet from '@fastify/helmet';
import { logger } from './index';
import {
  ResponseValidationError,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { registerRoutes } from './routes/router';
import cors from '@fastify/cors';
import { z } from 'zod';

export const initFastify = (): Either<Error, FastifyInstance> => {
  const app = fastify();

  app.register(helmet);
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors, { origin: '*' });

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof ResponseValidationError) {
      logger.warn(err);
      return reply.status(400).send({
        error: 'validation',
        details: err.details,
        statusCode: 400,
        msg: 'Input failed validation, please check parameters',
        status: StatusResponses.Enum.Failure,
      } as z.infer<typeof ZodValidationErrorResponse>);
    }
  });

  registerRoutes(app);

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
