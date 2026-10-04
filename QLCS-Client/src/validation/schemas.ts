import { z } from "zod";

export const loginSchema = z.object({
	username: z.string().min(1, "Tên đăng nhập không được để trống"),
	password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const userUpdateSchema = z.object({
	id: z.number(),
	username: z
		.string()
		.min(3)
		.max(30)
		.regex(/^[a-zA-Z0-9_]+$/, "Chỉ gồm chữ cái, số và dấu gạch dưới")
		.optional(),
	password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").optional(),
	avatar: z.string().optional(),
});

const dobPattern = /^(\d{4}|\d{2}\/\d{2}\/\d{4})$/;
const currentYear = new Date().getFullYear();

export const profileSchema = z.object({
	stt: z.number().nullable().optional(),
	name: z
		.string()
		.min(1, "Tên không được để trống")
		.regex(
			/^[a-zA-ZÀ-ỹ\s-]+$/,
			"Tên chỉ được chứa chữ cái, khoảng trắng và dấu gạch nối",
		),
	dob: z
		.string()
		.nullable()
		.optional()
		.refine((val) => {
			if (!val) return true;
			return dobPattern.test(val);
		}, "Năm sinh phải là YYYY hoặc DD/MM/YYYY")
		.refine((val) => {
			if (!val) return true;
			if (val.includes("/")) {
				const [, m, y] = val.split("/").map(Number);
				if (m < 1 || m > 12) return false;
				return y <= currentYear;
			}
			const y = parseInt(val);
			return y >= 1900 && y <= currentYear;
		}, "Ngày tháng không hợp lệ"),
	gender: z.string().nullable().optional(),
	cccd: z
		.string()
		.nullable()
		.optional()
		.refine((val) => {
			if (!val) return true;
			return /^\d{12}$/.test(val);
		}, "CCCD phải gồm đúng 12 chữ số"),
	ethnicity: z.string().nullable().optional(),
	residence: z.string().nullable().optional(),
	currentAddress: z.string().nullable().optional(),
	villageId: z.number().nullable().optional(),
	received: z.union([z.boolean(), z.number()]).nullable().optional(),
	notes: z.string().nullable().optional(),
});

export const htxhProfileSchema = profileSchema.extend({
	age75plus: z.string().nullable().optional(),
	age70to74poor: z.string().nullable().optional(),
	baoTro: z.string().nullable().optional(),
	huuTri: z.string().nullable().optional(),
	huuTuatBaoHiem: z.string().nullable().optional(),
	nguoiCoCong: z.string().nullable().optional(),
});

export const profilePageSchema = z.object({
	villageId: z.number().nullable().optional(),
	search: z.string().optional(),
	statusFilter: z.string().optional(),
	ageFilters: z.array(z.string()).optional(),
	villageFilters: z.array(z.number()).optional(),
	sortKey: z.string().optional(),
	sortDirection: z.string().optional(),
	page: z.number().min(1),
	itemsPerPage: z.number().min(1).max(1000),
});

export const villageSchema = z.object({
	name: z.string().min(1, "Tên thôn không được để trống"),
});

export const bulkDeleteSchema = z.object({
	userId: z.number(),
	ids: z.array(z.number()).min(1, "Phải chọn ít nhất một hồ sơ"),
});

export const exportParamsSchema = z.object({
	activeTab: z.string(),
	isGlobal: z.boolean().optional(),
	villages: z.any().optional(),
	profiles: z.array(z.any()).optional(),
	profileIds: z.array(z.number()).optional(),
});
