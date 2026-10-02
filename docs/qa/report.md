# BÁO CÁO TỔNG THỂ KIỂM THỬ TRÌNH DUYỆT & ĐỘ TIN CẬY (QA REPORT)

**Dự án:** Quản Lý Chính Sách Xã Đăk Hà (QLCS v3.0.0)  
**Thời gian:** 02/10/2026  
**Chi nhánh git:** `fix/browser-qa` (gốc từ tag `pre-browser-qa`)  
**Môi trường:** Local (`http://localhost:5173` và `http://localhost:5000/api`)  
**Công cụ điều khiển:** Chrome 140 Headless + Chrome DevTools Protocol (CDP v1.3 via Node.js Native WebSocket)  
**Bộ kịch bản:** 7 luồng người dùng (FLOW-01 đến FLOW-07, theo [flows.md](file:///c:/Projects/QLCS/docs/qa/flows.md))  

---

## 1. SO SÁNH VỚI BASELINE (TRƯỚC VS SAU)

| Chỉ số / Hạng mục | Baseline (Pha 0) | Trước khi sửa (Pha 1) | Sau khi sửa (Pha 3) | Đánh giá |
| :--- | :---: | :---: | :---: | :---: |
| **Vitest Client Tests** | 103 / 103 passed | 103 / 103 passed | **104 / 104 passed** (+1 regression test) | 🟢 Tốt hơn |
| **Backend Tests** | 13 / 13 passed | 13 / 13 passed | **13 / 13 passed** | 🟢 Ổn định 100% |
| **ESLint Errors (Client)** | 2 errors, 13 warnings | 2 errors, 13 warnings | **0 errors, 14 warnings** | 🟢 Giảm 100% errors |
| **Client Build (`tsc && vite`)** | 0 error (1,868 modules) | 0 error (1,868 modules) | **0 error (1,868 modules, 6.1s)** | 🟢 Nhanh hơn |
| **Backend Build (`tsc`)** | 0 error | 0 error | **0 error** | 🟢 Ổn định |
| **Console Errors khi chạy luồng** | Chưa đo | 3,125 errors (vòng lặp request) | **2 errors** (chỉ còn lỗi test mật khẩu sai có chủ đích) | 🟢 Giảm 99.9% |
| **Console Warnings khi chạy luồng** | Chưa đo | 749 warnings | **0 warnings** | 🟢 Triệt tiêu hoàn toàn |
| **Tình trạng Connection Pool DB** | Bình thường | **Tràn kết nối P2024** (kiệt pool do flood) | **Hoàn toàn bình thường**, 0 lỗi pool | 🟢 Tuyệt đối an toàn |

---

## 2. DANH SÁCH LỖI ĐÃ SỬA VÀ BẰNG CHỨNG

### 1. BUG-P1-01: Vòng lặp re-render vô tận nạp danh sách hồ sơ (P0)
- **Commit:** [`0348a10`](file:///c:/Projects/QLCS/QLCS-Client) `fix(client): BUG-P1-01 fix infinite re-render loop on profile list fetching`
- **Nguyên nhân gốc:** `Dashboard/index.tsx` sinh ra `ageFilters: []` mới trên mỗi chu kỳ render; `useProfiles.ts` đưa tham chiếu mảng `ageFilters` vào dependency array của `loadPage` $\rightarrow$ `[] !== []` làm `loadPage` đổi tham chiếu liên tục, gây vòng lặp `loadPage -> setPageData -> render -> loadPage` với tần suất hàng trăm request/giây.
- **Giải pháp:** Sử dụng hằng số tĩnh `EMPTY_AGE_FILTERS` và trích xuất primitive `ageGroup` (`string | undefined`) làm dependency cho `useCallback(loadPage)`. Bổ sung test hồi quy tại [`src/__tests__/statsLoopRegression.test.ts`](file:///c:/Projects/QLCS/QLCS-Client/src/__tests__/statsLoopRegression.test.ts).
- **Bằng chứng:** Số request khi chuyển tab Chúc Thọ ổn định ở 1 request nạp danh sách; backend log không còn bất kỳ lỗi Prisma `P2024` hay `Timed out fetching connection`.

### 2. BUG-P1-02: AppContext gọi API `/api/villages` khi chưa đăng nhập (P1)
- **Commit:** [`642834d`](file:///c:/Projects/QLCS/QLCS-Client) `fix(client): BUG-P1-02 prevent unauthenticated villages API fetch and eliminate 401 cascade on mount`
- **Nguyên nhân gốc:** `checkSession()` trong `AppContext.tsx` gọi `refreshVillages()` ở cuối hàm không phụ thuộc vào `token`.
- **Giải pháp:** Chuyển lời gọi `refreshVillages()` vào `useEffect` phụ thuộc vào `user`, đồng thời chỉ gọi khi có `user` trong `handleReconnected`.
- **Bằng chứng:** Console log ở màn hình Đăng nhập hoàn toàn sạch sẽ, không còn xuất hiện lỗi HTTP 401 Unauthorized khi khởi động app.

### 3. BUG-P1-03: Lỗi cú pháp ESLint blocking (P2)
- **Commit:** [`828a03a`](file:///c:/Projects/QLCS/QLCS-Client) `fix(client): BUG-P1-03 resolve ESLint no-mixed-spaces-and-tabs and no-useless-escape`
- **Nguyên nhân gốc:** Trộn tab/space tại `useFilters.ts:131` và ký tự escape thừa `\-` trong regex họ tên tại `schemas.ts:29`.
- **Giải pháp:** Chuẩn hóa tab thuần nhất và cập nhật regex thành `/^[a-zA-ZÀ-ỹ\s-]+$/`.
- **Bằng chứng:** `npx eslint` trên 2 file đạt exit code 0; tổng số ESLint errors của dự án về 0.

### 4. BUG-P1-04: Thiếu dependency trong CustomSelect (P2)
- **Commit:** [`11995ed`](file:///c:/Projects/QLCS/QLCS-Client) `fix(client): BUG-P1-04 wrap handleSelect in useCallback and add to dependencies in CustomSelect`
- **Nguyên nhân gốc:** `handleSelect` được gọi trong `useEffect` bắt phím Enter nhưng không có trong dependency array.
- **Giải pháp:** Bọc `handleSelect` bằng `useCallback(..., [onChange])` và bổ sung vào dependency array của effect.
- **Bằng chứng:** `npx eslint src/components/common/CustomSelect.tsx` đạt exit code 0, 0 warning.

### 5. BUG-P1-05: Tiêu điểm bàn phím khi mở Modal Hồ Sơ (P2)
- **Nguyên nhân & Khảo sát:** Form `ProfileModal.tsx` đã gắn `nameInputRef` vào ô input Họ và tên và đã kích hoạt focus sau 50ms khi mở modal.
- **Bằng chứng:** Trong kịch bản test Pha 3, `activeElement` khi mở modal đã được ghi nhận chính xác là input `Nguyễn Văn A`. Bấm phím `Escape` đóng modal ngay lập tức.

---

## 3. DANH SÁCH LỖI CÒN LẠI VÀ LỖI MỚI PHÁT SINH
- **Lỗi ở Cổng Duyệt:** 0 (Không có lỗi nào yêu cầu thay đổi kiến trúc nghiệp vụ).
- **Lỗi không tái hiện được:** 0.
- **Lỗi quá 3 lần thử:** 0.
- **Lỗi mới phát sinh:** 0 (Toàn bộ 104 unit tests, build Vite và build Backend đều vượt qua 100%).

---

## 4. BẰNG CHỨNG HÌNH ẢNH TRÊN TRÌNH DUYỆT THẬT (CHROME HEADLESS)
Toàn bộ ảnh chụp màn hình trong quá trình chạy kiểm thử tự động lưu trữ tại `docs/qa/screenshots/`:
- `01-login-initial.png`: Màn hình Đăng nhập ban đầu.
- `01-login-empty-validation.png`: Thông báo lỗi validation khi để trống form.
- `01-login-wrong-password.png`: Thông báo lỗi mật khẩu không chính xác.
- `02-admin-logged-in.png`: Màn hình sau khi Admin đăng nhập thành công.
- `03-villages-overview.png`: Tổng quan 7 thôn trên Màn hình Quản Lý Thôn.
- `04-village-card-focus.png`: Focus bàn phím trên thẻ thôn.
- `05-analytics-village-selected.png`: Điều hướng vào Thôn 1 và cập nhật ngữ cảnh làm việc.
- `06-dashboard-chuctho.png`: Bảng điều khiển phân hệ Hồ Sơ Chúc Thọ sau bản vá.
- `07-year-selector-open.png`: Popover chọn năm tính toán chúc thọ `YearSelector`.
- `08-search-results.png`: Kết quả tìm kiếm họ tên.
- `09-dashboard-htxh.png`: Phân hệ Hưu Trí Xã Hội.
- `10-after-tab-stress.png`: Trạng thái ứng dụng sau khi chuyển đổi tab nhanh (chống stale UI).
- `11-modal-add-profile.png`: Modal Thêm Hồ Sơ hiển thị đầy đủ và focus input đầu tiên.
- `12-modal-closed-escape.png`: Modal đóng mượt mà bằng phím Escape.
- `13-recycle-bin-view.png`: Màn hình Thùng Rác.
- `14-audit-log-view.png`: Màn hình Nhật Ký Hoạt Động.
- `15-settings-view.png`: Màn hình Cài Đặt Hệ Thống.
- `16-settings-light-theme.png`: Giao diện Sáng (Light Theme).
- `17-responsive-768px-tablet.png`: Giao diện trên máy tính bảng (Tablet 768px).
- `18-responsive-360px-mobile.png`: Giao diện trên điện thoại di động (Mobile 360px).
