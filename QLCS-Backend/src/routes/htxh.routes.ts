import { Router } from "express";
import {
	bulkAddHtxhProfiles,
	bulkDeleteHtxh,
	bulkUpdateHtxhStatus,
	createHtxhProfile,
	deleteHtxhProfile,
	emptyTrashHtxh,
	getDeletedHtxhProfiles,
	getHtxhAuditLog,
	getHtxhProfiles,
	getHtxhStats,
	hardDeleteHtxhProfile,
	recalculateHtxhAgeFields,
	restoreHtxhProfile,
	streamHtxhProfiles,
	updateHtxhNotes,
	updateHtxhProfile,
	updateHtxhStatus,
} from "../controllers/htxh.controller";
import {
	authenticateToken,
	authorizeVillageScope,
	requireAdmin,
} from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken as any);
router.use(authorizeVillageScope as any);

router.get("/", getHtxhProfiles as any);
router.get("/stats", getHtxhStats as any);
router.get("/stream", streamHtxhProfiles as any);
router.get("/deleted", getDeletedHtxhProfiles as any);
router.post("/", createHtxhProfile as any);
router.post("/bulk-status", bulkUpdateHtxhStatus as any);
router.post("/bulk-delete", bulkDeleteHtxh as any);
router.post("/bulk-add", bulkAddHtxhProfiles as any);
router.post("/recalculate", recalculateHtxhAgeFields as any);
router.delete("/trash", requireAdmin as any, emptyTrashHtxh as any);
router.get("/:id/audit-log", getHtxhAuditLog as any);
router.put("/:id", updateHtxhProfile as any);
router.put("/:id/status", updateHtxhStatus as any);
router.put("/:id/notes", updateHtxhNotes as any);
router.put("/:id/restore", restoreHtxhProfile as any);
router.delete("/:id", deleteHtxhProfile as any);
router.delete("/:id/hard", requireAdmin as any, hardDeleteHtxhProfile as any);

export default router;
