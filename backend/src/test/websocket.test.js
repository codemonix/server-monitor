import http from 'http';
import WebSocket from 'ws';
import request from 'supertest';

import app from '../app';
import { initWsHub } from '../services/ws/wsHub.service.js';
import EnrollmentToken from '../models/EnrollmentToken.model.js';
import User from '../models/User.model.js';
import MetricPoint from '../models/MetricPoint.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from './setup.js';

let server;
let port;
let agentToken;
let agentId;

// Setup DB and Server
beforeAll(async () => {
    await connectTestDB();
    
    // Create HTTP server to attach WS to
    server = http.createServer(app);
    initWsHub(server);
    
    // Listen to port 0 (OS free port)
    await new Promise((resolve => {
        server.listen(0, () => {
            port = server.address().port;
            resolve();
        });
    }));
});

beforeEach(async () => {
    await clearTestDB();

    // Create admin
    const admin = await User.create({ email: 'admin@ws.com', role: 'admin' });

    // Create enrollment token
    await EnrollmentToken.create({
        token: 'ws-enroll-token',
        createdBy: admin._id,
        expiresAt: new Date(Date.now() + 60000),
        used: false
    });

    // Enroll Agent to get token
    const res = await request(app)
        .post('/api/agents/enroll')
        .send({
            token: 'ws-enroll-token',
            name: 'Ws-Test-Agent',
            host: 'ws-host',
            ip: '127.0.0.1'
        });

    agentToken = res.body.accessToken;
    agentId = res.body.agentId;
})

// Cleanup DB between tests
// afterEach(async () => {
//     await clearTestDB();

//     // Recreate data for next test
//     const admin = await User.create({ email: 'admin@ws.com', role: 'admin' });
//     const tokenDoc = await EnrollmentToken.create({
//         token: 'ws-enroll-token',
//         createdBy: admin._id,
//         expiresAt: new Date(Date.now() + 60000),
//         used: false
//     });

//     // Enroll an agent to get valid token
//     const res = await request(app)
//         .post('/api/agents/enroll')
//         .send({
//             token: 'ws-enroll-token',
//             name: 'Ws-Test-Agent',
//             host: 'Ws-Test-Host',
//             ip: '127.0.0.1'
//         });

//     agentToken = res.body.accessToken;
//     agentId = res.body.agentId;
// });

// Teardown
afterAll(async () => {
    server.close();
    await closeTestDB();
});

describe('WebSocker Server', () => {
    it('should authenticate a connected agent successfully', async () => {
        const wsUrl = `http://localhost:${port}/ws`;
        const client = new WebSocket(wsUrl);

        const authMessage = {
            type: 'auth',
            role: 'agent',
            token: agentToken
        };

        // Wrape the async event logic in a Promise
        const authResponse = await new Promise((resolve, reject) => {
            client.on('open', () => {
                client.send(JSON.stringify(authMessage));
            });

            client.on('message', (data) => {
                const msg = JSON.parse(data);
                if (msg.type === 'auth_success') resolve(msg);
                else reject(new Error(`Unexpected message: ${data}`));
            });

            client.on('error', reject);
        });

        console.log("authResponse:", authResponse);

        expect(authResponse).toMatchObject({ type: 'auth_success', role: 'agent' });
        client.close();
    });

    it('should disconnect if auth is invalid', async () => {
        const wsUrl = `ws://localhost:${port}/ws`;
        const client = new WebSocket(wsUrl);

        const badAuthMsg = {
            type: 'auth',
            role: 'agent',
            token: 'invalid-jwt-token'
        };

        const closeCode = await new Promise((resolve) => {
            client.on('open', () => client.send(JSON.stringify(badAuthMsg)));
            // Expect the server to close connection
            client.on('close', (code) => resolve(code))
        });

        // Close code 4001
        expect(closeCode).toBe(4001);
    });

    it('should ingest metrics sent via WebSocket', async () => {
        const wsUrl = `ws://localhost:${port}/ws`;
        const client = new WebSocket(wsUrl);

        // Authenticate first
        await new Promise((resolve) => {
            client.on('open', () => {
                client.send(JSON.stringify({ type: 'auth', role: 'agent', token: agentToken }));
            });
            client.once('message', () => resolve());
        });

        // Send metric message
        const metricPayload = {
            type: 'metrics',
            agentId: agentId,
            ts: new Date().toISOString(),
            cpu: 45.5,
            memUsed: 1024,
            memTotal: 4096,
            diskUsed: 50,
            diskTotal: 100
        };

        client.send(JSON.stringify(metricPayload));

        // Wait for async proccess to be done
        await new Promise(r => setTimeout(r, 500));

        // Verify in DB
        const points = await MetricPoint.find({ agent: agentId });
        expect(points.length).toBe(1);
        expect(points[0].cpu).toBe(metricPayload.cpu);
        expect(points[0].memPercent).toBe(25);

        client.close();
    })
})