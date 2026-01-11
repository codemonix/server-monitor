import { Router } from "express";
import { ingestMetrics, filteredMetrics } from "../controllers/metrics.controller.js";
import { authAgentJwt } from "../middlewares/authAgent.middleware.js";
import authUser from "../middlewares/authUser.middleware.js";

const router = Router();

router.post("/points", authAgentJwt, ingestMetrics);
router.post("/", filteredMetrics );


export default router;
