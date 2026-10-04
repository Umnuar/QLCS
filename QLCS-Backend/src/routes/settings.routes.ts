import { Router } from "express";
import {
	getSettings,
	updateSettings,
} from "../controllers/settings.controller";
import {
	authenticateToken,
	requireAdmin,
} from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken as any);

router.get("/", getSettings as any);
router.put("/", requireAdmin as any, updateSettings as any);

export default router;
