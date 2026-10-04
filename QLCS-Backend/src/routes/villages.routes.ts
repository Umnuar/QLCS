import { Router } from "express";
import {
	createVillage,
	deleteVillage,
	getVillageStats,
	getVillages,
	updateVillage,
} from "../controllers/villages.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken as any);

router.get("/", getVillages as any);
router.get("/stats", getVillageStats as any);
router.post("/", createVillage as any);
router.put("/:id", updateVillage as any);
router.delete("/:id", deleteVillage as any);

export default router;
