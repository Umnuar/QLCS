import { beforeAll, describe, expect, it, vi } from "vitest";

let chucthoHandler: any;
let htxhHandler: any;
const mockPostMessage = vi.fn();

beforeAll(async () => {
	// Mock self for Chuc Tho
	const selfMock1 = {
		postMessage: mockPostMessage,
		onmessage: null,
	};
	global.self = selfMock1 as any;
	await import("../workers/importChucthoWorker");
	chucthoHandler = selfMock1.onmessage;

	// Reset modules so next import executes cleanly
	vi.resetModules();

	// Mock self for HTXH
	const selfMock2 = {
		postMessage: mockPostMessage,
		onmessage: null,
	};
	global.self = selfMock2 as any;
	await import("../workers/importHtxhWorker");
	htxhHandler = selfMock2.onmessage;
});

describe("Import Web Workers", () => {
	describe("importChucthoWorker", () => {
		it("should parse Chuc Tho Excel sheet successfully", () => {
			mockPostMessage.mockClear();
			const wbData = [
				["DANH SÁCH NGƯỜI CAO TUỔI ĐỦ TUỔI CHÚC THỌ"],
				[],
				[
					"STT",
					"Họ và tên",
					"Năm sinh",
					"Nam",
					"Nữ",
					"Số CCCD",
					"Dân tộc",
					"Cư trú",
					"Nơi ở hiện nay",
				],
				[
					1,
					"Nguyen Van A",
					"15/06/1966",
					"x",
					"",
					"001066000001",
					"Kinh",
					"HN",
					"HN",
				], // milestone 60
				[2, "Tran Thi B", "1956", "", "x", "001056000002", "Kinh", "HN", "HN"], // milestone 70
				[3, "Le Van C", "1970", "x", "", "001070000003", "Kinh", "HN", "HN"], // 56 years old (no milestone)
				[4, "Pham Van D (Đã mất)", "1956", "x", "", "", "Kinh", "HN", "HN"], // deceased
				[5, "Bui Van E", "1956", "", "", "", "Kinh", "HN", "HN"], // missing gender
			];

			chucthoHandler({
				data: {
					wbData,
					villageId: 1,
					currentYear: 2026,
				},
			});

			const doneCall = mockPostMessage.mock.calls.find(
				(c) => c[0].type === "done" || c[0].profiles !== undefined,
			);
			expect(doneCall).toBeDefined();
			const result = doneCall![0];

			// Should have 2 successfully parsed profiles: Nguyen Van A (60) and Tran Thi B (70)
			expect(result.profiles).toHaveLength(2);
			expect(result.profiles[0].name).toBe("Nguyen Van A");
			expect(result.profiles[0].gender).toBe("Nam");
			expect(result.profiles[0].age60).toBe("x");
			expect(result.profiles[0]._displayStatus).toBeDefined();

			expect(result.profiles[1].name).toBe("Tran Thi B");
			expect(result.profiles[1].gender).toBe("Nữ");
			expect(result.profiles[1].age70).toBe("x");

			// Le Van C (56) should be ignored
			// Pham Van D (deceased) should be ignored
			// Bui Van E (no gender) should be ignored
			expect(result.errors.length).toBeGreaterThanOrEqual(3);
		});
	});

	describe("importHtxhWorker", () => {
		it("should parse HTXH Excel sheet successfully", () => {
			mockPostMessage.mockClear();
			const wbData = [
				["DANH SÁCH HƯỞNG HƯU TRÍ XÃ HỘI"],
				[],
				[
					"STT",
					"Họ và tên",
					"Năm sinh",
					"Nam",
					"Nữ",
					"Số CCCD",
					"Đối tượng đủ 75 tuổi trở lên",
					"Đối tượng từ 70-74 tuổi thuộc hộ nghèo, cận nghèo",
					"Bảo trợ",
				],
				[1, "Pham Van E", "1951", "x", "", "223456700001", "x", "", ""],
				[2, "Hoang Thi F", "1948", "", "x", "223456700002", "", "x", "x"],
				[3, "Bui Van G", "1955", "x", "", "", "", "Nghèo", ""],
			];

			htxhHandler({
				data: {
					wbData,
					villageId: 1,
				},
			});

			const doneCall = mockPostMessage.mock.calls.find(
				(c) => c[0].type === "done" || c[0].profiles !== undefined,
			);
			expect(doneCall).toBeDefined();
			const result = doneCall![0];

			expect(result.profiles).toHaveLength(3);
			expect(result.profiles[0].name).toBe("Pham Van E");
			expect(result.profiles[0].age75plus).toBe("x");

			expect(result.profiles[1].name).toBe("Hoang Thi F");
			expect(result.profiles[1].age70to74poor).toBe("x");
			expect(result.profiles[1].baoTro).toBe("x");

			expect(result.profiles[2].name).toBe("Bui Van G");
			expect(result.profiles[2].age70to74poor).toBe("x");
		});
	});
});
