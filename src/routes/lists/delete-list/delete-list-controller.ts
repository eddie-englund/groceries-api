import {
  MsgStatusResponses,
  StatusResponses,
  ZodDefaultResponse,
  ZodDefaultResponseT,
} from '@util/zod-response';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import * as TE from 'fp-ts/lib/TaskEither';
import { getCollections } from '@db/db';
import { logger } from '@index';
import { pipe } from 'fp-ts/function';
import { validateSession } from '@util/validate-session';
import { DeleteListSchema } from './delete-list-schema';
import { UserNotFoundError } from '@routes/auth/login/login-controller';

export class FailedToUpdateUserError extends Error {
  public constructor(err: unknown) {
    super(`Failed to update user, got error: ${JSON.stringify(err)}`);
  }
}

export const DeleteListRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/delete',
    schema: {
      body: DeleteListSchema,
      response: {
        200: ZodDefaultResponse,
        400: ZodDefaultResponse,
      },
    },
    preHandler: (req, reply) => validateSession(req, reply),
    handler: async (req, reply) => {
      await pipe(
        TE.tryCatch(
          async () =>
            await getCollections().users?.findOneAndUpdate(
              { email: req.user.email },
              {
                $pull: { lists: { id: req.body.id } },
              },
              {
                returnDocument: 'after',
              },
            ),
          (reason) => new UserNotFoundError(req.user.username, reason),
        ),
        TE.chainW((res) => {
          if (res?.ok === 0 || !res?.ok) return TE.left(new FailedToUpdateUserError(res));
          else return TE.right(res?.value);
        }),
        TE.mapLeft((left) => {
          logger.error(left);
          return reply.status(400).send({
            msg: MsgStatusResponses.Enum['Bad request'],
            status: StatusResponses.Enum.Failure,
            statusCode: 500,
          } as ZodDefaultResponseT);
        }),
        TE.map(() =>
          reply.status(200).send({
            msg: 'Success, deleted list.',
            status: StatusResponses.Enum.Success,
            statusCode: 200,
          } as ZodDefaultResponseT),
        ),
      )();
    },
  });
};
