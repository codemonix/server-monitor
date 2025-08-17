import express from 'express';
import { generateKey, listKeys, revokeKey } from '../../controllers/admin/enrollment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/auth.middleware.js';


const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.post('/generate', generateKey);
router.get('/', listKeys);
router.post('/:id/revoke', revokeKey);

export default router;