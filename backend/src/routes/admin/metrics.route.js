import express from 'express';
import { summery } from '../../controllers/admin/metricsAdmin.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use( authenticate, requireRole('admin'));

router.get('/summery', summery);

export default router;