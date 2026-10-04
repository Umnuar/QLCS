import type { Response } from "express";
import cron from "node-cron";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";

/**
 * GET /api/backups/snapshot
 * Xuất snapshot JSON của các bảng chính (chỉ Admin).
 */
export const getSnapshot = async (req: AuthRequest, res: Response) => {
	try {
		const [villages, users, profiles, htxh_profiles, settings, auditLogs] =
			await Promise.all([
				(prisma as any).villages.findMany({ orderBy: { name: "asc" } }),
				(prisma as any).users.findMany({
					select: {
						id: true,
						username: true,
						role: true,
						avatar_url: true,
						village_id: true,
						created_at: true,
						updated_at: true,
					},
					orderBy: { username: "asc" },
				}),
				(prisma as any).profiles.findMany({
					where: { is_deleted: false },
					orderBy: [{ village_id: "asc" }, { stt: "asc" }],
				}),
				(prisma as any).htxh_profiles.findMany({
					where: { is_deleted: false },
					orderBy: [{ village_id: "asc" }, { stt: "asc" }],
				}),
				(prisma as any).settings.findMany(),
				(prisma as any).profile_audit_log.findMany({
					take: 2000,
					orderBy: { created_at: "desc" },
				}),
			]);

		const snapshot = {
			metadata: {
				app: "qlcs-backend",
				version: "2.0.0",
				timestamp: new Date().toISOString(),
				counts: {
					villages: villages.length,
					users: users.length,
					profiles: profiles.length,
					htxh_profiles: htxh_profiles.length,
					settings: settings.length,
					profile_audit_log: auditLogs.length,
				},
			},
			data: {
				villages,
				users,
				profiles,
				htxh_profiles,
				settings,
				profile_audit_log: auditLogs,
			},
		};

		if (req.query.download === "true") {
			const filename = `qlcs_snapshot_${new Date().toISOString().slice(0, 10)}.json`;
			res.setHeader("Content-Type", "application/json");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${filename}"`,
			);
		}

		res.json(snapshot);
	} catch (error) {
		console.error("getSnapshot error:", error);
		res.status(500).json({ error: "Lỗi server khi xuất snapshot CSDL" });
	}
};

/**
 * POST /api/backups/restore
 * Khôi phục dữ liệu từ snapshot (chỉ Admin).
 */
export const restoreSnapshot = async (req: AuthRequest, res: Response) => {
	try {
		const body = req.body;
		const snapshotData = body.data || body;

		if (!snapshotData || typeof snapshotData !== "object") {
			res.status(400).json({ error: "Dữ liệu snapshot không hợp lệ" });
			return;
		}

		const { villages, profiles, htxh_profiles, settings } = snapshotData;

		let restoredProfiles = 0;
		let restoredHtxh = 0;
		let restoredVillages = 0;

		await (prisma as any).$transaction(async (tx: any) => {
			// 1. Khôi phục thôn nếu có
			if (Array.isArray(villages)) {
				for (const v of villages) {
					if (!v.id || !v.name) continue;
					await tx.villages.upsert({
						where: { id: v.id },
						update: { name: v.name },
						create: {
							id: v.id,
							name: v.name,
							created_at: v.created_at ? new Date(v.created_at) : new Date(),
						},
					});
					restoredVillages++;
				}
			}

			// 2. Khôi phục hồ sơ Chúc Thọ
			if (Array.isArray(profiles)) {
				for (const p of profiles) {
					if (!p.id || !p.name) continue;
					const { village, ...cleanProfile } = p;
					await tx.profiles.upsert({
						where: { id: p.id },
						update: {
							...cleanProfile,
							updated_at: new Date(),
						},
						create: {
							...cleanProfile,
							created_at: p.created_at ? new Date(p.created_at) : new Date(),
							updated_at: new Date(),
						},
					});
					restoredProfiles++;
				}
			}

			// 3. Khôi phục hồ sơ HTXH
			if (Array.isArray(htxh_profiles)) {
				for (const h of htxh_profiles) {
					if (!h.id || !h.name || !h.village_id) continue;
					const { village, ...cleanHtxh } = h;
					await tx.htxh_profiles.upsert({
						where: { id: h.id },
						update: {
							...cleanHtxh,
							updated_at: new Date(),
						},
						create: {
							...cleanHtxh,
							created_at: h.created_at ? new Date(h.created_at) : new Date(),
							updated_at: new Date(),
						},
					});
					restoredHtxh++;
				}
			}

			// 4. Khôi phục settings nếu có
			if (Array.isArray(settings)) {
				for (const s of settings) {
					if (!s.key) continue;
					await tx.settings.upsert({
						where: { key: s.key },
						update: { value: String(s.value) },
						create: { key: s.key, value: String(s.value) },
					});
				}
			}

			// 5. Ghi log hoạt động restore
			await tx.audit_logs.create({
				data: {
					user_id: req.user?.id || null,
					action: "RESTORE_SNAPSHOT",
					details: `Khôi phục CSDL thành công: ${restoredProfiles} Chúc thọ, ${restoredHtxh} HTXH, ${restoredVillages} Thôn`,
					created_at: new Date(),
				},
			});
		});

		res.json({
			success: true,
			message: "Khôi phục dữ liệu từ snapshot thành công",
			restored: {
				villages: restoredVillages,
				profiles: restoredProfiles,
				htxh_profiles: restoredHtxh,
			},
		});
	} catch (error) {
		console.error("restoreSnapshot error:", error);
		res.status(500).json({ error: "Lỗi server khi khôi phục snapshot CSDL" });
	}
};

/**
 * Tích hợp node-cron chạy lúc 02:00 AM hàng ngày lưu snapshot hoặc log trạng thái CSDL.
 */
export const initBackupCron = () => {
	cron.schedule("0 2 * * *", async () => {
		try {
			const [profilesCount, htxhCount, usersCount, villagesCount] =
				await Promise.all([
					(prisma as any).profiles.count({ where: { is_deleted: false } }),
					(prisma as any).htxh_profiles.count({ where: { is_deleted: false } }),
					(prisma as any).users.count(),
					(prisma as any).villages.count(),
				]);

			const logDetails = {
				timestamp: new Date().toISOString(),
				chuctho: profilesCount,
				htxh: htxhCount,
				users: usersCount,
				villages: villagesCount,
			};

			console.log(`[Backup Cron 02:00 AM] Health Check:`, logDetails);

			await (prisma as any).audit_logs.create({
				data: {
					action: "DAILY_BACKUP_STATUS",
					details: JSON.stringify(logDetails),
					created_at: new Date(),
				},
			});
		} catch (err) {
			console.error(
				"[Backup Cron] Lỗi khi thực hiện kiểm tra sao lưu hàng ngày:",
				err,
			);
		}
	});

	console.log(
		"[Cron] Đã kích hoạt lịch tự động sao lưu/giám sát CSDL lúc 02:00 AM hàng ngày.",
	);
};
