import crypto from 'crypto';
import Agent from '../../models/agent.model.js';
import logger from '../../utils/logger.js';


export async function listAgents(req, res, next) {
    try {
        const agents = await Agent.find().sort({ createdAt: -1 }).limit(20);
        res.json(agents);
    } catch (error) {
        logger.error("fetching agents list failed:", error.message);
        next(error);
    }
}

export async function rotateAgentToken(req, res, next) {
    try {
        const { id } = req.params;
        const agent = await Agent.findById(id);
        if (!agent) return res.status(404).json({ message: "Agent not found"});

        agent.apiToken = crypto.randomBytes(24).toString('hex');
        await agent.save();
        res.json({ message: "Rotated", apiToken: agent.apiToken });
    } catch (error) {
        logger.error("Rotate agent token failed", error.message);
        next(error);
    }
}

export async function updateAgent(req, res, next) {
    try {
        const { id } = req.params;
        const { name, tags = [], notes } = req.body || {};
        const agent = Agent.findByIdAndUpdate(
            id,
            { $set: { name, tags, notes } },
            { new: true }
        );
        if (!agent) return res.status(404).json({ message: "Agent not found" });
        res.json(agent);
    } catch (error) {
        logger.error("update agent failed:", error.message);
        next(error);
    }
}

export async function deleteAgent(req, res, next) {
    try {
        const { id } = req.params;
        await Agent.findByIdAndDelete(id);
        res.json({ message: "agent deleted"})
    } catch (error) {
        logger.error("failed to delete agent:", error.message);
        next(error);
    }
}
