import { describe, expect, it } from "vitest";
import { downloadTemplateClient, exportExcelClient } from "../utils/excelExporter";

describe("Excel Exporter", () => {
	it("should reject export if profiles list is empty", async () => {
		const res = await exportExcelClient({
			filteredProfiles: [],
			activeTab: "chuctho",
		});
		expect(res.success).toBe(false);
		expect(res.error).toContain("Không có hồ sơ");
	});

	it("should create sample Excel structure without throwing", async () => {
		const res = await downloadTemplateClient("cth");
		expect(typeof res.success).toBe("boolean");
	});
});
