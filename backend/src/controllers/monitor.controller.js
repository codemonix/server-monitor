import { getAllStats } from '../services/aggregator.service.js';
import logger from '../utils/logger.js';
import AgentMetric from '../models/agentMetrics.model.js';

export async function getMonitorSnapshot( req, res, next ) {
    try {
        const stats = await getAllStats();
        res.json(stats);
    } catch (error) {
        logger.error("get stats failed ->", error.message );
        next(error);
    }
}

export async function getMetricHistory(req, res, next) {

    try {
        const { agentId, from, to, limit = 1000 } = req.query;
        const qry = {};
    
        if ( agentId ) qry.agentId = agentId;
        if ( from || to ) qry.ts = {};
        if ( from ) qry.ts.$gte = new Date(from);
        if ( to ) qry.ts.$lte = new Date(to);   
    
        const docs = await AgentMetric
            .find(qry)
            .sort({ ts: 1 })
            .limit(Number(limit));
            
        res.json(
            docs.map( d => ({
                agentId: d.agentId,
                ts: d.ts,
                payload: d.payload 
            }))
        );
    } catch (error) {
        logger.error("get metric hostory failed:", error.message );
        next(error);
    }
};
