import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
	formatTimestamp,
	getDbConnectionInfo,
	formatLogLine,
	logStart,
	logHttp,
	logAuth,
	logCron,
	logDb,
	logError,
	requestLogger,
} from "../middlewares/logger.middleware";

describe("Standardized Docker Logging", () => {
	it("formats timestamp in HH:mm:ss 24h format", () => {
		const testDate = new Date(2026, 9, 9, 8, 5, 9);
		const formatted = formatTimestamp(testDate);
		expect(formatted).toBe("08:05:09");
	});

	it("extracts DB connection info in <HOST>:<PORT>/<DATABASE> format", () => {
		const originalUrl = process.env.DATABASE_URL;
		try {
			process.env.DATABASE_URL = "postgresql://postgres:secret@localhost:5432/qlcs_db?schema=public";
			expect(getDbConnectionInfo()).toBe("localhost:5432/qlcs_db");

			process.env.DATABASE_URL = "postgresql://user:pass@192.168.1.100:6543/dakha_qlcs";
			expect(getDbConnectionInfo()).toBe("192.168.1.100:6543/dakha_qlcs");
		} finally {
			process.env.DATABASE_URL = originalUrl;
		}
	});

	it("formats log lines as [HH:mm:ss] [TAG] Message without ANSI when non-TTY", () => {
		const line = formatLogLine("START", "Service ready on port 5000 | DB: Connected | Env: production");
		// In test runner process.stdout.isTTY is false or undefined
		expect(line).toMatch(/^\[\d{2}:\d{2}:\d{2}\] \[START\] Service ready on port 5000 \| DB: Connected \| Env: production$/);
		expect(line).not.toContain("\x1b[");
	});

	describe("Log helpers output format", () => {
		let consoleLogSpy: any;
		let consoleErrorSpy: any;
		const originalEnv = process.env.NODE_ENV;

		beforeEach(() => {
			process.env.NODE_ENV = "development";
			consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		});

		afterEach(() => {
			process.env.NODE_ENV = originalEnv;
			consoleLogSpy.mockRestore();
			consoleErrorSpy.mockRestore();
		});

		it("[START] matches '[START] Service ready on port <PORT> | DB: Connected | Env: <NODE_ENV>'", () => {
			logStart(5000, "Connected", "production");
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringMatching(/^\[\d{2}:\d{2}:\d{2}\] \[START\] Service ready on port 5000 \| DB: Connected \| Env: production$/)
			);
		});

		it("[HTTP] matches '[HTTP] <METHOD> <PATH> <STATUS> <DURATION>ms | IP: <IP>'", () => {
			logHttp("GET", "/api/villages", 200, 15, "127.0.0.1");
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringMatching(/^\[\d{2}:\d{2}:\d{2}\] \[HTTP\] GET \/api\/villages 200 15ms \| IP: 127\.0\.0\.1$/)
			);
		});

		it("[AUTH] matches '[AUTH] <username> (<role>) -> <ACTION> | IP: <IP>'", () => {
			logAuth("admin", "admin", "LOGIN_SUCCESS", "127.0.0.1");
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringMatching(/^\[\d{2}:\d{2}:\d{2}\] \[AUTH\] admin \(admin\) -> LOGIN_SUCCESS \| IP: 127\.0\.0\.1$/)
			);
		});

		it("[CRON] matches '[CRON] <JobName> -> <STATUS>'", () => {
			logCron("DailyBackup", "SUCCESS");
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringMatching(/^\[\d{2}:\d{2}:\d{2}\] \[CRON\] DailyBackup -> SUCCESS$/)
			);
		});

		it("[DB] matches '[DB] Connected to PostgreSQL at <HOST>:<PORT>/<DATABASE>'", () => {
			logDb("localhost:5432/qlcs_db");
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringMatching(/^\[\d{2}:\d{2}:\d{2}\] \[DB\] Connected to PostgreSQL at localhost:5432\/qlcs_db$/)
			);
		});

		it("[ERROR] matches '[ERROR] [<code>] <message>'", () => {
			logError(500, "Database connection failure");
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.stringMatching(/^\[\d{2}:\d{2}:\d{2}\] \[ERROR\] \[500\] Database connection failure$/)
			);
		});
	});

	describe("requestLogger liveness filtering", () => {
		let consoleLogSpy: any;
		const originalEnv = process.env.NODE_ENV;

		beforeEach(() => {
			process.env.NODE_ENV = "development";
			consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		});

		afterEach(() => {
			process.env.NODE_ENV = originalEnv;
			consoleLogSpy.mockRestore();
		});

		const createMockReqRes = (url: string) => {
			let finishCb: (() => void) | undefined;
			const req: any = {
				method: "GET",
				url,
				originalUrl: url,
				headers: {},
				ip: "127.0.0.1",
			};
			const res: any = {
				statusCode: 200,
				on: (event: string, cb: () => void) => {
					if (event === "finish") finishCb = cb;
				},
			};
			const next = vi.fn();
			return { req, res, next, triggerFinish: () => finishCb?.() };
		};

		it("filters /api/health", () => {
			const { req, res, next, triggerFinish } = createMockReqRes("/api/health");
			requestLogger(req, res, next);
			expect(next).toHaveBeenCalled();
			triggerFinish();
			expect(consoleLogSpy).not.toHaveBeenCalled();
		});

		it("filters /api/ping", () => {
			const { req, res, next, triggerFinish } = createMockReqRes("/api/ping");
			requestLogger(req, res, next);
			expect(next).toHaveBeenCalled();
			triggerFinish();
			expect(consoleLogSpy).not.toHaveBeenCalled();
		});

		it("filters /favicon.ico", () => {
			const { req, res, next, triggerFinish } = createMockReqRes("/favicon.ico");
			requestLogger(req, res, next);
			expect(next).toHaveBeenCalled();
			triggerFinish();
			expect(consoleLogSpy).not.toHaveBeenCalled();
		});

		it("logs normal API requests", () => {
			const { req, res, next, triggerFinish } = createMockReqRes("/api/profiles");
			requestLogger(req, res, next);
			expect(next).toHaveBeenCalled();
			triggerFinish();
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringMatching(/\[HTTP\] GET \/api\/profiles 200 \d+ms \| IP: 127\.0\.0\.1/)
			);
		});
	});
});
