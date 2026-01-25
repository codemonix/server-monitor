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

}