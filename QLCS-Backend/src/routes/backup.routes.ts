import { Router } from "express";
import { getSnapshot, restoreSnapshot } from "../controllers/backup.controller";
import {
	authenticateToken,
	requireAdmin,
} from "../middlewares/auth.middleware";

const router = Router();

// Tất cả endpoints backup chỉ dành riêng cho Admin
router.use(authenticateToken as any);
router.use(requireAdmin as any);

router.get("/snapshot", getSnapshot as any);
router.post("/restore", restoreSnapshot as any);

export default router;
