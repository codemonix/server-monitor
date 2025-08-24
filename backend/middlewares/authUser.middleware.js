import { verifyAccess } from "../services/jwt.service.js";
import logger from "../utils/logger.js";

export default function authUser(requiredRole) {
    return ( req, res, next ) => {
        try {
            const h = req.headers.authorization || '' ;
            const token = h.startsWith('Bearer ') ? h.slice(7) : null ;
            if (!token ) return res.status(401).json({ error: 'missing token' });
            const payload = verifyAccess(token);
            if ( requiredRole && payload.role !== requiredRole ) return res.status(403).json({ error: 'forbidden' });
            req.user = payload;
            next();
        } catch (error) {
            logger("User authentication failed:", error.message);
            return res.status(401).json({ error: 'invalid token' });
        }
    }
}