import { findHeaderAndDataStart, fuzzyMatch, parseDob } from "./workerUtils";

const HTXH_COL_MAP: Record<string, string> = {
	tt: "stt",
	stt: "stt",
	"số tt": "stt",
	"họ và tên": "name",
	"họ tên": "name",
	tên: "name",
	"ho va ten": "name",
	"ho ten": "name",
	"năm sinh": "dob",
	"ngày tháng năm sinh": "dob",
	"ngày sinh": "dob",
	"ngay sinh": "dob",
	"nam sinh": "dob",
	nam: "genderNam",
	"giới tính nam": "genderNam",
	nữ: "genderNu",
	nu: "genderNu",
	"giới tính nữ": "genderNu",
	"số cccd": "cccd",
	cccd: "cccd",
	cmnd: "cccd",
	"số cmnd": "cccd",
	"căn cước": "cccd",
	"cmnd/cccd": "cccd",
	"dân tộc": "ethnicity",
	"dan toc": "ethnicity",
	"cư trú": "residence",
	"cu tru": "residence",
	"nơi đăng ký hộ khẩu": "residence",
	hktt: "residence",
	"hộ khẩu thường trú": "residence",
	"nơi ở hiện nay": "currentAddress",
	"chỗ ở": "currentAddress",
	"nơi ở": "currentAddress",
	"địa chỉ": "currentAddress",
	"noi o hien nay": "currentAddress",
	"đối tượng đủ 75": "age75plus",
	"đối tượng đù 75": "age75plus",
	"đủ 75": "age75plus",
	"75 tuổi trở lên": "age75plus",
	"đối tượng đù 75 tuổi trở lên": "age75plus",
	"đối tượng đủ 75 tuổi trở lên": "age75plus",
	"du 75 tuoi": "age75plus",
	"tren 75": "age75plus",
	"đối tượng từ 70": "age70to74poor",
	"70-74": "age70to74poor",
	"hộ nghèo": "age70to74poor",
	"đối tượng từ 70-74 tuổi thuộc hộ nghèo, cận nghèo": "age70to74poor",
	"đối tượng từ 70-74 tuổi thuộc hộ nghèo": "age70to74poor",
	"70 den 74": "age70to74poor",
	"ho ngheo can ngheo": "age70to74poor",
	"bảo trợ": "baoTro",
	"bảo trợ xã hội": "baoTro",
	"bao tro xa hoi": "baoTro",
	"tro cap xa hoi": "baoTro",
	"hưu trí": "huuTri",
	"huu tri xa hoi": "huuTri",
	"luong huu": "huuTri",
	"hưu, tuất": "huuTuatBaoHiem",
	"hưu tuất": "huuTuatBaoHiem",
	"hưu, tuất bảo hiểm": "huuTuatBaoHiem",
	"hưu tuất bảo hiểm": "huuTuatBaoHiem",
	"huu tuat": "huuTuatBaoHiem",
	"tuat bao hiem": "huuTuatBaoHiem",
	"người có công": "nguoiCoCong",
	"có công": "nguoiCoCong",
	"co cong voi cach mang": "nguoiCoCong",
	"nguoi co cong": "nguoiCoCong",
	"ghi chú": "notes",
	"ghi chu": "notes",
	note: "notes",
	notes: "notes",
	"đã nhận quà": "received",
	"da nhan qua": "received",
	"đã nhận": "received",
	"da nhan": "received",
	"nhận quà": "received",
};

self.onmessage = (e) => {
	const { wbData, villageId, colIndex: customColIndex } = e.data;
	const rows = wbData;

	const { headerRowIdx, dataStart } = findHeaderAndDataStart(rows);

	if (dataStart === -1 || headerRowIdx === -1) {
		self.postMessage({
			type: "done",
			success: 0,
			errors: [
				"Không tìm thấy cột 'Họ và tên'. Vui lòng kiểm tra lại file mẫu.",
			],
			profiles: [],
		});
		return;
	}

	const colIndex: Record<string, number> = customColIndex || {};

	if (Object.keys(colIndex).length === 0) {
		// Parse all rows from headerRowIdx to dataStart - 1 as headers, joining vertically to handle merged cells
		const maxCols = Math.max(
			...rows
				.slice(headerRowIdx, dataStart)
				.map((r: any[]) => (r ? r.length : 0)),
		);
		for (let c = 0; c < maxCols; c++) {
			let colText = "";
			for (let r = headerRowIdx; r < dataStart; r++) {
				if (rows[r] && rows[r][c] !== undefined && rows[r][c] !== null) {
					colText += " " + String(rows[r][c]);
				}
			}
			colText = colText.trim();
			if (!colText) continue;

			for (const [mapKey, fieldName] of Object.entries(HTXH_COL_MAP)) {
				if (fuzzyMatch(colText, mapKey, 0.65)) {
					if (colIndex[fieldName] === undefined) colIndex[fieldName] = c;
				}
			}
		}
	}

	if (colIndex["name"] === undefined) {
		self.postMessage({
			type: "done",
			success: 0,
			errors: ["Không thể map được cột 'Họ và tên'."],
			profiles: [],
		});
		return;
	}

	const parsedProfiles: any[] = [];
	const errors: string[] = [];
	let emptyStreak = 0;

	for (let i = dataStart; i < rows.length; i++) {
		if (i % 500 === 0) {
			self.postMessage({ type: "progress", current: i, total: rows.length });
		}

		const row = rows[i];
		const isEmpty =
			!row ||
			row.every(
				(c: any) => c === null || c === undefined || String(c).trim() === "",
			);

		const isJunkRow =
			!isEmpty &&
			row
				.filter(
					(c: any) => c !== null && c !== undefined && String(c).trim() !== "",
				)
				.every(
					(c: any) =>
						/^\s*\(\d+\)\s*$/.test(String(c)) ||
						/^\s*\d+\s*$/.test(String(c)) ||
						String(c).toLowerCase().includes("tổng"),
				);

		if (isEmpty || isJunkRow) {
			emptyStreak++;
			if (emptyStreak >= 10) break;
			continue;
		}
		emptyStreak = 0;

		const rowNum = i + 1;

		const getCol = (field: string) => {
			const idx = colIndex[field];
			return idx !== undefined && row[idx] !== undefined && row[idx] !== null
				? String(row[idx]).trim()
				: "";
		};

		const name = getCol("name");
		if (name.toLowerCase().includes("tổng")) {
			continue;
		}

		if (!name) {
			errors.push(`Dòng ${rowNum}: Thiếu Họ và tên.`);
			continue;
		}

		const rowTextForCheck = row.join(" ").toLowerCase();
		const isDeceasedOrMoved =
			rowTextForCheck.includes("đã mất") ||
			rowTextForCheck.includes("từ trần") ||
			rowTextForCheck.includes("chết") ||
			rowTextForCheck.includes("thay đổi nơi cư trú") ||
			rowTextForCheck.includes("chuyển đi") ||
			rowTextForCheck.includes("chuyển khẩu");

		const genderNam = getCol("genderNam");
		const genderNu = getCol("genderNu");
		const hasNoGender = !genderNam && !genderNu;

		if (isDeceasedOrMoved) {
			errors.push(
				`Dòng ${rowNum} (${name}): Tự động bỏ qua (Có ghi chú Đã mất / Chuyển cư).`,
			);
			continue;
		}

		if (hasNoGender) {
			errors.push(
				`Dòng ${rowNum} (${name}): Thiếu giới tính, xem như đã chuyển đi/đã mất, bỏ qua.`,
			);
			continue;
		}

		const rawDob = row[colIndex["dob"]];
		const dobParsed = parseDob(rawDob);

		if (!dobParsed) {
			errors.push(`Dòng ${rowNum} (${name}): Năm sinh không hợp lệ.`);
			continue;
		}

		const rawCccd = getCol("cccd");
		const cccd = rawCccd ? rawCccd.replace(/\..*$/, "") : null;

		const profileData: any = {
			_rowNum: rowNum,
			villageId,
			stt: parseInt(getCol("stt"), 10) || 0,
			name,
			dob: dobParsed.dob,
			gender: getCol("genderNam") ? "Nam" : getCol("genderNu") ? "Nữ" : "",
			cccd,
			ethnicity: getCol("ethnicity"),
			residence: getCol("residence"),
			currentAddress: getCol("currentAddress"),
			current_address: getCol("currentAddress"),
			received: (() => {
				const r = getCol("received").toLowerCase();
				return r === "x" ||
					r === "1" ||
					r.includes("đã") ||
					r.includes("roi") ||
					r === "true"
					? 1
					: 0;
			})(),
			notes: getCol("notes"),
			age75plus: getCol("age75plus") ? "x" : "",
			age70to74poor: getCol("age70to74poor") ? "x" : "",
			baoTro: getCol("baoTro") ? "x" : "",
			huuTri: getCol("huuTri") ? "x" : "",
			huuTuatBaoHiem: getCol("huuTuatBaoHiem") ? "x" : "",
			nguoiCoCong: getCol("nguoiCoCong") ? "x" : "",
			_displayStatus: "visible", // HTXH are always visible
		};

		parsedProfiles.push(profileData);
	}

	self.postMessage({ type: "done", profiles: parsedProfiles, errors });
};
