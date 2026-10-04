import crypto from "crypto";
import type { Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { auditProfile, isValidUUID, removeAccents } from "../utils/audit";

// In-memory cache for HTXH stats to prevent DB connection pool exhaustion (10s TTL)
const statsCache = new Map<string, { data: any; expiresAt: number }>();

export const clearHtxhStatsCache = () => {
	statsCache.clear();
};

const maskHtxhProfileCccd = (p: any) => {
	if (!p) return p;
	return {
		...p,
		cccd: p.cccd_last4 ? `••••••••${p.cccd_last4}` : (p.cccd ? "••••••••••••" : null),
	};
};

const HTXH_CATEGORY_MAP: Record<string, string> = {
	age75plus: "age75plus",
	age70to74poor: "age70to74poor",
	baoTro: "bao_tro",
	bao_tro: "bao_tro",
	huuTri: "huu_tri",
	huu_tri: "huu_tri",
	huuTuatBaoHiem: "huu_tuat_bao_hiem",
	huu_tuat_bao_hiem: "huu_tuat_bao_hiem",
	nguoiCoCong: "nguoi_co_cong",
	nguoi_co_cong: "nguoi_co_cong",
};

const HTXH_SORT_KEY_MAP: Record<string, string> = {
	stt: "stt",
	name: "name",
	dob: "dob",
	gender: "gender",
	cccd: "cccd",
	ethnicity: "ethnicity",
	residence: "residence",
	currentAddress: "current_address",
	current_address: "current_address",
	received: "received",
	age75plus: "age75plus",
	age70to74poor: "age70to74poor",
	baoTro: "bao_tro",
	bao_tro: "bao_tro",
	huuTri: "huu_tri",
	huu_tri: "huu_tri",
	huuTuatBaoHiem: "huu_tuat_bao_hiem",
	huu_tuat_bao_hiem: "huu_tuat_bao_hiem",
	nguoiCoCong: "nguoi_co_cong",
	nguoi_co_cong: "nguoi_co_cong",
	created_at: "created_at",
	createdAt: "created_at",
	updated_at: "updated_at",
	updatedAt: "updated_at",
	milestone: "dob",
};

export const getHtxhProfiles = async (req: AuthRequest, res: Response) => {
	try {
		const {
			search,
			villageId,
			status,
			ageGroup,
			sortKey,
			sortDirection,
			gender,
			ethnicity,
			residence,
		} = req.query;
		const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
		const limit = Math.min(
			10000,
			Math.max(1, parseInt(req.query.limit as string, 10) || 50),
		);
		const skip = (page - 1) * limit;

		const where: any = { is_deleted: false };
		if (isValidUUID(req.user?.village_id)) {
			where.village_id = req.user.village_id;
		} else {
			const rawVillageId =
				typeof villageId === "string" ? villageId.trim() : undefined;
			if (rawVillageId && rawVillageId !== "all" && isValidUUID(rawVillageId)) {
				where.village_id = rawVillageId;
			}
		}
		if (status === "received") where.received = true;
		if (status === "unreceived") where.received = false;
		if (ageGroup && typeof ageGroup === "string") {
			const cleanGroup = ageGroup.trim();
			const mappedCol = HTXH_CATEGORY_MAP[cleanGroup];
			if (mappedCol) {
				where[mappedCol] = { not: "" };
			}
		}
		if (gender && typeof gender === "string" && gender.trim()) {
			where.gender = gender.trim();
		}
		if (ethnicity && typeof ethnicity === "string" && ethnicity.trim()) {
			if (ethnicity.trim() === "dtts") {
				where.ethnicity = { not: "Kinh" };
			} else {
				where.ethnicity = ethnicity.trim();
			}
		}
		if (residence && typeof residence === "string" && residence.trim()) {
			where.residence = { contains: residence.trim(), mode: "insensitive" };
		}
		if (search && typeof search === "string" && search.trim()) {
			const rawSearch = search.trim();
			const searchClean = removeAccents(rawSearch).toLowerCase();
			where.OR = [
				{ name_unaccented: { contains: searchClean, mode: "insensitive" } },
				{ name: { contains: rawSearch, mode: "insensitive" } },
				{ cccd_last4: { contains: rawSearch } },
			];
		}
		const orderBy: any = {};
		const mappedSortKey =
			sortKey && typeof sortKey === "string"
				? HTXH_SORT_KEY_MAP[sortKey.trim()]
				: undefined;
		if (mappedSortKey) {
			orderBy[mappedSortKey] = sortDirection === "desc" ? "desc" : "asc";
		} else {
			orderBy.stt = "asc";
		}

		const [data, total] = await Promise.all([
			(prisma as any).htxh_profiles.findMany({
				where,
				orderBy,
				skip,
				take: limit,
			}),
			(prisma as any).htxh_profiles.count({ where }),
		]);
		const totalPages = Math.ceil(total / limit);

		res.json({
			data: data.map(maskHtxhProfileCccd),
			pagination: { total, page, limit, totalPages },
		});
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error: "Lỗi server khi lấy danh sách htxh profile" });
	}
};

export const getDeletedHtxhProfiles = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const profiles: any[] = await (prisma as any).htxh_profiles.findMany({
			where: {
				is_deleted: true,
				...(req.user?.village_id ? { village_id: req.user.village_id } : {}),
			},
			orderBy: { deleted_at: "desc" },
		});
		res.json({ data: profiles.map(maskHtxhProfileCccd) });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const createHtxhProfile = async (req: AuthRequest, res: Response) => {
	try {
		const data = req.body;
		const profileId = data.id || crypto.randomUUID();
		const newProfile = await (prisma as any).htxh_profiles.create({
			data: {
				...(req.user?.village_id ? { village_id: req.user.village_id } : {}),
				...data,
				id: profileId,
				name_unaccented: removeAccents(data.name || ""),
				is_deleted: false,
				version: 1,
				created_at: new Date(),
				updated_at: new Date(),
			},
		});
		await auditProfile({
			profileId,
			userId: req.user!.id,
			action: "CREATE",
			newValues: newProfile,
			profileType: "htxh",
			villageId: newProfile.village_id || req.user?.village_id,
		});
		clearHtxhStatsCache();
		res.status(201).json({ data: newProfile });
	} catch (error: any) {
		if (error?.code === "P2002") {
			res.status(409).json({ error: "CCCD đã tồn tại" });
			return;
		}
		console.error(error);
		res.status(500).json({ error: "Lỗi khi tạo htxh profile" });
	}
};

export const updateHtxhProfile = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		const data = req.body;
		const currentProfile = await (prisma as any).htxh_profiles.findUnique({
			where: { id },
		});
		if (!currentProfile) {
			res.status(404).json({ error: "Không tìm thấy" });
			return;
		}
		if (
			req.user?.village_id &&
			currentProfile.village_id !== req.user.village_id
		) {
			res.status(403).json({ error: "Không có quyền" });
			return;
		}
		// Optimistic locking
		if (
			data.version !== undefined &&
			Number(data.version) !== Number(currentProfile.version)
		) {
			res.status(409).json({
				error: "Hồ sơ đã được sửa bởi người khác",
				currentVersion: currentProfile.version,
			});
			return;
		}
		if (data.name) data.name_unaccented = removeAccents(data.name);
		const updatedProfile = await (prisma as any).htxh_profiles.update({
			where: { id },
			data: {
				...(req.user?.village_id ? { village_id: req.user.village_id } : {}),
				...data,
				version: currentProfile.version! + 1,
				updated_at: new Date(),
			},
		});
		await auditProfile({
			profileId: id,
			userId: req.user!.id,
			action: "UPDATE",
			oldValues: currentProfile,
			newValues: updatedProfile,
			changedFields: Object.keys(data),
			profileType: "htxh",
			villageId:
				updatedProfile.village_id ||
				currentProfile.village_id ||
				req.user?.village_id,
		});
		clearHtxhStatsCache();
		res.json({ data: updatedProfile });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi cập nhật htxh profile" });
	}
};

export const deleteHtxhProfile = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		const currentProfile = await (prisma as any).htxh_profiles.findUnique({
			where: { id },
		});
		if (!currentProfile) {
			res.status(404).json({ error: "Không tìm thấy" });
			return;
		}
		if (
			req.user?.village_id &&
			currentProfile.village_id !== req.user.village_id
		) {
			res.status(403).json({ error: "Không có quyền" });
			return;
		}
		const updatedProfile = await (prisma as any).htxh_profiles.update({
			where: { id },
			data: {
				is_deleted: true,
				deleted_at: new Date(),
				version: currentProfile.version! + 1,
				updated_at: new Date(),
			},
		});
		await auditProfile({
			profileId: id,
			userId: req.user!.id,
			action: "SOFT_DELETE",
			oldValues: currentProfile,
			profileType: "htxh",
			villageId: currentProfile.village_id || req.user?.village_id,
		});
		clearHtxhStatsCache();
		res.json({ data: updatedProfile });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi xóa" });
	}
};

export const restoreHtxhProfile = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		const currentProfile = await (prisma as any).htxh_profiles.findUnique({
			where: { id },
		});
		if (!currentProfile) {
			res.status(404).json({ error: "Không tìm thấy" });
			return;
		}
		if (
			req.user?.village_id &&
			currentProfile.village_id !== req.user.village_id
		) {
			res.status(403).json({ error: "Không có quyền" });
			return;
		}
		const updatedProfile = await (prisma as any).htxh_profiles.update({
			where: { id },
			data: {
				is_deleted: false,
				deleted_at: null,
				version: currentProfile.version! + 1,
				updated_at: new Date(),
			},
		});
		await auditProfile({
			profileId: id,
			userId: req.user!.id,
			action: "RESTORE",
			oldValues: currentProfile,
			profileType: "htxh",
			villageId: currentProfile.village_id || req.user?.village_id,
		});
		clearHtxhStatsCache();
		res.json({ data: updatedProfile });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi khôi phục" });
	}
};

export const hardDeleteHtxhProfile = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const id = req.params.id as string;
		const currentProfile = await (prisma as any).htxh_profiles.findUnique({
			where: { id },
		});
		if (!currentProfile) {
			res.status(404).json({ error: "Không tìm thấy" });
			return;
		}
		if (
			req.user?.village_id &&
			currentProfile.village_id !== req.user.village_id
		) {
			res.status(403).json({ error: "Không có quyền" });
			return;
		}
		// SEC-03-07: Bảo toàn vĩnh viễn lịch sử kiểm toán, ghi nhận hành động HARD_DELETE
		await auditProfile({
			profileId: id,
			userId: req.user!.id,
			action: "HARD_DELETE",
			oldValues: currentProfile,
			profileType: "htxh",
			villageId: currentProfile.village_id || req.user?.village_id,
		});
		await (prisma as any).htxh_profiles.delete({ where: { id } });
		clearHtxhStatsCache();
		res.json({ message: "Xóa vĩnh viễn thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi xóa vĩnh viễn" });
	}
};

export const bulkUpdateHtxhStatus = async (req: AuthRequest, res: Response) => {
	try {
		const { ids, received } = req.body;
		if (!Array.isArray(ids)) {
			res.status(400).json({ error: "ids phải là mảng" });
			return;
		}
		const where: any = { id: { in: ids }, is_deleted: false };
		if (req.user?.village_id) where.village_id = req.user.village_id;
		await (prisma as any).htxh_profiles.updateMany({
			where,
			data: { received, updated_at: new Date() },
		});
		clearHtxhStatsCache();
		res.json({ message: "Cập nhật trạng thái hàng loạt thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi cập nhật hàng loạt" });
	}
};

export const bulkDeleteHtxh = async (req: AuthRequest, res: Response) => {
	try {
		const { ids } = req.body;
		if (!Array.isArray(ids)) {
			res.status(400).json({ error: "ids phải là mảng" });
			return;
		}
		const where: any = { id: { in: ids } };
		if (req.user?.village_id) where.village_id = req.user.village_id;
		const profiles = await (prisma as any).htxh_profiles.findMany({ where });
		await (prisma as any).htxh_profiles.updateMany({
			where,
			data: {
				is_deleted: true,
				deleted_at: new Date(),
				updated_at: new Date(),
			},
		});
		for (const p of profiles) {
			await auditProfile({
				profileId: p.id,
				userId: req.user!.id,
				action: "BULK_SOFT_DELETE",
				oldValues: p,
				profileType: "htxh",
				villageId: req.user?.village_id,
			});
		}
		clearHtxhStatsCache();
		res.json({ message: "Xóa hàng loạt thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi xóa hàng loạt" });
	}
};

export const getHtxhStats = async (req: AuthRequest, res: Response) => {
	try {
		const userVillageId = isValidUUID(req.user?.village_id)
			? req.user.village_id
			: undefined;
		const rawVillageId =
			typeof req.query.villageId === "string"
				? req.query.villageId.trim()
				: undefined;
		const targetVillageId =
			userVillageId ||
			(rawVillageId && rawVillageId !== "all" && isValidUUID(rawVillageId)
				? rawVillageId
				: undefined);
		const cacheKey = `stats_htxh_${targetVillageId || "all"}`;

		const cached = statsCache.get(cacheKey);
		if (cached && cached.expiresAt > Date.now()) {
			res.json({ data: cached.data });
			return;
		}

		const where: any = { is_deleted: false };
		if (targetVillageId) where.village_id = targetVillageId;

		const [total, received] = await Promise.all([
			(prisma as any).htxh_profiles.count({ where }),
			(prisma as any).htxh_profiles.count({
				where: { ...where, received: true },
			}),
		]);

		const unreceived = total - received;
		const rate = total === 0 ? "0.0" : ((received / total) * 100).toFixed(1);
		const data = { total, received, unreceived, rate };

		statsCache.set(cacheKey, { data, expiresAt: Date.now() + 10000 }); // 10s TTL
		res.json({ data });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const streamHtxhProfiles = async (req: AuthRequest, res: Response) => {
	try {
		const { search, villageId, status, ageGroup } = req.query;
		const where: any = { is_deleted: false };
		if (isValidUUID(req.user?.village_id)) {
			where.village_id = req.user.village_id;
		} else {
			const rawVillageId =
				typeof villageId === "string" ? villageId.trim() : undefined;
			if (rawVillageId && rawVillageId !== "all" && isValidUUID(rawVillageId)) {
				where.village_id = rawVillageId;
			}
		}
		if (status === "received") where.received = true;
		if (status === "unreceived") where.received = false;
		if (ageGroup && typeof ageGroup === "string") {
			const cleanGroup = ageGroup.trim();
			const mappedCol = HTXH_CATEGORY_MAP[cleanGroup];
			if (mappedCol) {
				where[mappedCol] = { not: "" };
			}
		}
		if (search && typeof search === "string" && search.trim()) {
			where.name_unaccented = {
				contains: removeAccents(search.trim()).toLowerCase(),
				mode: "insensitive",
			};
		}
		res.setHeader("Content-Type", "application/x-ndjson");
		res.setHeader("Transfer-Encoding", "chunked");
		let cursor: string | undefined;
		let hasMore = true;
		while (hasMore) {
			if (req.destroyed) break;
			const findArgs: any = {
				where,
				take: 500,
				orderBy: [{ stt: "asc" }, { id: "asc" }],
			};
			if (cursor) {
				findArgs.cursor = { id: cursor };
				findArgs.skip = 1;
			}
			const profiles = await (prisma as any).htxh_profiles.findMany(findArgs);
			if (profiles.length === 0) {
				hasMore = false;
				break;
			}
			for (const p of profiles) {
				if (req.destroyed) break;
				res.write(JSON.stringify(maskHtxhProfileCccd(p)) + "\n");
			}
			cursor = profiles[profiles.length - 1].id;
		}
		res.end();
	} catch (error) {
		console.error(error);
		if (!res.headersSent) {
			res.status(500).json({ error: "Lỗi server streaming" });
		} else {
			res.end();
		}
	}
};

export const updateHtxhStatus = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		const { received } = req.body;
		const currentProfile = await (prisma as any).htxh_profiles.findUnique({
			where: { id },
		});
		if (!currentProfile) {
			res.status(404).json({ error: "Không tìm thấy" });
			return;
		}
		if (
			req.user?.village_id &&
			currentProfile.village_id !== req.user.village_id
		) {
			res.status(403).json({ error: "Không có quyền" });
			return;
		}
		const updatedProfile = await (prisma as any).htxh_profiles.update({
			where: { id },
			data: { received, updated_at: new Date() },
		});
		clearHtxhStatsCache();
		res.json({ data: updatedProfile });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const bulkAddHtxhProfiles = async (req: AuthRequest, res: Response) => {
	try {
		const { profiles: profilesData } = req.body;
		if (!Array.isArray(profilesData)) {
			res.status(400).json({ error: "profiles phải là mảng" });
			return;
		}

		const allVillages: any[] = await (prisma as any).villages.findMany({
			select: { id: true, name: true },
		});

		const cleanProfiles: any[] = [];
		const errors: any[] = [];
		for (const data of profilesData) {
			try {
				const id = data.id || crypto.randomUUID();

				let cleanVillageId: string | null = null;
				const rawVillageId =
					req.user?.village_id || data.village_id || data.villageId || null;
				if (isValidUUID(rawVillageId)) {
					if (allVillages.some((v) => v.id === rawVillageId.trim())) {
						cleanVillageId = rawVillageId.trim();
					}
				}

				if (!cleanVillageId) {
					const searchLoc =
						`${data.residence || ""} ${data.current_address || data.currentAddress || ""} ${data.village_name || ""}`.toLowerCase();
					const matched = allVillages.find((v) => {
						const vName = v.name.toLowerCase();
						return (
							searchLoc.includes(vName) ||
							(vName.startsWith("thôn ") &&
								searchLoc.includes(vName.replace("thôn ", "")))
						);
					});
					if (matched) {
						cleanVillageId = matched.id;
					}
				}

				if (!cleanVillageId) {
					errors.push({
						data,
						error: "Không tìm thấy thông tin thôn hợp lệ cho hồ sơ này",
					});
					continue;
				}

				const cleanCccd = data.cccd ? String(data.cccd).trim() : null;

				const cleanData: any = {
					id,
					stt:
						typeof data.stt === "number"
							? data.stt
							: parseInt(data.stt, 10) || null,
					name: String(data.name || "").trim(),
					name_unaccented: removeAccents(data.name || "").toLowerCase(),
					dob: data.dob ? String(data.dob).trim() : null,
					gender: data.gender ? String(data.gender).trim() : "",
					cccd: cleanCccd,
					cccd_last4:
						cleanCccd && cleanCccd.length >= 4 ? cleanCccd.slice(-4) : null,
					ethnicity: data.ethnicity ? String(data.ethnicity).trim() : "Kinh",
					residence: data.residence ? String(data.residence).trim() : null,
					current_address: data.current_address || data.currentAddress || null,
					village_id: cleanVillageId,
					age75plus: data.age75plus || data.age_75_plus || "",
					age70to74poor: data.age70to74poor || data.age_70_74_poor || "",
					bao_tro: data.bao_tro || data.baoTro || "",
					huu_tri: data.huu_tri || data.huuTri || "",
					huu_tuat_bao_hiem:
						data.huu_tuat_bao_hiem || data.huuTuatBaoHiem || "",
					nguoi_co_cong: data.nguoi_co_cong || data.nguoiCoCong || "",
					received: Boolean(data.received),
					calculation_year:
						typeof data.calculation_year === "number"
							? data.calculation_year
							: typeof data.calculationYear === "number"
								? data.calculationYear
								: parseInt(data.calculation_year || data.calculationYear, 10) ||
									null,
					notes: data.notes ? String(data.notes).trim() : "",
					is_deleted: false,
					version: 1,
					created_at: new Date(),
					updated_at: new Date(),
				};

				cleanProfiles.push(cleanData);
			} catch (err: any) {
				errors.push({ data, error: err?.message || "Unknown error" });
			}
		}

		// Chia mảng dữ liệu thành các batch (mỗi batch 500 bản ghi), thực thi createMany
		const BATCH_SIZE = 500;
		let totalInserted = 0;
		for (let i = 0; i < cleanProfiles.length; i += BATCH_SIZE) {
			const batch = cleanProfiles.slice(i, i + BATCH_SIZE);
			try {
				const result = await (prisma as any).htxh_profiles.createMany({
					data: batch,
					skipDuplicates: true,
				});
				totalInserted += result?.count ?? batch.length;
			} catch (batchErr: any) {
				errors.push({
					batchIndex: Math.floor(i / BATCH_SIZE),
					error: batchErr?.message || "Batch insert error",
				});
			}
		}

		clearHtxhStatsCache();
		res.json({
			success: true,
			data: {
				inserted: totalInserted,
				created: totalInserted,
				updated: 0,
				errors: errors.length,
				errorDetails: errors,
			},
			inserted: totalInserted,
			created: totalInserted,
			updated: 0,
			errors: errors.length,
			errorDetails: errors,
		});
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi thêm hàng loạt" });
	}
};

export const getHtxhAuditLog = async (req: AuthRequest, res: Response) => {
	try {
		const profileId = req.params.id as string;
		if (req.user?.village_id) {
			const currentProfile = await (prisma as any).htxh_profiles.findUnique({
				where: { id: profileId },
				select: { village_id: true },
			});
			if (
				!currentProfile ||
				currentProfile.village_id !== req.user.village_id
			) {
				res.status(403).json({ error: "Không có quyền" });
				return;
			}
		}
		const logs = await (prisma as any).profile_audit_log.findMany({
			where: { profile_id: profileId, profile_type: "htxh" },
			orderBy: { created_at: "desc" },
			include: { user: { select: { username: true } } },
		});
		res.json({ data: logs });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const updateHtxhNotes = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		const { notes } = req.body;
		const existing = await (prisma as any).htxh_profiles.findUnique({
			where: { id },
		});
		if (!existing) {
			return res.status(404).json({ error: "Không tìm thấy hồ sơ" });
		}
		if (req.user?.village_id && existing.village_id !== req.user.village_id) {
			return res
				.status(403)
				.json({ error: "Không có quyền chỉnh sửa hồ sơ thôn khác" });
		}
		const updatedProfile = await (prisma as any).htxh_profiles.update({
			where: { id },
			data: { notes, updated_at: new Date() },
		});
		res.json({ data: updatedProfile });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const emptyTrashHtxh = async (req: AuthRequest, res: Response) => {
	try {
		const where: any = { is_deleted: true };
		if (req.user?.village_id) where.village_id = req.user.village_id;
		const deletedProfiles = await (prisma as any).htxh_profiles.findMany({
			where,
		});
		// SEC-03-07: Bảo toàn vĩnh viễn lịch sử kiểm toán, ghi nhận hành động HARD_DELETE cho từng hồ sơ bị dọn
		for (const p of deletedProfiles) {
			await auditProfile({
				profileId: p.id,
				userId: req.user!.id,
				action: "HARD_DELETE",
				oldValues: p,
				profileType: "htxh",
				villageId: p.village_id || req.user?.village_id,
			});
		}
		await (prisma as any).htxh_profiles.deleteMany({ where });
		clearHtxhStatsCache();
		res.json({ message: "Dọn thùng rác thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const recalculateHtxhAgeFields = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const { year } = req.body;
		if (!year) {
			res.status(400).json({ error: "Cần truyền năm (year)" });
			return;
		}
		const where: any = { is_deleted: false };
		if (req.user?.village_id) where.village_id = req.user.village_id;
		const profiles = await (prisma as any).htxh_profiles.findMany({ where });
		let updated = 0;
		for (const p of profiles) {
			if (!p.dob) continue;
			const dobParts = p.dob.split("/");
			let birthYear: number;
			if (dobParts.length === 3) {
				birthYear = parseInt(dobParts[2]);
			} else if (dobParts.length === 1 && dobParts[0].length === 4) {
				birthYear = parseInt(dobParts[0]);
			} else {
				continue;
			}
			if (isNaN(birthYear)) continue;
			const age = year - birthYear;
			const ageData: any = {
				age75plus: age >= 75 ? "x" : "",
				age70to74poor: age >= 70 && age < 75 ? p.age70to74poor || "" : "",
				bao_tro: p.bao_tro || "",
				huu_tri: p.huu_tri || "",
				huu_tuat_bao_hiem: p.huu_tuat_bao_hiem || "",
				nguoi_co_cong: p.nguoi_co_cong || "",
				calculation_year: year,
			};
			await (prisma as any).htxh_profiles.update({
				where: { id: p.id },
				data: ageData,
			});
			updated++;
		}
		clearHtxhStatsCache();
		res.json({ message: `Đã tính lại tuổi cho ${updated} hồ sơ HTXH` });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};
