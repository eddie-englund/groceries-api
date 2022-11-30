import { logger } from '@index';

class MissingEnvVariablesError extends Error {
  public constructor(stack: string[]) {
    super(`Missing environment variables: ${stack}`);
  }
}

const EnvVariables = [
  'NODE_ENV',
  'CORS_ORIGINS',
  'MONGODB_URI',
  'MONGODB_NAME',
  'JWT_SESSION_TOKEN',
  'JWT_REFRESH_TOKEN',
  'APP_PORT',
  'APP_ADMIN_USERNAME',
  'APP_ADMIN_PASSWORD',
];

export const validateEnv = () => {
  const missingVariables: string[] = [];
  const setVariables = Object.values(process.env);

  EnvVariables.forEach((variable) => {
    if (setVariables.includes(variable)) return;
    missingVariables.push(variable);
  });

  if (!missingVariables.length) return;
  logger.error(new MissingEnvVariablesError(missingVariables));

  process.exit(1);
};
