import { Router } from "express";
import { 
    setupSystem, 
    login, 
    refreshToken, 
    logout,
    checkSetupStatus
} from "../controllers/auth.controller.js";

const router = Router();

// router.post("/seed-admin", seedAdmin);
router.get("/setup-status", checkSetupStatus);
router.post("/setup", setupSystem)


router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);


export default router;
