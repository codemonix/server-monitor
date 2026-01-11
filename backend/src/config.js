import dotenv from 'dotenv';

dotenv.config();

export default {
    PORT: process.env.PORT || 4000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_AGENT_SECRET: process.env.JWT_AGENT_SECRET,
    ACCESS_TTL_MIN: process.env.ACCESS_TTL_MIN,
    REFRESH_TTL_DAYS: process.env.REFRESH_TTL_DAYS,
    ENROLLMENT_TTL_MIN: process.env.ENROLLMENT_TTL_MIN,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DEBUG_LOG: process.env.DEBUG_LOG,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
}

