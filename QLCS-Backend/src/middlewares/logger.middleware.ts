import type { NextFunction, Request, Response } from "express";

/**
 * Trích xuất địa chỉ IP thực của client hỗ trợ qua Cloudflare Tunnel và reverse proxies
 */
export const getClientIp = (req: Request): string => {
	let ip = "";
	const cfIp = req.headers["cf-connecting-ip"];
	if (cfIp) {
		ip = (Array.isArray(cfIp) ? cfIp[0] : cfIp).trim();
	} else {
		const forwarded = req.headers["x-forwarded-for"];
		if (forwarded) {
			const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
			ip = ips.split(",")[0].trim();
		} else {
			ip = req.ip || req.socket?.remoteAddress || "unknown";
		}
	}
	if (ip.startsWith("::ffff:")) {
		ip = ip.substring(7);
	}
	return ip;
};

/**
 * Định dạng thời gian chuẩn [HH:mm:ss] 24h
 */
export const formatTimestamp = (date = new Date()): string => {
	const pad = (n: number) => n.toString().padStart(2, "0");
	const h = pad(date.getHours());
	const m = pad(date.getMinutes());
	const s = pad(date.getSeconds());
	return `${h}:${m}:${s}`;
};

/**
 * Trích xuất thông tin kết nối CSDL theo chuẩn <HOST>:<PORT>/<DATABASE>
 */
export const getDbConnectionInfo = (): string => {
	const rawUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
	if (!rawUrl) {
		return "localhost:5432/qlcs_db";
	}
	try {
		const url = new URL(rawUrl);
		const host = url.hostname || "localhost";
		const port = url.port || "5432";
		const db = url.pathname.replace(/^\//, "") || "qlcs_db";
		return `${host}:${port}/${db}`;
	} catch {
		const match = rawUrl.match(/@([^:/]+)(?::(\d+))?\/([^?]+)/);
		if (match) {
			const host = match[1];
			const port = match[2] || "5432";
			const db = match[3];
			return `${host}:${port}/${db}`;
		}
		return "localhost:5432/qlcs_db";
	}
};

const isColorEnabled = (): boolean => {
	return Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
};

const TAG_COLORS: Record<string, string> = {
	START: "\x1b[1;36m", // Cyan bold
	HTTP: "\x1b[1;32m",  // Green bold
	AUTH: "\x1b[1;35m",  // Magenta bold
	CRON: "\x1b[1;33m",  // Yellow bold
	DB: "\x1b[1;34m",    // Blue bold
	ERROR: "\x1b[1;31m", // Red bold
};

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

export const formatLogLine = (tag: string, content: string): string => {
	const timestamp = formatTimestamp();
	if (!isColorEnabled()) {
		return `[${timestamp}] [${tag}] ${content}`;
	}
	const tagColor = TAG_COLORS[tag] || "\x1b[1m";
	return `${DIM}[${timestamp}]${RESET} ${tagColor}[${tag}]${RESET} ${content}`;
};

export const logStart = (
	port: number | string,
	dbStatus: string = "Connected",
	env: string = process.env.NODE_ENV || "development",
): void => {
	if (process.env.NODE_ENV === "test") return;
	console.log(
		formatLogLine(
			"START",
			`Service ready on port ${port} | DB: ${dbStatus} | Env: ${env}`,
		),
	);
};

export const logHttp = (
	method: string,
	path: string,
	status: number,
	duration: number,
	ip: string,
): void => {
	if (process.env.NODE_ENV === "test") return;
	console.log(
		formatLogLine(
			"HTTP",
			`${method} ${path} ${status} ${duration}ms | IP: ${ip}`,
		),
	);
};

export const logAuth = (
	username: string,
	role: string,
	action: string,
	ip: string,
): void => {
	if (process.env.NODE_ENV === "test") return;
	console.log(
		formatLogLine("AUTH", `${username} (${role}) -> ${action} | IP: ${ip}`),
	);
};

export const logCron = (jobName: string, status: string): void => {
	if (process.env.NODE_ENV === "test") return;
	console.log(formatLogLine("CRON", `${jobName} -> ${status}`));
};

export const logDb = (info?: string): void => {
	if (process.env.NODE_ENV === "test") return;
	const dbInfo = info || getDbConnectionInfo();
	console.log(
		formatLogLine("DB", `Connected to PostgreSQL at ${dbInfo}`),
	);
};

export const logError = (code: string | number, message: string): void => {
	if (process.env.NODE_ENV === "test") return;
	console.error(formatLogLine("ERROR", `[${code}] ${message}`));
};

const isLivenessPath = (path: string): boolean => {
	return (
		path === "/api/health" ||
		path.startsWith("/api/health?") ||
		path === "/api/ping" ||
		path.startsWith("/api/ping?") ||
		path === "/favicon.ico" ||
		path.startsWith("/favicon.ico?")
	);
};

/**
 * Middleware ghi log các HTTP request theo định dạng 1 dòng chuẩn Docker container
 */
export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	if (process.env.NODE_ENV === "test") {
		next();
		return;
	}

	const startTime = Date.now();
	const clientIp = getClientIp(req);

	res.on("finish", () => {
		const url = req.originalUrl || req.url;

		if (isLivenessPath(url)) {
			return; // Bỏ qua log [HTTP] cho endpoint liveness: /api/health, /api/ping, /favicon.ico
		}

		const duration = Date.now() - startTime;
		const method = req.method;
		const status = res.statusCode;

		logHttp(method, url, status, duration, clientIp);
	});

	next();
};
