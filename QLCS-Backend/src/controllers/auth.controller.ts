import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { getClientIp } from "../middlewares/logger.middleware";
import {
	generateAccessToken,
	generateRefreshToken,
	type TokenPayload,
	verifyRefreshToken,
} from "../utils/jwt";

// POST /api/auth/setup - Create first admin account
export const setupAdmin = async (req: Request, res: Response) => {
	try {
		const userCount = await (prisma as any).users.count();
		if (userCount > 0) {
			res.status(400).json({ error: "Admin đã được tạo" });
			return;
		}
		const { username, password } = req.body;
		if (!username || !password) {
			res.status(400).json({ error: "Username và password là bắt buộc" });
			return;
		}
		const cleanUsername = String(username || "")
			.trim()
			.toLowerCase();
		const password_hash = await bcrypt.hash(password, 12);
		const user = await (prisma as any).users.create({
			data: { username: cleanUsername, password_hash, role: "admin" },
		});
		res.status(201).json({
			message: "Admin đã được tạo thành công",
			data: { id: user.id, username: user.username, role: user.role },
		});
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;
		const clientIp = getClientIp(req);

		if (!username || !password) {
			res.status(400).json({ error: "Sai thông tin đăng nhập" });
			return;
		}
		const cleanUsername = String(username || "")
			.trim()
			.toLowerCase();
		const user = await (prisma as any).users.findUnique({
			where: { username: cleanUsername },
		});
		if (!user) {
			console.log(
				`\x1b[31m[AUTH-ALERT] Đăng nhập thất bại: Tài khoản "${username}" không tồn tại trong CSDL! (IP: ${clientIp})\x1b[0m`,
			);
			res.status(401).json({ error: "Sai thông tin đăng nhập" });
			return;
		}
		const validPassword = await bcrypt.compare(password, user.password_hash);
		if (!validPassword) {
			console.log(
				`\x1b[31m[AUTH-ALERT] Đăng nhập thất bại: Tài khoản "${cleanUsername}" nhập SAI MẬT KHẨU! (IP: ${clientIp})\x1b[0m`,
			);
			res.status(401).json({ error: "Sai thông tin đăng nhập" });
			return;
		}
		console.log(
			`\x1b[32m[AUTH-SUCCESS] Người dùng "${user.username}" [${user.role}] đăng nhập thành công! (IP: ${clientIp})\x1b[0m`,
		);
		const payload: TokenPayload = {
			id: user.id,
			username: user.username,
			role: user.role,
			village_id: user.village_id,
		};
		const accessToken = generateAccessToken(payload);
		const refreshToken = generateRefreshToken(payload);
		// Store refresh token in DB
		await (prisma as any).refresh_tokens.create({
			data: {
				user_id: user.id,
				token: refreshToken,
				expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			},
		});
		res.json({
			data: {
				accessToken,
				refreshToken,
				user: {
					id: user.id,
					username: user.username,
					role: user.role,
					village_id: user.village_id,
					avatar_url: user.avatar_url,
				},
			},
		});
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

// POST /api/auth/refresh
export const refresh = async (req: Request, res: Response) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			res.status(400).json({ error: "Refresh token là bắt buộc" });
			return;
		}
		// Verify token exists in DB
		const storedToken = await (prisma as any).refresh_tokens.findUnique({
			where: { token: refreshToken },
		});
		if (!storedToken) {
			res.status(401).json({ error: "Refresh token không hợp lệ" });
			return;
		}
		// Verify JWT signature
		const decoded = verifyRefreshToken(refreshToken);
		// Get fresh user data
		const user = await (prisma as any).users.findUnique({
			where: { id: decoded.id },
		});
		if (!user) {
			res.status(401).json({ error: "User không tồn tại" });
			return;
		}
		const payload: TokenPayload = {
			id: user.id,
			username: user.username,
			role: user.role,
			village_id: user.village_id,
		};
		const newAccessToken = generateAccessToken(payload);
		const newRefreshToken = generateRefreshToken(payload);
		// Rotate: delete old, create new
		await (prisma as any).refresh_tokens.delete({
			where: { token: refreshToken },
		});
		await (prisma as any).refresh_tokens.create({
			data: {
				user_id: user.id,
				token: newRefreshToken,
				expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			},
		});
		res.json({
			data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
		});
	} catch (error) {
		res.status(401).json({ error: "Refresh token hết hạn hoặc không hợp lệ" });
	}
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response) => {
	try {
		const user = await (prisma as any).users.findUnique({
			where: { id: req.user!.id },
			select: {
				id: true,
				username: true,
				role: true,
				village_id: true,
				avatar_url: true,
				created_at: true,
			},
		});
		if (!user) {
			res.status(404).json({ error: "User không tồn tại" });
			return;
		}
		res.json({ data: user });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

// PUT /api/auth/password
export const changePassword = async (req: AuthRequest, res: Response) => {
	try {
		const { currentPassword, newPassword } = req.body;
		if (!currentPassword) {
			res.status(400).json({ error: "Mật khẩu hiện tại là bắt buộc" });
			return;
		}
		if (!newPassword) {
			res.status(400).json({ error: "Mật khẩu mới là bắt buộc" });
			return;
		}
		const user = await (prisma as any).users.findUnique({
			where: { id: req.user!.id },
		});
		if (!user) {
			res.status(404).json({ error: "User không tồn tại" });
			return;
		}

		const valid = await bcrypt.compare(currentPassword, user.password_hash);
		if (!valid) {
			res.status(400).json({ error: "Mật khẩu hiện tại không đúng" });
			return;
		}

		const password_hash = await bcrypt.hash(newPassword, 12);
		await (prisma as any).users.update({
			where: { id: req.user!.id },
			data: { password_hash, updated_at: new Date() },
		});
		await (prisma as any).refresh_tokens.deleteMany({
			where: { user_id: req.user!.id },
		});
		res.json({ message: "Đổi mật khẩu thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

// PUT /api/auth/username
export const changeUsername = async (req: AuthRequest, res: Response) => {
	try {
		const { newUsername } = req.body;
		const cleanNewUsername = String(newUsername || "")
			.trim()
			.toLowerCase();
		if (!cleanNewUsername) {
			res.status(400).json({ error: "Username mới là bắt buộc" });
			return;
		}
		const existing = await (prisma as any).users.findUnique({
			where: { username: cleanNewUsername },
		});
		if (existing) {
			res.status(409).json({ error: "Username đã tồn tại" });
			return;
		}
		await (prisma as any).users.update({
			where: { id: req.user!.id },
			data: { username: cleanNewUsername, updated_at: new Date() },
		});
		res.json({ message: "Đổi username thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

// POST /api/auth/logout
export const logout = async (req: AuthRequest, res: Response) => {
	try {
		const { refreshToken } = req.body;
		if (refreshToken) {
			await (prisma as any).refresh_tokens.deleteMany({
				where: { token: refreshToken },
			});
		}
		res.json({ message: "Đăng xuất thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

// PUT /api/auth/avatar
export const updateAvatar = async (req: AuthRequest, res: Response) => {
	try {
		const { avatar } = req.body;
		if (!avatar) {
			res.status(400).json({ error: "Avatar data là bắt buộc" });
			return;
		}
		const user = await (prisma as any).users.update({
			where: { id: req.user!.id },
			data: { avatar_url: avatar, updated_at: new Date() },
			select: {
				id: true,
				username: true,
				role: true,
				village_id: true,
				avatar_url: true,
			},
		});
		res.json({ message: "Cập nhật avatar thành công", data: user });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};
