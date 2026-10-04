import { describe, expect, it } from "vitest";
import {
	bulkDeleteSchema,
	exportParamsSchema,
	htxhProfileSchema,
	loginSchema,
	profilePageSchema,
	profileSchema,
	userUpdateSchema,
	villageSchema,
} from "../validation/schemas";

describe("loginSchema", () => {
	it("accepts valid login data", () => {
		const result = loginSchema.safeParse({
			username: "admin",
			password: "123456",
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty username", () => {
		const result = loginSchema.safeParse({ username: "", password: "123456" });
		expect(result.success).toBe(false);
	});

	it("rejects short password", () => {
		const result = loginSchema.safeParse({
			username: "admin",
			password: "12345",
		});
		expect(result.success).toBe(false);
	});
});

describe("userUpdateSchema", () => {
	it("accepts valid user update with all fields", () => {
		const result = userUpdateSchema.safeParse({
			id: 1,
			username: "admin",
			password: "123456",
			avatar: "pic.png",
		});
		expect(result.success).toBe(true);
	});

	it("accepts partial update (password only)", () => {
		const result = userUpdateSchema.safeParse({ id: 1, password: "newpass" });
		expect(result.success).toBe(true);
	});

	it("rejects username with special chars", () => {
		const result = userUpdateSchema.safeParse({ id: 1, username: "admin!" });
		expect(result.success).toBe(false);
	});

	it("rejects short username", () => {
		const result = userUpdateSchema.safeParse({ id: 1, username: "ab" });
		expect(result.success).toBe(false);
	});
});

describe("profileSchema", () => {
	it("accepts minimal valid profile", () => {
		const result = profileSchema.safeParse({ name: "Nguyễn Văn An" });
		expect(result.success).toBe(true);
	});

	it("accepts full valid profile", () => {
		const result = profileSchema.safeParse({
			name: "Nguyễn Văn An",
			dob: "15/06/1950",
			gender: "Nam",
			cccd: "001012345678",
			ethnicity: "Kinh",
			residence: "Hà Nội",
			currentAddress: "Số 1, Đường ABC",
			villageId: 1,
			received: true,
			notes: "Ghi chú",
		});
		expect(result.success).toBe(true);
	});

	it("accepts year-only dob format", () => {
		const result = profileSchema.safeParse({
			name: "Nguyễn Văn An",
			dob: "1950",
		});
		expect(result.success).toBe(true);
	});

	it("accepts empty optional fields", () => {
		const result = profileSchema.safeParse({
			name: "Test",
			dob: "",
			gender: "",
			cccd: "",
			ethnicity: "",
			residence: "",
			currentAddress: "",
			notes: "",
		});
		expect(result.success).toBe(true);
	});

	it("accepts null for optional fields", () => {
		const result = profileSchema.safeParse({
			name: "Test",
			stt: null,
			dob: null,
			gender: null,
			cccd: null,
			ethnicity: null,
			residence: null,
			currentAddress: null,
			notes: null,
			villageId: null,
			received: null,
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty name", () => {
		const result = profileSchema.safeParse({ name: "" });
		expect(result.success).toBe(false);
	});

	it("rejects name with numbers", () => {
		const result = profileSchema.safeParse({ name: "Nguyễn Văn 123" });
		expect(result.success).toBe(false);
	});

	it("rejects invalid dob format", () => {
		const result = profileSchema.safeParse({ name: "Test", dob: "32/13/2020" });
		expect(result.success).toBe(false);
	});

	it("rejects future year in dob", () => {
		const nextYear = new Date().getFullYear() + 1;
		const result = profileSchema.safeParse({
			name: "Test",
			dob: String(nextYear),
		});
		expect(result.success).toBe(false);
	});

	it("rejects year before 1900", () => {
		const result = profileSchema.safeParse({ name: "Test", dob: "1899" });
		expect(result.success).toBe(false);
	});

	it("rejects invalid CCCD length", () => {
		const result = profileSchema.safeParse({ name: "Test", cccd: "123" });
		expect(result.success).toBe(false);
	});

	it("rejects CCCD with letters", () => {
		const result = profileSchema.safeParse({
			name: "Test",
			cccd: "abcd12345678",
		});
		expect(result.success).toBe(false);
	});

	it("accepts valid 12-digit CCCD", () => {
		const result = profileSchema.safeParse({
			name: "Test",
			cccd: "001012345678",
		});
		expect(result.success).toBe(true);
	});

	it("accepts received as number 0/1", () => {
		const result = profileSchema.safeParse({ name: "Test", received: 1 });
		expect(result.success).toBe(true);
	});

	it("accepts received as boolean", () => {
		const result = profileSchema.safeParse({ name: "Test", received: false });
		expect(result.success).toBe(true);
	});
});

describe("htxhProfileSchema", () => {
	it("accepts valid HTXH profile with milestone fields", () => {
		const result = htxhProfileSchema.safeParse({
			name: "Trần Thị B",
			age75plus: "x",
			age70to74poor: "",
			baoTro: "",
			huuTri: "x",
			huuTuatBaoHiem: "",
			nguoiCoCong: "",
		});
		expect(result.success).toBe(true);
	});

	it("inherits profile validation (rejects empty name)", () => {
		const result = htxhProfileSchema.safeParse({ name: "" });
		expect(result.success).toBe(false);
	});
});

describe("profilePageSchema", () => {
	it("accepts valid pagination params", () => {
		const result = profilePageSchema.safeParse({ page: 1, itemsPerPage: 50 });
		expect(result.success).toBe(true);
	});

	it("accepts with all optional fields", () => {
		const result = profilePageSchema.safeParse({
			villageId: 1,
			search: "Nguyễn",
			statusFilter: "received",
			ageFilters: ["75", "80"],
			villageFilters: [1, 2],
			sortKey: "name",
			sortDirection: "asc",
			page: 2,
			itemsPerPage: 100,
		});
		expect(result.success).toBe(true);
	});

	it("rejects page < 1", () => {
		const result = profilePageSchema.safeParse({ page: 0, itemsPerPage: 50 });
		expect(result.success).toBe(false);
	});

	it("rejects itemsPerPage > 1000", () => {
		const result = profilePageSchema.safeParse({ page: 1, itemsPerPage: 1001 });
		expect(result.success).toBe(false);
	});

	it("rejects itemsPerPage < 1", () => {
		const result = profilePageSchema.safeParse({ page: 1, itemsPerPage: 0 });
		expect(result.success).toBe(false);
	});

	it("accepts null villageId", () => {
		const result = profilePageSchema.safeParse({
			page: 1,
			itemsPerPage: 50,
			villageId: null,
		});
		expect(result.success).toBe(true);
	});
});

describe("villageSchema", () => {
	it("accepts valid village name", () => {
		const result = villageSchema.safeParse({ name: "Thôn 1" });
		expect(result.success).toBe(true);
	});

	it("rejects empty village name", () => {
		const result = villageSchema.safeParse({ name: "" });
		expect(result.success).toBe(false);
	});
});

describe("bulkDeleteSchema", () => {
	it("accepts valid bulk delete", () => {
		const result = bulkDeleteSchema.safeParse({ userId: 1, ids: [1, 2, 3] });
		expect(result.success).toBe(true);
	});

	it("rejects empty ids array", () => {
		const result = bulkDeleteSchema.safeParse({ userId: 1, ids: [] });
		expect(result.success).toBe(false);
	});

	it("rejects missing ids", () => {
		const result = bulkDeleteSchema.safeParse({ userId: 1 });
		expect(result.success).toBe(false);
	});
});

describe("exportParamsSchema", () => {
	it("accepts valid export params", () => {
		const result = exportParamsSchema.safeParse({
			activeTab: "chuctho",
			isGlobal: true,
			villages: [{ id: 1, name: "Thôn 1" }],
			profiles: [{ id: 1, name: "Test" }],
			profileIds: [1, 2],
		});
		expect(result.success).toBe(true);
	});

	it("accepts minimal export params", () => {
		const result = exportParamsSchema.safeParse({ activeTab: "htxh" });
		expect(result.success).toBe(true);
	});
});
