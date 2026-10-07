import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { initBackupCron } from "./controllers/backup.controller";
import { requestLogger } from "./middlewares/logger.middleware";
import analyticsRoutes from "./routes/analytics.routes";
import auditRoutes from "./routes/audit.routes";
import authRoutes from "./routes/auth.routes";
import backupRoutes from "./routes/backup.routes";
import excelRoutes from "./routes/excel.routes";
import htxhRoutes from "./routes/htxh.routes";
import profilesRoutes from "./routes/profiles.routes";
import settingsRoutes from "./routes/settings.routes";
import usersRoutes from "./routes/users.routes";
import villagesRoutes from "./routes/villages.routes";
import { prisma } from "./config/prisma";
import { startDashboard } from "./utils/dashboard";

const app = express();
app.set("trust proxy", 1);

// SEC-04-02: Khóa cứng CORS Whitelist - chỉ cho phép đúng cổng dev máy khách và domain chính thức HTTPS
const isOriginAllowed = (origin: string | undefined): boolean => {
	if (!origin) return true; // Hỗ trợ Electron Desktop (file://), mobile, cURL
	if (
		origin === "https://qlcs.dulieudakha.vn" ||
		origin.endsWith(".dulieudakha.vn") ||
		origin === "https://dulieudakha.vn" ||
		origin === "http://localhost:5173" ||
		origin === "http://127.0.0.1:5173"
	) {
		return true;
	}
	return false;
};

// SEC-04-06: Helmet CSP phòng vệ chuyên dụng cho REST API Server
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'none'"],
				frameAncestors: ["'none'"],
			},
		},
		frameguard: { action: "deny" },
	}),
);
app.use(
	cors({
		origin: (origin, callback) => {
			if (isOriginAllowed(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Blocked by CORS"));
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

// SEC-03-10: Hạ giới hạn body JSON xuống 2MB chống tấn công DoS tràn RAM (File Excel đã được Multer xử lý riêng)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(requestLogger);

// Health check theo chuẩn Đắk Hà v2.0.0 (SEC-04-04: Cung cấp thời gian chuẩn máy chủ & trạng thái CSDL)
app.head("/api/health", (_req, res) => res.status(200).end());
app.get("/api/health", async (_req, res) => {
	let dbStatus = "connected";
	try {
		await (prisma as any).$queryRawUnsafe("SELECT 1");
	} catch {
		dbStatus = "disconnected";
	}
	res.json({
		status: dbStatus === "connected" ? "ok" : "degraded",
		app: "qlcs-backend",
		version: "2.0.0",
		database: dbStatus,
		serverTime: new Date().toISOString(),
		timestamp: Date.now(),
		uptime: process.uptime(),
	});
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/htxh", htxhRoutes);
app.use("/api/villages", villagesRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/backups", backupRoutes);

// Global error handler (hide stack traces in production)
app.use(
	(
		err: any,
		_req: express.Request,
		res: express.Response,
		_next: express.NextFunction,
	) => {
		console.error(err);
		const message =
			process.env.NODE_ENV === "production" ? "Lỗi server" : err.message;
		res.status(err.status || 500).json({ error: message });
	},
);

// Khởi chạy cron job sao lưu / giám sát lúc 02:00 AM hàng ngày
initBackupCron();

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
	console.log(`[Server] QLCS Backend v2.0.0 running on port ${PORT}`);
	console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);

	if (process.env.NODE_ENV !== "test") {
		startDashboard();
	}
});

// Giữ kết nối Cloudflare Tunnel luôn ấm (Keep-Alive)
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

export default app;
