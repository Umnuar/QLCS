import bcrypt from "bcryptjs";
import type { Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";

/**
 * GET /api/users
 * Lấy danh sách tài khoản (chỉ Admin, kèm thông tin thôn từ bảng villages, giấu password_hash).
 */
export const getUsers = async (_req: AuthRequest, res: Response) => {
	try {
		const usersList = await (prisma as any).users.findMany({
			select: {
				id: true,
				username: true,
				role: true,
				avatar_url: true,
				village_id: true,
				created_at: true,
				updated_at: true,
				village: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: [{ role: "asc" }, { username: "asc" }],
		});

		res.json({ data: usersList });
	} catch (error) {
		console.error("getUsers error:", error);
		res.status(500).json({ error: "Lỗi server khi lấy danh sách tài khoản" });
	}
};

/**
 * POST /api/users
 * Tạo tài khoản cán bộ mới (bắt buộc role 'user' hoặc 'admin', bcrypt hash password, gán village_id).
 */
export const createUser = async (req: AuthRequest, res: Response) => {
	try {
		const { username, password, role = "user", village_id } = req.body;

		if (!username || !username.trim()) {
			res.status(400).json({ error: "Tên đăng nhập không được để trống" });
			return;
		}
		if (!password || password.length < 6) {
			res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
			return;
		}
		if (!["user", "admin"].includes(role)) {
			res
				.status(400)
				.json({ error: "Vai trò (role) phải là 'user' hoặc 'admin'" });
			return;
		}

		const cleanUsername = username.trim().toLowerCase();

		// Kiểm tra tên đăng nhập đã tồn tại chưa
		const existingUser = await (prisma as any).users.findUnique({
			where: { username: cleanUsername },
		});
		if (existingUser) {
			res.status(409).json({ error: "Tên đăng nhập đã tồn tại" });
			return;
		}

		// Nếu truyền village_id, kiểm tra thôn có tồn tại không
		const validVillageId = village_id || null;
		if (validVillageId) {
			const village = await (prisma as any).villages.findUnique({
				where: { id: validVillageId },
			});
			if (!village) {
				res.status(400).json({ error: "Thôn được chọn không tồn tại" });
				return;
			}
		}

		const password_hash = await bcrypt.hash(password, 12);
		const newUser = await (prisma as any).users.create({
			data: {
				username: cleanUsername,
				password_hash,
				role,
				village_id: validVillageId,
			},
			select: {
				id: true,
				username: true,
				role: true,
				avatar_url: true,
				village_id: true,
				created_at: true,
				updated_at: true,
				village: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		res.status(201).json({
			message: "Tạo tài khoản thành công",
			data: newUser,
		});
	} catch (error) {
		console.error("createUser error:", error);
		res.status(500).json({ error: "Lỗi server khi tạo tài khoản" });
	}
};

/**
 * PUT /api/users/:id
 * Cập nhật username, role, village_id.
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
	try {
		const { id } = req.params;
		const { username, role, village_id } = req.body;

		const user = await (prisma as any).users.findUnique({ where: { id } });
		if (!user) {
			res.status(404).json({ error: "Không tìm thấy tài khoản" });
			return;
		}

		const updateData: any = { updated_at: new Date() };

		if (username !== undefined) {
			const cleanUsername = username.trim().toLowerCase();
			if (!cleanUsername) {
				res.status(400).json({ error: "Tên đăng nhập không được để trống" });
				return;
			}
			if (cleanUsername !== user.username) {
				const existing = await (prisma as any).users.findUnique({
					where: { username: cleanUsername },
				});
				if (existing) {
					res.status(409).json({ error: "Tên đăng nhập đã tồn tại" });
					return;
				}
				updateData.username = cleanUsername;
			}
		}

		if (role !== undefined) {
			if (!["user", "admin"].includes(role)) {
				res
					.status(400)
					.json({ error: "Vai trò (role) phải là 'user' hoặc 'admin'" });
				return;
			}
			updateData.role = role;
		}

		if (village_id !== undefined) {
			if (village_id) {
				const village = await (prisma as any).villages.findUnique({
					where: { id: village_id },
				});
				if (!village) {
					res.status(400).json({ error: "Thôn được chọn không tồn tại" });
					return;
				}
				updateData.village_id = village_id;
			} else {
				updateData.village_id = null;
			}
		}

		const updatedUser = await (prisma as any).users.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				username: true,
				role: true,
				avatar_url: true,
				village_id: true,
				created_at: true,
				updated_at: true,
				village: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		res.json({
			message: "Cập nhật tài khoản thành công",
			data: updatedUser,
		});
	} catch (error) {
		console.error("updateUser error:", error);
		res.status(500).json({ error: "Lỗi server khi cập nhật tài khoản" });
	}
};

/**
 * POST /api/users/:id/reset-password
 * Đổi/reset mật khẩu tài khoản.
 */
export const resetPassword = async (req: AuthRequest, res: Response) => {
	try {
		const { id } = req.params;
		const { newPassword, password } = req.body;
		const passToSet = newPassword || password;

		if (!passToSet || passToSet.length < 6) {
			res.status(400).json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" });
			return;
		}

		const user = await (prisma as any).users.findUnique({ where: { id } });
		if (!user) {
			res.status(404).json({ error: "Không tìm thấy tài khoản" });
			return;
		}

		const password_hash = await bcrypt.hash(passToSet, 12);

		await (prisma as any).$transaction([
			(prisma as any).users.update({
				where: { id },
				data: {
					password_hash,
					updated_at: new Date(),
				},
			}),
			(prisma as any).refresh_tokens.deleteMany({
				where: { user_id: id },
			}),
		]);

		res.json({ message: "Đặt lại mật khẩu thành công" });
	} catch (error) {
		console.error("resetPassword error:", error);
		res.status(500).json({ error: "Lỗi server khi đặt lại mật khẩu" });
	}
};

/**
 * DELETE /api/users/:id
 * Xóa tài khoản cán bộ (chặn tự xóa chính mình).
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
	try {
		const { id } = req.params;

		if (req.user?.id === id) {
			res
				.status(400)
				.json({ error: "Không thể tự xóa tài khoản của chính mình" });
			return;
		}

		const user = await (prisma as any).users.findUnique({ where: { id } });
		if (!user) {
			res.status(404).json({ error: "Không tìm thấy tài khoản" });
			return;
		}

		await (prisma as any).$transaction([
			(prisma as any).refresh_tokens.deleteMany({ where: { user_id: id } }),
			(prisma as any).audit_logs.updateMany({
				where: { user_id: id },
				data: { user_id: null },
			}),
			(prisma as any).profile_audit_log.updateMany({
				where: { user_id: id },
				data: { user_id: null },
			}),
			(prisma as any).users.delete({ where: { id } }),
		]);

		res.json({ message: "Xóa tài khoản thành công" });
	} catch (error) {
		console.error("deleteUser error:", error);
		res.status(500).json({ error: "Lỗi server khi xóa tài khoản" });
	}
};
