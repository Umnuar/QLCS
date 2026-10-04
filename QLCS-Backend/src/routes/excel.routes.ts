import { Router } from "express";
import multer from "multer";
import {
	getExcelTemplate,
	importExcel,
	previewExcel,
} from "../controllers/excel.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Cấu hình Multer lưu bộ nhớ đệm (MemoryStorage), không tạo file tạm trên ổ đĩa
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 20 * 1024 * 1024 }, // Giới hạn 20MB
});

// Bảo vệ toàn bộ router bằng JWT
router.use(authenticateToken as any);

router.post("/preview", upload.single("file"), previewExcel as any);
router.post("/import", upload.single("file"), importExcel as any);
router.get("/template", getExcelTemplate as any);

export default router;
