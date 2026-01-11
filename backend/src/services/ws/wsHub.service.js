import { WebSocketServer } from "ws";
import url from 'url';
import { handleConnection } from "./connectionHandler.js";
import logger from '../../utils/logger.js';


export function initWsHub(server) {
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (req, socket, head) => {
        logger("wsHub.service.js -> incomming req.")
        const { pathname } = url.parse(req.url);
        // logger("wsHub.service.js -> pathname:", pathname)
        if ( pathname === '/ws' ) {
            console.log("pathname correct");
            wss.handleUpgrade(req, socket, head, (ws) => {
                console.log("wsHub.service.js -> upgrade handled, emitting connection");
                wss.emit('connection', ws, req);
            });
        } else {
            console.log("pathname incorrect");
            socket.destroy();
        }
    });

    wss.on('connection', (ws, req) => {
        console.log("wsHub.service.js -> on connection called.");
        ws.isAuthenticated = false;
        const authTimer = setTimeout(() => {
            if (!ws.isAuthenticated) {
                console.log("wsHub.service.js -> close timer fired, **** CLOSING CONNECTION ****", Date.now());
                ws.close(4001, "Authentication timeout");
            };
        }, 10000);

        ws.clearAuthTimer = () => {
            console.log("wsHub.service.js -> clearAuthTimer called.");
            clearTimeout(authTimer);
        }

        handleConnection(ws, req);

    });

    console.log('✅ WebSocket Hub initialized at /ws');
}