import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

async function getVillageProfileCounts(villageIds: string[]) {
	if (villageIds.length === 0) {
		return {
			profileMap: new Map<string, { total: number; received: number }>(),
			htxhMap: new Map<string, { total: number; received: number }>(),
		};
	}

	const [profileGroups, htxhGroups] = await Promise.all([
		(prisma as any).profiles.groupBy({
			by: ["village_id", "received"],
			where: {
				village_id: { in: villageIds },
				is_deleted: false,
			},
			_count: { _all: true },
		}),
		(prisma as any).htxh_profiles.groupBy({
			by: ["village_id", "received"],
			where: {
				village_id: { in: villageIds },
				is_deleted: false,
			},
			_count: { _all: true },
		}),
	]);

	const profileMap = new Map<string, { total: number; received: number }>();
	for (const g of profileGroups) {
		if (!g.village_id) continue;
		const entry = profileMap.get(g.village_id) || { total: 0, received: 0 };
		const count = g._count?._all || g._count?.id || 0;
		entry.total += count;
		if (g.received === true) {
			entry.received += count;
		}
		profileMap.set(g.village_id, entry);
	}

	const htxhMap = new Map<string, { total: number; received: number }>();
	for (const g of htxhGroups) {
		if (!g.village_id) continue;
		const entry = htxhMap.get(g.village_id) || { total: 0, received: 0 };
		const count = g._count?._all || g._count?.id || 0;
		entry.total += count;
		if (g.received === true) {
			entry.received += count;
		}
		htxhMap.set(g.village_id, entry);
	}

	return { profileMap, htxhMap };
}

export const getVillages = async (req: Request, res: Response) => {
	try {
		const user = (req as any).user;
		const where: any = {};
		// Non-admin users can only see their own village
		if (user && user.village_id) {
			where.id = user.village_id;
		}
		const villages = await (prisma as any).villages.findMany({
			where,
			orderBy: { name: "asc" },
		});

		// Enrich with profile counts using groupBy (batch 2 queries instead of 4N queries)
		const villageIds = villages.map((v: any) => v.id);
		const { profileMap, htxhMap } = await getVillageProfileCounts(villageIds);

		const enriched = villages.map((v: any) => {
			const p = profileMap.get(v.id) || { total: 0, received: 0 };
			const h = htxhMap.get(v.id) || { total: 0, received: 0 };
			return { ...v, total: p.total, received: p.received, htxh_total: h.total, htxh_received: h.received };
		});
		res.json({ data: enriched });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server khi lấy danh sách thôn" });
	}
};

export const createVillage = async (req: Request, res: Response) => {
	try {
		const user = (req as any).user;
		if (user?.role !== "admin") {
			res.status(403).json({ error: "Chỉ Admin mới có quyền thực hiện" });
			return;
		}
		const { name } = req.body;
		if (!name || typeof name !== "string" || name.trim().length < 2) {
			res.status(400).json({ error: "Tên thôn là bắt buộc và phải có ít nhất 2 ký tự" });
			return;
		}
		const trimmedName = name.trim();
		const existing = await (prisma as any).villages.findFirst({
			where: { name: { equals: trimmedName, mode: "insensitive" } },
		});
		if (existing) {
			res.status(409).json({ error: `Thôn "${trimmedName}" đã tồn tại trong hệ thống` });
			return;
		}
		const newVillage = await (prisma as any).villages.create({
			data: { name: trimmedName },
		});
		res.status(201).json({ data: newVillage });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server khi tạo thôn" });
	}
};

export const updateVillage = async (req: Request, res: Response) => {
	try {
		const user = (req as any).user;
		if (user?.role !== "admin") {
			res.status(403).json({ error: "Chỉ Admin mới có quyền thực hiện" });
			return;
		}
		const id = req.params.id as string;
		const { name } = req.body;
		if (!name || typeof name !== "string" || name.trim().length < 2) {
			res.status(400).json({ error: "Tên thôn là bắt buộc và phải có ít nhất 2 ký tự" });
			return;
		}
		const trimmedName = name.trim();
		const existing = await (prisma as any).villages.findFirst({
			where: {
				name: { equals: trimmedName, mode: "insensitive" },
				NOT: { id },
			},
		});
		if (existing) {
			res.status(409).json({ error: `Thôn "${trimmedName}" đã tồn tại trong hệ thống` });
			return;
		}
		const updatedVillage = await (prisma as any).villages.update({
			where: { id },
			data: { name: trimmedName },
		});
		res.json({ data: updatedVillage });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server khi cập nhật thôn" });
	}
};

export const deleteVillage = async (req: Request, res: Response) => {
	try {
		const user = (req as any).user;
		if (user?.role !== "admin") {
			res.status(403).json({ error: "Chỉ Admin mới có quyền thực hiện" });
			return;
		}
		const id = req.params.id as string;

		const [userCount, profileCount, htxhCount] = await Promise.all([
			(prisma as any).users.count({ where: { village_id: id } }),
			(prisma as any).profiles.count({ where: { village_id: id } }),
			(prisma as any).htxh_profiles.count({ where: { village_id: id } }),
		]);

		if (userCount > 0 || profileCount > 0 || htxhCount > 0) {
			const totalRecords = profileCount + htxhCount;
			res.status(400).json({
				error: `Không thể xóa thôn vì còn ${totalRecords} hồ sơ (${profileCount} Chúc thọ, ${htxhCount} HTXH) và ${userCount} cán bộ đang liên kết.`,
			});
			return;
		}

		await (prisma as any).villages.delete({
			where: { id },
		});
		res.json({ message: "Đã xóa thôn thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server khi xóa thôn" });
	}
};

export const getVillageStats = async (req: Request, res: Response) => {
	try {
		const user = (req as any).user;
		const where: any = {};
		if (user && user.village_id) {
			where.id = user.village_id;
		}
		const villages = await (prisma as any).villages.findMany({
			where,
			orderBy: { name: "asc" },
		});
		const villageIds = villages.map((v: any) => v.id);
		const { profileMap, htxhMap } = await getVillageProfileCounts(villageIds);

		const stats = villages.map((v: any) => {
			const p = profileMap.get(v.id) || { total: 0, received: 0 };
			const h = htxhMap.get(v.id) || { total: 0, received: 0 };
			return {
				id: v.id,
				name: v.name,
				total: p.total,
				received: p.received,
				htxh_total: h.total,
				htxh_received: h.received,
			};
		});
		res.json({ data: stats });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};
