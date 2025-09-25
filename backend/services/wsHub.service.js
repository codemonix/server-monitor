import { WebSocketServer } from 'ws';
import url from 'url';
import { authAgentJwt } from '../middlewares/authAgent.middleware.js';
import MetricPoint from '../models/MetricPoint.model.js';
import logger from '../utils/logger.js';

const clientsByServerId = new Map(); // ServerId -> WebSocket[]

export function initWsHub(httpServer) {
    const wss = new WebSocketServer({ server: httpServer, path: '/ws/metrics' });
    wss.on('connection', async ( ws, req ) => {
        try {
            const { query } = url.parse(req.url, true);
            if (query.token) {
                const agent = await authAgentJwt(query.token);
                ws.isAgent = true;
                ws.agentId = String(agent._id);
                ws.on('message', async (message) => {
                    try {
                        const p = JSON.parse(message.toString());
                        const point = new MetricPoint({ agent: agent._id, ts: p.ts || Date.now(), ...p });
                        await point.save();
                        const watchers = clientsByServerId.get(ws.agentId);
                        if (watchers) {
                            const json = JSON.stringify({ ts: point.ts, cpu: point.cpu, memUsed: point.memUsed,
                                memTotal: point.memTotal, rx: point.rx, tx: point.tx, diskUsage: point.diskUsed,
                                diskTotal: point.diskTotal, load1: point.load1, load5: point.load5, load15: point.load15 });
                        for ( const watcher of watchers) {
                            try {
                                watcher.send(json)
                            } catch (error) {
                                logger("cannot send data to watchers:", error.message);
                            }
                        }
                        }
                    } catch (error) {
                        logger("Error processing WebSocket message:", error.message);
                    }
                })
            } else if (query.serverId) {
                //Browser watcher side
                const sid = String(query.serverId);
                ws.isWatcher = true;
                ws.serverId = sid;
                if ( !clientsByServerId.has(sid) ) {
                    clientsByServerId.set(sid, new Set());
                }
                clientsByServerId.get(sid).add(ws);
                ws.on('close', () => clientsByServerId.get(sid)?.delete(ws));
            } else {
                ws.close();
            }
        } catch (error) {
            logger("WebSocket connection error:", error.message);
            try {
                ws.close();
            } catch {          }
        }
    })
}