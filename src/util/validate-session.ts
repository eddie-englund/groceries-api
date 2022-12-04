import { FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { logger } from '@index';
import { ListItem } from '@routes/lists/create-list/create-list-schema';
import { Do } from 'fp-ts-contrib/lib/Do';
import * as E from 'fp-ts/lib/Either';
import { UserNotFoundError } from '@routes/auth/login/login-controller';
import { JwtUndefUser } from '@db/models/jwt-model';

export class UserNotAuthenticatedError extends Error {
  public constructor(token: string, reason: any) {
    super(`Token '${token}' is invalid, reason: ${reason}`);
  }
}

class MissingHeaderError extends Error {
  public constructor() {
    super('Header was missing or content of header did not include a bearer token');
  }
}

export const JwtSchema = z.object({
  expiresIn: z.number(),
  iat: z.number(),
  data: z.object({
    user: z.object({
      password: z.string(),
      username: z.string(),
      email: z.string().email(),
      lists: z.array(ListItem),
    }),
  }),
});

const validateTokenData = (
  payload: JwtUndefUser,
): TE.TaskEither<UserNotAuthenticatedError, z.infer<typeof JwtSchema>> =>
  TE.tryCatch(
    async () => await JwtSchema.parseAsync(payload),
    (reason) => new UserNotAuthenticatedError('unkown', reason),
  );

const getTokenFromHeader = (header: string): O.Option<string> =>
  O.fromNullable(header.split(' ')[1]);

const jwtVerify = async (token: string, secret: string): Promise<JwtUndefUser> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      if (!decoded) return reject(decoded);
      if (typeof decoded === 'string') return reject('decoded was a string');
      resolve(decoded);
    });
  });
};

const validateToken = (
  token: string,
): TE.TaskEither<UserNotAuthenticatedError, JwtUndefUser> =>
  TE.tryCatch(
    async () => await jwtVerify(token, process.env.JWT_SESSION_SECRET),
    (reason) => new UserNotAuthenticatedError(token, reason),
  );

export const validateSession = async (req: FastifyRequest, reply: FastifyReply) => {
  const validateE = await Do(TE.MonadTask)
    .bind('header', TE.fromNullable(new MissingHeaderError())(req.headers.authorization))
    .bindL('token', ({ header }) =>
      pipe(
        getTokenFromHeader(header),
        TE.fromOption(() => new MissingHeaderError()),
      ),
    )
    .bindL('jwt', ({ token }) => validateToken(token))
    .doL(({ header }) => TE.right(logger.debug(header)))
    .doL(({ token }) => TE.right(logger.debug(token)))
    .doL(({ jwt }) => TE.right(logger.debug(JSON.stringify(jwt))))
    .bindL('payload', ({ jwt }) => validateTokenData(jwt))
    .bindL('jwtUser', ({ payload }) =>
      pipe(
        payload.data?.user,
        TE.fromNullable(
          new UserNotFoundError('unkown', 'user object is missing from jwt'),
        ),
      ),
    )
    .doL(({ jwtUser }) => TE.right((req.user = jwtUser)))
    .return((res) => res.payload)();

  return await pipe(
    validateE,
    E.match(
      (left) => {
        logger.error(left);
        return reply.status(401).send({ msg: 'Invalid session' });
      },
      () => undefined,
    ),
  );
};
