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
import { GetAllUsersSchema } from './get-all-users-schema';
import { z } from 'zod';

export class ListNotFoundError extends Error {
  public constructor(listId: string, user: string) {
    super(`Could not find list with id ${listId} on user ${user}`);
  }
}

export const GetAllUsersRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/all',
    schema: {
      response: {
        200: GetAllUsersSchema,
        400: ZodDefaultResponse,
        500: ZodDefaultResponse,
      },
    },
    preHandler: (req, reply) => validateSession(req, reply),
    handler: async (req, reply) => {
      await pipe(
        TE.Do,
        TE.bind('dbUsers', () =>
          TE.tryCatch(
            async () => await getCollections().users?.find({}),
            (reason) => new Error(`No users found, got error ${reason}`),
          ),
        ),
        TE.bindW('users', ({ dbUsers }) =>
          TE.fromNullable(new Error('No users found'))(dbUsers),
        ),
        TE.bindW('arrayUser', ({ users }) =>
          TE.tryCatch(
            async () => users.toArray(),
            (reason) =>
              new Error(`Failed to transform users to array, got error: ${reason}`),
          ),
        ),
        TE.mapLeft((left) => {
          logger.error(JSON.stringify(left));
          return reply.status(500).send({
            msg: MsgStatusResponses.Enum['Internal server error'],
            status: StatusResponses.Enum.Failure,
            statusCode: 500,
          });
        }),
        TE.map(({ arrayUser }) => {
          logger.debug(
            JSON.stringify({
              data: arrayUser.map((p) => {
                return {
                  username: p.username,
                  lists: p.lists,
                };
              }),
              msg: 'Here ya go!.',
              status: StatusResponses.Enum.Success,
              statusCode: 200,
            }),
          );
          return reply.status(200).send({
            data: arrayUser.map((p) => {
              return {
                username: p.username,
                lists: p.lists,
              };
            }),
            msg: 'Here ya go!.',
            status: StatusResponses.Enum.Success,
            statusCode: 200,
          } as z.infer<typeof GetAllUsersSchema>);
        }),
      )();
    },
  });
};
