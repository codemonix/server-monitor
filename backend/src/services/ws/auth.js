import { agentJwtService, verifyAccess } from "../jwt.service.js";
import logger from '../../utils/logger.js';


export async function authenticate(ws, token, role) {
    // logger("auth.js -> authenticate -> token, role:", token, role);

    if ( role === 'agent') {
        const payload = await agentJwtService.verifyAccess(token);
        logger("auth.js -> authenticate[agent] -> payload;", payload);
        return { role: payload.typ, id: payload.sub };
    }

    if ( role === 'dashboard' ) {
        const payload = verifyAccess(token);
        // logger("auth.js -> authenticate[dashboard] -> payload:", payload);
        return { role: payload.typ, id: payload.sub };
    }

    // const authHeader = req.headers['authorization'];
    // logger("auth.js -> authenticate - authHeader:", authHeader);
    // if (!authHeader) throw new Error("Missing Authorization header");

    // const token = authHeader.split(' ')[1];
    // // const role = req.headers['x-role'];
    // // const id = req.headers['x-agent-id'];
    // logger("auth.js -> authenticate -> agent -> token role id", token, req.role);

    // if ( req.role === 'agent' ) {
    //     const payload = agentJwtService.verifyAccess(token);
    //     logger("auth.js -> authenticate[agent] -> payload;", payload);
    //     if (payload.typ === req.role) {
    //         return { agentRole: payload.typ, agentId: payload.sub }
    //     } else {
    //         logger("auth,js -> authenticate: agent authenitcation failed");
    //         throw new Error("agent missmatch");
    //     }
    // } else if ( req.role === 'dashboard' ) {
    //     logger("auth.js -> authenticate[dashboard] -> token role:", token, role)
    //     const payload = verifyAccess(token);
    //     logger("auth.js -> authenticate[dashboard] -> payload:", payload);
    //     return { dashboardRole: payload.typ, dashboardId: payload.sub };
    // } else {
    //     throw new Error("Unkmown role");
    // }
}