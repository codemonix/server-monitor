import mongoose from "mongoose";
import app from './app.js';
import { config } from "./config/index.js";
import logger from "./utils/logger.js";

async function start() {
    try {
        await mongoose.connect( config.mongoUri, { autoIndex: true });
        logger.info('connected to MongoDB ✅');

        const server = app.listen(config.port, () => {
            logger.info(`Server Monitor backend listening on port ${config.port}`);
        });

        // TODO: webSocket should be implemented here

        process.on('SIGINT', async () => {
            console.log('Shutting down ...');
            await mongoose.disconnect();
            server.close(() => process.exit(0));
        });
    } catch (error) {
        logger.error('Failed to start', error);
        process.exit(1);
    }
}

start();