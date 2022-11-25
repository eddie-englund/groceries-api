import { StatusResponses, MsgStatusResponses, ZodDefaultResponse, ZodDefaultResponseT } from '@util/zod-response';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { Do } from 'fp-ts-contrib/lib/Do';
import { createUserSchema } from './create-user-schema';
import * as TE from 'fp-ts/lib/TaskEither';
import argon2 from 'argon2';
import { logger } from '@index';
import { getCollections } from '@db/db';
import { pipe } from 'fp-ts/lib/function';
import { validateAdmin } from '@util/validate-admin';
import { ZodError } from 'zod';

export const CreateUserRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/user/create',
    schema: {
      body: createUserSchema,
      response: {
        201: ZodDefaultResponse,
        400: ZodDefaultResponse || ZodError<ZodDefaultResponseT>,
        500: ZodDefaultResponse || ZodError<ZodDefaultResponseT>,
      },
    },
    handler: async (req, reply) => {
      const user = Do(TE.MonadTask)
        .bind(
          'validAdmin',
          TE.tryCatch(
            async () => await validateAdmin(req.body.adminUsername, req.body.adminPassword),
            (reason) => {
              logger.error(reason);
              return {
                msg: MsgStatusResponses.Enum['Bad request'],
                status: StatusResponses.Enum.Failure,
                statusCode: 400,
              } as ZodDefaultResponseT;
            },
          ),
        )
        .bind(
          'userExist',
          TE.tryCatch(
            async () =>
              await getCollections().users?.findOne({
                email: req.body.email,
              }),
            (reason) => {
              logger.error(reason);
              return {
                msg: MsgStatusResponses.Enum['Bad request'],
                status: StatusResponses.Enum.Failure,
                statusCode: 400,
              } as ZodDefaultResponseT;
            },
          ),
        )
        .bindL('passwordHash', () =>
          TE.tryCatch(
            async () => await argon2.hash(req.body.password),
            (reason) => {
              logger.error(reason);
              return {
                msg: MsgStatusResponses.Enum['Internal server error'],
                status: StatusResponses.Enum.Failure,
                statusCode: 500,
              } as ZodDefaultResponseT;
            },
          ),
        )
        .bindL('user', ({ passwordHash }) =>
          TE.tryCatch(
            async () =>
              await getCollections().users?.insertOne({
                username: req.body.username,
                email: req.body.email,
                password: passwordHash,
                lists: [],
              }),
            (reason) => {
              logger.error(reason);
              return {
                msg: MsgStatusResponses.Enum['Internal server error'],
                status: StatusResponses.Enum.Failure,
                statusCode: 500,
              } as ZodDefaultResponseT;
            },
          ),
        )
        .return((res) => res);

      const result = await pipe(
        user,
        TE.match(
          (left) => left,
          () =>
            ({
              status: StatusResponses.Enum.Success,
              msg: 'Success, created user!',
              statusCode: 201,
            } as ZodDefaultResponseT),
        ),
      )();

      return reply.status(result.statusCode).send(result);
    },
  });
};
