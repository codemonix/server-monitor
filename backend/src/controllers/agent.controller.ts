
import crypto from 'crypto';
import Agent from '../models/Agent.model.js';
import { getAgentsList, delAgent, refreshSession } from '../services/agent.service.js';
import { agentJwtService } from '../services/jwt.service.js';
import { verifyEnrollmentToken, generateEnrollToken, getEnrollmentTokensList } from '../services/enrollment.service.js';
import logger from '../utils/logger.js';
import { removeAgent, getAgent } from '../services/ws/wsRegistry.js';

/** 
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @returns { token: string }
 */

export async function createEnrollmentToken(req, res) {
    try {
        const ttlMin = Number(process.env.ENROLLMENT_TTL_MIN || 30);
        const enrollment = await generateEnrollToken(req.user.sub, ttlMin);
        logger.debug("agent.controller.js -> Created enrollment token:", {enrollment});
        return res.json({ token: enrollment.token });
    } catch (error) {
        logger.error("agent.controller.js -> Error creating enrollment token:", {error: error.message});
        return res.status(500).json({ error: "internal server error" });
    }
}




export async function enrollAgent(req, res) {
    try {
        const { token, name, host, ip, os, arch, version, tags = [], cpuModel } = req.body;
        const enrollment = await verifyEnrollmentToken(token);
        if (!enrollment) {
            logger.debug("agent.controller.js -> Invalid enrollment token");
            return res.status(400).json({ error: 'invalid enrollment token' });
        }
        const agent = await Agent.create({
            name: name || host,
            host,
            ip,
            os,
            arch,
            version,
            tags,
            status: 'offline',
            cpuModel,
        });
        logger.debug("agent.controller.js -> Agent enrolled successfully:", {agent});
        logger.info("agent.controller.js -> Generating agent secret...");
        const { accessToken, refreshToken } = await agentJwtService.issueToken(agent);
        logger.info("agent.controller.js -> Agent secret generated");
        res.status(201).json({ agentId: agent._id, accessToken, refreshToken });
    } catch (error) {
        logger.error("agent.controller.js -> Error enrolling agent:", {error: error.message});
        return res.status(500).json({ error: "Enrollment failed" });
    }
}

export async function refreshAgentToken(req, res) {
    try {
        const  authHeader  = req.headers['authorization'];
        const refreshToken = authHeader ? authHeader.split(' ')[1] : null;
        logger.debug("agent.controller.js -> refreshAgentToken -> refreshToken:", {refreshToken})
        if (!refreshToken) {
            logger.info("agent.controller.js -> Refresh token required");
            return res.status(400).json({ error: 'refresh token required' });
        }
        const result = await refreshSession(refreshToken);
        
        if (!result) {
            return res.status(403).json({ error: 'invalid refresh token' });
        }
        
        logger.debug("agent.controller.js -> Refreshed agent newTokens and config:", {result});
        res.json(result);
    } catch (error) {
        logger.error("agent.controller.js -> Error refreshing agent token:", {error: error.message});
        return res.status(500).json({ error: "token refresh failed" });
    }
}

export async function heartbeat(req, res) {
    try {
        const agent = req.agent;
        agent.lastSeenAt = new Date();
        agent.status = 'online';
        await agent.save();
        logger.debug("agent.controller.js -> Heartbeat received from agentId:", {agentId: agent._id});
        return res.json({ status: 'ok' });
    } catch (error) {
        logger.error("agent.controller.js -> Error processing heartbeat:", {error: error.message});
        res.status(500).json({ error: "Heartbeat failed" });
    }
}

export async function getAgents(req, res) {
    try {
        const agents = await getAgentsList();
        logger.debug("agent.controller.js -> getAgents -> agents:", {agents} );
        return res.json(agents);
    } catch (err) {
        logger.error("agent.controller.js -> getAgents -> failed to load agents:", {error: err.message});
        res.status(500).json({ error: "loading agents failed."});
    }
}

export async function deleteAgent(req, res) {
    const agentId = req.params.id;
    logger.debug("agent.controller.js -> deleteAgent -> agentId:", {agentId} );
    try {
        await delAgent(agentId);
        const ws = getAgent(agentId);
        if ( ws ) ws.close( 4003, "Agent deleted");
        removeAgent(agentId);
        logger.info("agent.controller.js -> Agent deleted successfully , DB % WS");
        res.status(200).json({ message: "Agent and related metrics deleted successfully" });
    } catch (err) {
        logger.error("agent.controller.js -> failed to delete agent")
        res.status(500).json({ error: err.message });
    }
}

export async function  getEnrollmentTokens(req, res) {
    try {
        const enrollmentTokens = await getEnrollmentTokensList();
        logger.info("Enrollment token generated successfully");
        return res.json(enrollmentTokens);
    } catch (error) {
        logger.error("agent.controller.js -> getEnrollmentTokens -> failed to load enrollment tokens:", {error: error.message});
        res.status(500).json({ error: "loading enrollment tokens failed."});
    }
}