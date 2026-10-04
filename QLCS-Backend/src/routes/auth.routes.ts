import { Router } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import {
	changePassword,
	changeUsername,
	getMe,
	login,
	logout,
	refresh,
	setupAdmin,
	updateAvatar,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// SEC-05-01: Bộ giới hạn tốc độ đăng nhập an toàn mặc định (10 lần sai / 15 phút, chỉ nới lỏng trong môi trường test)
const loginLimiter = rateLimit({
	windowMs: process.env.NODE_ENV === "test" ? 1000 : 15 * 60 * 1000,
	max: process.env.NODE_ENV === "test" ? 1000 : 10,
	skipSuccessfulRequests: true,
	message: {
		error: "Quá nhiều lần đăng nhập sai, vui lòng thử lại sau ít phút",
	},
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req: any, res: any) => {
		const cleanUsername = String(req.body?.username || "")
			.trim()
			.toLowerCase();
		return `${(ipKeyGenerator as any)(req, res)}_${cleanUsername}`;
	},
});

// Public routes
router.post("/setup", setupAdmin as any);
router.post("/login", loginLimiter, login as any);
router.post("/refresh", refresh as any);

// Authenticated routes
router.get("/me", authenticateToken as any, getMe as any);
router.put("/password", authenticateToken as any, changePassword as any);
router.put("/username", authenticateToken as any, changeUsername as any);
router.put("/avatar", authenticateToken as any, updateAvatar as any);
router.post("/logout", authenticateToken as any, logout as any);

export default router;
