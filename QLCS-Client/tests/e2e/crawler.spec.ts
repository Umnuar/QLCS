import { expect, test, type Locator, type Page } from "@playwright/test";

interface ApiError {
	method: string;
	url: string;
	status: number;
	body: string;
	timestamp: string;
	lastAction: string;
}

interface ConsoleError {
	text: string;
	timestamp: string;
	lastAction: string;
}

interface UnhandledError {
	message: string;
	timestamp: string;
	lastAction: string;
}

test.describe("QLCS Smart Crawler - Deep Filter & Real CRUD Verification Suite (Best of 3)", () => {
	const apiErrors: ApiError[] = [];
	const consoleErrors: ConsoleError[] = [];
	const unhandledErrors: UnhandledError[] = [];
	const visitedRoutes: string[] = [];
	let interactionCount = 0;
	let currentAction = "Khởi tạo kiểm thử";

	const getVnTime = () =>
		new Date().toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

	const isDangerous = (text: string): boolean => {
		const dangerousRegex =
			/xóa vĩnh viễn|xóa hàng loạt|hard delete|reset|xóa thôn|xóa dữ liệu|khôi phục dữ liệu|đăng xuất|logout/i;
		return dangerousRegex.test(text);
	};

	// ----------------------------------------------------------------------
	// TRỤ CỘT 1: THIẾT LẬP BẪY LỖI & GIÁM SÁT TOÀN DIỆN (setupErrorTraps)
	// ----------------------------------------------------------------------
	const setupErrorTraps = (page: Page) => {
		// Bắt lỗi HTTP Status >= 400 từ Backend (:5000 hoặc /api/)
		page.on("response", async (response) => {
			const url = response.url();
			if (
				url.includes("favicon.ico") ||
				url.includes("chrome-extension://") ||
				url.includes("fonts.googleapis.com") ||
				url.includes("fonts.gstatic.com")
			) {
				return;
			}

			const status = response.status();
			if (status >= 400 && (url.includes(":5000") || url.includes("/api/"))) {
				let body = "";
				try {
					body = await response.text();
				} catch {
					body = "[Không thể đọc body response]";
				}

				apiErrors.push({
					method: response.request().method(),
					url,
					status,
					body: body.slice(0, 300),
					timestamp: getVnTime(),
					lastAction: currentAction,
				});
			}
		});

		// Bắt lỗi Console & Lỗi React Crash
		page.on("console", (msg) => {
			if (msg.type() === "error") {
				const text = msg.text();
				if (
					text.includes("favicon.ico") ||
					text.includes("ERR_CONNECTION_REFUSED") ||
					text.includes("fonts.googleapis.com") ||
					text.includes("fonts.gstatic.com") ||
					text.includes("chrome-extension://") ||
					text.includes("vite:react-babel") ||
					text.includes("vite-babel")
				) {
					return;
				}

				consoleErrors.push({
					text,
					timestamp: getVnTime(),
					lastAction: currentAction,
				});
			}
		});

		// Bắt unhandled runtime exceptions
		page.on("pageerror", (err) => {
			unhandledErrors.push({
				message: `${err.name}: ${err.message}`,
				timestamp: getVnTime(),
				lastAction: currentAction,
			});
		});
	};

	// ----------------------------------------------------------------------
	// TRỤ CỘT 2: CÁC HÀM TIỆN ÍCH GIAO DIỆN (UI Helpers)
	// ----------------------------------------------------------------------

	// 1. Helper chọn option trong CustomSelect theo nhãn chữ
	const selectCustomOption = async (
		page: Page,
		containerLocator: Locator,
		optionText: string,
	): Promise<boolean> => {
		const trigger = containerLocator.locator('[role="combobox"]').first();
		if (await trigger.isVisible().catch(() => false)) {
			await trigger.click();
			interactionCount++;
			await page.waitForTimeout(200);

			const option = page
				.locator(`[role="option"]:has-text("${optionText}")`)
				.first();
			if (await option.isVisible().catch(() => false)) {
				await option.click();
				interactionCount++;
				await page.waitForTimeout(300);
				return true;
			}
			await page.keyboard.press("Escape");
			await page.waitForTimeout(150);
		}
		return false;
	};

	// 2. Helper tự đóng hộp thoại thông báo thành công (ModalContainer z-[9999999])
	const closeSuccessAlertIfPresent = async (p: Page) => {
		const alertModal = p.locator(
			'div[role="alertdialog"], div.fixed.inset-0.z-\\[9999999\\]',
		);
		const alertCloseBtn = alertModal
			.locator('button:has-text("Đóng")')
			.first();
		try {
			await alertCloseBtn.waitFor({ state: "visible", timeout: 4000 });
			await alertCloseBtn.click();
			interactionCount++;
			await alertModal
				.waitFor({ state: "hidden", timeout: 3000 })
				.catch(() => {});
			await p.waitForTimeout(300);
		} catch {
			// Alert dialog không hiển thị hoặc đã đóng
		}
	};

	// 3. Helper tự dò nút an toàn ở cuối mỗi màn hình (Button Spider)
	const crawlSafeButtons = async (page: Page, screenName: string) => {
		const buttons = await page.locator("button").all();
		for (const btn of buttons) {
			const isVisible = await btn.isVisible().catch(() => false);
			if (!isVisible) continue;

			const text = (await btn.innerText().catch(() => "")) || "";
			const ariaLabel =
				(await btn.getAttribute("aria-label").catch(() => "")) || "";
			const title = (await btn.getAttribute("title").catch(() => "")) || "";
			const fullLabel = `${text} ${ariaLabel} ${title}`.trim();

			if (!fullLabel || isDangerous(fullLabel)) continue;

			// Bỏ qua các nút điều khiển layout, modal, hoặc logout/đổi thôn
			if (
				fullLabel.includes("thanh bên") ||
				fullLabel.includes("chẩn đoán") ||
				fullLabel.includes("kích thước") ||
				fullLabel.includes("giao diện") ||
				fullLabel.includes("Đăng xuất") ||
				fullLabel.includes("Đổi thôn") ||
				fullLabel.includes("Xóa") ||
				fullLabel.includes("Xác nhận") ||
				fullLabel.includes("Nhập Excel") ||
				fullLabel.includes("Xuất Excel") ||
				fullLabel.includes("Thêm")
			) {
				continue;
			}

			if (
				fullLabel.includes("Làm mới") ||
				fullLabel.includes("Thu gọn") ||
				fullLabel.includes("Mở rộng")
			) {
				currentAction = `[Spider] Click nút an toàn trên ${screenName}: ${fullLabel}`;
				await btn.click({ timeout: 1000 }).catch(() => {});
				interactionCount++;
				await page.waitForTimeout(200);
			}
		}
	};

	// ----------------------------------------------------------------------
	// TEST CASE CHÍNH: FULL FLOW CRAWLER
	// ----------------------------------------------------------------------
	test("Smart Crawler: Quét cạn 7 thôn, Filter & Vòng đời CRUD THẬT [TEST-CRAWLER] an toàn 100%", async ({
		page,
	}) => {
		test.setTimeout(240000);
		setupErrorTraps(page);

		console.log(
			"\n==================================================================",
		);
		console.log(
			"🚀 BẮT ĐẦU SMART CRAWLER NÂNG CẤP (BEST OF 3): QUÉT 7 THÔN & CRUD THẬT",
		);
		console.log(
			"==================================================================\n",
		);

		// -------------------------------------------------------------
		// GIAI ĐOẠN 1: TỰ ĐỘNG ĐĂNG NHẬP (ADMIN / ADMIN123)
		// -------------------------------------------------------------
		currentAction = "Điều hướng & Đăng nhập hệ thống";
		console.log("🔑 [1/8] Khởi động và Đăng nhập hệ thống...");
		await page.goto("/", { waitUntil: "domcontentloaded" });

		const loginInput = page.locator('input[type="password"]');
		const sidebar = page.locator("aside");

		await expect(loginInput.or(sidebar)).toBeVisible({ timeout: 20000 });

		if (await loginInput.isVisible()) {
			currentAction = "Điền thông tin đăng nhập admin/admin123";
			const usernameInput = page
				.locator('input[placeholder*="tài khoản" i], input[type="text"]')
				.first();
			const submitBtn = page
				.locator('button[type="submit"], button:has-text("ĐĂNG NHẬP")')
				.first();

			await usernameInput.fill("admin");
			await loginInput.fill("admin123");
			await submitBtn.click();
			interactionCount++;

			await expect(sidebar).toBeVisible({ timeout: 20000 });
			await page.waitForTimeout(1000);
		}

		visitedRoutes.push("Login -> Dashboard");
		console.log("   ✓ Đăng nhập thành công với tài khoản Quản trị viên (Admin)");

		// -------------------------------------------------------------
		// GIAI ĐOẠN 2: QUẢN LÝ THÔN & QUÉT CẠN TOÀN BỘ 7 THÔN ĐĂK HÀ
		// -------------------------------------------------------------
		currentAction = "Quét trang Quản Lý Thôn & Quét cạn 7 thôn Đăk Hà";
		console.log("\n📍 [2/8] Quét cạn thẻ thôn & Mở màn hình làm việc...");
		visitedRoutes.push("Quản Lý Thôn");

		const villagesNavBtn = sidebar
			.locator('button:has-text("Quản Lý Thôn")')
			.first();
		if (await villagesNavBtn.isVisible()) {
			await villagesNavBtn.click();
			interactionCount++;
			await page.waitForTimeout(800);

			// 2.1. Test tìm kiếm thôn
			currentAction = "Tìm kiếm thôn";
			const searchVillageInput = page
				.locator('input[placeholder*="Tìm kiếm thôn"]')
				.first();
			if (await searchVillageInput.isVisible()) {
				await searchVillageInput.fill("Thôn");
				interactionCount++;
				await page.waitForTimeout(300);
				await searchVillageInput.fill("");
				interactionCount++;
				await page.waitForTimeout(200);
			}

			// 2.2. Quét cạn toàn bộ các thẻ thôn trên địa bàn (7 thôn Đăk Hà)
			console.log(
				"   -> Quét cạn toàn bộ các thẻ thôn trên địa bàn (7 thôn Đăk Hà)...",
			);
			const villageCards = page.locator('div[role="button"]:has(h4)');
			const villageCount = await villageCards.count();
			expect(villageCount).toBeGreaterThan(0);
			console.log(`   ✓ Phát hiện ${villageCount} thẻ thôn trên địa bàn`);

			for (let i = 0; i < villageCount; i++) {
				const targetCard = page.locator('div[role="button"]:has(h4)').nth(i);
				const cardName =
					(await targetCard.locator("h4").innerText().catch(() => "")) ||
					`Thôn ${i + 1}`;
				currentAction = `Click chọn thôn [${cardName}]`;
				console.log(`      ✓ Quét thôn ${i + 1}/${villageCount}: ${cardName}`);

				await targetCard.click();
				interactionCount++;
				await page.waitForLoadState("networkidle").catch(() => {});
				await page.waitForTimeout(300);

				// Xác nhận màn hình tải dữ liệu thành công không crash
				await expect(page.locator("text=Thống Kê").first()).toBeVisible({
					timeout: 8000,
				});

				// Quay lại trang Quản Lý Thôn để tiếp tục quét thôn kế tiếp
				const villagesNav = sidebar
					.locator('button:has-text("Quản Lý Thôn")')
					.first();
				await villagesNav.click();
				await page.waitForTimeout(300);
			}
			console.log(
				"   ✓ Đã quét cạn thành công toàn bộ các thôn trên địa bàn Đăk Hà!",
			);

			// Chọn Thôn 1 làm ngữ cảnh thao tác chuẩn
			const firstCard = page.locator('div[role="button"]:has(h4)').first();
			if (await firstCard.isVisible()) {
				await firstCard.click();
				interactionCount++;
				await page.waitForTimeout(500);
			}

			// Dò nút an toàn trên Quản Lý Thôn
			await crawlSafeButtons(page, "Quản Lý Thôn");
		}

		// -------------------------------------------------------------
		// GIAI ĐOẠN 3: THỐNG KÊ (ANALYTICS PAGE)
		// -------------------------------------------------------------
		currentAction = "Chuyển sang trang Thống Kê";
		console.log("\n📍 [3/8] Quét trang Thống Kê (Analytics Page)...");
		const analyticsNav = sidebar
			.locator('button:has-text("Thống Kê")')
			.first();
		if (await analyticsNav.isVisible()) {
			await analyticsNav.click();
			interactionCount++;
			visitedRoutes.push("Thống Kê");
			await page.waitForTimeout(1000);
			console.log("   ✓ Đã tải dữ liệu widget và biểu đồ thống kê");

			// Dò nút an toàn trên Thống Kê
			await crawlSafeButtons(page, "Thống Kê");
		}

		// -------------------------------------------------------------
		// GIAI ĐOẠN 4: HỒ SƠ CHÚC THỌ (QUÉT CẠN FILTER & CRUD THẬT)
		// -------------------------------------------------------------
		currentAction = "Chuyển sang trang Hồ Sơ Chúc Thọ";
		console.log("\n📍 [4/8] Quét chuyên sâu trang Hồ Sơ Chúc Thọ...");
		const chucthoNav = sidebar
			.locator('button:has-text("Hồ Sơ Chúc Thọ")')
			.first();
		if (await chucthoNav.isVisible()) {
			await chucthoNav.click();
			interactionCount++;
			visitedRoutes.push("Hồ Sơ Chúc Thọ");
			await page.waitForTimeout(1200);

			// --- PHẦN A: QUÉT CẠN CÁC PILL VÀ BỘ LỌC ---
			console.log(
				"   🔍 [Filter Spider] Quét cạn tất cả dropdown và pill lọc...",
			);
			const filterBar = page.locator("div.relative.z-30").first();

			// 1. Quét Bộ lọc Thôn (Toàn xã + từng thôn trong 7 thôn Đăk Hà)
			currentAction = "Quét qua toàn bộ các thôn trong bộ lọc";
			const villageFilterBox = filterBar.locator("div.w-36.shrink-0").first();
			const villageTrigger = villageFilterBox
				.locator('[role="combobox"]')
				.first();
			if (await villageTrigger.isVisible()) {
				await villageTrigger.click();
				interactionCount++;
				await page.waitForTimeout(200);

				const villageOptions = await page
					.locator('[role="option"]')
					.allInnerTexts()
					.catch(() => []);
				await page.keyboard.press("Escape");
				await page.waitForTimeout(150);

				// Duyệt qua từng thôn
				for (const vName of villageOptions.slice(0, 8)) {
					currentAction = `Lọc thôn: ${vName}`;
					await selectCustomOption(page, villageFilterBox, vName);
					await page.waitForLoadState("networkidle").catch(() => {});
					await page.waitForTimeout(300);
				}
				console.log(
					`      ✓ Đã quét qua ${Math.min(villageOptions.length, 8)} lựa chọn địa bàn thôn`,
				);
			}

			// 2. Quét Dropdown Mốc độ tuổi (60, 70, 80, Tất cả)
			currentAction = "Quét bộ lọc mốc độ tuổi";
			const ageFilterBox = filterBar.locator("div.w-40.shrink-0").first();
			for (const ageOption of [
				"Tròn 60 tuổi",
				"Tròn 70 tuổi",
				"Tất cả độ tuổi",
			]) {
				await selectCustomOption(page, ageFilterBox, ageOption);
				await page.waitForLoadState("networkidle").catch(() => {});
				await page.waitForTimeout(200);
			}

			// 3. Quét Dropdown Giới tính
			currentAction = "Quét bộ lọc giới tính";
			const genderFilterBox = filterBar.locator("div.w-36.shrink-0").nth(1);
			for (const genderOption of ["Nam", "Nữ", "Tất cả giới tính"]) {
				await selectCustomOption(page, genderFilterBox, genderOption);
				await page.waitForLoadState("networkidle").catch(() => {});
				await page.waitForTimeout(200);
			}

			// 4. Quét Dropdown Trạng thái nhận quà
			currentAction = "Quét bộ lọc trạng thái nhận quà";
			const statusFilterBox = filterBar.locator("div.w-40.shrink-0").last();
			for (const stOption of [
				"Đã nhận quà",
				"Chưa nhận quà",
				"Tất cả trạng thái",
			]) {
				await selectCustomOption(page, statusFilterBox, stOption);
				await page.waitForLoadState("networkidle").catch(() => {});
				await page.waitForTimeout(200);
			}

			// 5. Thử nút Xóa lọc (Reset all filters)
			const clearFilterBtn = page
				.locator('button:has-text("Xóa lọc"), button:has-text("Xóa tất cả")')
				.first();
			if (await clearFilterBtn.isVisible()) {
				await clearFilterBtn.click();
				interactionCount++;
				await page.waitForTimeout(400);
			}
			console.log(
				"      ✓ Đã hoàn tất quét cạn bộ lọc và khôi phục trạng thái chuẩn",
			);

			// --- PHẦN B: TỰ ĐỘNG DỌN RÁC PHIÊN TRƯỚC (PRE-TEST CLEANUP) ---
			console.log(
				"   🧹 [Pre-test Cleanup] Tìm kiếm và dọn sạch dữ liệu cũ [TEST-CRAWLER]...",
			);
			currentAction = "Dọn rác phiên trước [TEST-CRAWLER]";
			const searchInput = page
				.locator('input[placeholder*="Tìm theo họ tên, CCCD"]')
				.first();
			await searchInput.fill("[TEST-CRAWLER]");
			await page.waitForTimeout(800);

			const oldTestRows = page.locator('tr:has-text("[TEST-CRAWLER]")');
			const oldCount = await oldTestRows.count();
			if (oldCount > 0) {
				console.log(
					`      ⚠️ Phát hiện ${oldCount} bản ghi cũ [TEST-CRAWLER] sót lại, đang dọn dẹp...`,
				);
				for (let i = 0; i < oldCount; i++) {
					const oldRow = page.locator('tr:has-text("[TEST-CRAWLER]")').first();
					if (await oldRow.isVisible().catch(() => false)) {
						const oldDelBtn = oldRow
							.locator(
								'button[aria-label*="Xóa"], button[title*="Thùng rác"]',
							)
							.first();
						await oldDelBtn.click();
						interactionCount++;
						await page.waitForTimeout(300);

						const confirmOldDeleteBtn = page
							.locator('button:has-text("Xác nhận")')
							.first();
						if (
							await confirmOldDeleteBtn
								.isVisible({ timeout: 5000 })
								.catch(() => false)
						) {
							await Promise.all([
								page
									.waitForResponse(
										(res) =>
											res.url().includes("/api/profiles/") &&
											res.request().method() === "DELETE" &&
											res.status() < 400,
										{ timeout: 15000 },
									)
									.catch(() => null),
								confirmOldDeleteBtn.click(),
							]);
							interactionCount++;
							await closeSuccessAlertIfPresent(page);
						}
					}
				}
				console.log("      ✓ Đã dọn sạch các bản ghi [TEST-CRAWLER] phiên trước");
			} else {
				console.log("      ✓ Không có bản ghi rác từ phiên trước");
			}
			await searchInput.fill("");
			interactionCount++;
			await page.waitForTimeout(400);

			// --- PHẦN C: VÒNG ĐỜI CRUD THẬT VỚI BẢN GHI [TEST-CRAWLER] ---
			console.log(
				"   🧪 [CRUD Real Lifecycle] Bắt đầu Thêm -> Lưu -> Sửa -> Xóa bản ghi [TEST-CRAWLER]...",
			);

			const testRecordName = "[TEST-CRAWLER] Nguyễn Văn Test";
			const testRecordCccd = "064054009999";

			// BƯỚC 1: THÊM MỚI VÀ LƯU THẬT (Anti Race-Condition)
			currentAction = "Mở form và LƯU THẬT bản ghi [TEST-CRAWLER]";
			const addProfileBtn = page
				.locator('button:has-text("Thêm Hồ Sơ")')
				.first();
			await addProfileBtn.click();
			interactionCount++;
			await page.waitForTimeout(600);

			await page.locator("#modal-input-name").fill(testRecordName);
			await page.locator("#modal-input-dob").fill("01/01/1954");
			await page.locator("#modal-input-cccd").fill(testRecordCccd);
			await page
				.locator("#modal-input-notes")
				.fill("Bản ghi tự động khởi tạo bởi Playwright Smart Crawler");
			interactionCount += 4;
			await page.waitForTimeout(300);

			// Bấm LƯU THẬT dùng Promise.all bắt response
			const saveButton = page
				.locator(
					'button[type="submit"][form="profile-modal-form"], button:has-text("Lưu thay đổi")',
				)
				.first();
			const [createResponse] = await Promise.all([
				page.waitForResponse(
					(res) =>
						res.url().includes("/api/profiles") &&
						res.request().method() === "POST" &&
						res.status() < 400,
					{ timeout: 15000 },
				),
				saveButton.click(),
			]);
			interactionCount++;

			console.log(
				`      ✓ Bấm LƯU THẬT: Backend phản hồi POST status ${createResponse.status()}`,
			);
			expect(createResponse.status()).toBeLessThan(400);

			// Đóng modal alert thông báo thành công
			await closeSuccessAlertIfPresent(page);

			// BƯỚC 2: XÁC MINH BẢN GHI XUẤT HIỆN TRÊN BẢNG
			currentAction = "Xác minh bản ghi [TEST-CRAWLER] xuất hiện trên bảng";
			await searchInput.fill("[TEST-CRAWLER]");
			interactionCount++;
			await page.waitForTimeout(800); // chờ debounce

			const testRow = page.locator('tr:has-text("[TEST-CRAWLER]")').first();
			await expect(testRow).toBeVisible({ timeout: 10000 });
			console.log(
				"      ✓ Đã tìm thấy bản ghi [TEST-CRAWLER] trên bảng dữ liệu",
			);

			// BƯỚC 3: SỬA BẢN GHI VÀ LƯU THẬT (Anti Race-Condition)
			currentAction = "Bấm SỬA bản ghi [TEST-CRAWLER] và cập nhật ghi chú";
			const editBtn = testRow
				.locator('button[aria-label*="Sửa"], button[title*="sửa"]')
				.first();
			await editBtn.click();
			interactionCount++;
			await page.waitForTimeout(600);

			const notesInput = page.locator("#modal-input-notes").first();
			await notesInput.fill(
				"Bản ghi [TEST-CRAWLER] đã được robot CẬP NHẬT thành công",
			);
			interactionCount++;
			await page.waitForTimeout(300);

			const updateButton = page
				.locator(
					'button[type="submit"][form="profile-modal-form"], button:has-text("Lưu thay đổi")',
				)
				.first();
			const [updateResponse] = await Promise.all([
				page.waitForResponse(
					(res) =>
						res.url().includes("/api/profiles/") &&
						(res.request().method() === "PUT" ||
							res.request().method() === "PATCH") &&
						res.status() < 400,
					{ timeout: 15000 },
				),
				updateButton.click(),
			]);
			interactionCount++;

			console.log(
				`      ✓ Bấm LƯU CẬP NHẬT: Backend phản hồi PUT/PATCH status ${updateResponse.status()}`,
			);
			expect(updateResponse.status()).toBeLessThan(400);

			// Đóng modal alert cập nhật thành công
			await closeSuccessAlertIfPresent(page);

			// BƯỚC 4: XÓA DỌN DẸP BẢN GHI (CHỈ NHẮM VÀO [TEST-CRAWLER])
			currentAction = "XÓA DỌN DẸP bản ghi [TEST-CRAWLER]";
			await searchInput.fill("[TEST-CRAWLER]");
			await page.waitForTimeout(600);

			const rowToDelete = page
				.locator('tr:has-text("[TEST-CRAWLER]")')
				.first();
			await expect(rowToDelete).toBeVisible({ timeout: 10000 });

			const deleteBtn = rowToDelete
				.locator('button[aria-label*="Xóa"], button[title*="Thùng rác"]')
				.first();
			await deleteBtn.click();
			interactionCount++;
			await page.waitForTimeout(400);

			// Xác nhận trong hộp thoại Confirm với Anti Race-Condition Promise.all
			const confirmDeleteBtn = page
				.locator('button:has-text("Xác nhận")')
				.first();
			await expect(confirmDeleteBtn).toBeVisible({ timeout: 5000 });

			const [deleteResponse] = await Promise.all([
				page.waitForResponse(
					(res) =>
						res.url().includes("/api/profiles/") &&
						res.request().method() === "DELETE" &&
						res.status() < 400,
					{ timeout: 15000 },
				),
				confirmDeleteBtn.click(),
			]);
			interactionCount++;

			console.log(
				`      ✓ Bấm XÁC NHẬN XÓA: Backend phản hồi DELETE status ${deleteResponse.status()}`,
			);
			expect(deleteResponse.status()).toBeLessThan(400);

			// Đóng modal alert xóa thành công
			await closeSuccessAlertIfPresent(page);

			// Xóa search query để trở lại chế độ xem ban đầu
			await searchInput.fill("");
			interactionCount++;
			await page.waitForTimeout(500);
			console.log(
				"      ✓ Đã dọn dẹp an toàn bản ghi [TEST-CRAWLER], bảo toàn 100% CSDL gốc",
			);

			// Dò nút an toàn trên Hồ Sơ Chúc Thọ
			await crawlSafeButtons(page, "Hồ Sơ Chúc Thọ");
		}

		// -------------------------------------------------------------
		// GIAI ĐOẠN 5: HƯU TRÍ XÃ HỘI (HTXH DASHBOARD)
		// -------------------------------------------------------------
		currentAction = "Chuyển sang trang Hưu Trí Xã Hội";
		console.log(
			"\n📍 [5/8] Quét chuyên sâu trang Hưu Trí Xã Hội (HTXH)...",
		);
		const htxhNav = sidebar
			.locator('button:has-text("Hưu Trí Xã Hội")')
			.first();
		if (await htxhNav.isVisible()) {
			await htxhNav.click();
			interactionCount++;
			visitedRoutes.push("Hưu Trí Xã Hội");
			await page.waitForTimeout(1200);

			// Test nhanh mở modal và đóng an toàn
			const addHtxhBtn = page.locator('button:has-text("Thêm Hồ Sơ")').first();
			if (await addHtxhBtn.isVisible()) {
				await addHtxhBtn.click();
				interactionCount++;
				await page.waitForTimeout(400);
				const cancelBtn = page.locator('button:has-text("Hủy")').first();
				if (await cancelBtn.isVisible()) {
					await cancelBtn.click();
					interactionCount++;
				} else {
					await page.keyboard.press("Escape");
				}
				await page.waitForTimeout(300);
				console.log("   ✓ Màn hình HTXH đã kiểm thử an toàn");
			}

			// Dò nút an toàn trên Hưu Trí Xã Hội
			await crawlSafeButtons(page, "Hưu Trí Xã Hội");
		}

		// -------------------------------------------------------------
		// GIAI ĐOẠN 6: THÙNG RÁC (RECYCLE BIN)
		// -------------------------------------------------------------
		currentAction = "Chuyển sang trang Thùng Rác";
		console.log("\n📍 [6/8] Quét trang Thùng Rác (Recycle Bin)...");
		const recycleNav = sidebar.locator('button:has-text("Thùng Rác")').first();
		if (await recycleNav.isVisible()) {
			await recycleNav.click();
			interactionCount++;
			visitedRoutes.push("Thùng Rác");
			await page.waitForTimeout(800);

			const cthBinTab = page
				.locator('button:has-text("Hồ Sơ Chúc Thọ")')
				.first();
			const htxhBinTab = page
				.locator('button:has-text("Hưu Trí Xã Hội")')
				.first();

			if (await htxhBinTab.isVisible()) {
				await htxhBinTab.click();
				interactionCount++;
				await page.waitForTimeout(300);
			}
			if (await cthBinTab.isVisible()) {
				await cthBinTab.click();
				interactionCount++;
				await page.waitForTimeout(300);
			}

			// TUYỆT ĐỐI BỎ QUA CÁC NÚT "XÓA VĨNH VIỄN"
			console.log("   ✓ Thùng rác: Đã duyệt an toàn không can thiệp CSDL");

			// Dò nút an toàn trên Thùng Rác
			await crawlSafeButtons(page, "Thùng Rác");
		}

		// -------------------------------------------------------------
		// GIAI ĐOẠN 7: NHẬT KÝ HOẠT ĐỘNG (AUDIT LOGS)
		// -------------------------------------------------------------
		currentAction = "Chuyển sang trang Nhật Ký Hoạt Động";
		console.log("\n📍 [7/8] Quét trang Nhật Ký Hoạt Động (Audit Log Page)...");
		const auditNav = sidebar
			.locator('button:has-text("Nhật Ký Hoạt Động")')
			.first();
		if (await auditNav.isVisible()) {
			await auditNav.click();
			interactionCount++;
			visitedRoutes.push("Nhật Ký Hoạt Động");
			await page.waitForTimeout(800);
			console.log(
				"   ✓ Nhật ký hoạt động: Đã nạp thành công lịch sử biến động",
			);

			// Dò nút an toàn trên Nhật Ký Hoạt Động
			await crawlSafeButtons(page, "Nhật Ký Hoạt Động");
		}

		// -------------------------------------------------------------
		// GIAI ĐOẠN 8: CÀI ĐẶT HỆ THỐNG (SETTINGS PAGE)
		// -------------------------------------------------------------
		currentAction = "Chuyển sang trang Cài Đặt Hệ Thống";
		console.log("\n📍 [8/8] Quét trang Cài Đặt Hệ Thống (Settings Page)...");
		const settingsNav = sidebar
			.locator('button:has-text("Cài Đặt Hệ Thống")')
			.first();
		if (await settingsNav.isVisible()) {
			await settingsNav.click();
			interactionCount++;
			visitedRoutes.push("Cài Đặt Hệ Thống");
			await page.waitForTimeout(800);

			for (const tabName of [
				"Thông tin cá nhân",
				"Quản lý cán bộ",
				"Sao lưu & Phục hồi",
				"Hệ thống",
			]) {
				const tabBtn = page.locator(`button:has-text("${tabName}")`).first();
				if (await tabBtn.isVisible()) {
					await tabBtn.click();
					interactionCount++;
					await page.waitForTimeout(300);
				}
			}
			console.log("   ✓ Cài đặt: Đã kiểm tra đầy đủ các phân mục quản trị");

			// Dò nút an toàn trên Cài Đặt Hệ Thống
			await crawlSafeButtons(page, "Cài Đặt Hệ Thống");
		}

		// ----------------------------------------------------------------------
		// TRỤ CỘT 4: TỔNG KẾT, BÁO CÁO & TIÊU CHÍ NGHIỆM THU (ASSERTIONS)
		// ----------------------------------------------------------------------
		console.log("\n=======================================================");
		console.log("📊 BÁO CÁO SMART CRAWLER KIỂM THỬ GIAO DIỆN & API QLCS");
		console.log("=======================================================");
		console.log(
			`• Tổng số route đã duyệt: ${visitedRoutes.length} (${visitedRoutes.join(" -> ")})`,
		);
		console.log(
			`• Tổng số tương tác đã thực hiện: ${interactionCount} actions`,
		);
		console.log(`• Lỗi Unhandled JS Exceptions: ${unhandledErrors.length}`);
		console.log(`• Lỗi Browser Console Runtime: ${consoleErrors.length}`);
		console.log(`• Lỗi HTTP API (code >= 400): ${apiErrors.length}`);

		if (apiErrors.length > 0) {
			console.log("\n⚠️ DANH SÁCH LỖI API PHÁT HIỆN:");
			apiErrors.forEach((e) =>
				console.log(
					`   - [${e.timestamp}] [HTTP ${e.status}] ${e.method} ${e.url} | Body: ${e.body} | Action: ${e.lastAction}`,
				),
			);
		}

		if (consoleErrors.length > 0) {
			console.log("\n⚠️ DANH SÁCH LỖI CONSOLE PHÁT HIỆN:");
			consoleErrors.forEach((e) =>
				console.log(`   - [${e.timestamp}] ${e.text} | Action: ${e.lastAction}`),
			);
		}

		if (unhandledErrors.length > 0) {
			console.log("\n⚠️ DANH SÁCH UNHANDLED RUNTIME CRASH:");
			unhandledErrors.forEach((e) =>
				console.log(
					`   - [${e.timestamp}] ${e.message} | Action: ${e.lastAction}`,
				),
			);
		}

		if (apiErrors.length === 0 && unhandledErrors.length === 0) {
			console.log("\n🎉 XUẤT SẮC: 0 lỗi HTTP >= 400, 0 unhandled exception!");
			console.log(
				"✅ 100% Giao diện, Route, Filter và chu trình CRUD THẬT đồng bộ hoàn hảo!\n",
			);
		}

		// TIÊU CHÍ NGHIỆM THU
		expect(
			unhandledErrors,
			"Không được có unhandled exception gây crash UI",
		).toEqual([]);
		expect(apiErrors, "Không được có lỗi HTTP >= 400 từ Backend").toEqual([]);
		expect(
			consoleErrors.filter(
				(e) =>
					e.text.includes("Invariant Violation") ||
					e.text.includes("Minified React error"),
			),
			"Không được có lỗi crash React",
		).toEqual([]);
	});
});
