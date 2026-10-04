/**
 * Utility functions for DOB parsing and age milestone calculations
 * for Chúc Thọ and Hưu Trí Xã Hội (HTXH).
 */

export function parseDobValue(raw: any): { dob: string; year: number } | null {
	if (!raw && raw !== 0) return null;

	if (raw instanceof Date) {
		const d = String(raw.getDate()).padStart(2, "0");
		const m = String(raw.getMonth() + 1).padStart(2, "0");
		const y = raw.getFullYear();
		return { dob: `${d}/${m}/${y}`, year: y };
	}

	if (typeof raw === "number") {
		if (raw >= 1850 && raw <= 2100) {
			return { dob: `01/01/${raw}`, year: raw };
		}
		// Excel serial date: days since 1899-12-30
		const date = new Date(Math.round((raw - 25569) * 86400 * 1000));
		if (!isNaN(date.getTime())) {
			const d = String(date.getUTCDate()).padStart(2, "0");
			const m = String(date.getUTCMonth() + 1).padStart(2, "0");
			const y = date.getUTCFullYear();
			return { dob: `${d}/${m}/${y}`, year: y };
		}
	}

	const str = String(raw).trim();
	const full = str.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
	if (full) {
		return {
			dob: `${full[1].padStart(2, "0")}/${full[2].padStart(2, "0")}/${full[3]}`,
			year: parseInt(full[3]),
		};
	}

	const monthYear = str.match(/^(\d{1,2})[/.-](\d{4})$/);
	if (monthYear) {
		return {
			dob: `01/${monthYear[1].padStart(2, "0")}/${monthYear[2]}`,
			year: parseInt(monthYear[2]),
		};
	}

	const yearOnly = str.match(/^(\d{4})$/);
	if (yearOnly) {
		return {
			dob: `01/01/${yearOnly[1]}`,
			year: parseInt(yearOnly[1]),
		};
	}

	return null;
}

export function computeChucthoMilestones(
	birthYear: number,
	calculationYear: number,
) {
	const age = calculationYear - birthYear;
	return {
		age60: age === 60 ? "x" : "",
		age65: age === 65 ? "x" : "",
		age70: age === 70 ? "x" : "",
		age75: age === 75 ? "x" : "",
		age80: age === 80 ? "x" : "",
		age85: age === 85 ? "x" : "",
		age90: age === 90 ? "x" : "",
		age95: age === 95 ? "x" : "",
		age100: age === 100 ? "x" : "",
		age_over_100: age > 100 ? "x" : "",
	};
}

export function computeHtxhMilestones(
	birthYear: number,
	calculationYear: number,
	record?: any,
) {
	const age = calculationYear - birthYear;
	return {
		age75plus: age >= 75 ? "x" : record?.age75plus || record?.age_75_plus || "",
		age70to74poor:
			age >= 70 && age <= 74
				? record?.age70to74poor || record?.age_70_74_poor || ""
				: "",
		bao_tro: record?.bao_tro || record?.baoTro || "",
		huu_tri: record?.huu_tri || record?.huuTri || "",
		huu_tuat_bao_hiem:
			record?.huu_tuat_bao_hiem || record?.huuTuatBaoHiem || "",
		nguoi_co_cong: record?.nguoi_co_cong || record?.nguoiCoCong || "",
	};
}
