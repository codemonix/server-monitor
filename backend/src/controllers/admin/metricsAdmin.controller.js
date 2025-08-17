import { loggers } from 'winston';
import AgentMetrics from '../../models/agentMetrics.model.js'


export async function summery(req, res, next) {
    try {
        const since = new Date(Date.now() - 3600_000); //last hour
        const total = await AgentMetrics.countDocuments({ ts: { $gte: since }});
        const perAgent = await AgentMetrics.aggregate([
            { $match: { ts: { $gte: since }}},
            { $group: { _id: '$agentId', count: { $sum: 1 }, last: { $max: '$ts' }}},
            { $sort: { count: -1 }}
        ]);
        res.json({ since, total, perAgent });
    } catch (error) {
        loggers.error(" agent summery failed:", error.message);
        next(error);
    }
}