import * as userServices from '../services/user.service.js';
import debugLog from '../utils/logger.js';
import User from "../models/User.model.js";
import RefreshToken from "../models/RefreshToken.model.js";
import { signAccess, signRefresh, verifyRefresh } from "../services/jwt.service.js";
import logger from "../utils/logger.js";


const ttl = Number(process.env.ACCESS_TTL_MIN || 15) * 60 ; // in seconds

export async function checkSetupStatus(req, res) {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });
        logger.info("auth.controller.js -> checkSetupStatus -> adminCount:", {adminCount});
        res.json({ isSetupComplete: adminCount > 0 });
    } catch (error) {
        logger.error("auth.controller.js -> checkSetupStatus -> error:", {error: error.message});
        res.status(500).json({ message: 'Internal Server Error!' });
    }
}

export async function setupSystem(req,res) {
    try {
        const { email, password } = req.body;
        if (!email || !password || password.length < 6) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const newAdmin = await userServices.createInitialAdmin({ email, password });

        const access = signAccess(newAdmin);
        const refresh = signRefresh(newAdmin);

        const rt = new RefreshToken({ 
            user: newAdmin._id, 
            token: refresh, 
            expiresAt: new Date(Date.now() + (Number(process.env.REFRESH_TTL_DAYS || 30) * 864e5))
    });
    await rt.save();

    res.cookie('refreshToken', refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: Number(process.env.REFRESH_TTL_DAYS || 30) * 864e5,
    });
    logger.info('auth.controller.js -> setupSystem -> initialiazed with admin:', {newAdmin: newAdmin.email});
    res.status(201).json({ access, ttl, user: newAdmin });
    } catch (error) {
        logger.error("auth.controller.js -> setupSystem -> error:", {error: error.message});
        const status = error.message === "System is already configured" ? 403 : 500;
        res.status(status).json({ error: error.message || "Setup Failed" });
    }
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @returns {{ access: string, ttl: number, user: { id: string, role: string, email: string } }}
 */

export async function login(req, res) {
    logger.debug("req -> ",{body: req.body});
    const { email, password } = req.body;
    logger.info('Login attempt for email:', {email});
    const user = await User.findOne({ email });
    logger.debug('User:', {user});
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

    logger.info('User logged in:', {email});

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
        logger.info('Access token refreshed for user:', {email: user.email});
        res.json({
            access,
            ttl,
            user: { id: user._id, role: user.role, email: user.email },
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            logger.error('auth.controller.js -> refreshToken -> TokenExpiredError or JsonWebTokenError:', {error: error.message});
            return res.status(403).json({ error: 'Invalid or expired refresh token' });
        }
        logger.error('Unexpected error:', {error: error.message});
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function logout(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            await RefreshToken.deleteOne({ token });
            logger.info("auth.controller.js -> logout -> Refresh token removed for one device");
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });

        return res.json({ ok: true });
    } catch (err) {
        logger.error("auth.controller.js -> logout -> ", {error: err.message});
        return res.status(500).json({ error: "Internal Server Error" });
    }
}



export async function getUsers(req, res) {
    try {
        const users = await User.find({}, 'email role createdAt');
        res.json(users);
    } catch (error) {
        logger.error("auth.controller.js -> getUsers -> error:", {error: error.message});
        res.status(500).json({ message: 'Failed to retrieve users' });
    }
}


