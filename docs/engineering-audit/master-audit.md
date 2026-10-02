# MASTER AUDIT: TỔNG HỢP VÀ PHÂN CẤP TOÀN DIỆN HỆ THỐNG QLCS

Tài liệu này tổng hợp toàn bộ các phát hiện kỹ thuật từ 12 báo cáo thẩm tra độc lập của 6 Subagent chuyên trách (Agent 1 đến Agent 6), phân cấp theo 5 mức độ nghiêm trọng từ **P0 (Critical)** đến **P4 (Cosmetic)** và mức độ tin cậy chứng cứ (**Confidence: HIGH / MEDIUM / LOW**).

---

## 1. MA TRẬN TỔNG HỢP PHÂN CẤP LỖI (PRIORITIZATION MATRIX)

| Mức Độ | Số Lượng | Lĩnh Vực Chính | Tiêu Chí Phân Loại |
| :--- | :---: | :--- | :--- |
| **P0 (Critical)** | **8** | Bảo mật CCCD, IPC Electron, Rules of Hooks, Mất dữ liệu Modal, CSP, Chặn bàn phím | Lỗ hổng bảo mật nghiêm trọng, nguy cơ mất dữ liệu người dùng, crash hoặc vi phạm tiêu chuẩn cốt lõi |
| **P1 (High)** | **12** | Database N+1, Race condition stale UI, Lỗi phân trang, Fake tests, Test Backend = 0% | Lỗi chức năng nghiệp vụ cốt lõi, sai lệch số liệu, nghẽn hiệu năng lớn, thiếu rào chắn kiểm thử |
| **P2 (Medium)** | **15** | Bão re-render định kỳ 6s, Nhân đôi SheetJS (1.3MB), OCC state 409, Quá tải connection pool | Tắc nghẽn hiệu năng, trải nghiệm người dùng kém, code smells ảnh hưởng độ ổn định |
| **P3 (Low)** | **11** | Dead code (1,031 LOC), Clean up types, Thiếu type-safety backend (322 `any`), Magic numbers | Khả năng bảo trì mã nguồn, dọn dẹp kỹ thuật, nợ kỹ thuật (Tech Debt) |
| **P4 (Cosmetic)** | **6** | Bo góc chi tiết, màu viền focus mờ, khoảng cách padding, icon tooltip | Tinh chỉnh thẩm mỹ nhỏ, không ảnh hưởng logic vận hành |

---

## 2. DANH MỤC FINDINGS CHI TIẾT (CHUẨN HÓA SCHEMA)

### 2.1. CÁC PHÁT HIỆN P0 — CRITICAL (ƯU TIÊN TUYỆT ĐỐI)

#### [FINDING-P0-01] Giải mã tự động toàn bộ CCCD trần qua REST API
- **Category**: Security
- **Severity**: P0 | **Confidence**: HIGH
- **Location**: `QLCS-Backend/src/config/prisma.ts:131-137`
- **Evidence**:
  ```typescript
  // prisma.ts
  query: {
    profiles: {
      async $allOperations({ operation, args, query }) {
        const result = await query(args);
        return processOutputData(result); // Tự động decrypt CCCD cho mọi truy vấn!
      }
    }
  }
  ```
- **Current Behavior**: Khi Client gọi `GET /api/profiles` hoặc `GET /api/htxh`, payload HTTP trả về toàn bộ 12 chữ số CCCD dạng văn bản rõ cho hàng trăm hồ sơ.
- **Expected Behavior**: Danh sách chỉ được phép trả về `cccd_last4` (ví dụ `••••••••1234`). Chỉ khi người dùng có thẩm quyền bấm xem chi tiết thì mới gọi endpoint bảo mật có ghi log kiểm toán.
- **Root Cause**: Prisma Client Extension áp dụng `processOutputData` toàn cục không phân biệt truy vấn danh sách (`findMany`) hay xem chi tiết (`findUnique`).
- **Impact**: Rò rỉ thông tin định danh cá nhân (PII) quy mô lớn qua đường truyền mạng. Nút che CCCD trên Client chỉ mang tính hình thức.
- **Recommended Fix**: Ngắt bỏ auto-decrypt trong `$allOperations` của Prisma. Tại các controller danh sách (`profiles`, `htxh`), chỉ select các trường công khai và `cccd_last4`. Xây dựng endpoint `POST /api/profiles/:id/reveal-cccd` kiểm tra quyền và ghi nhận `profile_audit_log`.
- **Dependencies**: Không.
- **Risk**: Medium (cần đảm bảo form sửa hồ sơ vẫn lấy được CCCD khi có quyền).
- **Test Required**: Integration test API danh sách không chứa `cccd` 12 số trần.

---

#### [FINDING-P0-02] Bỏ qua hoàn toàn IPC Sender Validation trong Electron Main Process
- **Category**: Electron Security
- **Severity**: P0 | **Confidence**: HIGH
- **Location**: `QLCS-Client/electron/main.ts:131-242, 303-320`
- **Evidence**:
  ```typescript
  // main.ts
  ipcMain.handle('secure-store:set', async (_e, key: string, value: any) => {
    // Không kiểm tra _e.senderFrame! Bất kỳ frame nào cũng có thể ghi đè token
    store.set(key, value);
  });
  ```
- **Current Behavior**: Toàn bộ IPC handlers bỏ qua tham số `event` (`_e`), cho phép bất kỳ frame hoặc iframe nào gửi IPC message.
- **Expected Behavior**: Mọi IPC handler bắt buộc xác thực `event.senderFrame === mainWindow.webContents.mainFrame`.
- **Root Cause**: Thiếu lớp bảo vệ nguồn gốc frame khi thiết kế IPC handlers.
- **Impact**: Nếu xuất hiện lỗ hổng XSS trong webview hoặc DOM, kẻ tấn công có thể thao túng `secure-store`, mở file dialog tùy tiện hoặc chiếm quyền ứng dụng desktop.
- **Recommended Fix**: Tạo helper `validateIpcSender(event, mainWindow)` và bọc toàn bộ `ipcMain.handle`.
- **Dependencies**: Không.
- **Risk**: Low.
- **Test Required**: Unit test kiểm tra IPC handler từ chối frame không hợp lệ.

---

#### [FINDING-P0-03] Vi phạm nghiêm trọng React Rules of Hooks trong AppContext
- **Category**: Architecture & Code Quality
- **Severity**: P0 | **Confidence**: HIGH
- **Location**: `QLCS-Client/src/AppContext.tsx:85`
- **Evidence**:
  ```typescript
  // AppContext.tsx:85
  if (existingContext) {
    return <>{children}</>; // EARLY RETURN trước khi gọi 23 hooks bên dưới!
  }
  const [user, setUser] = useState<User | null>(null);
  // ... 22 hooks khác bên dưới
  ```
- **Current Behavior**: Khi `existingContext` thay đổi hoặc trong các ngữ cảnh lồng nhau, thứ tự gọi Hook bị thay đổi hoàn toàn giữa các lần render.
- **Expected Behavior**: Tuân thủ tuyệt đối React Rules of Hooks (không bao giờ đặt điều kiện return trước hooks).
- **Root Cause**: Cố gắng xử lý trường hợp lồng Provider nhưng đặt guard sai vị trí.
- **Impact**: Gây lỗi React Error #310 ("Rendered fewer hooks than expected"), crash ứng dụng bất thình lình khi hot reload hoặc re-mount.
- **Recommended Fix**: Tách thành component bọc ngoài kiểm tra hoặc loại bỏ hoàn toàn nhánh `if (existingContext)` vì trong cây DOM chỉ có duy nhất 1 `<AppContextProvider>` tại `main.tsx`.
- **Dependencies**: Không.
- **Risk**: Low.
- **Test Required**: Vitest render `<AppContextProvider>` nhiều lần liên tiếp.

---

#### [FINDING-P0-04] Lỗi mất dữ liệu hồ sơ khi lưu thất bại (Silent Data Loss)
- **Category**: UI/UX & Reliability
- **Severity**: P0 | **Confidence**: HIGH
- **Location**: `QLCS-Client/src/pages/Dashboard/index.tsx:271-286` & `modals/ProfileModal.tsx:228-231`
- **Evidence**:
  ```typescript
  // index.tsx
  const handleSaveProfileFromModal = async (data: any) => {
    await handleSave(data, isEditMode);
    // THIẾU RETURN BOOLEAN! Trả về undefined!
  };

  // ProfileModal.tsx
  const saveResult = await onSave(payload);
  if ((saveResult as any) !== false) { // undefined !== false LUÔN LÀ TRUE!
    onClose(); // Luôn đóng modal dù lưu thất bại!
  }
  ```
- **Current Behavior**: Khi lưu hồ sơ bị lỗi (mất mạng, lỗi validate 400, conflict OCC 409), modal vẫn tự động đóng ngay lập tức, xóa sạch toàn bộ dữ liệu cán bộ vừa nhập liệu dở.
- **Expected Behavior**: Modal phải giữ nguyên dữ liệu, hiển thị banner báo lỗi cụ thể khi `saveResult === false`.
- **Root Cause**: Bất đồng bộ trong hợp đồng trả về giữa component cha (`index.tsx`) và component con (`ProfileModal.tsx`).
- **Impact**: Cán bộ mất công nhập liệu dài, dữ liệu không được ghi vào CSDL nhưng người dùng tưởng đã lưu thành công.
- **Recommended Fix**: `handleSaveProfileFromModal` phải `return success;` và `ProfileModal` hiển thị thông báo lỗi, chỉ đóng khi `success === true`.
- **Dependencies**: Không.
- **Risk**: Low.
- **Test Required**: Test mô phỏng API trả về lỗi 500/409, xác nhận modal không bị đóng.

---

#### [FINDING-P0-05] Lỗi Header CSP chặn tải Stylesheet Google Fonts trong Electron Production
- **Category**: Release & Build
- **Severity**: P0 | **Confidence**: HIGH
- **Location**: `QLCS-Client/electron/main.ts:25-30`
- **Evidence**:
  ```typescript
  // main.ts
  const csp = "default-src 'self'; connect-src 'self' http://localhost:5000 https://qlcs.dulieudakha.vn https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com;";
  // https://fonts.googleapis.com bị đặt nhầm vào connect-src thay vì style-src!
  ```
- **Current Behavior**: Khi chạy bản đóng gói exe, Chromium chặn đứng việc tải CSS Google Fonts (`<link rel="stylesheet">`).
- **Expected Behavior**: Google Fonts stylesheet được tải hợp lệ.
- **Root Cause**: Nhầm lẫn giữa domain kết nối API (`connect-src`) và domain nạp stylesheet (`style-src`).
- **Impact**: Ứng dụng rơi về font hệ thống mặc định của Windows, vỡ layout bảng dữ liệu, chữ bị tràn và xô lệch số liệu.
- **Recommended Fix**: Chuyển `https://fonts.googleapis.com` sang chỉ thị `style-src`.
- **Dependencies**: Không.
- **Risk**: Low.
- **Test Required**: Kiểm tra CSP header trong môi trường production build.

---

#### [FINDING-P0-06] Chặn hoàn toàn người dùng bàn phím tại Màn hình Thôn (Keyboard Inaccessible)
- **Category**: Accessibility (WCAG 2.1 AA)
- **Severity**: P0 | **Confidence**: HIGH
- **Location**: `QLCS-Client/src/pages/VillagesPage.tsx:492`
- **Evidence**:
  ```tsx
  // VillagesPage.tsx
  <div onClick={() => handleVillageClick(village.id)} className="...">
    {/* Thẻ div thuần không có tabIndex, không có role, không bắt onKeyDown */}
  </div>
  ```
- **Current Behavior**: Cán bộ sử dụng bàn phím không thể Tab tới các thẻ thôn và không thể chọn thôn để vào làm việc.
- **Expected Behavior**: Thẻ thôn có thể focus bằng phím `Tab` và kích hoạt bằng phím `Enter` hoặc `Space`.
- **Root Cause**: Dùng thẻ `<div>` bắt sự kiện click chuột thuần túy thay vì thẻ `<button>` ngữ nghĩa.
- **Impact**: Vi phạm nghiêm trọng tiêu chuẩn WCAG 2.1.1 (Keyboard), cô lập hoàn toàn người dùng thao tác bằng bàn phím.
- **Recommended Fix**: Đổi thành thẻ `<button type="button">` hoặc thêm `tabIndex={0}`, `role="button"`, `onKeyDown`.
- **Dependencies**: Không.
- **Risk**: Low.
- **Test Required**: Test mô phỏng nhấn phím `Tab` và `Enter` kích hoạt chuyển thôn.

---

#### [FINDING-P0-07] Thiếu Focus Trap trong Modal & Drawer dẫn đến thoát tiêu điểm
- **Category**: Accessibility (WCAG 2.1 AA)
- **Severity**: P0 | **Confidence**: HIGH
- **Location**: `QLCS-Client/src/pages/Dashboard/modals/ProfileModal.tsx` & `src/hooks/useModal.tsx`
- **Current Behavior**: Khi mở modal, nhấn Tab qua nút cuối cùng khiến tiêu điểm bay ra nền bên dưới; khi đóng modal, tiêu điểm bị lạc mất, không quay về nút trigger.
- **Expected Behavior**: Tiêu điểm bàn phím bị giữ chặt bên trong Modal/Drawer khi đang mở (Loop Tab/Shift+Tab); khi đóng, tiêu điểm quay lại phần tử trước đó.
- **Root Cause**: Chưa triển khai Focus Trapping và phục hồi focus.
- **Impact**: Người dùng bàn phím bị mất định hướng, vô tình kích hoạt các nút phía sau backdrop.
- **Recommended Fix**: Tích hợp hook quản lý Focus Trap chuẩn (lắng nghe `keydown` phím `Tab` và quản lý `document.activeElement`).
- **Dependencies**: Không.
- **Risk**: Low.
- **Test Required**: Test bàn phím xoay vòng trong Modal.

---

#### [FINDING-P0-08] Rò rỉ tài nguyên Memory Leak do đặt Timeout Cleanup sai vị trí
- **Category**: Code Quality & Reliability
- **Severity**: P0 | **Confidence**: HIGH
- **Location**: `QLCS-Client/src/components/Layout/AppLayout.tsx:21-25`
- **Evidence**:
  ```typescript
  // AppLayout.tsx
  window.addEventListener('server:reconnected', () => {
    setShowBanner(true);
    const t = setTimeout(() => setShowBanner(false), 3000);
    return () => clearTimeout(t); // VÔ NGHĨA! Event listener callback không đọc return cleanup!
  });
  ```
- **Current Behavior**: Mỗi lần server reconnect, một timer mới được tạo ra mà không bao giờ bị hủy nếu component unmount hoặc reconnect liên tục.
- **Expected Behavior**: Timer phải được lưu vào ref hoặc state và dọn dẹp đúng cách trong hàm cleanup của `useEffect`.
- **Root Cause**: Viết hàm cleanup của setTimeout bên trong listener callback thay vì return của `useEffect`.
- **Impact**: Rò rỉ timer và cập nhật state trên unmounted component gây lỗi React warning.
- **Recommended Fix**: Sử dụng `useRef` lưu timer ID và dọn dẹp trong return của `useEffect`.
- **Dependencies**: Không.
- **Risk**: Low.
- **Test Required**: Unit test mount/unmount component khi kích hoạt event.

---

### 2.2. CÁC PHÁT HIỆN P1 — HIGH (NGHIỆP VỤ & HIỆU NĂNG CỐT LÕI)

#### [FINDING-P1-01] Vấn đề 4N+1 Queries và cạn kiệt Connection Pool Supabase
- **Category**: Database & Performance
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Backend/src/controllers/villages.controller.ts:18-34` & `analytics.controller.ts:190-210`
- **Evidence**: `getVillages` và `getByVillage` lặp qua 7 thôn, mỗi thôn bắn 4 queries riêng biệt (`count` chúc thọ, `count` đã nhận quà, `count` chưa nhận, `count` HTXH), tổng cộng 28-29 queries đồng thời cho mỗi request.
- **Impact**: Làm nghẽn hàng đợi kết nối Supabase, response time tăng vọt khi nhiều máy trạm cùng truy cập.
- **Recommended Fix**: Thay thế bằng 1 câu truy vấn `groupBy` của Prisma kết hợp SQL view hoặc cache in-memory 60 giây.
- **Dependencies**: Không.

#### [FINDING-P1-02] Bảng htxh_profiles thiếu Index trên is_deleted và calculation_year
- **Category**: Database
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Backend/prisma/schema.prisma:50-70`
- **Impact**: 100% truy vấn nghiệp vụ đều lọc `where: { is_deleted: false }`. Thiếu index dẫn đến Sequential Scan trên toàn bộ bảng, làm chậm nghiêm trọng khi dữ liệu đạt 23,000+ bản ghi.
- **Recommended Fix**: Bổ sung `@@index([village_id, is_deleted, calculation_year])` vào schema Prisma và chạy migration.
- **Dependencies**: Cần đồng bộ schema.

#### [FINDING-P1-03] Lỗi phân trang làm trắng bảng dữ liệu khi đổi Limit (BUG-QA-PAG-01)
- **Category**: QA / Runtime
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Client/src/pages/Dashboard/index.tsx` & `useProfiles.ts`
- **Impact**: Đang ở Trang 5 (10 dòng/trang), đổi dropdown sang 100 dòng/trang, `page` vẫn giữ nguyên là 5 dẫn đến gọi API với `skip = 400`, làm bảng trắng trơn dù hệ thống chỉ có 60 bản ghi.
- **Recommended Fix**: Khi `limit` thay đổi, bắt buộc tự động reset `page` về 1.
- **Dependencies**: Không.

#### [FINDING-P1-04] Race condition Stale UI do thiếu AbortController (BUG-REL-STALE-01)
- **Category**: Reliability
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Client/src/pages/Dashboard/hooks/useProfiles.ts:77-124`
- **Impact**: Khi chuyển nhanh giữa các mốc tuổi hoặc chuyển tab, request cũ đến sau sẽ ghi đè dữ liệu lên tab mới, hiển thị sai lệch hồ sơ.
- **Recommended Fix**: Tích hợp `AbortController` vào hàm `loadPage`, tự động abort request trước đó khi có filter mới.
- **Dependencies**: Không.

#### [FINDING-P1-05] 48.3% Test Suites là test ngụy tạo (Fake Tests)
- **Category**: Test & Verification
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Client/src/__tests__/age.test.ts`, `helpers.test.ts`, `useUndo.test.ts`
- **Impact**: 57/118 tests tự viết lại logic trong file test thay vì import từ mã nguồn thật. Mã nguồn thật có lỗi thì test vẫn báo PASS 100%, tạo ra cảm giác an toàn giả tạo.
- **Recommended Fix**: Viết lại toàn bộ các test suites này, bắt buộc import trực tiếp từ mã nguồn sản phẩm trong `src/`.
- **Dependencies**: Không.

#### [FINDING-P1-06] Độ phủ Test tầng Backend bằng 0% (0 Tests)
- **Category**: Test & Release
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Backend`
- **Impact**: 10 controllers xử lý nghiệp vụ tiền tệ, bảo mật, mã hóa, import Excel không hề có một dòng test tự động nào bảo vệ.
- **Recommended Fix**: Cài đặt `vitest` + `supertest` cho Backend, viết test suites cho Auth, OCC versioning và API tính tuổi.
- **Dependencies**: Không.

#### [FINDING-P1-07] N+1 Sequential Inserts gây timeout 30s khi Import Excel lớn
- **Category**: Database & Reliability
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Backend/src/controllers/profiles.controller.ts:bulkAddProfiles`
- **Impact**: Chạy vòng lặp `for ... of` gọi tuần tự từng câu `prisma.profiles.create`. File Excel > 1,000 dòng mất > 30s làm kích hoạt timeout phía Client.
- **Recommended Fix**: Chuyển sang `prisma.profiles.createMany` trong 1 câu SQL đơn lẻ, chia batch 500 bản ghi/lần.
- **Dependencies**: Không.

#### [FINDING-P1-08] Khóa mã hóa electron-store bị hardcode trần trong mã nguồn
- **Category**: Electron Security
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Client/electron/main.ts:8-11`
- **Impact**: Khóa `"QLCS_ENCRYPTED_STORE_KEY_SECURE_2026"` lộ rõ trong binary/asar, kẻ tấn công đọc được token lưu trên máy trạm.
- **Recommended Fix**: Chuyển sang dùng `safeStorage` native của Electron (sử dụng Windows DPAPI).
- **Dependencies**: Không.

#### [FINDING-P1-09] Phụ thuộc vòng (Circular Dependency) giữa Excel và Profiles Controller
- **Category**: Architecture
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Backend/src/controllers/excel.controller.ts:7-8` & `profiles.controller.ts:6`
- **Impact**: Gây nguy cơ runtime `undefined` khi nạp module, phá vỡ tính module hóa.
- **Recommended Fix**: Rút trích hàm tính mốc tuổi `computeChucthoMilestones` ra file tiện ích dùng chung `src/utils/age.ts`.
- **Dependencies**: Không.

#### [FINDING-P1-10] Thiếu cơ chế thu hồi (Revocation) Access Token khi Logout
- **Category**: Security
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Backend/src/controllers/auth.controller.ts:255-268`
- **Impact**: Sau khi bấm Đăng xuất, Access Token cũ vẫn có thể dùng để gọi API trong 15 phút.
- **Recommended Fix**: Thêm cơ chế Blacklist token ngắn hạn trong bộ nhớ hoặc Redis/In-memory cache có TTL 15m.
- **Dependencies**: Không.

#### [FINDING-P1-11] Giao diện AnalyticsPage kéo 2,000 bản ghi thô về Client để tính toán
- **Category**: Architecture & Performance
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Client/src/pages/AnalyticsPage.tsx:211-255`
- **Impact**: Client gọi `limit: 1000` hai lần để đếm Nam/Nữ và Dân tộc. Số liệu bị sai khi xã có > 1,000 hồ sơ, đồng thời gây lãng phí băng thông và đơ UI.
- **Recommended Fix**: Backend cung cấp endpoint `GET /api/analytics/demographics` tính toán trực tiếp trên CSDL qua câu lệnh SQL Aggregation.
- **Dependencies**: Phối hợp Client và Backend.

#### [FINDING-P1-12] Lỗ hổng Dependency CVEs trong Client và Backend
- **Category**: Security / Supply Chain
- **Severity**: P1 | **Confidence**: HIGH
- **Location**: `QLCS-Client/package.json` & `QLCS-Backend/package.json`
- **Impact**: Chứa các thư viện có lỗ hổng bảo mật đã biết (`xlsx@0.18.5`, `qs`).
- **Recommended Fix**: Rà soát, nâng cấp hoặc thay thế an toàn không làm vỡ API.
- **Dependencies**: Không.

---

### 2.3. CÁC PHÁT HIỆN P2 — MEDIUM (HIỆU NĂNG & TRẢI NGHIỆM NGƯỜI DÙNG)

- **[FINDING-P2-01] Bão Re-render định kỳ 6s do Heartbeat Ping**: `AppContext.tsx` cập nhật `latency` mỗi 6s làm re-render toàn bộ cây component do `value` không được bọc `useMemo`.
- **[FINDING-P2-02] Thư viện SheetJS bị đóng gói nhân đôi (1.30 MB chiếm 65% bundle)**: Cả `xlsx.min.js` (869KB) và `xlsx.js` (429KB) đều bị kéo vào bundle.
- **[FINDING-P2-03] Lỗi lặp OCC 409 khi người dùng bấm Lưu lại**: `ProfileModal.tsx` không cập nhật lại `version` mới sau khi bị 409 Conflict khiến các lần bấm sau tiếp tục lỗi.
- **[FINDING-P2-04] Nút nhận quà cho phép spam-click gửi nhiều HTTP PUT**: `ProfileRow.tsx` thiếu trạng thái disabled khi mutation đang chạy.
- **[FINDING-P2-05] Thân bảng MainTable trống trơn khi không có kết quả**: Thiếu component Empty State trực quan.
- **[FINDING-P2-06] Validation form trong ProfileModal không dùng Zod Schema**: Cho phép nhập năm sinh tương lai `2099` sinh tuổi âm `-73`.
- **[FINDING-P2-07] Backend Audit Log bỏ qua tham số lọc `userId`**: `audit.controller.ts` không đọc `req.query.userId`, khiến trang kiểm toán trắng trơn khi lọc theo cán bộ.
- **[FINDING-P2-08] Thao tác Batch Restore/Delete bắn đồng loạt hàng trăm requests đơn lẻ**: Dùng `Promise.all` dễ kích hoạt Rate Limit 429.
- **[FINDING-P2-09] Transaction Timeout trong restoreSnapshot**: Interactive transaction 5s mặc định của Prisma bị sập khi restore file lớn.
- **[FINDING-P2-10] Thiếu icon Windows Win32 chuẩn `.ico`**: Electron builder thiếu file icon native cho thanh taskbar Windows.
- **[FINDING-P2-11] Vi phạm độ tương phản màu sắc WCAG 1.4.3**: Text phụ `text-slate-400` trên nền trắng chỉ đạt 2.73:1 (chuẩn yêu cầu $\ge 4.5:1$).
- **[FINDING-P2-12] Nút Toggle ẩn/hiện mật khẩu có `tabIndex={-1}`**: Chặn người dùng bàn phím kiểm tra lại mật khẩu đã nhập trong `Login.tsx`.
- **[FINDING-P2-13] Nguy cơ mất form dở khi vô tình bấm Escape**: Không có cảnh báo xác nhận khi form đang có dữ liệu bẩn (`dirty state`).
- **[FINDING-P2-14] Thiếu Code-splitting cho các Modal lớn**: `ImportModal` (1,510 dòng) và `Settings` (1,285 dòng) không dùng `React.lazy()`.
- **[FINDING-P2-15] CSP index.html chứa `'unsafe-inline'` và `'unsafe-eval'**: Cần làm sạch theo chuẩn CSP nghiêm ngặt.

---

### 2.4. CÁC PHÁT HIỆN P3 — LOW (MÃ CHẾT & NỢ KỸ THUẬT)

- **[FINDING-P3-01] 1,031 dòng mã chết (Dead code)**:
  - `ProfileCard.tsx` (414 dòng) mồ côi.
  - `importCutriWorker.ts` (223 dòng) không thuộc phạm vi QLCS.
  - `types/shared.ts` (128 dòng) thừa.
  - `DeleteConfirm.tsx` (116 dòng) không còn dùng.
  - `excelApi.ts` (56 dòng) zombie do đã chuyển sang Web Worker.
- **[FINDING-P3-02] 322 lần sử dụng `any` và ép kiểu `(prisma as any)` trong Backend**: Làm mất đi sức mạnh kiểm tra tĩnh của TypeScript.
- **[FINDING-P3-03] 18 khối catch nuốt lỗi âm thầm (Silent Catches)**: Đáng chú ý là `prisma.ts:45` trả về chuỗi mã hóa thô khi lỗi decrypt.
- **[FINDING-P3-04] Trùng lặp thuật toán tính tuổi tròn tại 5 nơi khác nhau**: Cần gom về duy nhất 1 helper chuẩn.
- **[FINDING-P3-05] `syncQueue` trong IndexedDB không có code kích hoạt**: Có hàng đợi offline nhưng chưa có nơi nào gọi `enqueueSync`.
- **[FINDING-P3-06] Thiếu giới hạn bounds check cho `app:set-zoom`**: Cho phép set zoom level vượt quá phạm vi an toàn 80% - 140%.
- **[FINDING-P3-07] Model `stats_cache` trong schema Prisma bị drift**: Không còn dùng do đã chuyển sang in-memory cache.
- **[FINDING-P3-08] Thiếu cấu hình `will-navigate` và `setWindowOpenHandler` trong Electron**: Đề phòng mở URL ngoại lai.
- **[FINDING-P3-09] Socket.io handshake không xác thực JWT**: Ai cũng có thể join room thôn.
- **[FINDING-P3-10] CORS regex kiểm tra lỏng lẻo**: Hàm kiểm tra đuôi domain `.dulieudakha.vn` có thể bị bypass.
- **[FINDING-P3-11] Endpoint `POST /api/auth/setup` thiếu secret guard**: Bất kỳ ai cũng có thể gọi nếu chưa có admin.

---

### 2.5. CÁC PHÁT HIỆN P4 — COSMETIC (TINH CHỈNH GIAO DIỆN)

- **[FINDING-P4-01] Viền focus `focus:ring-emerald-500/20` quá mờ**: Tăng độ rõ nét lên `focus:ring-2 focus:ring-emerald-600`.
- **[FINDING-P4-02] Thiếu nhãn semantic `<label htmlFor="...">`**: Cải thiện đọc màn hình (Screen Reader).
- **[FINDING-P4-03] Thiếu Skeleton Loader trong VillagesPage**: Thay thế spinner tròn bằng Skeleton dạng card.
- **[FINDING-P4-04] Thiếu aria-label trên các ô Search Input**: Bổ sung `aria-label="Tìm kiếm hồ sơ"`.
- **[FINDING-P4-05] Bo góc chưa hoàn toàn đồng nhất giữa các thẻ thôn**: Chuẩn hóa về `rounded-2xl`.
- **[FINDING-P4-06] Tooltip giải thích chi tiết lỗi ngày sinh**: Hiển thị tooltip thân thiện thay vì text dài trên cột bảng.
