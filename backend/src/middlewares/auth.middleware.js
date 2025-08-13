import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';

export function authenticate( req, res, next ) {
    const authHeader = req.headers.authorization;
    if ( !authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'missing token'});
    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify( token, config.jwtSecret );
        req.user = payload;
        logger.info("user authenticated");
        next()
    } catch (error) {
        logger.error("user authentication failed")
        return res.status(401).json({ message: 'invalid token' });
    }
}

export function requireRole( role ) {
    return (req, res, next ) => {
        if (!req.user ) return res.status(401).json({ message: 'not authenticated' });
        if (req.user.role !== role ) return res.status(403).json({ message: 'forbidden' });
        next();
    };
}