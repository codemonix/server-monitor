import dotenv from 'dotenv'

dotenv.config();

export const config = {
    port: process.env.PORT || 4000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/servermonitor',
    jwtSecret: process.env.JWT_SECRET || 'NoJwtSecret123456',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    pollingInterval: parseInt(process.env.POLLIN_INTERVAL_MS || '5000', 10),
    outlineApiUrl: process.env.OUTLINE_API_URL || '',
    outlineApiKey: process.env.OUTLINE_API_KEY || '',
};
