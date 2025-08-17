import express from 'express';
import { getMonitorSnapshot, getMetricHistory } from '../controllers/monitor.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getMonitorSnapshot);
router.get('/history', authenticate, getMetricHistory)

export default router;