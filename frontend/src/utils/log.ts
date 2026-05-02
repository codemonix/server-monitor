const LEVELS: Record<string, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

const isProd = import.meta.env.PROD;

const isDevMode = localStorage.getItem("srm_dev_mode") === "true";

let currentLevel = isProd && !isDevMode ? LEVELS.WARN : LEVELS.DEBUG;

export function setLogLevel(level: string) {
    if (LEVELS[level] !== undefined) currentLevel = LEVELS[level];
    else console.warn(`[Logger] Invalid log level: ${level}`);
}

function formatMessage(level: string, message: string) {
    const timestamp = new Date().toLocaleTimeString();
    return `[${timestamp}] ${level} : ${message}`;
}

export const logger = {
    debug: (message: string, context?: unknown) => {
        if (currentLevel <= LEVELS.DEBUG) {
            if (context !== undefined) {
                console.log(formatMessage("DEBUG", message), context);
            } else {
                console.log(formatMessage("DEBUG", message));
            }
        }
    },
    info: (message: string, context?: unknown) => {
        if (currentLevel <= LEVELS.INFO) {
            if (context !== undefined) {
                console.info(formatMessage("INFO", message), context);
            } else {
                console.info(formatMessage("INFO", message));
            }
        }
    },
    warn: (message: string, context?: unknown) => {
        if (currentLevel <= LEVELS.WARN) {
            if (context !== undefined) {
                console.warn(formatMessage("WARN", message), context);
            } else {
                console.warn(formatMessage("WARN", message));
            }
        }
    },
    error: (message: string, context?: unknown) => {
        if (currentLevel <= LEVELS.ERROR) {
            if (context !== undefined) {
                console.error(formatMessage("ERROR", message), context);
            } else {
                console.error(formatMessage("ERROR", message));
            }
        }
    },
};
