import winston, { Logger } from 'winston';
import { consoleFormat } from 'winston-console-format';

const appName = 'Groceries';

export const createLogger = (): Logger => {
  let logger = winston.createLogger({
    levels: Object.assign({ fatal: 0, warn: 4, trace: 7 }, winston.config.syslog.levels),
    level: 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.ms(),
      winston.format.label({ label: appName }),
      winston.format.simple(),
      winston.format.padLevels(),
      consoleFormat({
        showMeta: false,
        inspectOptions: {
          depth: Infinity,
          colors: true,
          maxArrayLength: Infinity,
          breakLength: 120,
          compact: Infinity,
        },
      }),
    ),
    defaultMeta: { svc: appName },
  });

  if (process.env.NODE_ENV.toLowerCase() === 'production') {
    logger = winston.createLogger({
      levels: Object.assign(
        { fatal: 0, warn: 4, trace: 7 },
        winston.config.syslog.levels,
      ),
      format: winston.format.combine(
        winston.format.label({ label: appName }),
        winston.format.json(),
      ),
      defaultMeta: { svc: appName },
    });
  }

  logger.add(new winston.transports.Console());

  return logger;
};
