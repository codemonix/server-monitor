import { Router } from "express";
import authUser from "../middlewares/authUser.middleware.js";
import { changePassword, getGlobalConfig, updateGlobalConfig, getPublicConfig } from "../controllers/settings.contoller.js";

const router = Router();

// Public settings
router.get('/public', getPublicConfig)

// User profile
router.put('/profile/password', authUser(), changePassword);

// System settings
router.get('/config', authUser('admin'), getGlobalConfig);
router.put('/config', authUser('admin'), updateGlobalConfig);

export default router;