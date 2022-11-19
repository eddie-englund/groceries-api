import dotenv from 'dotenv';
import { either } from 'fp-ts';
import { createLogger } from './util/create-logger';
import { initFastify } from './app';
import { retryConnectDb } from './db/db';

dotenv.config();

export const logger = createLogger();

const start = async (): Promise<void> => {
  const db = await retryConnectDb({ uri: process.env.MONGODB_URI, dbName: process.env.MONGODB_NAME });
  if (either.isLeft(db)) {
    logger.error(db);
    process.exit(1);
  };
  const app = initFastify();
  if (either.isLeft(app)) process.exit(1);
};

start().catch((e) => console.error(e));
