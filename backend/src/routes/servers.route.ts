import { Router } from "express";
import authUser from '../middlewares/authUser.middleware.js';
import { serverSummery, serverMetrics, serversWithInitStat } from "../controllers/metrics.controller.js";
import { getAgents } from "../controllers/agent.controller.js";


const router = Router();

router.get("/", authUser(), getAgents);
router.get("/:id/summary", authUser(), serverSummery);
router.get("/:id/metrics", authUser(), serverMetrics);
router.get("/server-stat", authUser(), serversWithInitStat);

export default router;
