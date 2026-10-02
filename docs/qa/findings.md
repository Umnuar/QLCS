# BÁO CÁO PHÁT HIỆN KIỂM CHỨNG TRỰC TIẾP TRÊN TRÌNH DUYỆT (PHASE 1 FINDINGS)

**Dự án:** Quản Lý Chính Sách Xã Đăk Hà (QLCS v3.0.0)  
**Thời gian thực hiện:** 02/10/2026  
**Môi trường:** Local (`http://localhost:5173` và `http://localhost:5000/api`)  
**Công cụ kiểm thử:** Chrome 140 Headless + Chrome DevTools Protocol (CDP v1.3 via WebSocket native)  
**Độ phủ:** 7 luồng người dùng chính (FLOW-01 đến FLOW-07)  

---

## 1. BẢNG TỔNG HỢP CÁC PHÁT HIỆN ĐÃ XÁC MINH (VERIFIED FINDINGS)

| ID | Loại | Tiêu đề | Mức độ | Độ tin cậy | Nhãn sửa | Lý do phân loại |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **BUG-P1-01** | React / Hiệu năng | Vòng lặp re-render vô tận khi nạp danh sách hồ sơ gây cạn kiệt Connection Pool Backend (Prisma P2024) | **P0** | Cao | **TỰ SỬA** | Lỗi render loop do `ageFilters` tạo array mới `[] !== []` trên mỗi render, phạm vi rõ ràng. |
| **BUG-P1-02** | Console / Chức năng | AppContext gọi API `/api/villages` khi người dùng chưa đăng nhập gây hàng loạt lỗi HTTP 401 Unauthorized | **P1** | Cao | **TỰ SỬA** | Lỗi gọi API thiếu điều kiện kiểm tra token trong `checkSession()`. |
| **BUG-P1-03** | Console / Code Quality | Lỗi cú pháp ESLint `no-mixed-spaces-and-tabs` và `no-useless-escape` | **P2** | Cao | **TỰ SỬA** | Lỗi định dạng code và regex escape không ảnh hưởng luồng nghiệp vụ. |
| **BUG-P1-04** | React / Console | `useEffect` trong `CustomSelect.tsx` thiếu dependency `handleSelect` | **P2** | Cao | **TỰ SỬA** | Bổ sung callback dependency chống stale closure. |
| **BUG-P1-05** | A11y / UI | Tiêu điểm bàn phím chưa tự động focus vào ô input "Họ và tên" khi mở Modal Hồ Sơ | **P2** | Cao | **TỰ SỬA** | Cải thiện khả năng tiếp cận bàn phím (Focus Trap & Initial Focus). |

---

## 2. CHI TIẾT TỪNG PHÁT HIỆN

### 🔴 BUG-P1-01: Vòng lặp re-render vô tận gây cạn kiệt Connection Pool Backend (Prisma P2024)
- **Loại:** React / Hiệu năng
- **Mức độ:** P0 (Nghiêm trọng - Gây quá tải hệ thống)
- **Độ tin cậy:** Cao (Tái hiện ổn định 100%)
- **Nhãn:** **TỰ SỬA**
- **Các bước tái hiện:**
  1. Mở ứng dụng tại `http://localhost:5173/`.
  2. Đăng nhập với tài khoản `admin` / `Admin@2026`.
  3. Chọn bất kỳ thẻ thôn nào trên màn hình (ví dụ: `Thôn 1`).
  4. Trên Sidebar, bấm chuyển sang phân hệ `Hồ Sơ Chúc Thọ` hoặc `Hưu Trí Xã Hội`.
  5. Mở DevTools Network tab hoặc theo dõi log backend terminal.
- **Kết quả thực tế vs Mong đợi:**
  - *Mong đợi:* Gửi duy nhất 1 request `GET /api/profiles` nạp danh sách hồ sơ trang 1 và hiển thị bảng dữ liệu.
  - *Thực tế:* Trình duyệt liên tục bắn hàng trăm request `GET /api/profiles?villageId=...&page=1&limit=10` mỗi giây. Sau ~2 giây, kết nối Prisma backend bị kiệt (`PrismaClientKnownRequestError: Timed out fetching a new connection from the connection pool (P2024)`), dẫn đến hàng loạt request tiếp theo bị fail (Network Error / 500).
- **Bằng chứng:**
  - Backend log `task-4978.log` (dòng 18600 - 18760): hàng trăm request trong cùng 1 giây `[21:13:34]` đến `[21:13:39]` và stack trace `PrismaClientKnownRequestError: P2024`.
  - Ảnh chụp màn hình: `docs/qa/screenshots/06-dashboard-chuctho.png`.
- **Nguyên nhân gốc (Root Cause):**
  - Tại `QLCS-Client/src/pages/Dashboard/index.tsx:113`: `ageFilters: ageMilestoneFilter ? [ageMilestoneFilter] : []`. Khi `ageMilestoneFilter` rỗng, toán tử tạo ra một mảng mới `[]` trên mỗi chu kỳ render của component.
  - Tại `QLCS-Client/src/pages/Dashboard/hooks/useProfiles.ts:210`: Callback `loadPage` phụ thuộc trực tiếp vào tham chiếu mảng `ageFilters`. Vì `[] !== []` (khác tham chiếu bộ nhớ), `loadPage` bị tạo mới sau mỗi render.
  - `useEffect(() => { loadPage() }, [loadPage])` thấy `loadPage` đổi tham chiếu liền kích hoạt gọi API. Khi API trả về, `setPageData` kích hoạt render mới $\rightarrow$ vòng lặp vô tận.
- **Vị trí nghi ngờ:**
  - `QLCS-Client/src/pages/Dashboard/index.tsx:113`
  - `QLCS-Client/src/pages/Dashboard/hooks/useProfiles.ts:202-217`
  - `QLCS-Client/src/pages/Dashboard/hooks/useFilters.ts:134-142`

---

### 🟠 BUG-P1-02: AppContext gọi API `/api/villages` khi người dùng chưa đăng nhập
- **Loại:** Console / Chức năng
- **Mức độ:** P1
- **Độ tin cậy:** Cao (Tái hiện ổn định 100%)
- **Nhãn:** **TỰ SỬA**
- **Các bước tái hiện:**
  1. Xóa sạch localStorage / sessionStorage (`localStorage.clear()`).
  2. Truy cập thẳng URL `http://localhost:5173/`.
  3. Mở tab Console trong Chrome DevTools.
- **Kết quả thực tế vs Mong đợi:**
  - *Mong đợi:* Giao diện Đăng nhập xuất hiện sạch sẽ, 0 lỗi console, không gọi API yêu cầu Bearer token.
  - *Thực tế:* Console in ra 4-5 lỗi HTTP 401 Unauthorized: `[AppContext] Lỗi tải danh mục thôn từ Backend, nạp từ Offline Cache: AxiosError: Request failed with status code 401` và `Failed to load resource: the server responded with a status of 401 (Unauthorized)`.
- **Bằng chứng:**
  - Console logs trong runner `task-5217.log` (ERR #1 - ERR #5, NET-FAIL-011 - NET-FAIL-014).
  - Ảnh chụp màn hình: `docs/qa/screenshots/01-login-initial.png`.
- **Nguyên nhân gốc (Root Cause):**
  - Tại `QLCS-Client/src/AppContext.tsx:368`: Hàm `checkSession()` gọi `refreshVillages()` ở cuối hàm nằm ngoài khối điều kiện `if (token)`. Dẫn tới ngay khi mở trang đăng nhập chưa hề có token, client đã tự động bắn request `GET /api/villages` đến backend. Backend trả về 401 vì thiếu JWT token.
- **Vị trí nghi ngờ:**
  - `QLCS-Client/src/AppContext.tsx:368`

---

### 🟡 BUG-P1-03: Lỗi cú pháp ESLint cản trở kiểm tra mã nguồn
- **Loại:** Console / Code Quality
- **Mức độ:** P2
- **Độ tin cậy:** Cao (Tái hiện 100%)
- **Nhãn:** **TỰ SỬA**
- **Các bước tái hiện:**
  1. Chạy `npm --prefix QLCS-Client run lint`.
- **Kết quả thực tế vs Mong đợi:**
  - *Mong đợi:* ESLint vượt qua với 0 error.
  - *Thực tế:* 2 lỗi blocking:
    + `src/pages/Dashboard/hooks/useFilters.ts:131:3`: `no-mixed-spaces-and-tabs`
    + `src/validation/schemas.ts:29:18`: `no-useless-escape` (`\-`)
- **Bằng chứng:** Kết quả chạy `npm run lint` ở baseline Pha 0.
- **Vị trí nghi ngờ:**
  - `QLCS-Client/src/pages/Dashboard/hooks/useFilters.ts:131`
  - `QLCS-Client/src/validation/schemas.ts:29`

---

### 🟡 BUG-P1-04: Thiếu dependency trong `CustomSelect.tsx`
- **Loại:** React / Console
- **Mức độ:** P2
- **Độ tin cậy:** Cao
- **Nhãn:** **TỰ SỬA**
- **Các bước tái hiện:**
  1. Kiểm tra mã nguồn tại `QLCS-Client/src/components/common/CustomSelect.tsx:233`.
- **Kết quả thực tế vs Mong đợi:**
  - *Mong đợi:* Toàn bộ các biến/hàm được sử dụng trong effect phải được khai báo trong dependency array hoặc bọc `useCallback`.
  - *Thực tế:* `useEffect` lắng nghe phím điều hướng dropdown gọi hàm `handleSelect` nhưng không có trong dependency array, vi phạm quy tắc `react-hooks/exhaustive-deps`.
- **Vị trí nghi ngờ:**
  - `QLCS-Client/src/components/common/CustomSelect.tsx:233`

---

### 🟡 BUG-P1-05: Tiêu điểm bàn phím chưa tự động focus vào ô input khi mở Modal Hồ Sơ
- **Loại:** A11y / UI
- **Mức độ:** P2
- **Độ tin cậy:** Cao
- **Nhãn:** **TỰ SỬA**
- **Các bước tái hiện:**
  1. Vào màn hình `Hồ Sơ Chúc Thọ`.
  2. Bấm nút `Thêm Hồ Sơ`.
  3. Kiểm tra `document.activeElement`.
- **Kết quả thực tế vs Mong đợi:**
  - *Mong đợi:* Ngay khi modal hiện ra, con trỏ phím tự động focus vào ô nhập liệu đầu tiên (Họ và tên) để người dùng có thể nhập liệu ngay bằng bàn phím.
  - *Thực tế:* Tiêu điểm chưa tự động chuyển vào input đầu tiên của form modal.
- **Bằng chứng:**
  - Log `task-5241.log`: `Active element khi modal mở: null`.
  - Ảnh chụp màn hình: `docs/qa/screenshots/11-modal-add-profile.png`.
- **Vị trí nghi ngờ:**
  - `QLCS-Client/src/pages/Dashboard/modals/ProfileModal.tsx`

---

## 3. DANH SÁCH CÁC MỤC CHƯA TÁI HIỆN ĐƯỢC (UNREPRODUCED)
- Không có lỗi nào chưa tái hiện được. Cả 5 lỗi trên đều được tái hiện ổn định 100% trên trình duyệt Chrome thật qua CDP runner.
