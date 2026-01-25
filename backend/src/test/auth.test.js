import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import { connectTestDB, closeTestDB, clearTestDB } from './setup.js';
import { beforeAll, describe, expect } from 'vitest';

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());


describe('Auth Endpoints', () => {

    it('should register and login a user', async () => {

        //Setup a user
        const userData = { email: 'test@srm.com', password: 'password123'};

        // Create user manually ( create user endpoint is admin protected)
        const user = new User({ email: userData.email, role: 'viewer' });
        await user.setPassword(userData.password);
        await user.save();

        // Try login
        const res = await request(app)
            .post('/api/auth/login')
            .send(userData);

        // Verify response 
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('access');
        expect(res.body.user).toHaveProperty('email', userData.email);

        // Verify cookie
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toMatch(/refreshToken=.*HttpOnly.*/);
    });

    it('should reject invalid pass', async () => {
        const user = new User({ email: 'wrong@srm.com', role: 'viewer' });
        await user.setPassword('correct-pass');
        await user.save();

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'wrong@srm.com', password: 'wrong-pass' });

        expect(res.status).toBe(401);
    });
});