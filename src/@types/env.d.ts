declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      CORS_ORIGINS: string | undefined;
      MONGODB_URI: string;
      MONGODB_NAME: string;
      JWT_SESSION_SECRET: string;
      JWT_REFRESH_SECRET: string;
      COOKIE_SECRET: string;
      REDIS_URI: string;
      APP_PORT: string;
    }
  }
}

export {};
