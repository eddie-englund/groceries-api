import dotenv from 'dotenv';
import { createLogger } from './util/create-logger';
import { initFastify } from './app';
import { retryConnectDb } from './db/db';
import { validateEnv } from '@util/validate-env';
import { pipe } from 'fp-ts/lib/function';
import { mapLeft } from 'fp-ts/Either';
import * as E from 'fp-ts/Either';

dotenv.config();

export const logger = createLogger();

const start = async (): Promise<void> => {
  validateEnv();

  const db = await retryConnectDb({
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_NAME,
  });
  const app = initFastify();

  pipe(
    E.Do,
    E.bind('db', () => db),
    E.bind('app', () => app),
    mapLeft((err) => {
      logger.error(err);
      process.exit(1);
    }),
  );
};

start().catch((e) => console.error(e));
