
import { createLogger, format, transports } from 'winston';
import path from 'path';

const devMode = process.env.NODE_ENV !== 'production';

// Extract caller file:line info
function getCaller() {
  const stack = new Error().stack.split('\n');
  // Stack line 4 usually contains the caller
  const callerLine = stack[4] || '';
  const match = callerLine.match(/\((.*):(\d+):(\d+)\)/) || callerLine.match(/at (.*):(\d+):(\d+)/);
  if (match) {
    return `${path.relative(process.cwd(), match[1])}:${match[2]}`;
  }
  return 'unknown';
}

const logger = createLogger({
  level: devMode ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf((info) => {
      const caller = devMode ? `(${getCaller()})` : '';
      const message = info.stack || info.message;
      return `[${info.timestamp}] [${info.level.toUpperCase()}] ${caller} ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: devMode
        ? format.combine(format.colorize(), format.simple())
        : format.simple(),
    }),
    new transports.File({ filename: 'logs/app.log' }),
  ],
});

// Helper functions for convenience
logger.debug = (msg) => logger.log({ level: 'debug', message: msg });
logger.info = (msg) => logger.log({ level: 'info', message: msg });
logger.warn = (msg) => logger.log({ level: 'warn', message: msg });
logger.error = (err) => {
  if (err instanceof Error) {
    logger.log({ level: 'error', message: err.stack });
  } else {
    logger.log({ level: 'error', message: err });
  }
};

export default logger;
