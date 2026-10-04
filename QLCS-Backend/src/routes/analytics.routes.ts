import { Router } from "express";
import { getByVillage, getOverview } from "../controllers/analytics.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Bảo vệ router bằng JWT
router.use(authenticateToken as any);

router.get("/overview", getOverview as any);
router.get("/by-village", getByVillage as any);

export default router;
