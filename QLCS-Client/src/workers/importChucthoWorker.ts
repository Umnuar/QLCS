import {
	AGE_MILESTONES_CHUCTHO,
	calcAgeFields,
	findHeaderAndDataStart,
	fuzzyMatch,
	parseDob,
} from "./workerUtils";

const CTH_COL_MAP: Record<string, string> = {
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
	"tròn 60": "age60",
	"tròn 60 tuổi": "age60",
	"tròn 65": "age65",
	"tròn 65 tuổi": "age65",
	"tròn 70": "age70",
	"tròn 70 tuổi": "age70",
	"tròn 75": "age75",
	"tròn 75 tuổi": "age75",
	"tròn 80": "age80",
	"tròn 80 tuổi": "age80",
	"tròn 85": "age85",
	"tròn 85 tuổi": "age85",
	"tròn 90": "age90",
	"tròn 90 tuổi": "age90",
	"tròn 95": "age95",
	"tròn 95 tuổi": "age95",
	"tròn 100": "age100",
	"tròn 100 tuổi": "age100",
	"trên 100": "ageOver100",
	"trên 100 tuổi": "ageOver100",
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
	const { wbData, villageId, currentYear, colIndex: customColIndex } = e.data;
	const rows = wbData;
	const currentMonth = new Date().getMonth() + 1;
	const currentDay = new Date().getDate();

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
		// Parse all rows from headerRowIdx to dataStart - 1 as headers
		for (let r = headerRowIdx; r < dataStart; r++) {
			const row = rows[r];
			if (!row) continue;
			row.forEach((cell: any, i: number) => {
				if (!cell) return;
				const key = String(cell);
				for (const [mapKey, fieldName] of Object.entries(CTH_COL_MAP)) {
					if (fuzzyMatch(key, mapKey, 0.75)) {
						if (colIndex[fieldName] === undefined) colIndex[fieldName] = i;
					}
				}
			});
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
		};

		const { fields, ageThisYear, birthdayPassedThisYear } = calcAgeFields(
			dobParsed.day,
			dobParsed.month,
			dobParsed.year,
			currentYear,
			currentMonth,
			currentDay,
		);

		// Always use calculated fields to ensure correctness based on current year
		Object.assign(profileData, fields);
		profileData.age = ageThisYear;
		profileData.birthYear = dobParsed.year;

		if (!AGE_MILESTONES_CHUCTHO.includes(ageThisYear) && ageThisYear <= 100) {
			errors.push(
				`Dòng ${rowNum} (${name}): Không thuộc mốc tuổi chúc thọ năm ${currentYear} (${ageThisYear} tuổi), đã bỏ qua.`,
			);
			continue;
		}

		profileData._displayStatus = birthdayPassedThisYear ? "green" : "orange";
		parsedProfiles.push(profileData);
	}

	self.postMessage({ type: "done", profiles: parsedProfiles, errors });
};
