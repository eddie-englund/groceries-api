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
import { EditListSchema } from './edit-list-schema';

export const CreatelistRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/edit',
    schema: {
      body: EditListSchema,
      response: {
        200: ZodDefaultResponse,
      },
    },
    preHandler: (req, reply) => validateSession(req, reply),
    handler: async (req, reply) => {
      logger.debug(`Creating list for user ${req.user.username}`);
      await pipe(
        TE.tryCatch(
          async () =>
            await getCollections().users?.findOneAndUpdate(
              { email: req.user.email, 'lists.id': req.body.listId },
              {
                $set: {
                  name: req.body.name,
                  items: req.body.items,
                },
              },
              { returnDocument: 'after' },
            ),
          (reason) =>
            new Error(
              `Failed to update list ${req.body.listId} on user ${req.user.username}. Got error: ${reason}`,
            ),
        ),
        TE.chainW((res) => {
          if (res?.ok === 0 || !res?.ok) return TE.left(new Error(`Got error ${res}`));
          else return TE.right(res?.value);
        }),
        TE.map(() =>
          reply.status(200).send({
            msg: `Success, your list ${req.body.name} has been updated!`,
            status: StatusResponses.Enum.Success,
            statusCode: 200,
          }),
        ),
        TE.mapLeft((left) => {
          logger.error(left);
          return reply.status(400).send({
            msg: MsgStatusResponses.Enum['Bad request'],
            status: StatusResponses.Enum.Failure,
            statusCode: 400,
          });
        }),
      )();
    },
  });
};
