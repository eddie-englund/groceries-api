import {
  MsgStatusResponses,
  StatusResponses,
  ZodDefaultResponse,
  ZodDefaultResponseT,
} from '@util/zod-response';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { CreateListSchema } from './create-list-schema';
import * as TE from 'fp-ts/lib/TaskEither';
import { getCollections } from '@db/db';
import { logger } from '@index';
import { pipe } from 'fp-ts/function';
import { validateSession } from '@util/validate-session';
import crypto from 'crypto';

class CreateListError extends Error {
  public constructor(username: string, reason: any) {
    super(`Failed to create a list for user '${username}' with reason: ${reason}`);
  }
}

export const CreatelistRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/create',
    schema: {
      body: CreateListSchema,
      response: {
        200: ZodDefaultResponse,
      },
    },
    preHandler: (req, reply) => validateSession(req, reply),
    handler: async (req, reply) => {
      logger.debug(`Creating list for user ${req.user.username}`);
      await pipe(
        TE.Do,
        TE.bind('addItem', () =>
          TE.tryCatch(
            async () =>
              await getCollections().users?.findOneAndUpdate(
                { email: req.user.email },
                {
                  $push: {
                    lists: {
                      id: crypto.randomUUID(),
                      createdAt: new Date().toISOString(),
                      name: req.body.name,
                      items: req.body.items.map((item) => {
                        return { ...item, id: crypto.randomUUID() };
                      }),
                    },
                  },
                },
              ),
            (reason) => {
              logger.error(new CreateListError(req.user.username, reason));
              return {
                msg: MsgStatusResponses.Enum['Internal server error'],
                status: StatusResponses.Enum.Failure,
                statusCode: 500,
              } as ZodDefaultResponseT;
            },
          ),
        ),
        TE.map(() =>
          reply.status(200).send({
            msg: `Success, your list ${req.body.name} has been created!`,
            status: StatusResponses.Enum.Success,
            statusCode: 200,
          }),
        ),
        TE.mapLeft((left) => reply.status(left.statusCode).send(left)),
      )();
    },
  });
};
