import Agent from "../models/Agent.model.js";
import { verifyAgent } from "../services/jwt.service.js";
import logger from "../utils/logger.js";

export async function authAgentJwt(req, res, next) {
    const authHeader = req.headers['authorization'];
    if ( !authHeader || !authHeader.startsWith('Bearer ') ) {
        logger("authAgent.middleware.js -> Missing or invalid authorization header");
        return res.status(401).json({ error: 'missing or invalid authorization header' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyAgent(token);
        const agent = await Agent.findById(decoded.sub);

        if (!agent) {
            logger("authAgent.middleware.js -> Agent not found");
            return res.status(401).json({ error: 'agent not found' });
        }
        req.agent = agent;
        logger("authAgent.middleware.js -> Agent authenticated successfully:", agent._id);
        next();
    } catch (error) {
        logger("authAgent.middleware.js -> Error during authentication:", error);
        return res.status(401).json({ error: 'invalid or expired token' });
    }
}

