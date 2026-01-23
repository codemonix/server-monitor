import { Router } from "express";
import authUser from "../middlewares/authUser.middleware.js";
import { listUsers, createUser, deleteUser, updateUserRole, resetPassword } from "../controllers/user.controller.js";

const router = Router();

// Only admins can manage users
router.get('/', authUser('admin'), listUsers);
router.post('/', authUser('admin'), createUser);
router.delete('/:id', authUser('admin'), deleteUser);
router.put('/:id/role', authUser('admin'), updateUserRole);

router.put('/:id/password', authUser('admin'), resetPassword);


export default router;