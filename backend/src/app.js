import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';
import agentRoutes from './routes/agent.route.js';
import serverRoutes from './routes/servers.route.js';
import metricRoutes from './routes/metrics.route.js';
import settingsRoutes from './routes/settings.route.js';
import userRoutes from './routes/user.route.js';

import { startCleanupJob } from './services/cleanup.service.js';

startCleanupJob();

const app = express();
app.use(helmet());

const whitelist = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173'];


app.use(cors({
    origin: function (origin, callback) {

        if (!origin) return callback(null, true);
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

export default app;