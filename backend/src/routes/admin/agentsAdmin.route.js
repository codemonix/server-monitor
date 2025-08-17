 import express from 'express';
 import { listAgents, rotateAgentToken, updateAgent, deleteAgent } from '../../controllers/admin/agentAdmin.controller.js';
 import { authenticate } from '../../middlewares/auth.middleware.js';
 import { requireRole } from '../../middlewares/auth.middleware.js';


 const router = express.Router();

 router.use( authenticate, requireRole('admin'));

 router.get('/', listAgents);
 router.post('/:id/rotate', rotateAgentToken);
 router.patch('/:id/', updateAgent);
 router.delete('/:id/', deleteAgent);

 export default router;