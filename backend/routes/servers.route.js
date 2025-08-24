import { Router } from "express";
import authUser from '../middlewares/authUser.middleware.js';
import { listServers, serverSummery, serverMetrics } from "../controllers/metrics.controller.js";


const router = Router();

router.get("/", authUser(), listServers);
router.get("/:id/summary", authUser(), serverSummery);
router.get("/:id/metrics", authUser(), serverMetrics);

export default router;
