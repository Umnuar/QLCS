import { describe, expect, it } from "vitest";
import {
	findHeaderAndDataStart,
	fuzzyMatch,
	normalizeStr,
	parseDob,
} from "../workers/workerUtils";

describe("workerUtils - normalizeStr real implementation", () => {
	it("removes Vietnamese diacritics and converts to lowercase alphanumeric", () => {
		expect(normalizeStr("Nguyễn Văn An")).toBe("nguyenvanan");
		expect(normalizeStr("Trần Thị Bích")).toBe("tranthibich");
		expect(normalizeStr("Đặng Văn Công")).toBe("angvancong");
	});

	it("handles empty and null/undefined values safely", () => {
		expect(normalizeStr("")).toBe("");
		expect(normalizeStr(null as any)).toBe("");
		expect(normalizeStr(undefined as any)).toBe("");
	});

	it("preserves ASCII characters and numbers while stripping spaces and punctuation", () => {
		expect(normalizeStr("Hello World 123!")).toBe("helloworld123");
		expect(normalizeStr("Thôn 1, Đăk Hà")).toBe("thon1akha");
	});
});

describe("workerUtils - fuzzyMatch real implementation", () => {
	it("matches identical strings ignoring accents and case", () => {
		expect(fuzzyMatch("Nguyễn Văn An", "nguyen van an")).toBe(true);
		expect(fuzzyMatch("Thôn 2", "thon 2")).toBe(true);
	});

	it("matches substring patterns for normalized phrases", () => {
		expect(fuzzyMatch("Hưu Trí Xã Hội", "Hưu Trí")).toBe(true);
		expect(fuzzyMatch("Trợ cấp hưu trí bảo hiểm", "Hưu trí")).toBe(true);
	});

	it("tolerates minor typos with Levenshtein similarity", () => {
		// "nguyenvana" vs "nguyenvann" (1 char difference out of 10 -> 90% match >= 75%)
		expect(fuzzyMatch("Nguyễn Văn An", "Nguyễn Văn Anh")).toBe(true);
	});

	it("rejects completely mismatched strings", () => {
		expect(fuzzyMatch("Nguyễn Văn A", "Trần Thị B")).toBe(false);
		expect(fuzzyMatch("Thôn 1", "Làng Plei")).toBe(false);
	});

	it("returns false if either input is empty", () => {
		expect(fuzzyMatch("", "something")).toBe(false);
		expect(fuzzyMatch("something", "")).toBe(false);
	});
});

describe("workerUtils - parseDob and findHeaderAndDataStart", () => {
	it("parses varied date patterns with correct day, month, year", () => {
		const full = parseDob("15/04/1960");
		expect(full?.day).toBe(15);
		expect(full?.month).toBe(4);
		expect(full?.year).toBe(1960);

		const monthYear = parseDob("08/1955");
		expect(monthYear?.day).toBe(1);
		expect(monthYear?.month).toBe(8);
		expect(monthYear?.year).toBe(1955);

		const yearOnly = parseDob("1948");
		expect(yearOnly?.day).toBe(1);
		expect(yearOnly?.month).toBe(1);
		expect(yearOnly?.year).toBe(1948);
	});

	it("locates header row and data start index in matrix array", () => {
		const mockSheet = [
			["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"],
			["DANH SÁCH CHÚC THỌ NĂM 2026"],
			[],
			["STT", "Họ và tên", "Ngày sinh", "Thôn"],
			[1, "Nguyễn Văn A", "01/01/1956", "Thôn 1"],
			[2, "Trần Thị B", "15/05/1951", "Thôn 2"],
		];

		const result = findHeaderAndDataStart(mockSheet);
		expect(result.headerRowIdx).toBe(3);
		expect(result.dataStart).toBe(4);
	});
});
