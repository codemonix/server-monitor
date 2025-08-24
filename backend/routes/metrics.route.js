import { Router } from "express";
import { ingestMetrics } from "../controllers/metrics.controller.js";
import { authAgentHmac } from "../middlewares/authAgent.middleware.js";

const router = Router();

router.post("/", authAgentHmac, ingestMetrics);

export default router;
