import { describe, expect, it } from "vitest";
import {
	calcAgeFields,
	findHeaderAndDataStart,
	fuzzyMatch,
	normalizeStr,
	parseDob,
} from "../workers/workerUtils";

describe("normalizeStr", () => {
	it("should lowercase and remove diacritics", () => {
		expect(normalizeStr("Họ và tên")).toBe("hovaten");
		expect(normalizeStr("Nguyễn Văn An")).toBe("nguyenvanan");
	});

	it("should return empty for falsy input", () => {
		expect(normalizeStr("")).toBe("");
		expect(normalizeStr(null as any)).toBe("");
		expect(normalizeStr(undefined as any)).toBe("");
	});

	it("should remove non-alphanumeric characters", () => {
		expect(normalizeStr("CCCD: 001050012345")).toBe("cccd001050012345");
	});
});

describe("fuzzyMatch", () => {
	it("should match identical strings", () => {
		expect(fuzzyMatch("Họ và tên", "ho va ten")).toBe(true);
	});

	it("should match substring for similar strings", () => {
		expect(fuzzyMatch("hưu, tuất", "Hưu, Tuất Bảo hiểm")).toBe(true);
		expect(fuzzyMatch("bảo trợ", "Bảo trợ xã hội")).toBe(true);
	});

	it("should reject very different strings", () => {
		expect(fuzzyMatch("abc", "xyz")).toBe(false);
	});
});

describe("parseDob", () => {
	it("should parse DD/MM/YYYY", () => {
		const result = parseDob("15/06/1946");
		expect(result).not.toBeNull();
		expect(result!.dob).toBe("15/06/1946");
		expect(result!.day).toBe(15);
		expect(result!.month).toBe(6);
		expect(result!.year).toBe(1946);
	});

	it("should parse MM/YYYY as first day of month", () => {
		const result = parseDob("06/1946");
		expect(result).not.toBeNull();
		expect(result!.dob).toBe("01/06/1946");
	});

	it("should parse YYYY as 01/01/YYYY", () => {
		const result = parseDob("1950");
		expect(result).not.toBeNull();
		expect(result!.dob).toBe("01/01/1950");
		expect(result!.year).toBe(1950);
	});

	it("should parse Excel serial date number", () => {
		const result = parseDob(16968);
		expect(result).not.toBeNull();
		expect(result!.dob).toBe("15/06/1946");
		expect(result!.day).toBe(15);
		expect(result!.month).toBe(6);
		expect(result!.year).toBe(1946);
	});

	it("should return null for invalid input", () => {
		expect(parseDob("")).toBeNull();
		expect(parseDob(null)).toBeNull();
		expect(parseDob("abc")).toBeNull();
		expect(parseDob("not-a-date")).toBeNull();
	});
});

describe("calcAgeFields", () => {
	it("should mark exact milestone ages", () => {
		const result = calcAgeFields(1, 1, 1950, 2025, 5, 16);
		expect(result.fields.age75).toBe("x");
		expect(result.ageThisYear).toBe(75);
	});

	it("should mark ageOver100 for >100", () => {
		const result = calcAgeFields(1, 1, 1920, 2025, 5, 16);
		expect(result.fields.ageOver100).toBe("x");
	});

	it("should leave non-milestone ages empty", () => {
		const result = calcAgeFields(1, 1, 1972, 2025, 5, 16);
		expect(result.fields.age75).toBe("");
		expect(result.fields.age60).toBe("");
		expect(result.fields.age65).toBe("");
	});
});

describe("findHeaderAndDataStart", () => {
	it('should find header row containing "Họ và tên"', () => {
		const rows = [
			["STT", "Họ và tên", "Năm sinh"],
			["1", "Nguyễn Văn An", "1950"],
		];
		const result = findHeaderAndDataStart(rows);
		expect(result.headerRowIdx).toBe(0);
		expect(result.dataStart).toBe(1);
	});

	it("should skip blank/subheader rows before data", () => {
		const rows = [
			["STT", "Họ và tên", "Năm sinh"],
			null as any,
			["1", "Nguyễn Văn An", "1950"],
		];
		const result = findHeaderAndDataStart(rows);
		expect(result.headerRowIdx).toBe(0);
		expect(result.dataStart).toBeGreaterThan(0);
	});

	it("should return -1 when header not found", () => {
		const rows = [
			["Column A", "Column B"],
			["Data", "More data"],
		];
		const result = findHeaderAndDataStart(rows);
		expect(result.headerRowIdx).toBe(-1);
		expect(result.dataStart).toBe(-1);
	});
});
