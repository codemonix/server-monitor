import { Router } from "express";
import { seedAdmin, login, refreshToken } from "../controllers/auth.controller.js";

const router = Router();

router.post("/seed-admin", seedAdmin);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

export default router;
