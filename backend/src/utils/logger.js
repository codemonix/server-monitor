import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};


let currentConfig = {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    level: 'info',
    saveToFile: true,
    retentionDays: '14d',
    maxFileSize: '20m'
};

const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: 'HH:mm:ss'}),
    format.printf((info) => {
        const { timestamp, level, message, service, ...meta } = info;
        const cleanMeta = { ...meta };
        delete cleanMeta[Symbol.for('splat')];
        const metaString = Object.keys(meta).length
        ? `\n${JSON.stringify(cleanMeta, null, 2)}`
        : '';
        return `${timestamp} ${level}: ${message}${metaString}`;
    })
);

const fileFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
);

const createConfiguredLogger = (config = currentConfig) => {
    const logTransports = [
        new transports.Console({ format: consoleFormat }),
    ];

    if (config.saveToFile) {
        logTransports.push(
            new DailyRotateFile({
                filename: 'logs/srm-error-%DATE%.log',
                level: 'error',
                format: fileFormat,
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: config.maxFileSize,
                maxFiles: config.retentionDays,
            }),
            new DailyRotateFile({
                filename: 'logs/srm-combined-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                format: fileFormat,
                zippedArchive: true,
                maxSize: config.maxFileSize,
                maxFiles: config.retentionDays,
            })
        );
    }

    return createLogger({
        level: config.level,
        levels,
        defaultMeta: { service: 'srm-api' },
        transports: logTransports,
    });
};

const logger = createConfiguredLogger();

logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

export const updateLoggerSettings = (newConfig) => {
    logger.info("logger.js -> updateLoggerSettings -> updating logging configuration dynamically");
    currentConfig = { ...currentConfig, ...newConfig };

    const { transports: newTransports } = createConfiguredLogger(currentConfig);

    logger.configure({
        level: currentConfig.level,
        transports: newTransports,
    });

    logger.debug("logger.js -> updateLoggerSettings -> logging configuration dynamically updated", {currentConfig})
};

export default logger;


