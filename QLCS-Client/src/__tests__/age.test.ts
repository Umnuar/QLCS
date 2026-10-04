import { describe, expect, it } from "vitest";
import {
	AGE_MILESTONES_CHUCTHO,
	calcAgeFields,
	parseDob,
} from "../workers/workerUtils";

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentDay = now.getDate();

function getMilestones(dobStr: any, calculationYear?: number) {
	const parsed = parseDob(dobStr);
	if (!parsed) {
		return {
			fields: {
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
			},
			ageThisYear: 0,
			birthdayPassedThisYear: false,
		};
	}
	const year = calculationYear || currentYear;
	return calcAgeFields(
		parsed.day,
		parsed.month,
		parsed.year,
		year,
		currentMonth,
		currentDay,
	);
}

describe("workerUtils - parseDob and calcAgeFields real implementation", () => {
	describe("Milestone verification across all standard tiers", () => {
		it("marks exact milestone age 60", () => {
			const birthYear = currentYear - 60;
			const { fields, ageThisYear } = getMilestones(`01/01/${birthYear}`);
			expect(ageThisYear).toBe(60);
			expect(fields.age60).toBe("x");
			expect(fields.age65).toBe("");
			expect(fields.age70).toBe("");
		});

		it("marks exact milestone age 70", () => {
			const birthYear = currentYear - 70;
			const { fields, ageThisYear } = getMilestones(`15/06/${birthYear}`);
			expect(ageThisYear).toBe(70);
			expect(fields.age70).toBe("x");
			expect(fields.age60).toBe("");
		});

		it("marks exact milestone age 75", () => {
			const birthYear = currentYear - 75;
			const { fields, ageThisYear } = getMilestones(`20/10/${birthYear}`);
			expect(ageThisYear).toBe(75);
			expect(fields.age75).toBe("x");
		});

		it("marks exact milestone age 80", () => {
			const birthYear = currentYear - 80;
			const { fields, ageThisYear } = getMilestones(`01/01/${birthYear}`);
			expect(ageThisYear).toBe(80);
			expect(fields.age80).toBe("x");
		});

		it("marks exact milestone age 85", () => {
			const birthYear = currentYear - 85;
			const { fields, ageThisYear } = getMilestones(`10/05/${birthYear}`);
			expect(ageThisYear).toBe(85);
			expect(fields.age85).toBe("x");
		});

		it("marks exact milestone age 90", () => {
			const birthYear = currentYear - 90;
			const { fields, ageThisYear } = getMilestones(`12/12/${birthYear}`);
			expect(ageThisYear).toBe(90);
			expect(fields.age90).toBe("x");
		});

		it("marks exact milestone age 95", () => {
			const birthYear = currentYear - 95;
			const { fields, ageThisYear } = getMilestones(`01/01/${birthYear}`);
			expect(ageThisYear).toBe(95);
			expect(fields.age95).toBe("x");
		});

		it("marks exact milestone age 100", () => {
			const birthYear = currentYear - 100;
			const { fields, ageThisYear } = getMilestones(`01/01/${birthYear}`);
			expect(ageThisYear).toBe(100);
			expect(fields.age100).toBe("x");
			expect(fields.ageOver100).toBe("");
		});

		it("marks ageOver100 for age > 100", () => {
			const { fields, ageThisYear } = getMilestones("1920", 2026);
			expect(ageThisYear).toBe(106);
			expect(fields.ageOver100).toBe("x");
			expect(fields.age100).toBe("");
		});

		it("leaves non-milestone ages completely empty", () => {
			const birthYear = currentYear - 63;
			const { fields, ageThisYear } = getMilestones(`01/01/${birthYear}`);
			expect(ageThisYear).toBe(63);
			for (const key of Object.keys(fields)) {
				expect(fields[key]).toBe("");
			}
		});
	});

	describe("parseDob date formatting resilience", () => {
		it("parses DD/MM/YYYY format correctly", () => {
			const parsed = parseDob("25/08/1954");
			expect(parsed).not.toBeNull();
			expect(parsed?.day).toBe(25);
			expect(parsed?.month).toBe(8);
			expect(parsed?.year).toBe(1954);
			expect(parsed?.dob).toBe("25/08/1954");
		});

		it("parses ISO YYYY-MM-DD format correctly", () => {
			const parsed = parseDob("1954-08-25");
			expect(parsed).not.toBeNull();
			expect(parsed?.day).toBe(25);
			expect(parsed?.month).toBe(8);
			expect(parsed?.year).toBe(1954);
		});

		it("parses MM/YYYY format and defaults day to 1", () => {
			const parsed = parseDob("09/1945");
			expect(parsed).not.toBeNull();
			expect(parsed?.day).toBe(1);
			expect(parsed?.month).toBe(9);
			expect(parsed?.year).toBe(1945);
			expect(parsed?.dob).toBe("01/09/1945");
		});

		it("parses 4-digit year-only number or string", () => {
			const parsedStr = parseDob("1950");
			expect(parsedStr?.year).toBe(1950);
			expect(parsedStr?.dob).toBe("01/01/1950");

			const parsedNum = parseDob(1950);
			expect(parsedNum?.year).toBe(1950);
			expect(parsedNum?.dob).toBe("01/01/1950");
		});

		it("returns null for invalid or empty inputs", () => {
			expect(parseDob("")).toBeNull();
			expect(parseDob(null)).toBeNull();
			expect(parseDob(undefined)).toBeNull();
			expect(parseDob("invalid-date-string")).toBeNull();
		});
	});

	describe("Calculation year forecasting & milestone consistency", () => {
		it("verifies AGE_MILESTONES_CHUCTHO contains all 9 official milestones", () => {
			expect(AGE_MILESTONES_CHUCTHO).toEqual([60, 65, 70, 75, 80, 85, 90, 95, 100]);
		});

		it("calculates future milestone correctly when calculationYear is changed", () => {
			const birthYear = 1950;
			// In 2025: age = 75 (milestone)
			const res2025 = getMilestones(String(birthYear), 2025);
			expect(res2025.ageThisYear).toBe(75);
			expect(res2025.fields.age75).toBe("x");

			// In 2026: age = 76 (non-milestone)
			const res2026 = getMilestones(String(birthYear), 2026);
			expect(res2026.ageThisYear).toBe(76);
			expect(Object.values(res2026.fields).every((v) => v === "")).toBe(true);

			// In 2030: age = 80 (milestone)
			const res2030 = getMilestones(String(birthYear), 2030);
			expect(res2030.ageThisYear).toBe(80);
			expect(res2030.fields.age80).toBe("x");
		});

		it("calculates birthdayPassedThisYear correctly", () => {
			// Birthday yesterday -> passed
			const pastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
			const pastYear = currentMonth === 1 ? currentYear - 1 - 70 : currentYear - 70;
			const resPast = calcAgeFields(1, pastMonth, pastYear, currentYear, currentMonth, currentDay);
			expect(resPast.birthdayPassedThisYear).toBe(true);

			// Birthday in future month -> not passed
			const futureMonth = currentMonth === 12 ? 12 : currentMonth + 1;
			const futureDay = currentMonth === 12 ? 31 : 28;
			if (currentMonth < 12) {
				const resFuture = calcAgeFields(futureDay, futureMonth, currentYear - 70, currentYear, currentMonth, currentDay);
				expect(resFuture.birthdayPassedThisYear).toBe(false);
			}
		});
	});
});
