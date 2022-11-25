declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      CORS_ORIGINS: string | undefined;
      MONGODB_URI: string;
      MONGODB_NAME: string;
      JWT_SESSION_SECRET: string;
      JWT_REFRESH_SECRET: string;
      APP_PORT: string;
      APP_ADMIN_USERNAME: string;
      APP_ADMIN_PASSWORD: string;
    }
  }
}

export {};
