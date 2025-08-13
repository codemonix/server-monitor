import express from 'express';
import { getMonitorSnapshot } from '../controllers/monitor.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, requireRole('admin'), (req, res) => {
    res.json({ secret: 'admin-only-data' });
});

export default router;