import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
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
import { startDashboard } from "./utils/dashboard";
import { type TokenPayload, verifyAccessToken } from "./utils/jwt";

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);

// SEC-04-02: Khóa cứng CORS Whitelist - chỉ cho phép đúng cổng dev máy khách và domain chính thức HTTPS
const isOriginAllowed = (origin: string | undefined): boolean => {
	if (!origin) return true; // Hỗ trợ Electron Desktop (file://), mobile, cURL
	if (
		origin === "https://qlcs.dulieudakha.vn" ||
		origin === "https://dulieudakha.vn" ||
		origin === "http://localhost:5173" ||
		origin === "http://127.0.0.1:5173"
	) {
		return true;
	}
	return false;
};

// Socket.io
const io = new SocketServer(httpServer, {
	cors: {
		origin: (origin, callback) => {
			if (isOriginAllowed(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Blocked by Socket.io CORS"));
			}
		},
		methods: ["GET", "POST"],
		credentials: true,
	},
});

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

// Make io accessible in controllers
app.set("io", io);

// Health check theo chuẩn Đắk Hà v2.0.0 (SEC-04-04: Cung cấp thời gian chuẩn máy chủ)
app.get("/api/health", (_req, res) => {
	res.json({
		status: "ok",
		app: "qlcs-backend",
		version: "2.0.0",
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

// SEC-03-11: Xác thực JWT Handshake và phân quyền Room Socket.io
io.use((socket, next) => {
	const token = socket.handshake.auth?.token || socket.handshake.query?.token;
	if (!token || typeof token !== "string") {
		return next(new Error("Authentication error: Token required"));
	}
	try {
		const payload = verifyAccessToken(token);
		(socket as any).user = payload;
		next();
	} catch (err) {
		return next(new Error("Authentication error: Invalid or expired token"));
	}
});

io.on("connection", (socket) => {
	const user = (socket as any).user as TokenPayload;
	console.log(`[Socket.io] Authenticated user connected: ${user?.username} (${socket.id})`);

	socket.on("join-village", (villageId: string) => {
		if (!villageId || typeof villageId !== "string") return;

		// Phân quyền Room: Admin được join mọi thôn; cán bộ thôn chỉ được join đúng thôn mình phụ trách
		if (user.role !== "admin" && user.village_id && user.village_id !== villageId) {
			console.warn(`[Socket.io] Unauthorized room join attempt by ${user.username} to village ${villageId}`);
			socket.emit("error", { message: "Không có quyền truy cập thôn khác" });
			return;
		}

		socket.join(`village:${villageId}`);
	});

	socket.on("disconnect", () => {
		console.log(`[Socket.io] Client disconnected: ${socket.id}`);
	});
});

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
httpServer.listen(PORT, () => {
	console.log(`[Server] QLCS Backend v2.0.0 running on port ${PORT}`);
	console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);

	if (process.env.NODE_ENV !== "test") {
		startDashboard();
	}
});

export { io };
