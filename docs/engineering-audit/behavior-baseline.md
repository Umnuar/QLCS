# BEHAVIOR BASELINE: QLCS (HỆ THỐNG QUẢN LÝ CHÍNH SÁCH XÃ ĐĂK HÀ)

## 1. TỔNG QUAN KIẾN TRÚC & TOPOLOGY

```
+-----------------------------------------------------------------------------------+
| CLIENT LAYER (c:\Projects\QLCS\QLCS-Client)                                      |
| - Electron 42 Thin-Client (Single Instance Lock, CSP connect-src, Zoom IPC)       |
| - React 18 + Vite 5 + TailwindCSS v4 (Dark/Light mode via .dark class)            |
| - Navigation: AppLayout (Header + ConnectionBanner + Sidebar + Dynamic Tab)       |
| - State & Storage: AppContext, SecureStorage (electron-store / localStorage)      |
| - Offline Capability: IndexedDB Read-Cache + Heartbeat Monitor (ping 6s)          |
+------------------------------------------+----------------------------------------+
                                           | HTTP / REST (JWT Bearer Token)
                                           v
+-----------------------------------------------------------------------------------+
| BACKEND LAYER (c:\Projects\QLCS\QLCS-Backend)                                     |
| - Node.js + Express + TypeScript (Port 5000 / qlcs.dulieudakha.vn)                 |
| - Auth: JWT Access Token (15m) + Refresh Token (7d) rotation                      |
| - Security: AES-256-GCM PII encryption (CCCD), SHA-256 hash, rate limiting        |
| - Data Concurrency: Optimistic Concurrency Control (OCC) via `version` (409)      |
| - Logging: ANSI Color Request Logger Middleware + Trust Proxy Cloudflare Tunnel   |
+------------------------------------------+----------------------------------------+
                                           | Prisma ORM (Connection Pooler & Direct)
                                           v
+-----------------------------------------------------------------------------------+
| PERSISTENCE LAYER (Supabase PostgreSQL)                                           |
| - Tables: villages, users, profiles (Chúc thọ), htxh_profiles, profile_audit_log, |
|           settings, stats_cache                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. ĐẶC TẢ CHI TIẾT 6 MÀN HÌNH NGHIỆP VỤ & CÁC LUỒNG THAO TÁC

### 2.1. Màn hình 1: Quản Lý Thôn & Địa Bàn (`VillagesPage.tsx`)
- **Vai trò**: Cán bộ Xã (`admin`).
- **Luồng hoạt động**:
  - Tải danh sách 7 thôn từ `GET /api/villages` kèm số lượng đối tượng chính sách.
  - 4 Thẻ KPI đầu trang: Tổng đối tượng toàn xã, Đã nhận quà, Chưa nhận quà, Tỷ lệ hoàn thành.
  - Khi click vào 1 thẻ thôn: Lưu `selectedVillageId` vào Context và chuyển sang `analytics` hoặc `chuctho` của thôn đó.
  - Nút "Xem Báo Cáo Đối Soát": Chuyển sang tab `analytics` với `selectedVillageId = ''` (toàn xã).

### 2.2. Màn hình 2: Quản Lý Hồ Sơ Chúc Thọ & Hưu Trí Xã Hội (`Dashboard/index.tsx`)
- **Vai trò**: Cán bộ Xã (`admin`) hoặc Trưởng Thôn (`user`).
- **Bố cục**: 1 cột Full-width, gồm:
  - Header Island: Tiêu đề thôn làm việc, nút `← Đổi thôn` (cho Admin), cụm nút `[📄 Nhập Excel]`, `[📥 Xuất Excel]`, `[+ Thêm Hồ Sơ]`.
  - Stats Cards: 4 thẻ thống kê số liệu của chế độ đang chọn (Chúc Thọ hoặc HTXH).
  - ProfileFilterBar: Ô tìm kiếm tiếng Việt không dấu (debounce 300ms), Dropdown chọn Trạng thái nhận quà, Dropdown chọn Mốc tuổi tròn Chúc Thọ (60, 65, 70, 75, 80, 85, 90, 95, 100, >100) hoặc 6 diện HTXH, Bộ chọn năm tính toán `YearSelector`.
  - MainTable: Bảng phẳng ghim 3 cột đầu (`STT`, `Phân loại`, `Họ và tên`) và cột cuối `Hành động`, `whitespace-nowrap`, ẩn số CCCD `••••••••1234` có nút mắt xem giải mã.
  - Drawer Slide-Over (`ProfileModal.tsx`): Form nhập liệu trượt từ cạnh phải, validation họ tên, ngày sinh, tính tự động mốc tuổi tròn theo năm tính toán, lưu với OCC `version`.
  - TablePagination: Chọn số dòng (10, 20, 50, 100 dòng/trang), nút Trang trước/Trang sau.

### 2.3. Màn hình 3: Thống Kê & Báo Cáo Đối Soát (`AnalyticsPage.tsx`)
- **Luồng hoạt động**:
  - `GET /api/analytics/overview`: Tổng hợp số liệu Chúc thọ, HTXH toàn xã hoặc theo thôn lọc.
  - Biểu đồ phân bố 10 mốc tuổi tròn và 6 diện HTXH.
  - Biểu đồ tròn MiniDonut: Tỷ lệ Nam/Nữ và Dân tộc (Kinh, Ba Na, Xơ Đăng, Ja Rai...).
  - Bảng đối soát số liệu so sánh giữa 7 thôn (Chúc Thọ, HTXH, Tỷ lệ hoàn thành).

### 2.4. Màn hình 4: Thùng Rác & Phục Hồi Dữ Liệu (`RecycleBinPage.tsx`)
- **Luồng hoạt động**:
  - Danh sách các hồ sơ bị xóa mềm (`is_deleted = true`).
  - Nút **Khôi phục**: Đưa hồ sơ trở lại danh sách hoạt động, ghi log audit.
  - Nút **Xóa vĩnh viễn**: Chỉ Admin thấy, yêu cầu xác nhận cảnh báo nguy hiểm trước khi xóa khỏi CSDL.

### 2.5. Màn hình 5: Nhật Ký Biến Động / Kiểm Toán (`AuditLogPage.tsx`)
- **Vai trò**: Cán bộ Xã (`admin`).
- **Luồng hoạt động**:
  - `GET /api/audit-logs`: Lấy lịch sử biến động từ `profile_audit_log`.
  - Bộ lọc: Lọc theo Thôn, theo Cán bộ thực hiện, theo Hành động (Thêm mới, Cập nhật, Xóa, Khôi phục).
  - Visual Diff tiếng Việt: Hiển thị trường dữ liệu thay đổi (Ví dụ: `Địa chỉ: Thôn 1 ➡️ Thôn 2`).

### 2.6. Màn hình 6: Cài Đặt Hệ Thống & Cán Bộ (`Settings/index.tsx`)
- **5 Tab chuẩn hóa**:
  1. `Tài Khoản Của Tôi`: Thông tin tài khoản, đổi mật khẩu cá nhân.
  2. `Quản Lý Cán Bộ Thôn` (Admin): Danh sách tài khoản cán bộ 7 thôn, thêm tài khoản mới, phân công thôn phụ trách, reset mật khẩu.
  3. `Sao Lưu CSDL`: Xuất snapshot JSON CSDL, khôi phục CSDL từ file JSON có cảnh báo.
  4. `Thông Tin Đơn Vị & Hệ Thống`: Đơn vị UBND Xã, Huyện Đăk Hà, Tỉnh Kon Tum, thông tin bản quyền.
  5. `Cài Đặt Thời Gian & Năm Tính Tuổi`: Cấu hình `globalCalculationYear` đồng bộ toàn hệ thống.

---

## 3. PHÂN ĐỊNH RẠCH RÒI HÀNH VI ỨNG DỤNG

### 3.1. Hành Vi Mong Muốn (Existing Intended Behavior - BẮT BUỘC BẢO TỒN)
1. **Tính mốc tuổi tròn**: Mốc tuổi chúc thọ được tính tự động từ `Năm Tính Toán - Năm Sinh`. Các mốc tuổi tròn chuẩn: 60, 65, 70, 75, 80, 85, 90, 95, 100, và trên 100 tuổi.
2. **6 Diện Hưu Trí Xã Hội**: `age75plus`, `age70to74poor`, `bao_tro`, `huu_tri`, `huu_tuat_bao_hiem`, `nguoi_co_cong`.
3. **Mã hóa CCCD**: Số CCCD bắt buộc được mã hóa AES-256-GCM trong CSDL, hash SHA-256 phục vụ tìm kiếm, trên giao diện che 8 số đầu (`••••••••1234`), chỉ giải mã khi người dùng bấm icon xem.
4. **Phân quyền vai trò (RBAC)**:
   - `admin`: Xem toàn xã, quản lý thôn, quản lý tài khoản, xem audit log, sao lưu/khôi phục, xóa vĩnh viễn.
   - `user` (Trưởng thôn): Chỉ xem và quản lý hồ sơ thuộc phạm vi thôn mình được phân công (`village_id`).
5. **Khóa lạc quan (OCC)**: Mọi thao tác cập nhật hồ sơ bắt buộc kiểm tra trường `version`. Nếu `version` gửi lên không khớp với CSDL, backend trả về HTTP 409 Conflict để tránh ghi đè dữ liệu đồng thời.
6. **Phiên làm việc**: Tự động đăng xuất sau 30 phút không có tương tác người dùng (`useInactivityTimeout`).
7. **Offline-First**: Nạp cache tức thì từ IndexedDB khi mở trang hoặc mất mạng; hiển thị `ConnectionBanner` màu vàng khi ngắt kết nối và tự động ẩn khi kết nối lại.

### 3.2. Lỗi & Điểm Nghẽn Đã Ghi Nhận (Known Issues / Target Findings)
1. **Thiếu IPC Sender Validation ở Main Process**: Handler IPC trong `electron/main.ts` chưa xác thực `event.senderFrame` để chặn tấn công từ frame độc hại.
2. **Nghẽn hiệu năng khi tải 23,000+ bản ghi**: Bảng `MainTable` render danh sách DOM lớn có thể gây lag nếu không có Virtualization hoặc Offset Pagination chuẩn hóa.
3. **Thiếu kiểm thử Failure Path tự động**: Chưa có kiểm thử tự động cho các tình huống ngắt kết nối mạng giữa chừng khi import Excel hoặc submit form.
4. **Cần hoàn thiện độ phủ Unit Test cho các Controller mới**: Các controller `analytics`, `audit`, `backup`, `users` mới bổ sung cần thêm integration test cases.

### 3.3. Hành Vi Chưa Rõ Cần Làm Rõ (Unclear Behavior)
1. **Chính sách xóa bản sao lưu tự động**: Snapshot JSON tự động lúc 02:00 AM được lưu trữ trong bao lâu trước khi tự động dọn dẹp để tránh đầy đĩa.
2. **Quy định chuyển thôn giữa các đối tượng chính sách**: Khi một đối tượng chuyển từ Thôn 1 sang Thôn 2, quyền truy cập của Trưởng thôn 1 sẽ mất ngay lập tức hay vẫn lưu vết lịch sử trong hồ sơ cũ.
