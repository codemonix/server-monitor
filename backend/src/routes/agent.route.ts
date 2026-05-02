import { Router } from "express";
import authUser from '../middlewares/authUser.middleware.js';
import { enrollAgent, createEnrollmentToken, heartbeat, refreshAgentToken, getAgents, deleteAgent, getEnrollmentTokens } from "../controllers/agent.controller.js";
import { authAgentJwt } from '../middlewares/authAgent.middleware.js';

const router = Router();

// Admin creates enrollment token
router.post('/enrollment', authUser('admin'), createEnrollmentToken);

// Agent enrolls using token
router.post('/enroll', enrollAgent);

//Agent refreshes token
router.post('/refresh-token', refreshAgentToken);

//Agent heartbeat (JWT) based
router.post('/heartbeat', authAgentJwt, heartbeat);

// Get Agent list
router.get('/', authUser(), getAgents);

// Delete agent by id
router.delete('/:id', authUser('admin'), deleteAgent );

// Get Enrollment Tokens list
router.get('/enrollment-tokens', authUser('admin'), getEnrollmentTokens);

export default router;
