import { getCollections } from '@db/db';
import { logger } from '@index';
import {
  StatusResponses,
  ZodDefaultResponse,
  ZodDefaultResponseT,
} from '@util/zod-response';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { tryCatch as TETryCatch } from 'fp-ts/lib/TaskEither';
import { LoginResponseSchema, LoginResponseSchemaT, loginSchema } from './login-schema';
import argon2 from 'argon2';
import { generateToken, RefreshToken, SessionToken } from '@util/generate-jwt';
import { Do } from 'fp-ts-contrib/lib/Do';
import * as TE from 'fp-ts/lib/TaskEither';
import { match } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';

export class UserNotFoundError extends Error {
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

const validatePw = async (
  inputPw: string,
  username: string,
  hash?: string,
): Promise<boolean> => {
  if (!hash)
    return Promise.reject(new InvalidPasswordError(username, 'No hash provided from db'));
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
      const invalidPwMessage = 'Invalid credentials, please try again.';
      const validateLogin = await Do(TE.MonadTask)
        .bind(
          'user',
          TETryCatch(
            async () =>
              await getCollections().users?.findOne({ username: req.body.username }),
            (reason) => {
              logger.debug(new UserNotFoundError(req.body.username, reason));
              return {
                msg: invalidPwMessage,
                status: StatusResponses.Enum.Failure,
                statusCode: 400,
              } as ZodDefaultResponseT;
            },
          ),
        )
        .bindL('validPassword', ({ user }) =>
          TETryCatch(
            async () =>
              await validatePw(req.body.password, req.body.username, user?.password),
            (reason) => {
              logger.debug(reason);
              return {
                msg: invalidPwMessage,
                status: StatusResponses.Enum.Failure,
                statusCode: 400,
              } as ZodDefaultResponseT;
            },
          ),
        )
        .bindL('refreshToken', ({ user }) =>
          TE.fromEither(
            generateToken(
              { user: { ...user, password: 'REDACTED', lists: [] } },
              RefreshToken,
              process.env.JWT_REFRESH_SECRET,
            ),
          ),
        )
        .bindL('sessionToken', ({ user }) =>
          TE.fromEither(
            generateToken(user?.username, SessionToken, process.env.JWT_SESSION_SECRET),
          ),
        )
        .return(({ sessionToken, refreshToken }) => ({
          msg: `Success, you've now logged in!`,
          statusCode: 200,
          status: StatusResponses.Enum.Success,
          data: {
            sessionToken,
            refreshToken,
          },
        }))();

      const status = pipe(
        validateLogin,
        match(
          (left) => left.statusCode,
          (right) => right.statusCode,
        ),
      );

      const result = pipe(
        validateLogin,
        match(
          (left) => left,
          (right) => right as LoginResponseSchemaT,
        ),
      );

      return reply.status(status).send(result);
    },
  });
};
