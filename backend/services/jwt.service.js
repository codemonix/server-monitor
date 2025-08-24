import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const AGENT_SECRET = process.env.JWT_AGENT_SECRET

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
 