import {
  MsgStatusResponses,
  StatusResponses,
  ZodDefaultResponse,
} from '@util/zod-response';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import * as TE from 'fp-ts/lib/TaskEither';
import { getCollections } from '@db/db';
import { logger } from '@index';
import { pipe } from 'fp-ts/function';
import { validateSession } from '@util/validate-session';
import { UserNotFoundError } from '@routes/auth/login/login-controller';
import { GetUserResponseShema, GetUserSchema } from './get-user-schema';

export class ListNotFoundError extends Error {
  public constructor(listId: string, user: string) {
    super(`Could not find list with id ${listId} on user ${user}`);
  }
}

export const GetUserRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/get',
    schema: {
      querystring: GetUserSchema,
      response: {
        200: GetUserResponseShema,
        400: ZodDefaultResponse,
      },
    },
    preHandler: (req, reply) => validateSession(req, reply),
    handler: async (req, reply) => {
      await pipe(
        TE.Do,
        TE.bind('dbUser', () =>
          TE.tryCatch(
            async () =>
              await getCollections().users?.findOne({ email: req.query.username }),
            (reason) => new UserNotFoundError(req.query.username, reason),
          ),
        ),
        TE.bind('user', ({ dbUser }) =>
          TE.fromNullable(new UserNotFoundError(req.query.username, 'unkown'))(dbUser),
        ),
        TE.mapLeft((left) => {
          logger.error(JSON.stringify(left));
          return reply.status(400).send({
            msg: MsgStatusResponses.Enum['Bad request'],
            status: StatusResponses.Enum.Failure,
            statusCode: 500,
          });
        }),
        TE.map(({ user }) =>
          reply.status(200).send({
            data: { username: user.username, lists: user.lists },
            msg: 'Here ya go!.',
            status: StatusResponses.Enum.Success,
            statusCode: 200,
          }),
        ),
      )();
    },
  });
};
