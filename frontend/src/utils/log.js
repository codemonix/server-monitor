
const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
let currentLevel = LEVELS.DEBUG;

export function setLogLevel(level) {
  if (LEVELS[level] !== undefined) currentLevel = LEVELS[level];
  else console.warn(`[Logger] Invalid log level: ${level}`);
}

function getCallerInfo() {
  try {
    const err = new Error();
    const stackLines = err.stack.split('\n').slice(3); // skip logger frames
    const callerLine = stackLines[0] || '';
    const match = callerLine.match(/at (.+) \((.+):(\d+):(\d+)\)/) || stackLines[0].match(/at (.+):(\d+):(\d+)/);
    if (match) {
      if (match.length === 5) {
        const [, func, file, line] = match;
        return `${file}:${line} (${func})`;
      } else if (match.length === 4) {
        const [, file, line] = match;
        return `${file}:${line}`;
      }
    }
  } catch (e) {
    console.error("Error getting caller info:", e);
    return 'unknown';
  }
  return 'unknown';
}

function formatMessage(level, message, context) {
  const timestamp = new Date().toISOString();
  const caller = getCallerInfo();
  const ctx = context ? `[${context}]` : '';
  return `${timestamp} ${level} ${ctx} [${caller}]: ${message}`;
}

export const logger = {
  debug: (message, context) => {
    if (currentLevel <= LEVELS.DEBUG) console.debug(formatMessage('DEBUG', message, context));
  },
  info: (message, context) => {
    if (currentLevel <= LEVELS.INFO) console.info(formatMessage('INFO', message, context));
  },
  warn: (message, context) => {
    if (currentLevel <= LEVELS.WARN) console.warn(formatMessage('WARN', message, context));
  },
  error: (message, context) => {
    if (currentLevel <= LEVELS.ERROR) console.error(formatMessage('ERROR', message, context));
  },
};
