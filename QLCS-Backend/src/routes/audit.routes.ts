import { Router } from "express";
import { getAuditLogs } from "../controllers/audit.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Bảo vệ router bằng JWT
router.use(authenticateToken as any);

router.get("/", getAuditLogs as any);

export default router;
