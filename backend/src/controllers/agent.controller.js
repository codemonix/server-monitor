
import crypto from 'crypto';
import Agent from '../models/Agent.model.js';
import { getAgentsList, delAgent, refreshSession } from '../services/agent.service.js';
import { agentJwtService } from '../services/jwt.service.js';
import { verifyEnrollmentToken, generateEnrollToken, getEnrollmentTokensList } from '../services/enrollment.service.js';
import logger from '../utils/logger.js';
import { removeAgent, getAgent } from '../services/ws/wsRegistery.js';

function randToken(bytes = 24) {
    return crypto.randomBytes(bytes).toString('hex');
}

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
        logger("agent.controller.js -> Created enrollment token:", enrollment);
        return res.json({ token: enrollment.token });
    } catch (error) {
        logger("agent.controller.js -> Error creating enrollment token:", error.message);
        return res.status(500).json({ error: "internal server error" });
    }
}




export async function enrollAgent(req, res) {
    try {
        const { token, name, host, ip, os, arch, version, tags = [], cpuModel } = req.body;
        const enrollment = await verifyEnrollmentToken(token);
        if (!enrollment) {
            logger("agent.controller.js -> Invalid enrollment token");
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
        logger("agent.controller.js -> Agent enrolled successfully:", agent);
        logger("agent.controller.js -> Generating agent secret...");
        const { accessToken, refreshToken } = await agentJwtService.issueToken(agent);
        logger("agent.controller.js -> Agent secret generated");
        res.status(201).json({ agentId: agent._id, accessToken, refreshToken });
    } catch (error) {
        logger("agent.controller.js -> Error enrolling agent:", error.message);
        return res.status(500).json({ error: "Enrollment failed" });
    }
}

export async function refreshAgentToken(req, res) {
    try {
        const  authHeader  = req.headers['authorization'];
        const refreshToken = authHeader ? authHeader.split(' ')[1] : null;
        logger("agent.controller.js -> refreshAgentToken -> refreshToken:", refreshToken)
        if (!refreshToken) {
            logger("agent.controller.js -> Refresh token required");
            return res.status(400).json({ error: 'refresh token required' });
        }
        // const newTokens = await agentJwtService.refreshTokens(refreshToken);
        const result = await refreshSession(refreshToken);
        
        if (!result) {
            return res.status(403).json({ error: 'invalid refresh token' });
        }
        
        logger("agent.controller.js -> Refreshed agent newTokens and config:", result);
        res.json(result);
    } catch (error) {
        logger("agent.controller.js -> Error refreshing agent token:", error.message);
        return res.status(500).json({ error: "token refresh failed" });
    }
}

export async function heartbeat(req, res) {
    try {
        const agent = req.agent;
        agent.lastSeenAt = new Date();
        agent.status = 'online';
        await agent.save();
        logger("agent.controller.js -> Heartbeat received from agentId:", agent._id);
        return res.json({ status: 'ok' });
    } catch (error) {
        logger("agent.controller.js -> Error processing heartbeat:", error.message);
        res.status(500).json({ error: "Heartbeat failed" });
    }
}

export async function getAgents(req, res) {
    try {
        const agents = await getAgentsList();
        console.log("agent.controller.js -> getAgents -> agents:", agents );
        return res.json(agents);
    } catch (err) {
        logger("agent.controller.js -> getAgents -> failed to load agents:", err.message);
        res.status(500).json({ error: "loading agents failed."});
    }
}

export async function deleteAgent(req, res) {
    const agentId = req.params.id;
    console.log("agent.controller.js -> deleteAgent -> agentId:", agentId );
    try {
        await delAgent(agentId);
        const ws = getAgent(agentId);
        if ( ws ) ws.close( 4003, "Agent deleted");
        removeAgent(agentId);
        logger("agent.controller.js -> Agent deleted successfully , DB % WS");
        res.status(200).json({ message: "Agent and related metrics deleted successfully" });
    } catch (err) {
        logger("agent.controller.js -> failed to delete agent")
        res.status(500).json({ error: err.message });
    }
}

export async function  getEnrollmentTokens(req, res) {
    try {
        const enrollmentTokens = await getEnrollmentTokensList();
        return res.json(enrollmentTokens);
    } catch (error) {
        logger("agent.controller.js -> getEnrollmentTokens -> failed to load enrollment tokens:", error.message);
        res.status(500).json({ error: "loading enrollment tokens failed."});
    }
}