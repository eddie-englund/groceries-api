import { FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify';
import * as TE from 'fp-ts/TaskEither';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as E from 'fp-ts/Either';
import jwt from 'jsonwebtoken';
import { JwtUser } from '@@types/fastify';
import { z } from 'zod';
import { logger } from '@index';
import { ListItem } from '@routes/lists/create-list/create-list-schema';

export class UserNotAuthenticatedError extends Error {
  public constructor(token: string, reason: any) {
    super(`Token '${token}' is invalid`);
    super.cause = reason;
  }
}
export const JwtSchema = z.object({
  exp: z.number(),
  iat: z.number(),
  user: z.object({
    password: z.string(),
    username: z.string(),
    email: z.string().email(),
    lists: z.array(ListItem),
  }),
});

const validateTokenData = (payload: any) =>
  O.fromEither(
    E.tryCatch(
      () => JwtSchema.parse(payload),
      (reason) => logger.debug(reason),
    ),
  );

const getTokenFromHeader = (header: string): O.Option<string> =>
  O.fromNullable(header.split(' ')[1]);

const validateToken = (token: string): O.Option<JwtUser | string> =>
  O.fromNullable(jwt.verify(token, process.env.JWT_SESSION_SECRET));

export const validateSession = async (request: FastifyRequest, reply: FastifyReply) => {
  const validate = pipe(
    request.headers.authorization,
    O.fromNullable,
    O.chain(flow(getTokenFromHeader)),
    O.chain(flow(validateToken)),
    O.chain(flow(validateTokenData)),
    O.map((res) => (request.jwtPayload = res)),
  );

  await pipe(
    validate,
    TE.fromOption(() => reply.hijack().status(401).send({ msg: 'Invalid session' })),
  )();
};
