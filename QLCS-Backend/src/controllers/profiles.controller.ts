import crypto from "crypto";
import type { Response } from "express";
import { decrypt, prisma } from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { auditProfile, isValidUUID, removeAccents } from "../utils/audit";
import { computeChucthoMilestones } from "../utils/age";

// In-memory cache for stats to prevent DB connection pool exhaustion (10s TTL)
const statsCache = new Map<string, { data: any; expiresAt: number }>();

export const clearProfileStatsCache = () => {
	statsCache.clear();
};

const maskProfileCccd = (p: any) => {
	return p;
};

interface LogAuditParams {
	userId: string;
	username?: string;
	action: string;
	tableName?: string;
	recordId: string;
	details?: { message?: string; [key: string]: any } | string;
	villageId?: string | null;
}

const logAudit = async (params: LogAuditParams) => {
	try {
		const message =
			typeof params.details === "object"
				? params.details?.message
				: String(params.details || "");
		await auditProfile({
			profileId: params.recordId,
			userId: params.userId,
			action: params.action,
			note: message,
			profileType: "chuctho",
			villageId: params.villageId,
		});
		await (prisma as any).audit_logs
			.create({
				data: {
					user_id: params.userId,
					village_id: params.villageId || null,
					action: params.action,
					details: message || JSON.stringify(params.details || {}),
				},
			})
			.catch(() => {});
	} catch (e) {
		console.error("Failed to log audit:", e);
	}
};

const VALID_CHUCTHO_AGE_GROUPS = new Set([
	"age60",
	"age65",
	"age70",
	"age75",
	"age80",
	"age85",
	"age90",
	"age95",
	"age100",
	"age_over_100",
]);

const CHUCTHO_SORT_KEY_MAP: Record<string, string> = {
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
	age60: "age60",
	age65: "age65",
	age70: "age70",
	age75: "age75",
	age80: "age80",
	age85: "age85",
	age90: "age90",
	age95: "age95",
	age100: "age100",
	ageOver100: "age_over_100",
	age_over_100: "age_over_100",
	created_at: "created_at",
	createdAt: "created_at",
	updated_at: "updated_at",
	updatedAt: "updated_at",
	milestone: "dob",
};

export const getProfiles = async (req: AuthRequest, res: Response) => {
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
			const mappedGroup =
				cleanGroup === "ageOver100" ? "age_over_100" : cleanGroup;
			if (VALID_CHUCTHO_AGE_GROUPS.has(mappedGroup)) {
				where[mappedGroup] = { not: "" };
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
				? CHUCTHO_SORT_KEY_MAP[sortKey.trim()]
				: undefined;
		if (mappedSortKey) {
			orderBy[mappedSortKey] = sortDirection === "desc" ? "desc" : "asc";
		} else {
			orderBy.stt = "asc";
		}

		const [data, total] = await Promise.all([
			(prisma as any).profiles.findMany({ where, orderBy, skip, take: limit }),
			(prisma as any).profiles.count({ where }),
		]);
		const totalPages = Math.ceil(total / limit);

		res.json({
			data: data.map(maskProfileCccd),
			pagination: { total, page, limit, totalPages },
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Lỗi server khi lấy danh sách profile" });
	}
};

export const getDeletedProfiles = async (req: AuthRequest, res: Response) => {
	try {
		const profiles: any[] = await (prisma as any).profiles.findMany({
			where: {
				is_deleted: true,
				...(req.user?.village_id ? { village_id: req.user.village_id } : {}),
			},
			orderBy: { deleted_at: "desc" },
		});
		res.json({ data: profiles.map(maskProfileCccd) });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const createProfile = async (req: AuthRequest, res: Response) => {
	try {
		const data = req.body;
		const profileId = data.id || crypto.randomUUID();
		const newProfile = await (prisma as any).profiles.create({
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
			profileType: "chuctho",
			villageId: newProfile.village_id || req.user?.village_id,
		});
		clearProfileStatsCache();
		res.status(201).json({ data: newProfile });
	} catch (error: any) {
		if (error?.code === "P2002") {
			res.status(409).json({ error: "CCCD đã tồn tại" });
			return;
		}
		console.error(error);
		res.status(500).json({ error: "Lỗi khi tạo profile" });
	}
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		const data = req.body;
		const currentProfile = await (prisma as any).profiles.findUnique({
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
		const updatedProfile = await (prisma as any).profiles.update({
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
			profileType: "chuctho",
			villageId:
				updatedProfile.village_id ||
				currentProfile.village_id ||
				req.user?.village_id,
		});
		clearProfileStatsCache();
		res.json({ data: updatedProfile });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi cập nhật profile" });
	}
};

export const deleteProfile = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		const currentProfile = await (prisma as any).profiles.findUnique({
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
		const updatedProfile = await (prisma as any).profiles.update({
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
			profileType: "chuctho",
			villageId: currentProfile.village_id || req.user?.village_id,
		});
		clearProfileStatsCache();
		res.json({ data: updatedProfile });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi xóa" });
	}
};

export const restoreProfile = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		const currentProfile = await (prisma as any).profiles.findUnique({
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
		const updatedProfile = await (prisma as any).profiles.update({
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
			profileType: "chuctho",
			villageId: currentProfile.village_id || req.user?.village_id,
		});
		clearProfileStatsCache();
		res.json({ data: updatedProfile });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi khôi phục" });
	}
};

export const hardDeleteProfile = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		const currentProfile = await (prisma as any).profiles.findUnique({
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
			profileType: "chuctho",
			villageId: currentProfile.village_id || req.user?.village_id,
		});
		await (prisma as any).profiles.delete({ where: { id } });
		clearProfileStatsCache();
		res.json({ message: "Xóa vĩnh viễn thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi xóa vĩnh viễn" });
	}
};

export const bulkUpdateStatus = async (req: AuthRequest, res: Response) => {
	try {
		const { ids, received } = req.body;
		if (!Array.isArray(ids)) {
			res.status(400).json({ error: "ids phải là mảng" });
			return;
		}
		const where: any = { id: { in: ids }, is_deleted: false };
		if (req.user?.village_id) where.village_id = req.user.village_id;
		await (prisma as any).profiles.updateMany({
			where,
			data: { received, updated_at: new Date() },
		});
		clearProfileStatsCache();
		res.json({ message: "Cập nhật trạng thái hàng loạt thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi cập nhật hàng loạt" });
	}
};

export const bulkDelete = async (req: AuthRequest, res: Response) => {
	try {
		const { ids } = req.body;
		if (!Array.isArray(ids)) {
			res.status(400).json({ error: "ids phải là mảng" });
			return;
		}
		const where: any = { id: { in: ids } };
		if (req.user?.village_id) where.village_id = req.user.village_id;
		const profiles = await (prisma as any).profiles.findMany({ where });
		await (prisma as any).profiles.updateMany({
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
				profileType: "chuctho",
				villageId: req.user?.village_id,
			});
		}
		clearProfileStatsCache();
		res.json({ message: "Xóa hàng loạt thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi khi xóa hàng loạt" });
	}
};

export const getProfileStats = async (req: AuthRequest, res: Response) => {
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
		const cacheKey = `stats_chuctho_${targetVillageId || "all"}`;

		const cached = statsCache.get(cacheKey);
		if (cached && cached.expiresAt > Date.now()) {
			res.json({ data: cached.data });
			return;
		}

		const where: any = { is_deleted: false };
		if (targetVillageId) where.village_id = targetVillageId;

		const [total, received] = await Promise.all([
			(prisma as any).profiles.count({ where }),
			(prisma as any).profiles.count({ where: { ...where, received: true } }),
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

export const streamProfiles = async (req: AuthRequest, res: Response) => {
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
			const mappedGroup =
				cleanGroup === "ageOver100" ? "age_over_100" : cleanGroup;
			if (VALID_CHUCTHO_AGE_GROUPS.has(mappedGroup)) {
				where[mappedGroup] = { not: "" };
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
			const profiles = await (prisma as any).profiles.findMany(findArgs);
			if (profiles.length === 0) {
				hasMore = false;
				break;
			}
			for (const p of profiles) {
				if (req.destroyed) break;
				res.write(JSON.stringify(maskProfileCccd(p)) + "\n");
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

export const updateProfileStatus = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		const { received } = req.body;
		const currentProfile = await (prisma as any).profiles.findUnique({
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
		const updatedProfile = await (prisma as any).profiles.update({
			where: { id },
			data: { received, updated_at: new Date() },
		});
		clearProfileStatsCache();
		res.json({ data: updatedProfile });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const bulkAddProfiles = async (req: AuthRequest, res: Response) => {
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
					age60: data.age60 || "",
					age65: data.age65 || "",
					age70: data.age70 || "",
					age75: data.age75 || "",
					age80: data.age80 || "",
					age85: data.age85 || "",
					age90: data.age90 || "",
					age95: data.age95 || "",
					age100: data.age100 || "",
					age_over_100: data.age_over_100 || data.ageOver100 || "",
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
				const result = await (prisma as any).profiles.createMany({
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

		clearProfileStatsCache();
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

export const getProfileAuditLog = async (req: AuthRequest, res: Response) => {
	try {
		const profileId = req.params.id as string;
		if (req.user?.village_id) {
			const currentProfile = await (prisma as any).profiles.findUnique({
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
			where: { profile_id: profileId, profile_type: "chuctho" },
			orderBy: { created_at: "desc" },
			include: { user: { select: { username: true } } },
		});
		res.json({ data: logs });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const updateProfileNotes = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		const { notes } = req.body;
		const existing = await (prisma as any).profiles.findUnique({
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
		const updatedProfile = await (prisma as any).profiles.update({
			where: { id },
			data: { notes, updated_at: new Date() },
		});
		res.json({ data: updatedProfile });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const emptyTrashProfiles = async (req: AuthRequest, res: Response) => {
	try {
		const where: any = { is_deleted: true };
		if (req.user?.village_id) where.village_id = req.user.village_id;
		const deletedProfiles = await (prisma as any).profiles.findMany({ where });
		// SEC-03-07: Bảo toàn vĩnh viễn lịch sử kiểm toán, ghi nhận hành động HARD_DELETE cho từng hồ sơ bị dọn
		for (const p of deletedProfiles) {
			await auditProfile({
				profileId: p.id,
				userId: req.user!.id,
				action: "HARD_DELETE",
				oldValues: p,
				profileType: "chuctho",
				villageId: p.village_id || req.user?.village_id,
			});
		}
		await (prisma as any).profiles.deleteMany({ where });
		clearProfileStatsCache();
		res.json({ message: "Dọn thùng rác thành công" });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const recalculateAgeFields = async (req: AuthRequest, res: Response) => {
	try {
		const { year } = req.body;
		if (!year) {
			res.status(400).json({ error: "Cần truyền năm (year)" });
			return;
		}
		const where: any = { is_deleted: false };
		if (req.user?.village_id) where.village_id = req.user.village_id;
		const profiles = await (prisma as any).profiles.findMany({ where });
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
			const ageData: any = {
				...computeChucthoMilestones(birthYear, year),
				calculation_year: year,
			};
			await (prisma as any).profiles.update({
				where: { id: p.id },
				data: ageData,
			});
			updated++;
		}
		clearProfileStatsCache();
		res.json({ message: `Đã tính lại tuổi cho ${updated} hồ sơ` });
	} catch (error) {
		res.status(500).json({ error: "Lỗi server" });
	}
};

export const revealCccd = async (req: AuthRequest, res: Response) => {
	try {
		const { id } = req.params;
		const user = req.user;
		if (!user) return res.status(401).json({ message: "Chưa xác thực" });

		const profile = await (prisma as any).profiles.findUnique({
			where: { id },
			select: { id: true, village_id: true, cccd: true, name: true },
		});

		if (!profile) return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

		(profile as any).full_name = profile.name;

		// RBAC: Admin hoặc cán bộ đúng thôn
		if (
			user.role !== "admin" &&
			user.village_id &&
			profile.village_id !== user.village_id
		) {
			return res
				.status(403)
				.json({ message: "Không có quyền xem CCCD của thôn khác" });
		}

		// Giải mã CCCD
		const decryptedCccd = profile.cccd ? decrypt(profile.cccd) : "";

		// Ghi log kiểm toán
		await logAudit({
			userId: user.id,
			username: user.username,
			action: "REVEAL_CCCD",
			tableName: "profiles",
			recordId: profile.id,
			details: {
				message: `Xem số CCCD đầy đủ của hồ sơ ${profile.full_name || profile.name || ""}`,
			},
			villageId: profile.village_id,
		});

		return res.json({ cccd: decryptedCccd });
	} catch (error) {
		console.error("Lỗi khi xem CCCD:", error);
		return res.status(500).json({ message: "Lỗi server" });
	}
};
