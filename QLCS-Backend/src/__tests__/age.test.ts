import { describe, expect, it } from "vitest";
import {
	computeChucthoMilestones,
	computeHtxhMilestones,
	parseDobValue,
} from "../utils/age";

describe("Backend age utils - parseDobValue", () => {
	it("parses Date object to DD/MM/YYYY", () => {
		const date = new Date(1955, 4, 15); // May 15, 1955
		const result = parseDobValue(date);
		expect(result).not.toBeNull();
		expect(result?.dob).toBe("15/05/1955");
		expect(result?.year).toBe(1955);
	});

	it("parses year number between 1850 and 2100", () => {
		const result = parseDobValue(1948);
		expect(result).not.toBeNull();
		expect(result?.dob).toBe("01/01/1948");
		expect(result?.year).toBe(1948);
	});

	it("parses standard string DD/MM/YYYY", () => {
		const result = parseDobValue("20/11/1950");
		expect(result).not.toBeNull();
		expect(result?.dob).toBe("20/11/1950");
		expect(result?.year).toBe(1950);
	});

	it("parses MM/YYYY string and defaults day to 01", () => {
		const result = parseDobValue("06/1960");
		expect(result).not.toBeNull();
		expect(result?.dob).toBe("01/06/1960");
		expect(result?.year).toBe(1960);
	});

	it("returns null for invalid inputs", () => {
		expect(parseDobValue("")).toBeNull();
		expect(parseDobValue(null)).toBeNull();
		expect(parseDobValue("invalid-date")).toBeNull();
	});
});

describe("Backend age utils - computeChucthoMilestones", () => {
	it("computes exact milestone age 60", () => {
		const result = computeChucthoMilestones(1966, 2026);
		expect(result.age60).toBe("x");
		expect(result.age65).toBe("");
		expect(result.age70).toBe("");
	});

	it("computes exact milestone age 80", () => {
		const result = computeChucthoMilestones(1946, 2026);
		expect(result.age80).toBe("x");
		expect(result.age75).toBe("");
		expect(result.age85).toBe("");
	});

	it("computes exact milestone age 100", () => {
		const result = computeChucthoMilestones(1926, 2026);
		expect(result.age100).toBe("x");
		expect(result.age_over_100).toBe("");
	});

	it("computes age > 100 correctly into age_over_100", () => {
		const result = computeChucthoMilestones(1920, 2026);
		expect(result.age_over_100).toBe("x");
		expect(result.age100).toBe("");
	});

	it("leaves all fields blank for non-milestone ages", () => {
		const result = computeChucthoMilestones(1963, 2026); // Age 63
		const values = Object.values(result);
		expect(values.every((v) => v === "")).toBe(true);
	});
});

describe("Backend age utils - computeHtxhMilestones", () => {
	it("flags age75plus for age >= 75", () => {
		const result = computeHtxhMilestones(1948, 2026); // Age 78
		expect(result.age75plus).toBe("x");
	});

	it("flags age70to74poor for age between 70 and 74 when record marked", () => {
		const result = computeHtxhMilestones(1953, 2026, { age70to74poor: "x" }); // Age 73
		expect(result.age70to74poor).toBe("x");
	});

	it("preserves policy flags like bao_tro and huu_tri", () => {
		const result = computeHtxhMilestones(1950, 2026, {
			bao_tro: "x",
			huu_tri: "x",
		});
		expect(result.bao_tro).toBe("x");
		expect(result.huu_tri).toBe("x");
	});
});
