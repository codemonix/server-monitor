import jwt from 'jsonwebtoken';
import EnrollmentKey from '../models/enrollmentKey.model.js';
import Agent from '../models/agent.model.js';
import AgentMetrics from '../models/agentMetrics.model.js';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';

export async function registerAgent(req, res, next) {
    try {
        const { enrollmentKey, name, ip, tags } = req.body || {};
        
        const keyDoc = await EnrollmentKey.findOne({ key: enrollmentKey });
        if ( !keyDoc || keyDoc.used || keyDoc.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid or expired enrollment key" });
        }

        const apiToken = crypto.randomBytes(24).toString('hex');

        const agent = await Agent.create({
            name,
            ip,
            apiToken,
            tags: Array.isArray(tags) ? tags : []
        });

        keyDoc.used = true;
        keyDoc.usedAt = new Date();
        await keyDoc.save();

        res.json({ message: "Agent registered", apiToken, agentId: agent,_id });
    } catch (error) {
        logger.error("register agent fails");
        next(error);
    }
}

export async function ingestMetrics(req, res, next) {
    try {
        const { agent } = req;
        const { items } = req.body;
        if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "no items found" });

        const docs = items.map(it => ({ agentId: agent.id, ts: new Date(it.ts), payload: it }));
        await AgentMetrics.insertMany(docs, { ordered: false });
        await Agent.findByIdAndUpdate( agent.id, { lastSeenAt: new Date() });
        res.json({ stored: docs.length });
    } catch (error) {
        logger.error("inset metrics failed:", error.message );
        next(error);
    }
}