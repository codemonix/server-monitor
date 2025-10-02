import MetricPoint from '../models/MetricPoint.model.js';
import Agent from '../models/Agent.model.js';

export async function ingestMetrics(req, res) {
    const agent = req.agent;
    const points = Array.isArray(req.body.points)? req.body.points : [req.body];
    const mapped = points.map( point => ({
        agent: agent._id,
        ts: Number(point.ts || Date.now()),
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
    }))
    await MetricPoint.insertMany(mapped);
    return res.json({ inserted: mapped.length });
}

export async function listServers(req, res) {
    const agents = await Agent.find().select('name host ip tags status');
    // const out = agents.map( agent => ({ id: agent._id, name: agent.name, ip: agent.ip, 
    //     tags: agent.tags, status: agent.status, type: 'linux' }))
     const dummyServers = [
        { id: "s1", name: "Server Alpha", status: "online", cpu: 12, mem: 32, uptime: "3 days" },
        { id: "s2", name: "Server Beta", status: "warning", cpu: 78, mem: 64, uptime: "12 days" },
        { id: "s3", name: "Container-DB", status: "offline", cpu: 0, mem: 0, uptime: "—" },
        { id: "s4", name: "Edge-01", status: "online", cpu: 22, mem: 12, uptime: "5 hours" },
        ];
    return res.json(dummyServers);
}

export async function serverSummery(req, res) {
    const { id } = req.params;
    const last = await MetricPoint.findOne({ agent: id }).sort({ ts: -1 });
    const processes = 0;
    const uptime = 0
    return res.json({ processes, uptime, lastTs: last?.ts || null })
}

export async function serverMetrics(req, res) {
    const { id } = req.params;
    const since = Number(req.query.since || 0);
    const points = (await MetricPoint.find({ agent: id, ts: { $gt: since } })).sort({ ts: 1 }).limit(500);
    const lastTs = points.at(-1)?.ts || since;
    return res.json({ points, lastTs });
}