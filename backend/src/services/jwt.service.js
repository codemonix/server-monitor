import jwt from "jsonwebtoken";
import Agent from "../models/Agent.model.js";
import logger from "../utils/logger.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_do_not_use';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_do_not_use';
const AGENT_SECRET = process.env.JWT_AGENT_SECRET || 'dev_agent_secret_do_not_use';

const ACCESS_TTL = process.env.ACCESS_TTL_MIN || '15m';
const REFRESH_TTL = process.env.REFRESH_TTL_DAYS || '30d';
const AGENT_ACCESS_TTL = process.env.AGENT_ACCESS_TTL_DAYS || '30m';
const AGENT_REFRESH_TTL = process.env.AGENT_REFRESH_TTL_DAYS || '30d';
// const AGENT_REFRESH_SECRET = process.env.JWT_AGENT_REFRESH_SECRET || 'agent_refresh_secret';

export function signAccess(user) {
    return jwt.sign({ sub: user._id, role: user.role, typ: 'user' }, ACCESS_SECRET, { expiresIn: `${process.env.ACCESS_TTL_MIN || 15}m` });
}

export function signRefresh(user) {
    return jwt.sign({ sub: user._id, role: user.role, typ: 'refresh' }, REFRESH_SECRET, { expiresIn: `${process.env.REFRESH_TTL_DAYS || 30}d` });
}

export function verifyAccess(token) {
    return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefresh(token) {
    return jwt.verify(token, REFRESH_SECRET);
}

export function signAgent(agent) {
    return jwt.sign({ sub: agent._id, typ: 'agent' }, AGENT_SECRET, { expiresIn: '7d' });
}

export function verifyAgent(token) {
    return jwt.verify(token, AGENT_SECRET);
}

// new agent token signing with different TTLs
export const agentJwtService = {
    async issueToken(agent) {
        const payload = { sub: agent._id, typ: 'agent' };
        const accessToken = jwt.sign(payload, AGENT_SECRET, { expiresIn: AGENT_ACCESS_TTL });
        const refreshToken = jwt.sign(payload, AGENT_SECRET, { expiresIn: AGENT_REFRESH_TTL });

        await Agent.findByIdAndUpdate(agent._id, { refreshToken });
        return { accessToken, refreshToken };
    },

    async refreshTokens(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, AGENT_SECRET);
            logger("jwt.service.js -> refreshTokens decode:", decoded);
            const agent = await Agent.findById(decoded.sub);
            logger("jwt.services.js -. refreshToken decoded agent:", agent);
            if (!agent) {
                logger("jwt.service.js -> Invalid refresh token");
                return null;
            }

            const payload = { sub: agent._id, typ: 'agent' };
            const newAccess = jwt.sign(payload, AGENT_SECRET, { expiresIn: AGENT_ACCESS_TTL });
            const newRefresh = jwt.sign(payload, AGENT_SECRET, { expiresIn: AGENT_REFRESH_TTL });

            agent.refreshToken = newRefresh;
            await agent.save();
            return { accessToken: newAccess, refreshToken: newRefresh };
        } catch (error) {
            logger("jwt.service.js -> Error refreshing agent tokens:", error.message);
            return null;
        }
    },

    async verifyAccess(token) {
        try {
            const decoded = jwt.verify(token, AGENT_SECRET);
            const agent = await Agent.findById(decoded.sub);
            if (!agent) {
                logger("jwt.service.js -> Invalid access token");
                return null;
            }
            return decoded;
        } catch (error) {
            logger("jwt.service.js -> token verification failed", error.message);
            return null;
        }
    }

}
 