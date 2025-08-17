import express from 'express';
import { registerAgent, ingestMetrics } from '../controllers/agent.controller.js';
import { authenticateAgent } from '../middlewares/agentAuth.middleware.js';

const router = express.Router();

router.post('/register', registerAgent);
router.post('/ingest', authenticateAgent, ingestMetrics);

export default router;