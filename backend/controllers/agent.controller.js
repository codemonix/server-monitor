// Enrollment + Agent ops

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import EnrollmentToken from '../models/EnrollmentToken.model.js';
import Agent from '../models/Agent.model.js';
import { signAccess, signAgent } from '../services/jwt.service.js';

function randToken(bytes = 24) {
    return crypto.randomBytes(bytes).toString('hex');
}

export async function createEnrollmentToken(req, res) {
    const ttlMin = Number(process.env.ENROLLMENT_TTL_MIN || 30);
    const token = randToken();
    const enrollmentToken = await EnrollmentToken.create({ token, createdBy: req.user.sub, expiresAt: new Date(Date.now() + ttlMin * 60 * 1000) });
    return res.json({ token });
}

export async function enrollAgent(req, res) {
    const { token, host, ip, os, arch, version, name, tags=[] } = req.body;
    const enrollmentToken = await EnrollmentToken.findOne({ token });
    if (!enrollmentToken || enrollmentToken.used || enrollmentToken.expiresAt < new Date()) {
        return res.status(400).json({ error: "Invalid or expired enrollment token" });
    }
    const agentSecret = randToken(32);
    const secretHash = await bcrypt.hash(agentSecret, 10);
    const agent = await Agent.create({ name: name || host, host, ip, os, arch, version, tags, secretHash, status: 'offline' });
    enrollmentToken.used = true;
    await enrollmentToken.save();

    // Persist the **plaintext** secret in memory for HMAC demo TODO: change secret storage

    req.app.locals.agentSecret = req.app.locals.agentSecret || {};
    req.app.locals.agentSecret[String(agent._id)] = agentSecret;

    const agentJwt = signAgent(agent);
    return res.json({ agentId: agent._id, agentSecret, agentJwt });
}

export async function heartbeat(req, res) {
    const { agent } = req;
    agent.lastHeartbeatAt = new Date();
    agent.status = 'online';
    await agent.save();
    return res.json({ ok: true });
}