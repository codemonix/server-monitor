import { Router } from "express";
import authUser from "../middlewares/authUser.middleware.js";
import { listUsers, createUser, deleteUser, updateUserRole } from "../controllers/user.controller.js";

const router = Router();

// Only admins can manage users
router.get('/', authUser('admin'), listUsers);
router.post('/', authUser('admin'), createUser);
router.delete('/:id', authUser('admin'), deleteUser);
router.put('/:id/role', authUser('admin'), updateUserRole);

export default router;