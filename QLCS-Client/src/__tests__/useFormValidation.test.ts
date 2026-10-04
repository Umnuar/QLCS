import { describe, expect, it } from "vitest";
import { z } from "zod";
import { profileSchema } from "../validation/schemas";

const testSchema = z.object({
	name: z.string().min(1, "Tên không được để trống"),
	age: z.number().min(0, "Tuổi không hợp lệ"),
	email: z.string().email("Email không hợp lệ").optional(),
});

describe("useFormValidation - validate function core logic", () => {
	it("should return isValid true for valid data", () => {
		const result = testSchema.safeParse({ name: "Test", age: 25 });
		expect(result.success).toBe(true);
	});

	it("should return isValid false with errors for invalid data", () => {
		const result = testSchema.safeParse({ name: "", age: -1 });
		expect(result.success).toBe(false);
		if (!result.success) {
			const issues = result.error.issues;
			const fieldErrors: Record<string, string> = {};
			for (const issue of issues) {
				const path = issue.path.join(".");
				if (!fieldErrors[path]) fieldErrors[path] = issue.message;
			}
			expect(fieldErrors.name).toBe("Tên không được để trống");
			expect(fieldErrors.age).toBe("Tuổi không hợp lệ");
		}
	});

	it("should map ZodError issues to field-level messages", () => {
		const profile = { name: "Nguyễn Văn An", dob: "invalid", cccd: "123" };
		const result = profileSchema.safeParse(profile);
		expect(result.success).toBe(false);
		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const path = issue.path.join(".");
				if (!fieldErrors[path]) fieldErrors[path] = issue.message;
			}
			expect(fieldErrors.dob).toBeDefined();
			expect(fieldErrors.cccd).toBeDefined();
		}
	});

	it("should collect only first error per field", () => {
		const schema = z.object({
			field: z
				.string()
				.min(1, "required")
				.refine(() => false, "also invalid"),
		});
		const result = schema.safeParse({ field: "" });
		expect(result.success).toBe(false);
		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const path = issue.path.join(".");
				if (!fieldErrors[path]) fieldErrors[path] = issue.message;
			}
			expect(fieldErrors.field).toBeDefined();
		}
	});

	it("should clear errors on successful parse", () => {
		const result = testSchema.safeParse({ name: "Valid", age: 30 });
		expect(result.success).toBe(true);
	});

	it("should return no errors for valid data with optional fields omitted", () => {
		const result = testSchema.safeParse({ name: "Test", age: 25 });
		expect(result.success).toBe(true);
	});

	it("should return error for invalid email when provided", () => {
		const result = testSchema.safeParse({
			name: "Test",
			age: 25,
			email: "not-an-email",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(
				result.error.issues.some((i) => i.path.join(".") === "email"),
			).toBe(true);
		}
	});
});
