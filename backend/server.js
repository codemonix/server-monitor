import app from './app.js';
import logger from './utils/logger.js';
import connectDB from './config/db.config.js';
import http from 'http';
import { initWsHub } from './services/wsHub.service.js';

connectDB();

const server = http.createServer(app);
initWsHub(server);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    logger(`API + WS running on: ${PORT}`);
});

export default server;

