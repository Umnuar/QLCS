import type { Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { isValidUUID } from "../utils/audit";

/**
 * GET /api/audit-logs
 * Lấy danh sách nhật ký biến động từ profile_audit_log:
 * - Hỗ trợ phân trang Offset (page, limit)
 * - Lọc theo villageId, action, profileType
 * - Tìm kiếm theo tên người dùng hoặc ghi chú
 * - Sắp xếp mới nhất trước
 * - Chỉ Admin hoặc tự động lọc theo thôn nếu là user cán bộ thôn
 */
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
	try {
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.max(1, parseInt(req.query.limit as string) || 50);
		const skip = (page - 1) * limit;

		const { villageId, action, profileType, search, userId } = req.query;

		const where: any = {};

		// Phân quyền thôn
		if (isValidUUID(req.user?.village_id)) {
			where.village_id = req.user.village_id;
		} else if (isValidUUID(villageId)) {
			where.village_id = (villageId as string).trim();
		}

		if (isValidUUID(userId)) {
			where.user_id = (userId as string).trim();
		}

		if (action && typeof action === "string" && action !== "ALL") {
			const act = action.trim();
			if (act === "DELETE") {
				where.action = { in: ["DELETE", "SOFT_DELETE", "BULK_SOFT_DELETE"] };
			} else if (act === "IMPORT") {
				where.action = { in: ["IMPORT", "IMPORT_CREATE", "IMPORT_UPDATE"] };
			} else {
				where.action = act;
			}
		}

		if (profileType && typeof profileType === "string") {
			where.profile_type = profileType;
		}

		if (search && typeof search === "string" && search.trim()) {
			const cleanSearch = search.trim();
			where.OR = [
				{ note: { contains: cleanSearch, mode: "insensitive" } },
				{ action: { contains: cleanSearch, mode: "insensitive" } },
				{ user: { username: { contains: cleanSearch, mode: "insensitive" } } },
			];
		}

		const [data, total] = await Promise.all([
			(prisma as any).profile_audit_log.findMany({
				where,
				orderBy: { created_at: "desc" },
				skip,
				take: limit,
				include: {
					user: {
						select: {
							id: true,
							username: true,
							role: true,
						},
					},
				},
			}),
			(prisma as any).profile_audit_log.count({ where }),
		]);

		const totalPages = Math.ceil(total / limit);

		res.json({
			data,
			pagination: {
				total,
				page,
				limit,
				totalPages,
			},
		});
	} catch (error) {
		console.error("getAuditLogs error:", error);
		res
			.status(500)
			.json({ error: "Lỗi server khi lấy danh sách nhật ký biến động" });
	}
};
