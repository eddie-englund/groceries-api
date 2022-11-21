import { getCollections } from '@db/db';
import { logger } from '@index';
import { MsgResponses, ZodDefaultResponse } from '@util/zod-response';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { either } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { tryCatch, chainW } from 'fp-ts/lib/TaskEither';
import { LoginResponseSchema, loginSchema } from './login-schema';
import argon2 from 'argon2';

class UserNotFoundError extends Error {
  public constructor(username: string, reason: unknown) {
    super(`No user found with username '${username}'`);
    super.cause = reason;
  }
}

class InvalidPasswordError extends Error {
  public constructor(username: string, reason: unknown) {
    super(`Invalid password submitted for user '${username}'`);
    super.cause = reason;
  }
}

const validatePw = async (inputPw: string, username: string, hash?: string): Promise<boolean> => {
  if (!hash) return Promise.reject(new InvalidPasswordError(username, 'No hash provided from db'));
  try {
    const verify = await argon2.verify(hash, inputPw);
    if (!verify) Promise.reject(new InvalidPasswordError(username, 'Invalid password'));
    return Promise.resolve(verify);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const LoginRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      body: loginSchema,
      response: {
        200: LoginResponseSchema,
        400: ZodDefaultResponse,
        500: ZodDefaultResponse,
      },
    },
    handler: async (req, reply) => {
      const passwordE = await pipe(
        tryCatch(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          async () => await getCollections().users!.findOne({ username: req.body.username }),
          (reason) => new UserNotFoundError(req.body.username, reason),
        ),
        chainW((res) =>
          tryCatch(
            async () => await validatePw(req.body.username, req.body.password, res?.password),
            (reason) => new InvalidPasswordError(req.body.username, reason),
          ),
        ),
      )();

      if (either.isLeft(passwordE)) {
        logger.debug(passwordE.left);
        return reply.status(400).send({
          status: MsgResponses.enum.Failure,
          msg: 'Invalid credentials, please try agian.',
          statusCode: 400,
        });
      }

      return reply.status(200).send({
        status: MsgResponses.enum.Success,
        msg: 'Success, logged in!',
        statusCode: 200,
        data: { jwt: 'owo' },
      });
    },
  });
};
