import { either } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';
import { Collection, Db, MongoClient } from 'mongodb';
import { User } from './models/user-model';
import ms from 'ms';
import { logger } from '../index';

interface Collections {
  users?: Collection<User>;
}

const collections: Collections = {};

interface ConnectionDetails {
  uri: string;
  dbName: string;
}

export const connectDB = async ({ uri, dbName }: ConnectionDetails): Promise<Either<Error, true>> => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db: Db = client.db(dbName);

    collections.users = db.collection<User>('users');

    return either.right(true);
  } catch (e: any) {
    logger.error(e);
    return either.left(e);
  }
};

class RetryConnectError extends Error {
  public constructor(interval: number, retryTimes: number) {
    super(`Failed to connect to db after ${retryTimes} attempts with inveral '${interval}'`);
  }
}

export const retryConnectDb = async (
  details: ConnectionDetails,
  interval: number = ms('10s'),
  retryTimes: number = 5,
): Promise<Either<RetryConnectError, true>> => {
  let attempts = 1;
  const connectionAttempt = async (): Promise<Either<RetryConnectError, true>> => {
    const attempt = await connectDB(details);

    if (either.isLeft(attempt) && attempts !== retryTimes) {
      logger.error(`Failed connection attempt ${attempts}, retrying...`);
      attempts++;
      setTimeout(() => connectionAttempt(), interval);
    }

    if (either.isLeft(attempt) && attempts === retryTimes) {
      logger.error(`Failed to connect after ${attempts} attempts`);
      return either.left(new RetryConnectError(interval, retryTimes));
    } else {
      logger.info(`Connected to database ${details.dbName}`)
      return either.right(true);
    }
  };

  return await connectionAttempt();
};

export const getCollections = (): Collections => collections;
