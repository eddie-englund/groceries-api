import { logger } from '@index';

class MissingEnvVariablesError extends Error {
  public constructor(stack: string[]) {
    super(`Missing environment variables: ${stack}`);
  }
}

const EnvVariables = [
  'NODE_ENV',
  'APP_CORS_ORIGINS',
  'MONGODB_URI',
  'MONGODB_NAME',
  'JWT_SESSION_SECRET',
  'JWT_REFRESH_SECRET',
  'APP_PORT',
  'APP_ADMIN_USERNAME',
  'APP_ADMIN_PASSWORD',
];

export const validateEnv = () => {
  const missingVariables: string[] = [];

  EnvVariables.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(process.env, key))
      missingVariables.push(key);
  });

  if (!missingVariables.length) return;
  logger.error(new MissingEnvVariablesError(missingVariables));
  process.exit(1);
};
