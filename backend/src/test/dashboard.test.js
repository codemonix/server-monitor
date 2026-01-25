import request from "supertest";
import app from "../app.js";
import User from "../models/User.model.js";
import Agent from "../models/Agent.model.js";
import MetricPoint from "../models/MetricPoint.model.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

let adminToken;
let agentId;

beforeAll(async () => connectTestDB());
afterAll(async () => closeTestDB());

beforeEach( async () => {
    await clearTestDB();

    // Create admin
    const admin = await User.create({ email: 'admin@dash.com', role: "admin"})
    await admin.setPassword('admin123');
    await admin.save();

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@dash.com', password: 'admin123' });

    console.log("loginRes.body:", loginRes.body);

    adminToken = loginRes.body.access;

    // Create Dummy agent
    const agent = await Agent.create({
        name: 'Production-DB',
        host: 'db-01',
        status: 'online',
        secretHash: 'hash'
    });
    agentId = agent._id;
    
    // Mock metrics (Past, Present, Future)
    const baseTime = Date.now();
    await MetricPoint.create([
        { agent: agentId, ts: new Date(baseTime - 100000), cpu: 10, memPercent: 20 }, // Old
        { agent: agentId, ts: new Date(baseTime), cpu: 50, memPercent: 60 },          // Now
        { agent: agentId, ts: new Date(baseTime + 100000), cpu: 90, memPercent: 80 }  // Future 
    ]);
});

describe('Dashboard API', () => {
    it('should retrive filtered metrics with pagination', async () => {
        // Test aggrigation pipeline in filteredMetrics
        const res = await request(app)
            .post('/api/metrics')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                page: 0,
                pageSize: 10,
                filters: {
                    agentIds: [agentId],
                    ranges: {
                        cpu: { min: 40 }
                    }
                },
                sort: { field: 'ts', order: 'desc'}
            });

        expect(res.status).toBe(200);
        expect(res.body.items.length).toBe(2);
        expect(res.body.total).toBe(2);
        expect(res.body.items[0].cpu).toBe(90);
    });

    it('should search agents by name', async () => {
        // Test search regex
        const res = await request(app)
            .post('/api/metrics')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                filters: {
                    search: 'Production'
                }
            });
        expect(res.status).toBe(200);
        expect(res.body.total).toBeGreaterThan(0);
        expect(res.body.items[0].agentName).toBe('Production-DB');
    });

    it('should delete agent and cascade delete metrics', async () => {
        // Vrify Metrics exist
        const preCheck = await MetricPoint.countDocuments({ agent: agentId });
        expect(preCheck).toBeGreaterThan(2);

        // Delete
        const res = await request(app)
            .delete(`/api/agents/${agentId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);

        // Agent gone ?
        const agentCheck = await Agent.findById(agentId);
        expect(agentCheck).toBeNull();

        // Metrics gone ?
        const metricCheck = await MetricPoint.countDocuments({ agent: agentId });
        expect(metricCheck).toBe(0);
    })
})
