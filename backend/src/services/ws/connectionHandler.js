import { authenticate } from './auth.js';
import {
    addAgent, removeAgent,
    addDashboard, removeDashboard
} from './wsRegistery.js';
import { handleAgentMessage } from './messageHandler.js';
import logger from '../../utils/logger.js';


export function handleConnection(ws, req) {
    console.log("connectionHandler.js -> new connection:", req.url);
    let role = null;
    let id = null;


    logger.debug("connectionHandler.js -> ws ", {isAuthenticated: ws.isAuthenticated});
    
    
    try {
        ws.on('message', async (data) => {
            const msg = JSON.parse(data);
            logger.info("connectionHandler.js -> handleConnection -> message received");
            logger.debug("connectionHandler.js -> received message: type, role:", msg.type, msg.role)

            if (msg.type === 'auth' && !ws.isAuthenticated) {
                logger.info("connectionHandler.js -> handling auth message");
                ws.clearAuthTimer();
                try {
                    const payload = await authenticate(ws, msg.token, msg.role);
                    // logger.debug("connectionHandler.js -> auth payload:", {payload});
                    role = payload.role;
                    id = payload.id;
                    
                    if ( role === 'agent') {
                        addAgent(id, ws);
                        ws.isAuthenticated = true;
                    } else if ( role === 'user' ) {
                        logger.debug("connectionHandler.js -> adding to dashbards ", ws.id)
                        addDashboard(ws);
                        ws.isAuthenticated = true;
                    } else throw new Error("Unknown role");

                    ws.send(JSON.stringify({ type: 'auth_success', role }));
                    logger.info('✅ WebSocket authenticated:', {role}, {id});
                } catch (error) {
                    logger.error("❌ WebSocket auth failed:", {error: error.message});
                    ws.send(JSON.stringify({ type: 'auth_failed', reason: 'Invalid token' }));
                    ws.close(4001, "Unauthorized");
                }
                logger.info("connectionHandler.js -> auth handled -> ", {"ws.isAuthenticated": ws.isAuthenticated});
                return;
            }

            // reject unauthenricated message
            if (!ws.isAuthenticated) return;

            // handle agent messages
            logger.info("connectionHandler.js -> handling agent message -> ", {"ws.isAuthenticated": ws.isAuthenticated} );
            if ( role === 'agent' && msg.type === 'metrics' && ws.isAuthenticated ) {
                logger.info("connectionHandler.js -> handling agent message");
                handleAgentMessage(id, msg);
            }


        })
    } catch (error) {
        logger.error("❌ WebSocket auth failed:", {error: error.message});
        ws.close(1008, "Unauthorized");
    }
}