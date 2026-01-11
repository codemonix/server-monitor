import MetricPoint from '../models/MetricPoint.model.js';
import Agent from '../models/Agent.model.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';
import escapeStringRegexp from 'escape-string-regexp';


/**
 * 
 * @param {Object} agent 
 * @param {Object|Object[]} payload 
 * @returns {Promise<number>}
 */

function computePercent(used, total) {
    if ( used == null || total == null || total === 0 ) return 0;
    const percent = (Number(used) / Number(total)) * 100;
    return Math.round(percent * 100) / 100;
}


export async function insertMetricPoints(payload) {
    const points = Array.isArray(payload) ? payload : [payload];

    

    const mapped = points.map( point => ({
        agent: point.agentId,
        ts: point.ts ? new Date(point.ts) : new Date(),
        cpu: point.cpu ?? 0,
        memUsed: point.memUsed ?? 0,
        memTotal: point.memTotal ?? 0,
        rx: point.rx ?? 0,
        tx: point.tx ?? 0,
        diskUsed: point.diskUsed ?? 0,
        diskTotal: point.diskTotal ?? 0,
        load1: point.load1 ?? 0,
        load5: point.load5 ?? 0,
        load15: point.load15 ?? 0,
        upTime: point.upTime ?? 0,
        memPercent: computePercent(point.memUsed, point.memTotal),
        diskPercent: computePercent(point.diskUsed, point.diskTotal),
    }));

    if (mapped.length === 0) return 0;

    try {
        const result = await MetricPoint.insertMany(mapped, { ordered: false });
        logger("metrics.service.js -> inserted metrics:", result.length)
        return result.length;
    } catch (error) {
        logger("metrics.services.js -> insertMetricPoints: inserting to DB failed:", error.message);
        throw error;
    }
}


export async function getServerSummery(agentId) {
    const last = await MetricPoint.findOne({ agent: agentId }).sort({ ts: -1 });
    return last
}

export async function getServerMetrics( agentId, since ) {
    let points = await MetricPoint.find(
                { agent: agentId, createdAt: { $gt: since }},
                null,
                {
                    sort: { createdAt: -1 },
                    limit: 500,
                }
            )
            .lean()
            .exec()
    
            points = points.reverse();

            const lastTs = points.at(-1)?.ts || since;

            logger("metrics,services.js -> getServerMetrics -> points:", points.length);
            return { points, lastTs };
}

export async function getServersWithInitStat() {
    
    const agents = await Agent.aggregate([
    {
        $lookup: {
            from: "metricpoints",
            let: { agentId: "$_id"},
            pipeline: [
                { $match: { $expr: { $eq: ["$agent", "$$agentId"] }}},
                {
                    $addFields: {
                        effectiveTime: { $ifNull: [ "$ts", "$createdAt" ]},
                    }
                },
                { $sort: { effectiveTime: -1 }},
                { $limit: 1 }
            ],
            as: "latestMetric"
        }
    },
    {
        $unwind: { path: "$latestMetric", preserveNullAndEmptyArrays: true }
    },
    {
        $project: {
            agentId: "$_id",
            name: 1,
            host: 1,
            ip: 1,
            os: 1,
            arch: 1,
            version: 1,
            tags: 1,
            status: 1,
            lastHeartbeatAt: 1,
            cpuModel: 1,
            
            cpu: { $ifNull: [ "$latestMetric.cpu", null ] },
            memUsed: { $ifNull: [ "$latestMetric.memUsed", null ] },
            memTotal: { $ifNull: [ "$latestMetric.memTotal", null ] },
            diskUsed: { $ifNull: [ "$latestMetric.diskUsed", null ] },
            diskTotal: { $ifNull: [ "$latestMetric.diskTotal", null ] },
            rx: { $ifNull: [ "$latestMetric.rx", null ] },
            tx: { $ifNull: [ "$latestMetric.tx", null ] },
            load1: { $ifNull: [ "$latestMetric.load1", null ] },
            load5: { $ifNull: [ "$latestMetric.load5", null ] },
            load15: { $ifNull: [ "$latestMetric.load15", null ] },
            ts: { $ifNull: [ "$latestMetric.ts", "$latestMetric.createdAt" , null ] },
        }
    }
    ]);

    console.log("metrics.service.js -> getServersWithInitStat -> fetched agents:", agents);

    return agents;
}

function buildMatchFromFilters( body = {} ) {
    console.log("metrics.service.js -> buildMatchFromFilters -> body:", body);
    
    const q = {};

    const { agentIds, ranges = {}, from, to } = body;

    try {
        if ( Array.isArray(agentIds) && agentIds.length > 0 ) {
            const validIds = agentIds.filter(id => mongoose.Types.ObjectId.isValid(id))
                    .map(id => {
                        if (mongoose.Types.ObjectId.isValid(id)) {
                            return mongoose.Types.ObjectId.createFromHexString(id);
                        }
                        return null;
                    })
                    .filter(id => id !== null);
            if (validIds.length > 0 ) q.agent = { $in: validIds };
        }

        const rangeFields = [ 'cpu', 'memPercent', 'diskPercent' ];
        rangeFields.forEach( field => {
            if ( ranges[field] ) {
                const { min, max } = ranges[field];
                const condition = {};
                if (min !== undefined && min !== null) condition.$gte = Number(min);
                if (max !== undefined && max !== null) condition.$lte = Number(max);

                if (Object.keys(condition).length > 0) {
                    q[field] = condition;
                }
            }
        })
    
        if ( from || to ) {
            const dateQuery = {};
            if ( from ) {
                const dFrom = new Date(from);
                if (!isNaN(dFrom)) dateQuery.$gte = dFrom;
            }
            if ( to ) {
                const dTo = new Date(to);
                if (!isNaN(dTo)) dateQuery.$lte = dTo;
            }
            if ( Object.keys(dateQuery).length > 0 ) q.ts = dateQuery;
        }
    
        console.log("metrics.service.js -> buildMatchFromFilters -> built query:", q);
    
        return q;

    } catch (error) {
        console.error("metrics.service.js -> buildMatchFromFilters -> error:", error.message);
        throw error;
    }
        

}

export async function getFilteredMetrics({ page = 0, pageSize = 50, filters = {}, sort = { field: "ts", order: 'desc' }} = {}) {

    console.log("metrics.service.js -> getFilteredMetrics -> filters:", filters);

    const match = buildMatchFromFilters(filters);

    try {
        if ( filters.search.trim() ) {
            const safeSearch = escapeStringRegexp( filters.search.trim() );
            const regex = new RegExp(safeSearch, 'i');

            // find agents matching the search term
            const matchingAgents = await Agent.find( {name: regex} ).select('_id').lean();
            const matchingAgentIds = matchingAgents.map(a => a._id);

            if (matchingAgentIds.length === 0) {
                return { items: [], total: 0 };
            }

            match.agent = { $in: matchingAgentIds };
            // const searchConditions = [ {} ];
            // if ( matchingAgentIds.length > 0 ) {
            //     searchConditions.push({ agent: { $in: matchingAgentIds }});
            // }

            // //Add existing filters
            // match.$and = match.$and || [];
            // match.$and.push({ $or: searchConditions });
        }

        const pipeline = [
            { $match: match },
            { $sort: { [sort.field]: sort.order === 'asc' ? 1 : -1 } },
            { $skip: page * pageSize },
            { $limit: pageSize },

            // limited lookup to get agent name
            {
                $lookup: {
                    from: "agents",
                    localField: "agent",
                    foreignField: "_id",
                    as: "agentInfo"
                }
            },
            { $unwind: { path: "$agentInfo", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    agent: 1,
                    agentName: "$agentInfo.name",
                    ts: 1,
                    cpu: 1,
                    memUsed: 1,
                    memTotal: 1,
                    memPercent: 1,
                    rx: 1,
                    tx: 1,
                    diskUsed: 1,
                    diskTotal: 1,
                    diskPercent: 1,
                    load1: 1,
                    load5: 1,
                    load15: 1,
                    upTime: 1,
                    createdAt: 1,
                }
            }
        ];

        const items = await MetricPoint.aggregate(pipeline).exec();

        console.log("metrics.service.js -> filteredMetrics -> fetched items:", items.length);
        console.log("metrics.service.js -> filteredMetrics -> match object:", match);
        console.log("metrics.service.js -> filteredMetrics -> last item ts:", items.length > 0 ? items[0].ts : null);

        // get total count
        const total = await MetricPoint.countDocuments(match);
        
    
    // const query = {};
    // console.log("metrics.service.js -> filteredMetrics -> page:", page, "pageSize:", pageSize);

    // if (Array.isArray(agentIds) && agentIds.length > 0 ) {
    //     query.agent = { $in: agentIds };
    // }

    // for ( const field in ranges ) {
    //     const { min, max } = ranges[field];
    //     const range = {};

    //     if (min !== null && min !== undefined) range.$gte = min;
    //     if (max !== null && max !== undefined) range.$lte = max;

    //     if (Object.keys(range).length > 0) {
    //         query[field] = range;
    //     }
    // }

    // if (search && search.trim() !== "") {
    //     const search = search.trim();
    //     query.$or = [

    //     ]
    // }

    // try {
    //     console.log("metrics.service.js -> filteredMetrics -> query:", query);
    
    
    //     const items = await MetricPoint.find(query)
    //         .sort({ createdAt: -1 })
    //         .skip(page * pageSize)
    //         .limit(pageSize)
    //         .lean();
    
    //     const total = await MetricPoint.countDocuments(query);
    //     console.log("metrics.service.js -> filteredMetrics -> total:", total);
    //     // console.log("metrics.controller.js -> filteredMetrics -> items:", items);
    
    
        return { items, total }

    } catch (error) {
        console.error("metrics.service.js -> getFilteredMetrics -> error:", error.message);
        throw error;
    }
}

    // const query = {};




    // if (search && search.trim() !== "") {
    //     const regex = new RegExp(search, "i");
    //     query.$or = [
    //         { os: regex },
    //         { cpuModel: regex },
    //         { memTotal: regex },
    //         { load1: regex },
    //         { load5: regex },
    //         { load15: regex },
    //     ]
    // }

    // const skip = (parseInt(page -1)) * parseInt(pageSize);
    // const limit = parseInt(pageSize);

    // const [ total, metrics ] = await Promise.all([
    //     MetricPoint.countDocuments(query),
    //     MetricPoint.find(query)
    //         .sort({ createdAt: -1 })
    //         .skip(skip)
    //         .limit(limit)
    //         .lean()
    // ]);

    // return [ total, metrics]



