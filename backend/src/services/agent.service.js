import Agent from '../models/Agent.model.js'
import logger from '../utils/logger.js';
import { deleteMetricsByAgentId } from './metrics.service.js';
import GlobalConfig from '../models/GlobalConfig.model.js';
import { agentJwtService } from './jwt.service.js';



export async function getAgentsList() {
    try {
        const agents = await Agent.find();
        return agents
    } catch (error) {
        console.log("agent.service.js -> getAgentsList -> error:", error.message);
        throw error;
    }
}

export async function delAgent(id) {

    console.log("agent.service.js -> delAgent -> deleting agent and related metrics:", id );

    try {

        await deleteMetricsByAgentId(id);

        const deletedAgents = await Agent.findByIdAndDelete(id);
        if (!deletedAgents) {
            throw new Error("Agent not found");
        }

        return deletedAgents;

    } catch (error) {
        console.log("agent.service.js -> delAgent -> error:", error.message);
        throw error;
    }
}

export async function refreshSession(refreshToken) {
    const newTokens = await agentJwtService.refreshTokens(refreshToken);
    if (!newTokens) return null;
    
    let globalCfg = await GlobalConfig.findOne({ settingsKey: 'default' }).lean();
    const configPayload = {
        pollIntervalMs: globalCfg?.pollingInterval || 5000,
        batchMaxItems: globalCfg?.batchMaxItems || 10,
    };

    return { ...newTokens, config: configPayload };
}