import { Router } from "express";
import {
	createUser,
	deleteUser,
	getUsers,
	resetPassword,
	updateUser,
} from "../controllers/users.controller";
import {
	authenticateToken,
	requireAdmin,
} from "../middlewares/auth.middleware";

const router = Router();

// Tất cả routes trong /api/users đều yêu cầu đăng nhập và có quyền Admin
router.use(authenticateToken as any);
router.use(requireAdmin as any);

router.get("/", getUsers as any);
router.post("/", createUser as any);
router.put("/:id", updateUser as any);
router.post("/:id/reset-password", resetPassword as any);
router.delete("/:id", deleteUser as any);

export default router;
