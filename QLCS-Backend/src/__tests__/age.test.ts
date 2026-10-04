import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	computeChucthoMilestones,
	computeHtxhMilestones,
	parseDobValue,
} from "../utils/age";

describe("Backend age utils - parseDobValue", () => {
	it("parses Date object to DD/MM/YYYY", () => {
		const date = new Date(1955, 4, 15); // May 15, 1955
		const result = parseDobValue(date);
		assert.notEqual(result, null);
		assert.equal(result?.dob, "15/05/1955");
		assert.equal(result?.year, 1955);
	});

	it("parses year number between 1850 and 2100", () => {
		const result = parseDobValue(1948);
		assert.notEqual(result, null);
		assert.equal(result?.dob, "01/01/1948");
		assert.equal(result?.year, 1948);
	});

	it("parses standard string DD/MM/YYYY", () => {
		const result = parseDobValue("20/11/1950");
		assert.notEqual(result, null);
		assert.equal(result?.dob, "20/11/1950");
		assert.equal(result?.year, 1950);
	});

	it("parses MM/YYYY string and defaults day to 01", () => {
		const result = parseDobValue("06/1960");
		assert.notEqual(result, null);
		assert.equal(result?.dob, "01/06/1960");
		assert.equal(result?.year, 1960);
	});

	it("returns null for invalid inputs", () => {
		assert.equal(parseDobValue(""), null);
		assert.equal(parseDobValue(null), null);
		assert.equal(parseDobValue("invalid-date"), null);
	});
});

describe("Backend age utils - computeChucthoMilestones", () => {
	it("computes exact milestone age 60", () => {
		const result = computeChucthoMilestones(1966, 2026);
		assert.equal(result.age60, "x");
		assert.equal(result.age65, "");
		assert.equal(result.age70, "");
	});

	it("computes exact milestone age 80", () => {
		const result = computeChucthoMilestones(1946, 2026);
		assert.equal(result.age80, "x");
		assert.equal(result.age75, "");
		assert.equal(result.age85, "");
	});

	it("computes exact milestone age 100", () => {
		const result = computeChucthoMilestones(1926, 2026);
		assert.equal(result.age100, "x");
		assert.equal(result.age_over_100, "");
	});

	it("computes age > 100 correctly into age_over_100", () => {
		const result = computeChucthoMilestones(1920, 2026);
		assert.equal(result.age_over_100, "x");
		assert.equal(result.age100, "");
	});

	it("leaves all fields blank for non-milestone ages", () => {
		const result = computeChucthoMilestones(1963, 2026); // Age 63
		const values = Object.values(result);
		assert.equal(values.every((v) => v === ""), true);
	});
});

describe("Backend age utils - computeHtxhMilestones", () => {
	it("flags age75plus for age >= 75", () => {
		const result = computeHtxhMilestones(1948, 2026); // Age 78
		assert.equal(result.age75plus, "x");
	});

	it("flags age70to74poor for age between 70 and 74 when record marked", () => {
		const result = computeHtxhMilestones(1953, 2026, { age70to74poor: "x" }); // Age 73
		assert.equal(result.age70to74poor, "x");
	});

	it("preserves policy flags like bao_tro and huu_tri", () => {
		const result = computeHtxhMilestones(1950, 2026, {
			bao_tro: "x",
			huu_tri: "x",
		});
		assert.equal(result.bao_tro, "x");
		assert.equal(result.huu_tri, "x");
	});
});
