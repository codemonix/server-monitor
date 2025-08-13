import { getAllStats } from '../services/aggregator.service.js';
import logger from '../utils/logger.js';

export async function getMonitorSnapshot( req, res, next ) {
    try {
        const stats = await getAllStats();
        res.json(stats);
    } catch (error) {
        logger.error("get stats failed ->", error.message );
        next(error);
    }
}