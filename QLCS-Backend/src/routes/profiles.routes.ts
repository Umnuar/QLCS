import { Router } from "express";
import {
	bulkAddProfiles,
	bulkDelete,
	bulkUpdateStatus,
	createProfile,
	deleteProfile,
	emptyTrashProfiles,
	getDeletedProfiles,
	getProfileAuditLog,
	getProfileStats,
	getProfiles,
	hardDeleteProfile,
	recalculateAgeFields,
	restoreProfile,
	revealCccd,
	streamProfiles,
	updateProfile,
	updateProfileNotes,
	updateProfileStatus,
} from "../controllers/profiles.controller";
import {
	authenticateToken,
	authorizeVillageScope,
	requireAdmin,
} from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken as any);
router.use(authorizeVillageScope as any);

router.post("/:id/reveal-cccd", authenticateToken as any, revealCccd as any);

router.get("/", getProfiles as any);
router.get("/stats", getProfileStats as any);
router.get("/stream", streamProfiles as any);
router.get("/deleted", getDeletedProfiles as any);
router.post("/", createProfile as any);
router.post("/bulk-status", bulkUpdateStatus as any);
router.post("/bulk-delete", bulkDelete as any);
router.post("/bulk-add", bulkAddProfiles as any);
router.post("/recalculate", recalculateAgeFields as any);
router.delete("/trash", requireAdmin as any, emptyTrashProfiles as any);
router.get("/:id/audit-log", getProfileAuditLog as any);
router.put("/:id", updateProfile as any);
router.put("/:id/status", updateProfileStatus as any);
router.put("/:id/notes", updateProfileNotes as any);
router.put("/:id/restore", restoreProfile as any);
router.delete("/:id", deleteProfile as any);
router.delete("/:id/hard", requireAdmin as any, hardDeleteProfile as any);

export default router;
