import { logger } from '@index';
import { tryCatch, Either } from 'fp-ts/lib/Either';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { InternalServerError, ZodDefaultResponseT } from './zod-response';

export const SessionToken = { expiresIn: ms('2 days') };

export const RefreshToken = { expiresIn: ms('1 week') };

export const generateToken = (
  payload: string | object = {},
  options: typeof SessionToken | typeof RefreshToken,
  strongSecret: string,
): Either<ZodDefaultResponseT, string> =>
  tryCatch(
    () => jwt.sign({ ...options, data: payload }, strongSecret),
    (e) => {
      logger.error('Failed to create session token', e);
      return InternalServerError;
    },
  );
