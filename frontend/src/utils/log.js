
const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

const isProd = import.meta.env.PROD;

const isDevMode = localStorage.getItem('srm_dev_mode') === 'true';

let currentLevel = (isProd && !isDevMode) ? LEVELS.WARN : LEVELS.DEBUG;

export function setLogLevel(level) {
  if (LEVELS[level] !== undefined) currentLevel = LEVELS[level];
  else console.warn(`[Logger] Invalid log level: ${level}`);
}


function formatMessage(level, message) {
  const timestamp = new Date().toLocaleTimeString();
  return `[${timestamp}] ${level} : ${message}`;
}

export const logger = {
  debug: (message, context) => {
    if (currentLevel <= LEVELS.DEBUG) {
      context !== undefined
        ? console.log(formatMessage('DEBUG', message), context)
        : console.log(formatMessage('DEBUG', message));
    }
  },
  info: (message, context) => {
    if (currentLevel <= LEVELS.INFO) {
      context !== undefined
        ? console.info(formatMessage('INFO', message), context)
        : console.info(formatMessage('INFO', message));
    }
  },
  warn: (message, context) => {
    if (currentLevel <= LEVELS.WARN) {
      context !== undefined
        ? console.warn(formatMessage('WARN', message), context)
        : console.warn(formatMessage('WARN', message));
    }
  },
  error: (message, context) => {
    if (currentLevel <= LEVELS.ERROR) {
      context !== undefined
        ? console.error(formatMessage('ERROR', message), context)
        : console.error(formatMessage('ERROR', message));
    }
  },
};
