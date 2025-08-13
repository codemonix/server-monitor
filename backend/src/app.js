import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routers/auth.router.js';
import monitorRoutes from './routers/monitor.router.js';
import errorHandler from './middlewares/errorHandler.middleware.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/monitor', monitorRoutes);

app.get('/', (req, res) => res.json({ ok: true, msg: 'Server Monitor Backend'}));

app.use(errorHandler);

export default app;