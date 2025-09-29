import { verifyAccess } from "../services/jwt.service.js";
import debugLog from "../utils/logger.js";

export default function authUser(requiredRole) {
    return ( req, res, next ) => {
        try {
            debugLog("User authentication attempt");
            const h = req.headers.authorization || '' ;
            debugLog("Authorization header:", !!h);
            const token = h.startsWith('Bearer ') ? h.slice(7) : null ;
            if (!token ) return res.status(401).json({ error: 'missing token' });
            const payload = verifyAccess(token);
            if ( requiredRole && payload.role !== requiredRole ) return res.status(403).json({ error: 'forbidden' });
            req.user = payload;
            next();
        } catch (error) {
            debugLog("User authentication failed (authUser.middleware):", error.message);
            return res.status(401).json({ error: 'invalid token' });
        }
    }
}