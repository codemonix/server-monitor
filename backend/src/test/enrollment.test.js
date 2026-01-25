import request from 'supertest';
import app from '../app.js';
import EnrollmentToken from '../models/EnrollmentToken.model.js';
import User from '../models/User.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from './setup.js';

beforeAll( async () => await connectTestDB());
afterEach( async () => await clearTestDB());
afterAll( async () => await closeTestDB());

describe('Enrollment Race Condition', () => {
    
    it('should prevent double-spending of enrollment tokens', async () => {

        // Create an admin user
        const admin = await User.create({ email: 'admin@srm.com', role: 'admin' });
        
        // Create an enrollment token
        const tokenDoc = await EnrollmentToken.create({
            token: 'valid-token-123',
            createdBy: admin._id,
            expiresAt: new Date(Date.now() + 10000),
            used: false
        });

        // Using Promise.all to fire as close as possible
        const request1 = request(app)
            .post('/api/agents/enroll')
            .send({
                token: 'valid-token-123',
                name: 'Agent-1',
                host: 'Server-1',
                ip: '127.0.0.1'
            });

        const request2 = request(app)
            .post('/api/agents/enroll')
            .send({
                token: 'valid-token-123',
                name: 'Agent-2',
                host: 'Server-2',
                ip: '127.0.0.1'
            })

        const [ res1, res2 ] = await Promise.all([ request1, request2 ]);

        console.log(`Request1 status code: ${res1.status} , Request2 status code: ${res2.status}`)
        // One req should succes and one fail
        const successCount = [ res1.status, res2.status ].filter(code => code === 201).length;
        const failureCount = [ res1.status, res2.status ].filter(code => code === 400 || code === 500 || code === 401).length;


        expect(successCount).toBe(1);
        expect(failureCount).toBe(1);


        
    })
})