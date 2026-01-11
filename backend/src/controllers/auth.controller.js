//For Users

import User from "../models/User.model.js";
import RefreshToken from "../models/RefreshToken.model.js";
import { signAccess, signRefresh, verifyRefresh } from "../services/jwt.service.js";
import debugLog from "../utils/logger.js";


const ttl = Number(process.env.ACCESS_TTL_MIN || 15) * 60 ; // in seconds

export async function seedAdmin(req, res) {
    const { email, password } = req.body;
    debugLog('Seeding admin user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
        const user = new User({ email, role: 'admin' });
        await user.setPassword(password);
        await user.save();
    }
    return res.json({ ok: true, user: user });
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @returns {{ access: string, ttl: number, user: { id: string, role: string, email: string } }}
 */

export async function login(req, res) {
    console.log("**********  BODY **********");
    console.log("req -> ",req.body);
    const { email, password } = req.body;
    debugLog('Login attempt for email:', email);
    const user = await User.findOne({ email });
    debugLog('User:', user);
    if (!user || !(await user.validatePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const access = signAccess(user);
    const refresh = signRefresh(user);

    // Save refresh token in DB
    const rt = new RefreshToken({ 
        user: user._id, 
        token: refresh, 
        expiresAt: new Date(Date.now() + (Number(process.env.REFRESH_TTL_DAYS || 30) * 864e5))})
    await rt.save();

    debugLog('User logged in:', email);

    // HttpOnly cookie for refresh token
    res.cookie('refreshToken', refresh, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Strict', 
        maxAge: Number(process.env.REFRESH_TTL_DAYS || 30) * 864e5,
    });

    res.json({ access, 
        ttl, 
        user: { id: user._id, role: user.role, email: user.email },
    });
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @returns { (access: string, ttl: number, user: { id: string, role: string, email: string }) }
 */

export async function refreshToken(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ error: 'Missing Refresh token'});

        // look up token in db
        const storedToken = await RefreshToken.findOne({ token });
        if ( !storedToken || storedToken.expiresAt < new Date() ) {
            return res.status(403).json({ error: "Invalid or Expired refresh token!" });
        }

        // verify token
        const payload = verifyRefresh(token);
        const user = await User.findById(payload.sub);
        if (!user) return res.status(401).json({ error: 'User not found' });

        // new access token
        const access = signAccess(user);
        debugLog('Access token refreshed for user:', user.email);
        res.json({
            access,
            ttl,
            user: { id: user._id, role: user.role, email: user.email },
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            debugLog('Refresh token error:', error);
            return res.status(403).json({ error: 'Invalid or expired refresh token' });
        }
        debugLog('Unexpected error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function logout(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            await RefreshToken.deleteOne({ token });
            debugLog("Refresh token removed for one device");
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });

        return res.json({ ok: true });
    } catch (err) {
        debugLog("Logout Error:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}