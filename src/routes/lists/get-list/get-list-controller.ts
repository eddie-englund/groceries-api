import { StatusResponses } from '@util/zod-response';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import * as TE from 'fp-ts/lib/TaskEither';
import { getCollections } from '@db/db';
import { logger } from '@index';
import { pipe } from 'fp-ts/function';
import { validateSession } from '@util/validate-session';
import { GetListResponseSchema, GetListSchema } from './get-list-schema';
import { UserNotFoundError } from '@routes/auth/login/login-controller';

export class ListNotFoundError extends Error {
  public constructor(listId: string, user: string) {
    super(`Could not find list with id ${listId} on user ${user}`);
  }
}

export const GetListRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/get',
    schema: {
      querystring: GetListSchema,
      response: {
        200: GetListResponseSchema,
      },
    },
    preHandler: (req, reply) => validateSession(req, reply),
    handler: async (req, reply) => {
      const username = req.query.username ?? req.user.username;
      await pipe(
        TE.Do,
        TE.bindW('dbUser', () =>
          TE.tryCatch(
            async () => await getCollections().users?.findOne({ username }),
            (reason) => new UserNotFoundError(username, reason),
          ),
        ),
        TE.bindW('user', ({ dbUser }) =>
          TE.fromNullable(new UserNotFoundError(username, 'unkown'))(dbUser),
        ),
        TE.bindW('list', ({ user }) =>
          TE.fromNullable(new ListNotFoundError(req.query.id, user?.username))(
            user?.lists.find((list) => list.id === req.query.id),
          ),
        ),
        TE.map(({ list }) =>
          reply.status(200).send({
            data: list,
            status: StatusResponses.Enum.Success,
            statusCode: 200,
            msg: 'Here ya go!',
          }),
        ),
        TE.mapLeft((err) => {
          logger.warn(`Failed to get list got err ${err}`);
          return reply.status(400).send({
            status: StatusResponses.Enum.Failure,
            statusCode: 400,
            msg: err.message,
            data: undefined,
          });
        }),
      )();
    },
  });
};
