import type { Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { isValidUUID } from "../utils/audit";

/**
 * GET /api/analytics/overview
 * Tổng hợp số liệu toàn xã:
 * - Tổng số hồ sơ Chúc Thọ, số đã nhận/chưa nhận quà, tỷ lệ % hoàn thành.
 * - Cơ cấu theo 10 mốc tuổi tròn (60, 65, 70, 75, 80, 85, 90, 95, 100, >100).
 * - Tổng hợp 6 diện HTXH (age75plus, age70to74poor, bao_tro, huu_tri, huu_tuat_bao_hiem, nguoi_co_cong).
 */
export const getOverview = async (req: AuthRequest, res: Response) => {
	try {
		const whereCt: any = { is_deleted: false };
		const whereHtxh: any = { is_deleted: false };

		// Phân quyền: Cán bộ thôn chỉ xem dữ liệu của thôn mình
		if (isValidUUID(req.user?.village_id)) {
			whereCt.village_id = req.user.village_id;
			whereHtxh.village_id = req.user.village_id;
		} else if (isValidUUID(req.query.villageId)) {
			const vId = (req.query.villageId as string).trim();
			whereCt.village_id = vId;
			whereHtxh.village_id = vId;
		}

		if (req.query.calculationYear) {
			const year = parseInt(req.query.calculationYear as string);
			if (!isNaN(year)) {
				whereCt.calculation_year = year;
				whereHtxh.calculation_year = year;
			}
		}

		// Thực hiện truy vấn song song cho Chúc Thọ
		const [
			ctTotal,
			ctReceived,
			age60,
			age65,
			age70,
			age75,
			age80,
			age85,
			age90,
			age95,
			age100,
			ageOver100,
		] = await Promise.all([
			(prisma as any).profiles.count({ where: whereCt }),
			(prisma as any).profiles.count({ where: { ...whereCt, received: true } }),
			(prisma as any).profiles.count({
				where: { ...whereCt, age60: { not: "" } },
			}),
			(prisma as any).profiles.count({
				where: { ...whereCt, age65: { not: "" } },
			}),
			(prisma as any).profiles.count({
				where: { ...whereCt, age70: { not: "" } },
			}),
			(prisma as any).profiles.count({
				where: { ...whereCt, age75: { not: "" } },
			}),
			(prisma as any).profiles.count({
				where: { ...whereCt, age80: { not: "" } },
			}),
			(prisma as any).profiles.count({
				where: { ...whereCt, age85: { not: "" } },
			}),
			(prisma as any).profiles.count({
				where: { ...whereCt, age90: { not: "" } },
			}),
			(prisma as any).profiles.count({
				where: { ...whereCt, age95: { not: "" } },
			}),
			(prisma as any).profiles.count({
				where: { ...whereCt, age100: { not: "" } },
			}),
			(prisma as any).profiles.count({
				where: { ...whereCt, age_over_100: { not: "" } },
			}),
		]);

		// Thực hiện truy vấn song song cho Hưu Trí Xã Hội
		const [
			htxhTotal,
			htxhReceived,
			age75plus,
			age70to74poor,
			bao_tro,
			huu_tri,
			huu_tuat_bao_hiem,
			nguoi_co_cong,
		] = await Promise.all([
			(prisma as any).htxh_profiles.count({ where: whereHtxh }),
			(prisma as any).htxh_profiles.count({
				where: { ...whereHtxh, received: true },
			}),
			(prisma as any).htxh_profiles.count({
				where: { ...whereHtxh, age75plus: { not: "" } },
			}),
			(prisma as any).htxh_profiles.count({
				where: { ...whereHtxh, age70to74poor: { not: "" } },
			}),
			(prisma as any).htxh_profiles.count({
				where: { ...whereHtxh, bao_tro: { not: "" } },
			}),
			(prisma as any).htxh_profiles.count({
				where: { ...whereHtxh, huu_tri: { not: "" } },
			}),
			(prisma as any).htxh_profiles.count({
				where: { ...whereHtxh, huu_tuat_bao_hiem: { not: "" } },
			}),
			(prisma as any).htxh_profiles.count({
				where: { ...whereHtxh, nguoi_co_cong: { not: "" } },
			}),
		]);

		const ctUnreceived = Math.max(0, ctTotal - ctReceived);
		const ctCompletionRate =
			ctTotal > 0 ? Number(((ctReceived / ctTotal) * 100).toFixed(2)) : 0;

		const htxhUnreceived = Math.max(0, htxhTotal - htxhReceived);
		const htxhCompletionRate =
			htxhTotal > 0 ? Number(((htxhReceived / htxhTotal) * 100).toFixed(2)) : 0;

		res.json({
			success: true,
			chuctho: {
				total: ctTotal,
				received: ctReceived,
				unreceived: ctUnreceived,
				completionRate: ctCompletionRate,
				ageStructure: {
					age60,
					age65,
					age70,
					age75,
					age80,
					age85,
					age90,
					age95,
					age100,
					age_over_100: ageOver100,
				},
			},
			htxh: {
				total: htxhTotal,
				received: htxhReceived,
				unreceived: htxhUnreceived,
				completionRate: htxhCompletionRate,
				categories: {
					age75plus,
					age70to74poor,
					bao_tro,
					huu_tri,
					huu_tuat_bao_hiem,
					nguoi_co_cong,
				},
			},
		});
	} catch (error) {
		console.error("getOverview error:", error);
		res.status(500).json({ error: "Lỗi server khi thống kê tổng quan" });
	}
};

/**
 * GET /api/analytics/by-village
 * Thống kê đối soát chi tiết giữa các thôn:
 * Mỗi thôn gồm số lượng Chúc Thọ, đã nhận, chưa nhận, tỷ lệ %, số lượng HTXH.
 */
export const getByVillage = async (req: AuthRequest, res: Response) => {
	try {
		const whereVillage: any = {};
		if (req.user?.village_id) {
			whereVillage.id = req.user.village_id;
		}

		const villages = await (prisma as any).villages.findMany({
			where: whereVillage,
			orderBy: { name: "asc" },
		});

		const calculationYear = req.query.calculationYear
			? parseInt(req.query.calculationYear as string)
			: undefined;

		const villageIds = villages.map((v: any) => v.id);

		const ctWhere: any = {
			village_id: { in: villageIds },
			is_deleted: false,
		};
		const htxhWhere: any = {
			village_id: { in: villageIds },
			is_deleted: false,
		};
		if (calculationYear) {
			ctWhere.calculation_year = calculationYear;
			htxhWhere.calculation_year = calculationYear;
		}

		const [profileGroups, htxhGroups] = await Promise.all([
			(prisma as any).profiles.groupBy({
				by: ["village_id", "received"],
				where: ctWhere,
				_count: { _all: true },
			}),
			(prisma as any).htxh_profiles.groupBy({
				by: ["village_id", "received"],
				where: htxhWhere,
				_count: { _all: true },
			}),
		]);

		const ctMap = new Map<string, { total: number; received: number }>();
		for (const g of profileGroups) {
			if (!g.village_id) continue;
			const entry = ctMap.get(g.village_id) || { total: 0, received: 0 };
			const count = g._count?._all || g._count?.id || 0;
			entry.total += count;
			if (g.received === true) {
				entry.received += count;
			}
			ctMap.set(g.village_id, entry);
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

		const villageStats = villages.map((v: any) => {
			const ct = ctMap.get(v.id) || { total: 0, received: 0 };
			const htxh = htxhMap.get(v.id) || { total: 0, received: 0 };
			const chucthoTotal = ct.total;
			const chucthoReceived = ct.received;
			const chucthoUnreceived = Math.max(0, chucthoTotal - chucthoReceived);
			const chucthoCompletionRate =
				chucthoTotal > 0
					? Number(((chucthoReceived / chucthoTotal) * 100).toFixed(2))
					: 0;

			const htxhTotal = htxh.total;
			const htxhReceived = htxh.received;
			const htxhUnreceived = Math.max(0, htxhTotal - htxhReceived);
			const htxhCompletionRate =
				htxhTotal > 0
					? Number(((htxhReceived / htxhTotal) * 100).toFixed(2))
					: 0;

			return {
				village_id: v.id,
				village_name: v.name,
				chuctho: {
					total: chucthoTotal,
					received: chucthoReceived,
					unreceived: chucthoUnreceived,
					completionRate: chucthoCompletionRate,
				},
				htxh: {
					total: htxhTotal,
					received: htxhReceived,
					unreceived: htxhUnreceived,
					completionRate: htxhCompletionRate,
				},
			};
		});

		// Tính tổng toàn bộ
		const summary = villageStats.reduce(
			(acc: any, curr: any) => {
				acc.chucthoTotal += curr.chuctho.total;
				acc.chucthoReceived += curr.chuctho.received;
				acc.chucthoUnreceived += curr.chuctho.unreceived;
				acc.htxhTotal += curr.htxh.total;
				acc.htxhReceived += curr.htxh.received;
				acc.htxhUnreceived += curr.htxh.unreceived;
				return acc;
			},
			{
				chucthoTotal: 0,
				chucthoReceived: 0,
				chucthoUnreceived: 0,
				htxhTotal: 0,
				htxhReceived: 0,
				htxhUnreceived: 0,
				chucthoCompletionRate: 0,
				htxhCompletionRate: 0,
			},
		);

		summary.chucthoCompletionRate =
			summary.chucthoTotal > 0
				? Number(
						((summary.chucthoReceived / summary.chucthoTotal) * 100).toFixed(2),
					)
				: 0;
		summary.htxhCompletionRate =
			summary.htxhTotal > 0
				? Number(((summary.htxhReceived / summary.htxhTotal) * 100).toFixed(2))
				: 0;

		res.json({
			success: true,
			data: villageStats,
			summary,
		});
	} catch (error) {
		console.error("getByVillage error:", error);
		res.status(500).json({ error: "Lỗi server khi thống kê theo thôn" });
	}
};
