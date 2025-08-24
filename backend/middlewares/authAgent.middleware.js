import Agent from "../models/Agent.model.js";
import bcrypt from "bcrypt";

import { verifyAgent } from "../services/jwt.service.js";
import { verifyHmac } from "../services/signing.service.js";

export async function authAgentJwt(token) {
    const payload = verifyAgent(token);
    const agent = await Agent.findById(payload.sub);
    if (!agent) throw new Error("Agent not found");
    return agent;
}

export async function authAgentHmac(req, res, next) {
    try {
        const agentId = req.headers['x-agent-id'];
        const signature = req.headers['x-signature'];
        const timestamp = req.headers['x-timestamp'];
        if (!agentId || !signature || !timestamp) return res.status(401).json({ error: 'missing hmac headers' });

        const skew = Math.abs(Date.now() - timestamp );
        if ( skew > (Number(process.env.HMAC_CLOCK_SKEW_SEC || 60) * 1000 ) ) {
            return res.status(401).json({ error: 'stale timestamp' });
        }
        const agent = await Agent.findById(agentId);
        if (!agent) return res.status(401).json({ error: 'agent not found' });

        // Fro demo only
        const secret = req.app.locals.agentSecrets?.[agentId];
        if (!secret) return res.status(401).json({ error: 'agent secret not found' });

        const ok = verifyHmac({ body: req.body, timestamp, signature, secret});
        if (!ok) return res.status(401).json({ error: 'bad signature' });

        req.agent = agent;
        next();
    } catch (error) {
        console.error('Error in authAgentHmac middleware:', error);
        res.status(500).json({ error: 'internal server error' });
    }
}