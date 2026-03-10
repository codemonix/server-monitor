import { WebSocketServer } from "ws";
import url from 'url';
import { handleConnection } from "./connectionHandler.js";
import logger from '../../utils/logger.js';


export function initWsHub(server) {
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (req, socket, head) => {
        logger.info("wsHub.service.js -> incomming req.")
        const { pathname } = url.parse(req.url);
        // logger("wsHub.service.js -> pathname:", pathname)
        if ( pathname === '/ws' ) {
            logger.debug("pathname correct");
            wss.handleUpgrade(req, socket, head, (ws) => {
                logger.debug("wsHub.service.js -> upgrade handled, emitting connection");
                wss.emit('connection', ws, req);
            });
        } else {
            logger.debug("pathname incorrect");
            socket.destroy();
        }
    });

    wss.on('connection', (ws, req) => {
        logger.info("wsHub.service.js -> on connection called.");
        ws.isAuthenticated = false;
        const authTimer = setTimeout(() => {
            if (!ws.isAuthenticated) {
                console.debug("wsHub.service.js -> close timer fired, **** CLOSING CONNECTION ****", {date: Date.now()});
                ws.close(4001, "Authentication timeout");
            };
        }, 10000);

        ws.clearAuthTimer = () => {
            logger.debug("wsHub.service.js -> clearAuthTimer called.");
            clearTimeout(authTimer);
        }

        handleConnection(ws, req);

    });

    logger.info('✅ WebSocket Hub initialized at /ws');
}