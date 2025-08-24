import { Router } from "express";
import authUser from '../middlewares/authUser.middleware.js';
import { enrollAgent, createEnrollmentToken, heartbeat } from "../controllers/agent.controller.js";
import { authAgentHmac } from '../middlewares/authAgent.middleware.js';

const router = Router();

// Admin creates enrollment token
router.post('/enrollment', authUser('admin'), createEnrollmentToken);

// Agent enrolls using token
router.post('/enroll', enrollAgent);

//Agent heartbeat (HMAC)
router.post('/heartbeat', authAgentHmac, heartbeat);

export default router;
