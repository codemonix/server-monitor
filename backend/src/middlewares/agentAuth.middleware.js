import Agent from '../models/agent.model.js';
import logger from '../utils/logger.js';



export async function authenticateAgent(req, res, next) {
    try {
        const token = req.headers['x-api-token'];
        if (!token) {
            return res.status(401).json({ message: "missing x-api-token"});
        }

        const agent = await Agent.findOne({ apiToken: token });
        if (!agent) {
            logger.warn("Invalid api token attempt");
            return res.status(401).json({ message: "invalid token"});
        }

        res.agent = agent;
        next();
    } catch (error) {
        logger.error("Error authenticating agent:", error.message);
        next(error);
    }
}