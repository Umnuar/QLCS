import type { Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const getSettings = async (_req: AuthRequest, res: Response) => {
	try {
		const settings = await (prisma as any).settings.findMany();
		const data: Record<string, string> = {};
		for (const s of settings) {
			data[s.key] = s.value;
		}
		res.json({ data });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
	try {
		const updates = req.body;
		if (!updates || typeof updates !== "object") {
			res.status(400).json({ error: "Body phải là object" });
			return;
		}
		for (const [key, value] of Object.entries(updates)) {
			await (prisma as any).settings.upsert({
				where: { key },
				update: { value: String(value) },
				create: { key, value: String(value) },
			});
		}
		res.json({ message: "Cập nhật cài đặt thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};
