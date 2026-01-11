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


    console.log("connectionHandler.js -> ws isAuthenticated:", ws.isAuthenticated);
    
    
    try {
        ws.on('message', async (data) => {
            const msg = JSON.parse(data);
            console.log("connectionHandler.js -> received message:", msg);
            logger("connectionHandler.js -> received message: type, role:", msg.type, msg.role)

            if (msg.type === 'auth' && !ws.isAuthenticated) {
                console.log("connectionHandler.js -> handling auth message");
                ws.clearAuthTimer();
                try {
                    const payload = await authenticate(ws, msg.token, msg.role);
                    console.log("connectionHandler.js -> auth payload:", payload);
                    role = payload.role;
                    id = payload.id;
                    
                    if ( role === 'agent') {
                        addAgent(id, ws);
                        ws.isAuthenticated = true;
                    } else if ( role === 'user' ) {
                        console.log("connectionHandler.js -> adding to dashbards lost", ws.id)
                        addDashboard(ws);
                        ws.isAuthenticated = true;
                    } else throw new Error("Unknown role");

                    ws.send(JSON.stringify({ type: 'auth_success', role }));
                    logger(`✅ WebSocket authenticated: role=${role}, id=${id}`);
                } catch (error) {
                    logger("❌ WebSocket auth failed:", error.message);
                    ws.send(JSON.stringify({ type: 'auth_failed', reason: 'Invalid token' }));
                    ws.close(4001, "Unauthorized");
                }
                console.log("connectionHandler.js -> auth handled -> ws.isAuthenticated:", ws.isAuthenticated);
                return;
            }

            // reject unauthenricated message
            if (!ws.isAuthenticated) return;

            // handle agent messages
            logger("connectionHandler.js -> handling agent message -> ws.isAuthenticated:", ws.isAuthenticated );
            if ( role === 'agent' && msg.type === 'metrics' && ws.isAuthenticated ) {
                logger("connectionHandler.js -> handling agent message = ", msg);
                handleAgentMessage(id, msg);
            }


        })
        // const role = url.parse(req)
        // logger("connectionHandler.js -> Incomming request for role:", role);
        // if (!role) return ws.close(1008, "Unauthorized");
        
        // if (role === 'agent') {
        //     logger("connectionHandler.js -> handling agent connection...")
        //     const { agentRole, agentId } = authenticate(req);
        //     if ( !agentId ) {
        //         logger("❌ closing unauthenticated connection");
        //         ws.close(1008, "Unauthorized");
        //     }
            
        //     addAgent(agentId, ws);
        //     logger(`🟢 Agent connected: ${agentId}`);
        //     ws.on('message', (msg) => {
        //         const data = JSON.parse(msg);
        //         if (data.type === 'ping') {
        //             ws.send(JSON.stringify({ type: 'pong', ts: Date.now()}));
        //         }
        //         handleAgentMessage(agentId, msg)
        //     });
        //     ws.on('close', () => {
        //         removeAgent(agentId);
        //         logger(`🔴 Agent disconnected: ${agentId}`);
        //     })
        // } else if (role === "dashboard") {
        //     logger("connectionHandler.js -> handling dashboard connection...")
        //     const { dashboardRole, dashboardId } = authenticate(req);
        //     if (dashboardId) {
        //         addDashboard(ws);
        //         logger("Dashboard connected");
        //     }

        //     ws.on('close', () => {
        //         removeDashboard(ws);
        //         logger("Dashboard disconnected");
        //     })
        //     ws.on('message', (msg) => {
        //         const data = JSON.parse(msg);
        //         if (data.type === 'ping') {
        //             ws.send(JSON.stringify({ type: 'pong', ts: Date.now()}));
        //         }
        //     })
        // }
        // logger("End of connection handler!")
    } catch (error) {
        logger("❌ WebSocket auth failed:", error.message);
        ws.close(1008, "Unauthorized");
    }
}