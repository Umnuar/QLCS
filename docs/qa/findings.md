# Bảng Tổng Hợp Phát Hiện Kiểm Thử Trực Tiếp (Findings) — Pha 1 & Pha 2

Tài liệu này ghi nhận toàn bộ các phát hiện và lỗi thực tế được kiểm chứng trực tiếp trên trình duyệt Chromium thông qua công cụ Playwright theo đúng tiêu chuẩn kiểm thử QA Pha 1, cùng kết quả khắc phục chuẩn mực trong Pha 2.

---

## Danh Sách Phát Hiện Chính Thức & Trạng Thái Sửa Lỗi

| ID | Loại | Tiêu đề | Mức độ | Nhãn sửa | Trạng thái | Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FINDING-UI-01** | Giao diện (UI) | Vỡ giao diện trên mobile 360px: Header đè chữ, Sidebar bóp nghẹt nội dung | **P1** | **TỰ SỬA** | 🟢 **ĐÃ SỬA & VERIFIED** | `a2cb52b` (Client) |
| **FINDING-A11Y-01** | A11y / UI | `ImportModal` không đóng bằng phím Escape và nút X thiếu `aria-label` | **P2** | **TỰ SỬA** | 🟢 **ĐÃ SỬA & VERIFIED** | `100ac55`, `7b845f1` (Client) |
| **FINDING-REACT-01** | React / Perf | Callback trong `AppContext` thiếu `useCallback` gây re-render lan tỏa toàn cây DOM | **P2** | **TỰ SỬA** | 🟢 **ĐÃ SỬA & VERIFIED** | `21be033` (Client) |
| **FINDING-FUNC-01** | Chức năng / DB | Backend thiếu validate độ dài & trùng lặp tên thôn khiến phát sinh dữ liệu rác | **P2** | **CỔNG DUYỆT (ĐÃ DUYỆT)** | 🟢 **ĐÃ SỬA & VERIFIED** | `134d788` (Backend) |
| **FINDING-CONSOLE-01**| Console / A11y| Ô nhập mật khẩu thiếu thuộc tính `autoComplete` gây cảnh báo DOM | **P3** | **TỰ SỬA** | 🟢 **ĐÃ SỬA & VERIFIED** | `d3a1b1b` (Client) |
| **FINDING-UI-02** | Giao diện (UI) | Header Island của Dashboard bị thụt/che một phần đỉnh dưới thanh Header | **P3** | **TỰ SỬA** | 🟢 **ĐÃ SỬA & VERIFIED** | `e4f48da` (Client) |

---

## Chi Tiết Từng Phát Hiện & Bằng Chứng Khắc Phục

### 1. FINDING-UI-01: Vỡ giao diện trên màn hình mobile 360px
* **Loại**: Giao diện (UI Responsive 360px).
* **Mức độ**: P1 (Ảnh hưởng nghiêm trọng trải nghiệm người dùng trên thiết bị di động).
* **Độ tin cậy**: Cao (Tái hiện 100% khi viewport width = 360px).
* **Nhãn sửa**: **TỰ SỬA**.
* **Trạng thái**: 🟢 **ĐÃ SỬA & VERIFIED**.
* **Các bước tái hiện**:
  1. Mở app tại `http://localhost:5173`.
  2. Đăng nhập với tài khoản `admin` / `admin123456`.
  3. Chọn một thôn (vd: Thôn 1) để vào Dashboard.
  4. Thu nhỏ viewport trình duyệt về kích thước mobile 360x640px.
* **Kết quả thực tế vs Mong đợi (Trước)**:
  * *Thực tế*: Trên Header, chữ thương hiệu bị đè trực tiếp lên nút Zoom. Sidebar chiếm ~260px/360px, vùng nội dung bên phải chỉ còn ~100px.
  * *Mong đợi*: Trên mobile `< 768px`, Sidebar tự thu gọn dạng icon mini `w-16`; Header ẩn bớt nút Zoom, văn bản thương hiệu co giãn hợp lý.
* **Biện pháp khắc phục**:
  - `Header.tsx`: Ẩn thanh Zoom trên mobile `< sm` (`hidden sm:flex`), thêm `truncate` cho tiêu đề thương hiệu.
  - `Sidebar.tsx`: Trên mobile `< md`, tự động co về `w-16` hiển thị icon-only với tooltip để nhường không gian cho nội dung chính.
* **Bằng chứng trước & sau**:
  - *Trước*: [flow03_04_mobile_360px.png](file:///c:/Projects/QLCS/docs/qa/screenshots/flow03_04_mobile_360px.png)
  - *Sau*: [flow03_04_mobile_360px_after.png](file:///c:/Projects/QLCS/docs/qa/screenshots/flow03_04_mobile_360px_after.png)
* **Commit**: `a2cb52b` (`fix(ui): [FINDING-UI-01] responsive layout on mobile 360px (Header overlap & Sidebar collapse)`).

---

### 2. FINDING-A11Y-01: `ImportModal` không đóng được bằng phím Escape & thiếu `aria-label`
* **Loại**: Khả năng truy cập (A11y) & Trải nghiệm (UX).
* **Mức độ**: P2 (Khó khăn cho người dùng sử dụng phím).
* **Độ tin cậy**: Cao (Tái hiện 100%).
* **Nhãn sửa**: **TỰ SỬA**.
* **Trạng thái**: 🟢 **ĐÃ SỬA & VERIFIED**.
* **Các bước tái hiện**:
  1. Từ trang Dashboard Chúc thọ hoặc HTXH, bấm nút `[📄 Nhập Excel]`.
  2. Hộp thoại `ImportModal` mở lên.
  3. Nhấn phím `Escape` trên bàn phím.
* **Kết quả thực tế vs Mong đợi (Trước)**:
  * *Thực tế*: Hộp thoại không phản ứng với phím `Escape`. Nút đóng `X` không có thuộc tính `aria-label`.
  * *Mong đợi*: Bắt phím `Escape` đóng modal an toàn (khi không trong quá trình upload dữ liệu), nút `X` có `aria-label="Đóng modal"`.
* **Biện pháp khắc phục**:
  - Bổ sung `useEffect` lắng nghe sự kiện `keydown` phím `Escape` gọi `handleCloseModal()` / `setImportResult(null)`.
  - Thêm `aria-label="Đóng modal"` và `title="Đóng (Escape)"` cho nút đóng `X`.
  - Bọc `handleCloseModal` trong `useCallback` với dependencies đầy đủ.
* **Bằng chứng sau sửa**: Kịch bản tự động Playwright xác nhận modal đóng ngay lập tức khi nhấn Escape và nút có aria-label chính xác.
* **Commits**: `100ac55`, `7b845f1`.

---

### 3. FINDING-REACT-01: Re-render lan tỏa trong `AppContext` do thiếu `useCallback`
* **Loại**: React Lifecycle & Hiệu năng.
* **Mức độ**: P2 (Gây render lại không cần thiết toàn bộ cây component).
* **Độ tin cậy**: Cao (10 warnings từ ESLint và kiểm tra runtime).
* **Nhãn sửa**: **TỰ SỬA**.
* **Trạng thái**: 🟢 **ĐÃ SỬA & VERIFIED**.
* **Các bước tái hiện**:
  1. Kiểm tra mã nguồn `AppContext.tsx` tại các dòng định nghĩa hàm: `toggleSidebar`, `setSidebarCollapsed`, `toggleTheme`, `setIsDarkMode`, `zoomIn`, `zoomOut`, `resetZoom`.
  2. Các hàm này được tạo mới sau mỗi render của `<AppContextProvider>`.
* **Kết quả thực tế vs Mong đợi (Trước)**:
  * *Thực tế*: Reference của các hàm thay đổi liên tục, làm vô hiệu hóa `useMemo` ở dòng 474 và kích hoạt re-render toàn bộ component con.
  * *Mong đợi*: Mọi handler trong context phải được memoize với `useCallback`.
* **Biện pháp khắc phục**:
  - Bọc toàn bộ các hàm UI state (`toggleSidebar`, `setSidebarCollapsed`, `toggleTheme`, `setIsDarkMode`, `zoomIn`, `zoomOut`, `resetZoom`) trong `useCallback`.
  - Giảm số lượng cảnh báo ESLint từ 14 xuống còn 7 (giảm 50%).
* **Commit**: `21be033` (`fix(perf): [FINDING-REACT-01] memoize context callbacks to eliminate re-renders`).

---

### 4. FINDING-FUNC-01: Backend thiếu validate độ dài & trùng lặp tên thôn
* **Loại**: Chức năng & Toàn vẹn dữ liệu (Data Integrity).
* **Mức độ**: P2 (Dữ liệu rác làm ô nhiễm giao diện danh sách thôn).
* **Độ tin cậy**: Cao (Kiểm chứng trực tiếp CSDL Supabase).
* **Nhãn sửa**: **CỔNG DUYỆT (ĐÃ ĐƯỢC PHÊ DUYỆT)**.
* **Trạng thái**: 🟢 **ĐÃ SỬA & VERIFIED**.
* **Các bước tái hiện**:
  1. Mở màn hình `VillagesPage`.
  2. Bảng thôn hiển thị 6 thẻ thôn đều có tên là `"1"`.
* **Kết quả thực tế vs Mong đợi (Trước)**:
  * *Thực tế*: API `createVillage` và `updateVillage` không validate độ dài (`name.trim().length >= 2`) và không kiểm tra trùng tên, dẫn đến việc tạo nhiều thôn rác tên `"1"`.
  * *Mong đợi*: Chặn tạo tên rác, trả về HTTP 400 nếu tên < 2 ký tự và HTTP 409 nếu tên đã tồn tại. Dọn dẹp an toàn các bản ghi rác trong CSDL.
* **Biện pháp khắc phục**:
  - `villages.controller.ts`: Bổ sung kiểm tra `typeof name === 'string' && name.trim().length >= 2` và truy vấn kiểm tra trùng lặp case-insensitive `findFirst({ where: { name: { equals: trimmedName, mode: 'insensitive' } } })`.
  - CSDL: Chuyển 2 hồ sơ thử nghiệm sang `Thôn 1`, xóa sạch 6 bản ghi thôn mồ côi tên `"1"` trong transaction an toàn.
* **Bằng chứng sau sửa**: Browser test xác nhận trang `VillagesPage` sạch 100%, không còn thẻ rác tên `"1"`.
* **Commit**: `134d788` (`fix(backend): [FINDING-FUNC-01] validate village name length and uniqueness`).

---

### 5. FINDING-CONSOLE-01: Cảnh báo DOM thiếu `autoComplete` trên ô nhập mật khẩu
* **Loại**: Console / Khả năng truy cập.
* **Mức độ**: P3 (Cảnh báo trình duyệt).
* **Độ tin cậy**: Cao.
* **Nhãn sửa**: **TỰ SỬA**.
* **Trạng thái**: 🟢 **ĐÃ SỬA & VERIFIED**.
* **Biện pháp khắc phục**:
  - `Login.tsx`: Bổ sung `autoComplete="username"` cho ô tài khoản và `autoComplete="current-password"` cho ô mật khẩu.
* **Bằng chứng sau sửa**: DevTools console không còn xuất hiện cảnh báo input autocomplete trên form đăng nhập.
* **Commit**: `d3a1b1b` (`fix(a11y): [FINDING-CONSOLE-01] add autocomplete attributes to login fields`).

---

### 6. FINDING-UI-02: Header Island bị che khuất đỉnh dưới thanh Header
* **Loại**: Giao diện (UI).
* **Mức độ**: P3 (Thẩm mỹ).
* **Độ tin cậy**: Cao.
* **Nhãn sửa**: **TỰ SỬA**.
* **Trạng thái**: 🟢 **ĐÃ SỬA & VERIFIED**.
* **Biện pháp khắc phục**:
  - `Dashboard/index.tsx`: Bổ sung khoảng đệm `pt-1.5` trên container chính của Dashboard, giúp bo góc của Header Island và KPI Cards hiển thị thông thoáng, không bị che khuất viền trên.
* **Bằng chứng sau sửa**: [flow03_01_chuctho_dashboard_after.png](file:///c:/Projects/QLCS/docs/qa/screenshots/flow03_01_chuctho_dashboard_after.png).
* **Commit**: `e4f48da` (`fix(ui): [FINDING-UI-02] fix Dashboard header island top spacing`).

---

## Mục Chưa Tái Hiện Được (0 mục)
* Không có lỗi nào trong danh sách nghi ngờ bị thiếu bằng chứng hoặc không tái hiện được. Mọi phát hiện đều đã được tái hiện, sửa chữa triệt để từ nguyên nhân gốc và kiểm chứng trên trình duyệt thực tế.
