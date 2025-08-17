import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.route.js';
import monitorRoutes from './routes/monitor.route.js';
import errorHandler from './middlewares/errorHandler.middleware.js';
import agentRoutes from './routes/agents.route.js';

import adminAgentsRoutes from './routes/admin/agentsAdmin.route.js';
import adminEnrollmentRoutes from './routes/admin/enrollment.route.js';
import adminMetricsRoutes from './routes/admin/metrics.route.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// brute-force protection
app.use('/api/', rateLimit({ windowMs: 60_000, max: 600 }));

app.use('/api/auth', authRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/agents', agentRoutes);

app.get('/', (req, res) => res.json({ ok: true, msg: 'Server Monitor Backend'}));

app.use(errorHandler);

export default app;