import crypto from "crypto";
import ExcelJS from "exceljs";
import type { Response } from "express";
import { hashCccd, prisma } from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { auditProfile, removeAccents } from "../utils/audit";
import { clearHtxhStatsCache } from "./htxh.controller";
import { clearProfileStatsCache } from "./profiles.controller";

import {
	computeChucthoMilestones,
	computeHtxhMilestones,
	parseDobValue,
} from "../utils/age";

export { computeChucthoMilestones, computeHtxhMilestones, parseDobValue };


/**
 * Parse rows from uploaded Excel buffer
 */
async function parseExcelBuffer(
	buffer: Buffer,
	profileType: "chuctho" | "htxh",
): Promise<any[]> {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(buffer as any);
	const worksheet = workbook.worksheets[0];
	if (!worksheet) return [];

	const rawRows: any[][] = [];
	worksheet.eachRow({ includeEmpty: false }, (row) => {
		const values: any[] = [];
		row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
			values[colNumber - 1] = cell.value;
		});
		rawRows.push(values);
	});

	if (rawRows.length === 0) return [];

	// Find header row (contains "họ và tên" or "họ tên")
	let headerRowIdx = -1;
	for (let i = 0; i < Math.min(20, rawRows.length); i++) {
		const rowStr = rawRows[i]
			.map((c) => String(c || "").toLowerCase())
			.join(" ");
		if (rowStr.includes("họ và tên") || rowStr.includes("họ tên")) {
			headerRowIdx = i;
			break;
		}
	}

	if (headerRowIdx === -1) {
		headerRowIdx = 0; // Fallback
	}

	// Detect data start row
	let dataStartIdx = headerRowIdx + 1;
	if (profileType === "htxh" && rawRows.length > headerRowIdx + 2) {
		const nextRowStr = rawRows[headerRowIdx + 1]
			.map((c) => String(c || "").toLowerCase())
			.join(" ");
		if (
			nextRowStr.includes("bảo trợ") ||
			nextRowStr.includes("hưu trí") ||
			nextRowStr.includes("người có công")
		) {
			dataStartIdx = headerRowIdx + 2;
		}
	}

	// Map header columns
	const headerRow = rawRows[headerRowIdx];
	const colMap: Record<string, number> = {};

	headerRow.forEach((val, idx) => {
		if (!val) return;
		const str = removeAccents(String(val)).toLowerCase().trim();
		if (str === "tt" || str === "stt" || str === "so tt") colMap.stt = idx;
		else if (
			str.includes("ho va ten") ||
			str.includes("ho ten") ||
			str === "ten"
		)
			colMap.name = idx;
		else if (
			str.includes("nam sinh") ||
			str.includes("ngay sinh") ||
			str.includes("ngay thang nam sinh")
		)
			colMap.dob = idx;
		else if (str === "nam") colMap.genderNam = idx;
		else if (str === "nu") colMap.genderNu = idx;
		else if (
			str.includes("cccd") ||
			str.includes("cmnd") ||
			str.includes("can cuoc")
		)
			colMap.cccd = idx;
		else if (str.includes("dan toc")) colMap.ethnicity = idx;
		else if (str.includes("cu tru") || str.includes("ho khau"))
			colMap.residence = idx;
		else if (
			str.includes("noi o") ||
			str.includes("cho o") ||
			str.includes("dia chi")
		)
			colMap.current_address = idx;
		else if (str.includes("ghi chu")) colMap.notes = idx;
		else if (str.includes("da nhan")) colMap.received = idx;
	});

	const records: any[] = [];
	for (let r = dataStartIdx; r < rawRows.length; r++) {
		const row = rawRows[r];
		if (!row || row.length === 0) continue;

		const getVal = (field: string) => {
			const idx = colMap[field];
			return idx !== undefined && row[idx] !== undefined && row[idx] !== null
				? row[idx]
				: "";
		};

		const name = String(getVal("name")).trim();
		if (!name || name.toLowerCase().includes("tổng")) continue;

		let gender = "";
		const namVal = String(getVal("genderNam")).trim();
		const nuVal = String(getVal("genderNu")).trim();
		if (namVal && !nuVal) gender = "Nam";
		else if (nuVal && !namVal) gender = "Nữ";

		const receivedStr = String(getVal("received")).toLowerCase().trim();
		const received =
			receivedStr === "x" ||
			receivedStr.includes("đã") ||
			receivedStr.includes("roi") ||
			receivedStr === "true";

		records.push({
			stt: parseInt(String(getVal("stt"))) || undefined,
			name,
			dob: getVal("dob"),
			gender,
			cccd: String(getVal("cccd")).trim(),
			ethnicity: String(getVal("ethnicity")).trim() || "Kinh",
			residence: String(getVal("residence")).trim(),
			current_address: String(getVal("current_address")).trim(),
			notes: String(getVal("notes")).trim(),
			received,
		});
	}

	return records;
}

// ============================================================
// Endpoints
// ============================================================

/**
 * POST /api/excel/preview
 * Nhận mảng dữ liệu đã parse (hoặc nhận file qua multer), so khớp với CSDL hiện tại theo CCCD/Họ tên/Ngày sinh
 * để phân loại: ca thêm mới (toAdd), ca cập nhật (toUpdate), ca bỏ qua/trùng lặp (toSkip), cảnh báo lỗi định dạng.
 */
export const previewExcel = async (req: AuthRequest, res: Response) => {
	try {
		const profileType = (req.body.type || req.query.type || "chuctho") as
			| "chuctho"
			| "htxh";
		const villageId =
			req.user?.village_id || req.body.villageId || req.query.villageId;
		const calculationYear =
			parseInt(req.body.calculationYear || req.query.calculationYear) ||
			new Date().getFullYear();

		let rawRecords: any[] = [];

		if (req.file) {
			rawRecords = await parseExcelBuffer(req.file.buffer, profileType);
		} else if (Array.isArray(req.body.records)) {
			rawRecords = req.body.records;
		} else if (Array.isArray(req.body.data)) {
			rawRecords = req.body.data;
		} else if (Array.isArray(req.body.profiles)) {
			rawRecords = req.body.profiles;
		} else {
			res
				.status(400)
				.json({ error: "Không tìm thấy dữ liệu hồ sơ hoặc file tải lên" });
			return;
		}

		if (rawRecords.length === 0) {
			res.status(400).json({ error: "Danh sách hồ sơ trống" });
			return;
		}

		const toAdd: any[] = [];
		const toUpdate: any[] = [];
		const toSkip: any[] = [];
		const warnings: any[] = [];

		const dbModel =
			profileType === "chuctho"
				? (prisma as any).profiles
				: (prisma as any).htxh_profiles;

		for (let i = 0; i < rawRecords.length; i++) {
			const row = rawRecords[i];
			const rowNum = i + 1;

			// 1. Kiểm tra họ và tên
			const name = String(row.name || "").trim();
			if (!name) {
				warnings.push({
					row: rowNum,
					field: "name",
					message: "Họ và tên không được để trống",
				});
				continue;
			}

			// 2. Kiểm tra định dạng ngày tháng năm sinh
			const dobInfo = parseDobValue(row.dob || row.birth_year);
			if (!dobInfo) {
				warnings.push({
					row: rowNum,
					field: "dob",
					name,
					message: `Ngày sinh không hợp lệ: "${row.dob || ""}"`,
				});
			}

			// 3. Kiểm tra định dạng CCCD (nếu có)
			const plainCccd = row.cccd
				? String(row.cccd).trim().replace(/\s+/g, "")
				: "";
			if (plainCccd && !/^\d{9}$|^\d{12}$/.test(plainCccd)) {
				warnings.push({
					row: rowNum,
					field: "cccd",
					name,
					message: `Số CCCD không đúng định dạng 9 hoặc 12 chữ số: "${plainCccd}"`,
				});
			}

			// 4. So khớp CSDL hiện tại
			let matchedProfile: any = null;
			const cleanNameUnaccented = removeAccents(name).toLowerCase();
			const whereBase: any = { is_deleted: false };
			if (villageId) whereBase.village_id = villageId;

			if (plainCccd) {
				const cccd_hash = hashCccd(plainCccd);
				matchedProfile = await dbModel.findFirst({
					where: { ...whereBase, cccd_hash },
				});
			}

			if (!matchedProfile && dobInfo) {
				matchedProfile = await dbModel.findFirst({
					where: {
						...whereBase,
						name_unaccented: {
							equals: cleanNameUnaccented,
							mode: "insensitive",
						},
						dob: dobInfo.dob,
					},
				});
			}

			// Chuẩn bị thông tin bản ghi để phân loại
			const normalizedRecord = {
				...row,
				name,
				dob: dobInfo ? dobInfo.dob : row.dob || "",
				birth_year: dobInfo ? dobInfo.year : undefined,
				cccd: plainCccd || null,
				name_unaccented: cleanNameUnaccented,
				village_id: villageId || row.village_id || null,
				calculation_year: calculationYear,
			};

			if (!matchedProfile) {
				// Hồ sơ mới hoàn toàn
				toAdd.push({
					rowNumber: rowNum,
					data: normalizedRecord,
				});
			} else {
				// Tìm thấy hồ sơ trùng CCCD hoặc Tên + Ngày sinh
				const diffs: Record<string, { old: any; new: any }> = {};
				const fieldsToCheck = [
					"gender",
					"ethnicity",
					"residence",
					"current_address",
					"notes",
					"received",
				];

				for (const field of fieldsToCheck) {
					if (
						row[field] !== undefined &&
						row[field] !== null &&
						String(row[field]) !== ""
					) {
						if (String(matchedProfile[field] || "") !== String(row[field])) {
							diffs[field] = { old: matchedProfile[field], new: row[field] };
						}
					}
				}

				if (Object.keys(diffs).length > 0) {
					toUpdate.push({
						rowNumber: rowNum,
						existingId: matchedProfile.id,
						existingVersion: matchedProfile.version,
						diffs,
						data: { ...normalizedRecord, id: matchedProfile.id },
					});
				} else {
					toSkip.push({
						rowNumber: rowNum,
						existingId: matchedProfile.id,
						reason:
							"Dữ liệu trùng khớp hoàn toàn với hồ sơ hiện tại trong hệ thống",
						data: normalizedRecord,
					});
				}
			}
		}

		res.json({
			success: true,
			summary: {
				total: rawRecords.length,
				toAddCount: toAdd.length,
				toUpdateCount: toUpdate.length,
				toSkipCount: toSkip.length,
				warningCount: warnings.length,
			},
			toAdd,
			toUpdate,
			toSkip,
			warnings,
		});
	} catch (error) {
		console.error("previewExcel error:", error);
		res.status(500).json({ error: "Lỗi server khi preview file Excel" });
	}
};

/**
 * POST /api/excel/import
 * Thực thi import trong prisma.$transaction:
 * - Hỗ trợ cả 2 biểu mẫu: chuctho (22 cột) và htxh (16 cột).
 * - Tự động mã hóa AES-256-GCM CCCD, tạo cccd_hash (SHA-256), cắt cccd_last4.
 * - Tự động chuẩn hóa họ tên không dấu name_unaccented.
 * - Tự động tính mốc tuổi tròn theo năm sinh và năm tính toán.
 * - Tăng version = version + 1 nếu là cập nhật.
 * - Ghi nhận profile_audit_log cho từng bản ghi.
 */
export const importExcel = async (req: AuthRequest, res: Response) => {
	try {
		const profileType = (req.body.type || req.query.type || "chuctho") as
			| "chuctho"
			| "htxh";
		const villageId =
			req.user?.village_id || req.body.villageId || req.query.villageId;
		const calculationYear =
			parseInt(req.body.calculationYear || req.query.calculationYear) ||
			new Date().getFullYear();

		if (!villageId && req.user?.role !== "admin") {
			res.status(400).json({ error: "Vui lòng chọn thôn để nhập dữ liệu" });
			return;
		}

		let recordsToImport: any[] = [];
		if (req.file) {
			recordsToImport = await parseExcelBuffer(req.file.buffer, profileType);
		} else if (Array.isArray(req.body.records)) {
			recordsToImport = req.body.records;
		} else if (Array.isArray(req.body.data)) {
			recordsToImport = req.body.data;
		} else {
			res
				.status(400)
				.json({ error: "Không tìm thấy danh sách bản ghi để nhập" });
			return;
		}

		if (recordsToImport.length === 0) {
			res.status(400).json({ error: "Không có bản ghi nào để import" });
			return;
		}

		// Thực thi trong Transaction bảo toàn dữ liệu
		const result = await (prisma as any).$transaction(
			async (tx: any) => {
				let addedCount = 0;
				let updatedCount = 0;
				let skippedCount = 0;

				const dbModel =
					profileType === "chuctho" ? tx.profiles : tx.htxh_profiles;

				for (const item of recordsToImport) {
					const raw = item.data || item;
					const name = String(raw.name || "").trim();
					if (!name) {
						skippedCount++;
						continue;
					}

					const name_unaccented = removeAccents(name);
					const dobInfo = parseDobValue(raw.dob || raw.birth_year);
					const dob = dobInfo
						? dobInfo.dob
						: raw.dob
							? String(raw.dob).trim()
							: null;
					const birthYear = dobInfo
						? dobInfo.year
						: parseInt(raw.birth_year) || null;

					// Xử lý CCCD bảo mật
					const plainCccd = raw.cccd
						? String(raw.cccd).trim().replace(/\s+/g, "")
						: "";
					const cccd_hash = plainCccd ? hashCccd(plainCccd) : null;

					// Tính toán các mốc chính sách tự động
					const milestoneFields =
						profileType === "chuctho"
							? birthYear
								? computeChucthoMilestones(birthYear, calculationYear)
								: {}
							: birthYear
								? computeHtxhMilestones(birthYear, calculationYear, raw)
								: {};

					// Kiểm tra tồn tại trong DB
					let existing: any = null;
					const whereCheck: any = { is_deleted: false };
					if (villageId) whereCheck.village_id = villageId;

					if (raw.id) {
						existing = await dbModel.findUnique({ where: { id: raw.id } });
					}
					if (!existing && cccd_hash) {
						existing = await dbModel.findFirst({
							where: { ...whereCheck, cccd_hash },
						});
					}
					if (!existing && dob) {
						existing = await dbModel.findFirst({
							where: {
								...whereCheck,
								name_unaccented: {
									equals: name_unaccented.toLowerCase(),
									mode: "insensitive",
								},
								dob,
							},
						});
					}

					if (existing) {
						// Chống IDOR: Không cho phép cán bộ thôn sửa đè hồ sơ thôn khác
						if (
							villageId &&
							existing.village_id &&
							existing.village_id !== villageId
						) {
							continue;
						}

						// UPDATE
						const newVersion = (existing.version || 1) + 1;
						const updateData: any = {
							name,
							name_unaccented,
							dob,
							gender: raw.gender || existing.gender || "",
							ethnicity: raw.ethnicity || existing.ethnicity || "Kinh",
							residence:
								raw.residence !== undefined
									? raw.residence
									: existing.residence,
							current_address:
								raw.current_address !== undefined
									? raw.current_address
									: existing.current_address,
							notes: raw.notes !== undefined ? raw.notes : existing.notes,
							received:
								raw.received !== undefined
									? Boolean(raw.received)
									: existing.received,
							calculation_year: calculationYear,
							version: newVersion,
							updated_at: new Date(),
							...milestoneFields,
						};

						if (plainCccd) {
							updateData.cccd = plainCccd;
						}

						const updated = await dbModel.update({
							where: { id: existing.id },
							data: updateData,
						});

						await auditProfile(
							{
								profileId: existing.id,
								userId: req.user!.id,
								villageId: existing.village_id || villageId,
								action: "IMPORT_UPDATE",
								oldValues: existing,
								newValues: updated,
								profileType,
								syncSource: "excel_import",
								note: `Cập nhật từ file Excel (${profileType})`,
							},
							tx,
						);

						updatedCount++;
					} else {
						// CREATE
						const profileId = raw.id || crypto.randomUUID();
						const createData: any = {
							id: profileId,
							stt: raw.stt || null,
							name,
							name_unaccented,
							dob,
							gender: raw.gender || "",
							cccd: plainCccd || null,
							ethnicity: raw.ethnicity || "Kinh",
							residence: raw.residence || "",
							current_address: raw.current_address || "",
							notes: raw.notes || "",
							received: Boolean(raw.received),
							village_id: villageId || raw.village_id,
							calculation_year: calculationYear,
							is_deleted: false,
							version: 1,
							created_at: new Date(),
							updated_at: new Date(),
							...milestoneFields,
						};

						const created = await dbModel.create({
							data: createData,
						});

						await auditProfile(
							{
								profileId,
								userId: req.user!.id,
								villageId: villageId || raw.village_id,
								action: "IMPORT_CREATE",
								newValues: created,
								profileType,
								syncSource: "excel_import",
								note: `Thêm mới từ file Excel (${profileType})`,
							},
							tx,
						);

						addedCount++;
					}
				}

				return { addedCount, updatedCount, skippedCount };
			},
			{ timeout: 60000, maxWait: 15000 },
		);

		clearProfileStatsCache();
		clearHtxhStatsCache();

		res.json({
			success: true,
			message: `Đã import thành công: thêm mới ${result.addedCount}, cập nhật ${result.updatedCount}, bỏ qua ${result.skippedCount}`,
			summary: {
				total: recordsToImport.length,
				added: result.addedCount,
				updated: result.updatedCount,
				skipped: result.skippedCount,
			},
		});
	} catch (error) {
		console.error("importExcel error:", error);
		res.status(500).json({ error: "Lỗi server khi thực hiện import dữ liệu" });
	}
};

/**
 * GET /api/excel/template
 * Trả về template mẫu chuẩn (hoặc metadata các cột chuẩn) cho Chúc thọ và HTXH.
 */
export const getExcelTemplate = async (req: AuthRequest, res: Response) => {
	try {
		const type = (req.query.type as string) || "chuctho";
		const format = (req.query.format as string) || "file";

		if (format === "json") {
			if (type === "htxh") {
				res.json({
					type: "htxh",
					title: "DANH SÁCH ĐẾN TUỔI HƯỞNG HƯU TRÍ XÃ HỘI HÀNG NĂM",
					columnCount: 16,
					columns: [
						{ key: "stt", label: "TT", sample: 1 },
						{ key: "name", label: "Họ và tên", sample: "Nguyễn Văn A" },
						{ key: "dob", label: "Năm sinh", sample: "1948" },
						{ key: "genderNam", label: "Nam", sample: "x" },
						{ key: "genderNu", label: "Nữ", sample: "" },
						{ key: "cccd", label: "Số CCCD", sample: "038048001234" },
						{ key: "ethnicity", label: "Dân tộc", sample: "Kinh" },
						{ key: "residence", label: "Cư trú", sample: "Thôn 1" },
						{
							key: "current_address",
							label: "Nơi ở hiện nay",
							sample: "Thôn 1, Xã Đắk Hà",
						},
						{
							key: "age75plus",
							label: "Đối tượng đủ 75 tuổi trở lên",
							sample: "x",
						},
						{
							key: "age70to74poor",
							label: "Đối tượng từ 70-74 tuổi thuộc hộ nghèo, cận nghèo",
							sample: "",
						},
						{ key: "bao_tro", label: "Bảo trợ", sample: "" },
						{ key: "huu_tri", label: "Hưu trí", sample: "" },
						{
							key: "huu_tuat_bao_hiem",
							label: "Hưu, Tuất Bảo hiểm",
							sample: "",
						},
						{ key: "nguoi_co_cong", label: "Người có công", sample: "" },
						{ key: "notes", label: "Ghi chú", sample: "Hồ sơ mẫu" },
						{ key: "received", label: "Đã nhận quà", sample: "" },
					],
				});
			} else {
				res.json({
					type: "chuctho",
					title: "DANH SÁCH NGƯỜI CAO TUỔI ĐỦ TUỔI CHÚC THỌ, MỪNG THỌ",
					columnCount: 22,
					columns: [
						{ key: "stt", label: "TT", sample: 1 },
						{ key: "name", label: "Họ và tên", sample: "Trần Thị B" },
						{ key: "dob", label: "Năm sinh", sample: "1955" },
						{ key: "genderNam", label: "Nam", sample: "" },
						{ key: "genderNu", label: "Nữ", sample: "x" },
						{ key: "cccd", label: "Số CCCD", sample: "038155005678" },
						{ key: "ethnicity", label: "Dân tộc", sample: "Kinh" },
						{ key: "residence", label: "Cư trú", sample: "Thôn 2" },
						{
							key: "current_address",
							label: "Nơi ở hiện nay",
							sample: "Thôn 2, Xã Đắk Hà",
						},
						{ key: "age60", label: "Tròn 60 tuổi", sample: "" },
						{ key: "age65", label: "Tròn 65 tuổi", sample: "" },
						{ key: "age70", label: "Tròn 70 tuổi", sample: "x" },
						{ key: "age75", label: "Tròn 75 tuổi", sample: "" },
						{ key: "age80", label: "Tròn 80 tuổi", sample: "" },
						{ key: "age85", label: "Tròn 85 tuổi", sample: "" },
						{ key: "age90", label: "Tròn 90 tuổi", sample: "" },
						{ key: "age95", label: "Tròn 95 tuổi", sample: "" },
						{ key: "age100", label: "Tròn 100 tuổi", sample: "" },
						{ key: "age_over_100", label: "Trên 100 tuổi", sample: "" },
						{ key: "notes", label: "Ghi chú", sample: "Mẫu chuẩn" },
						{ key: "received", label: "Đã nhận quà", sample: "" },
					],
				});
			}
			return;
		}

		// Generate Excel file via ExcelJS
		const workbook = new ExcelJS.Workbook();
		workbook.creator = "QLCS Hệ Thống";
		workbook.created = new Date();

		if (type === "htxh") {
			const sheet = workbook.addWorksheet("DS_HUU_TRI_XA_HOI");
			sheet.addRow(["DANH SÁCH ĐẾN TUỔI HƯỞNG HƯU TRÍ XÃ HỘI HÀNG NĂM"]);
			sheet.addRow([]);

			sheet.addRow([
				"TT",
				"Họ và tên",
				"Năm sinh",
				"Nam",
				"Nữ",
				"Số CCCD",
				"Dân tộc",
				"Cư trú",
				"Nơi ở hiện nay",
				"Đối tượng đủ 75 tuổi trở lên",
				"Đối tượng từ 70-74 tuổi thuộc hộ nghèo, cận nghèo",
				"Đang hưởng chế độ chính sách",
				"",
				"",
				"",
				"Ghi chú",
				"Đã nhận quà",
			]);

			sheet.addRow([
				"",
				"",
				"",
				"",
				"",
				"",
				"",
				"",
				"",
				"",
				"",
				"Bảo trợ",
				"Hưu trí",
				"Hưu, Tuất Bảo hiểm",
				"Người có công",
				"",
				"",
			]);

			// Merges for two-tier headers
			sheet.mergeCells("A1:Q1");
			sheet.mergeCells("A3:A4");
			sheet.mergeCells("B3:B4");
			sheet.mergeCells("C3:C4");
			sheet.mergeCells("D3:D4");
			sheet.mergeCells("E3:E4");
			sheet.mergeCells("F3:F4");
			sheet.mergeCells("G3:G4");
			sheet.mergeCells("H3:H4");
			sheet.mergeCells("I3:I4");
			sheet.mergeCells("J3:J4");
			sheet.mergeCells("K3:K4");
			sheet.mergeCells("L3:O3");
			sheet.mergeCells("P3:P4");
			sheet.mergeCells("Q3:Q4");

			sheet.addRow([
				1,
				"Lê Văn C",
				"1948",
				"x",
				"",
				"038048001234",
				"Kinh",
				"Thôn 1",
				"Thôn 1, Xã Đắk Hà",
				"x",
				"",
				"",
				"",
				"",
				"",
				"Mẫu dữ liệu chuẩn",
				"Chưa nhận",
			]);
			sheet.addRow([
				2,
				"Phạm Thị D",
				"1954",
				"",
				"x",
				"038154005678",
				"Kinh",
				"Thôn 2",
				"Thôn 2, Xã Đắk Hà",
				"",
				"x",
				"x",
				"",
				"",
				"",
				"Hộ nghèo",
				"Chưa nhận",
			]);

			// Set column widths
			sheet.columns = [
				{ width: 6 },
				{ width: 25 },
				{ width: 14 },
				{ width: 6 },
				{ width: 6 },
				{ width: 18 },
				{ width: 12 },
				{ width: 18 },
				{ width: 25 },
				{ width: 18 },
				{ width: 22 },
				{ width: 12 },
				{ width: 12 },
				{ width: 20 },
				{ width: 16 },
				{ width: 20 },
				{ width: 15 },
			];

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.setHeader(
				"Content-Disposition",
				'attachment; filename="File_Mau_Huu_Tri_Xa_Hoi.xlsx"',
			);
			await workbook.xlsx.write(res);
			res.end();
		} else {
			// Chúc thọ
			const sheet = workbook.addWorksheet("DS_CHUC_THO");
			sheet.addRow(["DANH SÁCH NGƯỜI CAO TUỔI ĐỦ TUỔI CHÚC THỌ, MỪNG THỌ"]);
			sheet.addRow([]);

			sheet.addRow([
				"TT",
				"Họ và tên",
				"Năm sinh",
				"Nam",
				"Nữ",
				"Số CCCD",
				"Dân tộc",
				"Cư trú",
				"Nơi ở hiện nay",
				"Tròn 60 tuổi",
				"Tròn 65 tuổi",
				"Tròn 70 tuổi",
				"Tròn 75 tuổi",
				"Tròn 80 tuổi",
				"Tròn 85 tuổi",
				"Tròn 90 tuổi",
				"Tròn 95 tuổi",
				"Tròn 100 tuổi",
				"Trên 100 tuổi",
				"Ghi chú",
				"Đã nhận quà",
			]);

			sheet.mergeCells("A1:U1");

			sheet.addRow([
				1,
				"Nguyễn Văn A",
				"1955",
				"x",
				"",
				"038055001234",
				"Kinh",
				"Thôn 1",
				"Thôn 1, Xã Đắk Hà",
				"",
				"",
				"x",
				"",
				"",
				"",
				"",
				"",
				"",
				"",
				"Mẫu dữ liệu",
				"Chưa nhận",
			]);
			sheet.addRow([
				2,
				"Trần Thị B",
				"1965",
				"",
				"x",
				"038165005678",
				"Kinh",
				"Thôn 2",
				"Thôn 2, Xã Đắk Hà",
				"x",
				"",
				"",
				"",
				"",
				"",
				"",
				"",
				"",
				"",
				"Mẫu dữ liệu",
				"Chưa nhận",
			]);

			sheet.columns = [
				{ width: 6 },
				{ width: 25 },
				{ width: 14 },
				{ width: 6 },
				{ width: 6 },
				{ width: 18 },
				{ width: 12 },
				{ width: 18 },
				{ width: 25 },
				{ width: 14 },
				{ width: 14 },
				{ width: 14 },
				{ width: 14 },
				{ width: 14 },
				{ width: 14 },
				{ width: 14 },
				{ width: 14 },
				{ width: 14 },
				{ width: 14 },
				{ width: 20 },
				{ width: 15 },
			];

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.setHeader(
				"Content-Disposition",
				'attachment; filename="File_Mau_Chuc_Tho.xlsx"',
			);
			await workbook.xlsx.write(res);
			res.end();
		}
	} catch (error) {
		console.error("getExcelTemplate error:", error);
		res.status(500).json({ error: "Lỗi server khi tạo template Excel" });
	}
};
