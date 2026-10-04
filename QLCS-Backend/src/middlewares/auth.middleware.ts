import type { NextFunction, Request, Response } from "express";
import { type TokenPayload, verifyAccessToken } from "../utils/jwt";

export interface AuthRequest extends Request {
	user?: TokenPayload;
}

/**
 * authenticateToken: Parse JWT from Authorization header, attach user to req.
 */
export const authenticateToken = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;
		const token =
			authHeader && authHeader.startsWith("Bearer ")
				? authHeader.slice(7)
				: null;

		if (!token) {
			res.status(401).json({ error: "Token không được cung cấp" });
			return;
		}

		const decoded = verifyAccessToken(token);
		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
	}
};

/**
 * requireAdmin: Ensure authenticated user has 'admin' role.
 */
export const requireAdmin = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	if (!req.user || req.user.role !== "admin") {
		res.status(403).json({
			error: "Chỉ Quản trị viên (Admin) mới có quyền thực hiện thao tác này",
		});
		return;
	}
	next();
};

/**
 * authorizeVillageScope: Enforce village-level data isolation.
 * - Admin (village_id = null): Can access ALL villages.
 * - Trưởng thôn (village_id = 'xxx'): Can ONLY access their own village.
 *
 * This middleware runs AFTER authenticateToken.
 * It checks req.body.village_id, req.query.villageId, and req.params
 * to ensure users cannot access data from other villages.
 */
export const authorizeVillageScope = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Chưa xác thực" });
			return;
		}

		// Admin can access everything
		if (req.user.role === "admin") {
			next();
			return;
		}

		// For non-admin users, enforce village scope and require village assignment
		if (!req.user.village_id) {
			res
				.status(403)
				.json({ error: "Tài khoản chưa được phân công thôn quản lý" });
			return;
		}

		const userVillageId = req.user.village_id;

		// Check query params
		if (req.query.villageId && req.query.villageId !== userVillageId) {
			res.status(403).json({ error: "Không có quyền truy cập thôn khác" });
			return;
		}

		// Check body village_id
		if (req.body.village_id && req.body.village_id !== userVillageId) {
			res.status(403).json({ error: "Không có quyền truy cập thôn khác" });
			return;
		}

		// Auto-inject village_id into query for GET requests
		if (req.method === "GET") {
			req.query.villageId = userVillageId;
		}

		// Auto-inject village_id into body for POST/PUT requests
		if (["POST", "PUT", "PATCH"].includes(req.method)) {
			if (req.body && typeof req.body === "object") {
				req.body.village_id = userVillageId;
			}
		}

		next();
	} catch (error) {
		res.status(500).json({ error: "Lỗi phân quyền" });
	}
};
