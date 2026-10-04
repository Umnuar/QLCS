function parseExcelSerialDate(
	serial: number,
): { d: number; m: number; y: number } | null {
	if (typeof serial !== "number" || serial < 0 || serial > 2958465) return null;
	let date = Math.floor(serial);
	if (date === 60) return { d: 29, m: 2, y: 1900 };
	if (date === 0) return { d: 0, m: 1, y: 1900 };
	if (date > 60) date--;
	const ms = Date.UTC(1900, 0, 1) + (date - 1) * 86400000;
	const d = new Date(ms);
	return { d: d.getUTCDate(), m: d.getUTCMonth() + 1, y: d.getUTCFullYear() };
}

export const normalizeStr = (str: string) => {
	if (!str) return "";
	return String(str)
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]/gi, "")
		.toLowerCase();
};

export const fuzzyMatch = (a: string, b: string, threshold = 0.75) => {
	const s1 = normalizeStr(a);
	const s2 = normalizeStr(b);

	if (s1 === s2) return true;

	// Allow substring match for normalized strings to handle cases like "hưu, tuất" vs "Hưu, Tuất Bảo hiểm"
	if (s1.length > 3 && s2.length > 3) {
		// Avoid cross-matching gender columns (e.g. "gioitinh" vs "gioitinhnam")
		const isGenderA = s1.includes("nam") || s1.includes("nu");
		const isGenderB = s2.includes("nam") || s2.includes("nu");
		if (isGenderA === isGenderB) {
			if (s1.includes(s2) || s2.includes(s1)) return true;
		}
	}

	if (s1.length === 0 || s2.length === 0) return false;

	const track = Array(s2.length + 1)
		.fill(null)
		.map(() => Array(s1.length + 1).fill(null));
	for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
	for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
	for (let j = 1; j <= s2.length; j += 1) {
		for (let i = 1; i <= s1.length; i += 1) {
			const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
			track[j][i] = Math.min(
				track[j][i - 1] + 1,
				track[j - 1][i] + 1,
				track[j - 1][i - 1] + indicator,
			);
		}
	}
	const dist = track[s2.length][s1.length];
	const maxLen = Math.max(s1.length, s2.length);
	return 1 - dist / maxLen >= threshold;
};

export function parseDob(
	raw: any,
): { dob: string; day: number; month: number; year: number } | null {
	if (!raw) return null;

	if (typeof raw === "number") {
		// If the number is between 1850 and 2100, it's almost certainly just a year, not an Excel serial date.
		// Excel serial dates for recent years are usually > 30000.
		if (raw >= 1850 && raw <= 2100) {
			return {
				dob: `01/01/${raw}`,
				day: 1,
				month: 1,
				year: raw,
			};
		}
		const info = parseExcelSerialDate(raw);
		if (info)
			return {
				dob: `${String(info.d).padStart(2, "0")}/${String(info.m).padStart(2, "0")}/${info.y}`,
				day: info.d,
				month: info.m,
				year: info.y,
			};
	}

	const str = String(raw).trim();

	const isoMatch = str.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/);
	if (isoMatch)
		return {
			dob: `${isoMatch[3].padStart(2, "0")}/${isoMatch[2].padStart(2, "0")}/${isoMatch[1]}`,
			day: parseInt(isoMatch[3]),
			month: parseInt(isoMatch[2]),
			year: parseInt(isoMatch[1]),
		};

	const full = str.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
	if (full)
		return {
			dob: `${full[1].padStart(2, "0")}/${full[2].padStart(2, "0")}/${full[3]}`,
			day: parseInt(full[1]),
			month: parseInt(full[2]),
			year: parseInt(full[3]),
		};

	const monthYear = str.match(/^(\d{1,2})[/.-](\d{4})$/);
	if (monthYear)
		return {
			dob: `01/${monthYear[1].padStart(2, "0")}/${monthYear[2]}`,
			day: 1,
			month: parseInt(monthYear[1]),
			year: parseInt(monthYear[2]),
		};

	const yearOnly = str.match(/^(\d{4})$/);
	if (yearOnly)
		return {
			dob: `01/01/${yearOnly[1]}`,
			day: 1,
			month: 1,
			year: parseInt(yearOnly[1]),
		};

	return null;
}

export const AGE_MILESTONES_CHUCTHO = [60, 65, 70, 75, 80, 85, 90, 95, 100];

export function calcAgeFields(
	day: number,
	month: number,
	year: number,
	currentYear: number,
	currentMonth: number,
	currentDay: number,
) {
	const birthdayPassedThisYear =
		month < currentMonth || (month === currentMonth && day <= currentDay);

	const ageThisYear = currentYear - year;

	const fields: Record<string, string> = {
		age60: "",
		age65: "",
		age70: "",
		age75: "",
		age80: "",
		age85: "",
		age90: "",
		age95: "",
		age100: "",
		ageOver100: "",
	};

	if (AGE_MILESTONES_CHUCTHO.includes(ageThisYear)) {
		const key = ageThisYear >= 100 ? "age100" : `age${ageThisYear}`;
		fields[key] = "x";
	} else if (ageThisYear > 100) {
		fields["ageOver100"] = "x";
	}

	return { fields, ageThisYear, birthdayPassedThisYear };
}

export function findHeaderAndDataStart(rows: any[][]): {
	headerRowIdx: number;
	dataStart: number;
} {
	for (let i = 0; i < Math.min(50, rows.length); i++) {
		const row = rows[i];
		if (!row) continue;

		const hasNameCol = row.some(
			(cell) => cell && fuzzyMatch(String(cell), "ho va ten", 0.7),
		);
		if (!hasNameCol) continue;

		for (let j = i + 1; j < Math.min(i + 10, rows.length); j++) {
			const nextRow = rows[j];
			if (!nextRow) continue;

			const isJunkRow = nextRow
				.filter((c) => c !== null && c !== undefined && String(c).trim() !== "")
				.every(
					(c) =>
						/^\s*\(\d+\)\s*$/.test(String(c)) || /^\s*\d+\s*$/.test(String(c)),
				);

			if (isJunkRow) continue;

			const isEmpty = nextRow.every(
				(c) => c === null || c === undefined || String(c).trim() === "",
			);
			if (isEmpty) continue;

			// Check if it's a sub-header row (e.g. contains "Bảo trợ", "Hưu trí", "Tròn 60")
			const text = nextRow.join(" ").toLowerCase();
			const hasSttOrDob = nextRow.some(
				(c) => c && (/^\s*\d{1,4}\s*$/.test(String(c)) || parseDob(c) !== null),
			);
			if (
				!hasSttOrDob &&
				(text.includes("bảo trợ") ||
					text.includes("hưu trí") ||
					text.includes("tròn 60") ||
					text.includes("đủ 75"))
			) {
				continue; // It's a subheader, skip to next row to find actual data start
			}

			return { headerRowIdx: i, dataStart: j };
		}

		return { headerRowIdx: i, dataStart: i + 1 };
	}

	return { headerRowIdx: -1, dataStart: -1 };
}
