
import { 
    insertMetricPoints, 
    getServerSummery, 
    getServerMetrics, 
    getServersWithInitStat, 
    getFilteredMetrics } from '../services/metrics.service.js';
import logger from '../utils/logger.js';

export async function ingestMetrics(req, res) {
    const agent = req.agent;
    logger.info("metrics.controller.js -> Ingesting metrics from agent", {agent});
    logger.debug("metrics.controller.js -> Payload:", {body: req.body});

    try {
        const insertedCount = await insertMetricPoints( req.body);
        return res.json({ inserted: insertedCount });
    } catch (error) {
        logger.error("metrics.controller.js -> ingestMetrics -> inserting metrics failed:", {error: error.message});
        return res.status(500).json({ error: "Failed to ingest metrics"});
    }
}

export async function serverSummery(req, res) {
    const { id } = req.params;
    try {
        const last = await getServerSummery(id);
        return res.json(last);
    } catch (error) {
        logger.error("metrics.controller.js -> serverSummery -> query failed:", {error: error.message})
        return res.status(500).json({ error: "Failed to load metrics"});
    }
    
}

export async function serverMetrics(req, res) {
    const { id: agentId } = req.params;
    const since = Number(req.query.since || 0);

    if (!agentId) {
        return res.status(400).json({ error: "Missing agent id"});
    }

    try {
        const { points, lastTs } = await getServerMetrics( agentId, since );
        return res.json({ points, lastTs });
    } catch (error) {
        logger.error("metrics.controller.js -> serverMetrics -> query failed:", {error: error.message})
        return res.status(500).json({ error: "Failed to load metrics"});
    }
}

export async function serversWithInitStat(req, res) {
    try {
        const agents = await getServersWithInitStat();

        logger.debug("metrics.controller.js -> serversWithInitStat -> total agents:", {n: agents.length});

        return res.json(agents);
    } catch (err) {
        logger.error("metrics.controller.js -> serversWithInitStat -> query failed:", {error: err.message})
        return res.status(500).json({ error: "Failed to fetch agents"})
    }
}

export async function filteredMetrics(req, res) {
    

    logger.debug("metrics.controller.js -> filteredMetrics", {"req.body": req.body});

    try {

        const body = req.body || {};
        const page = Math.max(0, Number(body.page) || 0);
        const pageSize = Math.min(1000, Math.max(1, Number(body.pageSize || 50 )));
        const filters = body.filters || body;
        const sort = body.sort || { field: "ts", order: "desc" };
        
        const { items, total } = await getFilteredMetrics({ page, pageSize, filters, sort });
        


        logger.debug("metrics.controller.js -> filteredMetrics -> number of items:", {n: items.length});
        logger.debug("metrics.controller.js -> filteredMetrics -> total:", {total});


        return res.json({
            total,
            items,
            
        });

    } catch (error) {
        logger.error("metrics.controller.js -> metrics -> query failed:", { error });
        return res.status(500).json({ error: "Failed to load metrics"});
    }

}