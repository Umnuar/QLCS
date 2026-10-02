# BÁO CÁO THẨM TRA HỆ THỐNG KIỂM THỬ TỰ ĐỘNG & ĐỘ PHỦ TEST (TEST GAP REPORT)
**Hệ Thống:** Quản Lý Chính Sách Xã Đăk Hà (QLCS)  
**Tác Giả:** AGENT 6 - Test & Release Engineer  
**Thời Điểm Thẩm Tra:** 30/09/2026  
**Trạng Thái Kiểm Thử Tổng Thể:** ⚠️ **NGUY CƠ CAO (HIGH RISK) - ĐỘ PHỦ THỰC TẾ DƯỚI 15%**

---

## 1. TỔNG QUAN KẾT QUẢ THỰC THI TEST TỰ ĐỘNG

### 1.1. Kết Quả Chạy Test Suite Client (`QLCS-Client`)
- **Lệnh thực thi:** `npm --prefix c:\Projects\QLCS\QLCS-Client test` (`vitest run`)
- **Phiên bản Runner:** Vitest v4.1.6 (Node.js runtime v22)
- **Kết quả:**
  - **Test Files:** 8 passed / 8 files (100%)
  - **Tests:** 118 passed / 118 tests (100%)
  - **Thời gian chạy:** 9.57 giây (transform 525ms, import 2.22s, tests 708ms)
  - **Cảnh báo runtime:** `[DEP0205] DeprecationWarning: module.register() is deprecated. Use module.registerHooks() instead.`

```
 ✓ src/__tests__/workers.test.ts (2 tests) 144ms
 ✓ src/__tests__/useUndo.test.ts (6 tests) 157ms
 ✓ src/__tests__/schemas.test.ts (37 tests) 135ms
 ✓ src/__tests__/workerUtils.test.ts (17 tests) 23ms
 ✓ src/__tests__/useFormValidation.test.ts (7 tests) 178ms
 ✓ src/__tests__/statsLoopRegression.test.ts (5 tests) 24ms
 ✓ src/__tests__/age.test.ts (19 tests) 17ms
 ✓ src/__tests__/helpers.test.ts (25 tests) 30ms

 Test Files  8 passed (8)
      Tests  118 passed (118)
   Duration  9.57s
```

### 1.2. Đánh Giá Cấu Hình `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: false,
  },
})
```
- **Lỗ hổng 1 - `environment: 'node'`**: Môi trường kiểm thử là `node` thuần túy, không có `jsdom` hoặc `happy-dom`. Điều này đồng nghĩa hệ thống **hoàn toàn bất khả thi** trong việc kiểm thử các React Component (`@testing-library/react`), Custom Hook (`renderHook`), hoặc các tương tác DOM thật.
- **Lỗ hổng 2 - `fileParallelism: false`**: Chế độ chạy song song bị vô hiệu hóa (phải chạy tuần tự). Nguyên nhân là do các test suite (`workers.test.ts`, `useUndo.test.ts`) thực hiện monkey-patching các biến toàn cục (`global.self`, `globalThis.localStorage`). Nếu bật song song, các test sẽ bị race-condition và sập ngay lập tức.
- **Lỗ hổng 3 - Thiếu báo cáo Coverage**: Chưa cấu hình `@vitest/coverage-v8` hoặc `@vitest/coverage-istanbul` để đo lường chính xác branch/line coverage trong CI/CD.

---

## 2. THẨM TRA CHI TIẾT 8 TEST SUITES HIỆN TẠI (CLIENT)

Bảng phân tích bản chất kiểm thử (Sự thật đằng sau 118 tests "passed"):

| Test Suite | File | Tests | Bản chất thực sự | Đánh giá giá trị thực tế |
| :--- | :--- | :---: | :--- | :--- |
| **Tính mốc tuổi chúc thọ** | `age.test.ts` | 19 | **Fake Unit Test (Copy-paste code)**: Tự viết lại hàm `calcMilestonesFromDob` và `computeDisplayStatus` bên trong file test thay vì import từ source code! | 🔴 **Vô giá trị phòng thủ**: Source code thực tế nếu bị đổi hoặc gãy thì test này vẫn xanh 100%! |
| **Tiện ích phụ trợ** | `helpers.test.ts` | 25 | **Duplicate Code Test**: Tự viết lại `removeAccents`, `rowMatchesSearchExact`, `rowMatchesSearch`, `getLastName` trong file test. | 🔴 **Vô giá trị phòng thủ**: Không import hay kiểm thử module thực tế trong `src/utils/`. |
| **Zod validation schemas** | `schemas.test.ts` | 37 | **Real Unit Test**: Import trực tiếp từ `../validation/schemas` để test login, userUpdate, profile, htxh, pagination, bulkDelete. | 🟢 **Giá trị cao**: Kiểm thử xác thực schema nghiêm ngặt, dữ liệu biên tốt. |
| **Chống hồi quy lặp request stats** | `statsLoopRegression.test.ts` | 5 | **Partial Test / Simulated Hook**: Test query sanitization qua spy `apiClient.get`. Tuy nhiên, logic bail-out của React state updater và guard loading lại được mô phỏng bằng code cục bộ trong test thay vì chạy hook/component thật. | 🟡 **Giá trị trung bình**: Bảo vệ được query params, nhưng chưa bảo vệ được vòng lặp re-render trong React Component. |
| **Hook xác thực form** | `useFormValidation.test.ts` | 7 | **Pseudo-Hook Test**: Đặt tên là `useFormValidation.test.ts` nhưng **KHÔNG HỀ IMPORT HOOK** `useFormValidation`! Chỉ test `zod.safeParse` và sao chép vòng lặp trích xuất error. | 🔴 **Ngụy tạo độ phủ**: Các state `errors`, hàm `clearErrors`, `getError`, vòng đời React của hook hoàn toàn không được kiểm thử. |
| **Hook hoàn tác** | `useUndo.test.ts` | 6 | **Mocked Self Test**: Sử dụng `vi.mock("../hooks/useUndo")` để mock chính hook cần test! Chỉ kiểm thử việc gọi `JSON.stringify` trên một mock `localStorage` tự tạo. | 🔴 **Ngụy tạo độ phủ**: Logic `pushUndo`, `undo`, `redo`, giới hạn `MAX_UNDO = 50`, `redoStack` thực tế trong `useUndo.ts` có độ phủ 0%. |
| **Tiện ích Web Worker** | `workerUtils.test.ts` | 17 | **Real Unit Test**: Import trực tiếp `normalizeStr`, `fuzzyMatch`, `parseDob`, `calcAgeFields`, `findHeaderAndDataStart` từ `../workers/workerUtils`. | 🟢 **Giá trị cao**: Kiểm tra thuật toán bóc tách dữ liệu Excel, xử lý ngày tháng Excel serial, mốc tuổi chuẩn xác. |
| **Import Web Worker** | `workers.test.ts` | 2 | **Real Worker Integration**: Mock `global.self`, test handler của `importChucthoWorker` và `importHtxhWorker`. | 🟢 **Giá trị cao**: Đảm bảo worker bóc tách danh sách, bắt lỗi người quá tuổi/mất/thiếu giới tính đúng quy định. |

> **KẾT LUẬN GIẬT MÌNH**: Trong tổng số 118 test passed, có tới **57 tests (48.3%)** là các test giả lập (tự viết lại code trong file test hoặc mock chính module đang cần test). Chỉ có **61 tests (51.7%)** thực sự kiểm thử code nguồn của ứng dụng!

---

## 3. PHÂN TÍCH LỖ HỔNG KIỂM THỬ TẦNG BACKEND (`QLCS-Backend`)

### 3.1. Hiện Trạng Kiểm Thử Backend
- **Số lượng Unit Tests:** **0**
- **Số lượng Integration Tests:** **0**
- **Số lượng E2E Tests:** **0**
- **Test Framework:** **Chưa cài đặt bất kỳ thư viện kiểm thử nào** (Không có `vitest`, `jest`, `mocha`, `supertest` trong `devDependencies` của `package.json`).

### 3.2. Danh Sách Các Module Backend Quan Trọng Đang "Thả Nổi" Không Có Test

| Module / Controller | Kích thước | Các chức năng nhạy cảm chưa được kiểm thử tự động | Mức độ rủi ro |
| :--- | :---: | :--- | :---: |
| `excel.controller.ts` | 27.7 KB | - Bóc tách workbook Excel nhiều sheet.<br>- Bulk Insert / Upsert hàng nghìn hồ sơ vào CSDL.<br>- Validate định dạng CCCD, ngày sinh, trùng lặp hồ sơ.<br>- Xuất file Excel báo cáo theo mẫu quy định. | 🚨 **CRITICAL** |
| `htxh.controller.ts` | 23.4 KB | - CRUD hồ sơ Hưu trí xã hội.<br>- Phân loại 6 diện trợ cấp (75+, 70-74 nghèo, bảo trợ, hưu trí...).<br>- Kiểm soát xung đột ghi đồng thời (OCC `version`).<br>- Thống kê KPI chế độ HTXH. | 🚨 **CRITICAL** |
| `profiles.controller.ts` | 22.7 KB | - CRUD hồ sơ Chúc thọ người cao tuổi.<br>- Tính toán 10 mốc tuổi tròn và trạng thái chúc thọ.<br>- Bulk status update (chuyển trạng thái nhận quà hàng loạt).<br>- Soft delete vào thùng rác (`RecycleBin`). | 🚨 **CRITICAL** |
| `auth.controller.ts` | 8.4 KB | - Đăng nhập tài khoản Xã / Thôn.<br>- Cấp phát cặp JWT Access Token (15m) / Refresh Token (7d).<br>- Cơ chế xoay vòng Refresh Token (Token Rotation).<br>- Đổi mật khẩu, chống Brute-Force. | 🚨 **CRITICAL** |
| `backup.controller.ts` | 6.5 KB | - Tạo bản sao lưu CSDL PostgreSQL (`pg_dump` / JSON export).<br>- Khôi phục dữ liệu từ bản sao lưu.<br>- Tải về và quản lý file backup. | 🚨 **CRITICAL** |
| `analytics.controller.ts` | 8.0 KB | - Tổng hợp số liệu toàn xã và theo từng thôn.<br>- Tính tỷ lệ hoàn thành, phân bố độ tuổi, giới tính, dân tộc.<br>- Đối soát số liệu giữa các địa bàn. | ⚠️ **HIGH** |
| `users.controller.ts` | 7.6 KB | - Quản lý tài khoản cán bộ xã và 7 trưởng thôn.<br>- Phân quyền RBAC (`admin` vs `user`). | ⚠️ **HIGH** |
| `audit.controller.ts` | 2.6 KB | - Ghi nhận nhật ký tác động (IP, User, Action, Diff).<br>- Phân trang và lọc lịch sử can thiệp dữ liệu. | 🟡 **MEDIUM** |
| `auth.middleware.ts` | 3.0 KB | - Giải mã JWT Bearer Token.<br>- Chặn truy cập trái phép, kiểm tra quyền thôn / xã. | 🚨 **CRITICAL** |
| `crypto / utils` | - | - Mã hóa AES-256-GCM số CCCD trước khi ghi DB.<br>- Băm SHA-256 tra cứu danh tính. | 🚨 **CRITICAL** |

---

## 4. PHÂN TÍCH LỖ HỔNG KIỂM THỬ TẦNG CLIENT (`QLCS-Client`)

Mặc dù có 8 test suites, các thành phần kiến trúc cốt lõi nhất của Client hoàn toàn không có test bảo vệ:

### 4.1. Tầng Quản Lý Trạng Thái & Dữ Liệu
1. **`AppContext.tsx` (12.7 KB - 0% Test)**:
   - Nơi lưu trữ trạng thái đăng nhập, thông tin `user`, `activeTab`, `selectedVillageId`, cài đặt giao diện (Dark/Light), thông báo hệ thống.
   - Luồng khởi tạo `isInitializing`, nạp token từ `secureStorage` lúc mở app không có bất kỳ test nào đảm bảo hoạt động trơn tru.
2. **`useProfiles.ts` (8.7 KB - 0% Test)**:
   - Hook trung tâm quản lý danh sách hồ sơ, phân trang, lọc tìm kiếm, cập nhật trạng thái đơn lẻ/hàng loạt, xóa hồ sơ, tích hợp Cache IndexedDB.
   - Khi có xung đột OCC (`version`), việc xử lý lỗi 409 Conflict và thông báo cho người dùng chưa từng được kiểm thử tự động.
3. **`apiClient.ts` (3.0 KB - 0% Test)**:
   - **Lỗ hổng trọng yếu**: Cơ chế Auto-Refresh Token khi gặp lỗi `401 Unauthorized` có hàng đợi `failedQueue` và biến cờ `isRefreshing`. Nếu có nhiều request đồng thời bị 401 cùng lúc, cơ chế hoãn request và replay lại sau khi lấy token mới có chạy đúng không? Không có test nào xác minh!
   - Xử lý sự kiện đăng xuất bắt buộc (`window.dispatchEvent(new Event("auth:logout"))`) khi refresh token hết hạn cũng chưa được test.
4. **`indexedDB.ts` (4.6 KB - 0% Test)**:
   - Hệ thống lưu trữ Offline Cache, Auto-save Drafts, và Hàng đợi đồng bộ `syncQueue`.
   - Toàn bộ dữ liệu trong IndexedDB được mã hóa bằng Web Crypto (`cryptoHelper.ts`). Nếu hàm giải mã gặp lỗi định dạng hoặc key thay đổi, toàn bộ cơ chế fallback offline sẽ sụp đổ âm thầm.

### 4.2. Tầng Giao Diện Người Dùng & Component (0% Test)
- Không có bất kỳ test nào cho các Modal cốt lõi:
  - `ImportModal.tsx` (57.5 KB): Wizard phức tạp gồm các bước: Tải file -> Chọn chế độ -> Preview bảng dữ liệu phân loại màu -> Bắt lỗi cột -> Chọn thôn đích -> Tiến trình đẩy CSDL.
  - `ExportModal.tsx` (8.8 KB): Cấu hình xuất Excel theo tiêu chí.
  - `ProfileModal.tsx` (22.0 KB): Drawer nhập liệu hồ sơ có tự động tính tuổi và validate Zod.
  - `DeleteConfirm.tsx` (3.8 KB): Hộp thoại xác nhận xóa với tên đối tượng.
- Bảng dữ liệu chính `MainTable.tsx` (14.2 KB) và `ProfileRow.tsx` (18.1 KB): Ghim cột, hiển thị trạng thái badge, ẩn/hiện CCCD `••••••••1234`.

### 4.3. Thiếu Sót Kiểm Thử Worker
- Thư mục `workers/` có 3 worker: `importChucthoWorker.ts`, `importHtxhWorker.ts`, và `importCutriWorker.ts`.
- File test `workers.test.ts` chỉ kiểm thử Chúc Thọ và HTXH, **bỏ quên hoàn toàn** `importCutriWorker.ts` (Import danh sách cử tri / nhân khẩu).

---

## 5. KIỂM THỬ E2E & KỊCH BẢN LUỒNG HOẠT ĐỘNG (END-TO-END GAPS)

### 5.1. Luồng Nghiệp Vụ Quan Trọng Nhất: "Nhập Excel -> Xem Trước -> Lưu CSDL"
Hiện tại **KHÔNG CÓ KỊCH BẢN E2E NÀO** (Playwright/Cypress/Puppeteer) cho luồng này:
1. Người dùng mở `ImportModal`.
2. Chọn file Excel mẫu chuẩn của Sở/Phòng LĐTBXH.
3. Client gửi dữ liệu mảng byte sang Web Worker.
4. Web Worker bóc tách sheet, chuẩn hóa ngày tháng, tính mốc tuổi và trả về danh sách đối tượng hợp lệ + danh sách dòng lỗi.
5. Giao diện render bảng xem trước với badge màu (Xanh: đã qua sinh nhật, Cam: chưa tới sinh nhật, Đỏ: lỗi dữ liệu).
6. Người dùng chọn Thôn áp dụng và ấn "Lưu vào CSDL".
7. Backend nhận payload, kiểm tra quyền, mã hóa CCCD và ghi vào PostgreSQL qua Transaction.
8. Trả về kết quả, Client tự động refresh bảng chính và cập nhật 4 thẻ KPI thống kê.

**RỦI RO THỰC TẾ:** Nếu một trong các khâu trên bị lỗi (ví dụ: IPC File Dialog không trả về base64 đúng, hoặc payload JSON quá lớn bị ngắt bởi Express body-parser, hoặc lỗi mã hóa crypto), toàn bộ quy trình sẽ đứt đoạn mà không có bất kỳ cảnh báo kiểm thử nào phát hiện trước khi đưa cho người dùng cuối.

---

## 6. PHÂN TÍCH NGUY CƠ KIỂM THỬ KHÔNG ỔN ĐỊNH (FLAKY TEST ANALYSIS)

### 6.1. Nguy Cơ Lệch Thời Gian & Ngày Tháng Hệ Thống (`age.test.ts`)
Trong `age.test.ts`, việc kiểm thử phụ thuộc trực tiếp vào `new Date()` mà không cô lập bằng fake timers:
```typescript
it("returns orange for milestone age with birthday not yet passed", () => {
    const now = new Date();
    const nextMonth = now.getMonth() + 2;
    const nextYear = nextMonth > 12 ? now.getFullYear() + 1 : now.getFullYear();
    const adjustedMonth = nextMonth > 12 ? nextMonth - 12 : nextMonth;
    const year = nextYear - 75;
    const dob = `01/${String(adjustedMonth).padStart(2, "0")}/${year}`;
    const r = computeDisplayStatus({ dob, calculationYear: nextYear });
    if (
        adjustedMonth > now.getMonth() + 1 ||
        (adjustedMonth === now.getMonth() + 1 && 1 > now.getDate())
    ) {
        expect(r).toBe("orange");
    }
});
```
- **Rủi ro Flaky:** Khối assertion `expect(r).toBe("orange")` nằm bên trong câu lệnh `if`. Vào các ngày chuyển giao tháng hoặc tháng 11/12, nếu điều kiện `if` trả về `false`, bài test sẽ kết thúc mà **không chạy bất kỳ assertion nào**, dẫn đến việc test luôn báo "Passed" giả tạo!
- **Khắc phục:** Bắt buộc sử dụng `vi.useFakeTimers()` và thiết lập thời điểm cố định (ví dụ: `vi.setSystemTime(new Date(2026, 5, 15))`).

### 6.2. Ô Nhiễm Môi Trường Toàn Cục (Global Pollution)
- `workers.test.ts` ghi đè `global.self = selfMock1 as any`.
- `useUndo.test.ts` can thiệp vào `Object.defineProperty(globalThis, "localStorage", ...)`.
- Mặc dù hiện tại cấu hình `fileParallelism: false` giúp che giấu xung đột này, nhưng nếu ai đó bật lại parallelism để tăng tốc độ chạy test, hàng loạt test sẽ fail ngẫu nhiên do dữ liệu mock bị đè chéo giữa các worker threads.

---

## 7. LỘ TRÌNH KHẮC PHỤC & XÂY DỰNG PHÁO ĐÀI KIỂM THỬ (ACTIONABLE ROADMAP)

### Giai Đoạn 1: Làm Sạch & Chuẩn Hóa Test Suites Hiện Tại (Ưu tiên P0)
1. **Refactor `age.test.ts` & `helpers.test.ts`**: Xóa bỏ toàn bộ code tự viết lại bên trong test. Import trực tiếp từ `src/utils/` và `src/workers/workerUtils.ts`.
2. **Thiết lập Fake Timers**: Cố định thời gian chạy test bằng `vi.setSystemTime()` để loại bỏ hoàn toàn nguy cơ flaky.
3. **Cài đặt `@testing-library/react` & `jsdom`**:
   - Đổi `environment: 'jsdom'` trong `vitest.config.ts`.
   - Viết lại `useFormValidation.test.ts` và `useUndo.test.ts` bằng `renderHook` thật để kiểm thử state transitions.

### Giai Đoạn 2: Thiết Lập Hệ Thống Test Backend (Ưu tiên P0)
1. Thêm `vitest`, `supertest`, `@types/supertest` vào `QLCS-Backend/package.json`.
2. Tạo CSDL Test riêng biệt (SQLite in-memory hoặc Docker PostgreSQL test container).
3. Viết Integration Test cho 3 luồng sống còn:
   - `auth.routes.test.ts`: Đăng nhập, refresh token, chặn token giả.
   - `profiles.routes.test.ts`: CRUD hồ sơ, kiểm tra OCC Conflict `version`.
   - `excel.routes.test.ts`: Bóc tách và bulk insert dữ liệu mẫu.

### Giai Đoạn 3: Tự Động Hóa E2E Test với Playwright (Ưu tiên P1)
1. Cấu hình Playwright kiểm thử ứng dụng Electron:
   - Kịch bản 1: Đăng nhập tài khoản `admin` -> Vào màn hình thôn -> Nhập hồ sơ -> Kiểm tra KPI nhảy số.
   - Kịch bản 2: Import file Excel mẫu 100 dòng -> Kiểm tra bảng preview -> Lưu DB -> Xuất lại file Excel đối chiếu.
