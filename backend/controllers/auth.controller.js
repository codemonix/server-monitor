//For Users

import User from "../models/User.model.js";
import RefreshToken from "../models/RefreshToken.model.js";
import { signAccess, signRefresh, verifyRefresh } from "../services/jwt.service.js";



export async function seedAdmin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        const user = new User({ email, role: 'admin' });
        await user.setPassword(password);
        await user.save();
    }
    return res.json({ ok: true });
}

export async function login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.validatePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const access = signAccess(user);
    const refresh = signRefresh(user);
    const rt = new RefreshToken({ user: user._id, token: refresh, expiresAt: new Date(Date.now() + (Number(process.env.REFRESH_TTL_DAYS || 30) * 864e5))})
    await rt.save();
    res.json({ access, refresh, user: { id: user._id, role: user.role, email: user.email } });
}

export async function refreshToken(req, res) {
    const { refresh } = req.body;
    if (!refresh) return res.status(400).json({ error: " missing refresh" });
    const payload = verifyRefresh(refresh);
    const rec = await RefreshToken.findOne({ token: refresh });
    if (!rec || rec.expiresAt < new Date()) return res.status(401).json({ error: "Invalid or expired refresh token" });
    const user = { _id: payload.sub, role: payload.role || 'viewer' };
    const access = signAccess(user);
    return res.json({ access });
}