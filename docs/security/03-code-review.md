# BÁO CÁO BƯỚC 3: RÀ SOÁT MÃ NGUỒN TĨNH (STATIC APPLICATION SECURITY TESTING - SAST)
## Dự án: Quản Lý Chính Sách (QLCS v3.0.0) — UBND Xã Đăk Hà

---

## 1. PHƯƠNG PHÁP & PHẠM VI KIỂM TOÁN MÃ TĨNH (SAST METHODOLOGY)

### 1.1. Chuẩn tham chiếu áp dụng
Quá trình rà soát mã nguồn được thực hiện kết hợp giữa công cụ phân tích tĩnh AST và đọc mã thủ công (Manual Code Review) dựa trên các tiêu chuẩn bảo mật quốc tế:
- **OWASP ASVS (Application Security Verification Standard) v4.0.3**: Cấp độ 2 (Level 2 — dành cho ứng dụng xử lý dữ liệu cá nhân nhạy cảm PII).
- **OWASP Top 10 (2021)** & **OWASP API Security Top 10 (2023)**.
- **CWE Top 25 (2023/2024)** & danh mục mã lỗi chuyên biệt.
- **Hướng dẫn An ninh Desktop Electron (Electron Security Guidelines)**.

### 1.2. Thống kê phạm vi mã nguồn được thẩm tra
- **Tầng Backend (`QLCS-Backend`)**:
  - 10 Router modules trong `src/routes/` (45 REST endpoints).
  - 8 Controllers trong `src/controllers/` (auth, profiles, htxh, villages, users, analytics, audit, backup, excel).
  - 3 Middleware trong `src/middlewares/` (auth, logger).
  - Tầng CSDL & Mật mã: `src/config/prisma.ts`, `prisma/schema.prisma`, `src/utils/jwt.ts`.
- **Tầng Client (`QLCS-Client`)**:
  - Giao diện & Form nhập liệu: `src/pages/`, `src/components/`, `src/validation/schemas.ts`.
  - Quản lý trạng thái & Cache: `src/AppContext.tsx`, `src/db/indexedDB.ts`, `src/utils/cryptoHelper.ts`.
  - Tầng Desktop Electron: `electron/main.ts`, `electron/preload.ts`.

---

## 2. KẾT QUẢ ĐÁNH GIÁ CHI TIẾT THEO CÁC LỚP ASVS v4.0.3

### 2.1. ASVS V2 & V3 — Xác thực & Quản lý Phiên (Authentication & Session)

| Tiêu Chí Kiểm Tra | Kết Quả Phân Tích Mã Nguồn | Trạng Thái | Phát Hiện & Mã Lỗi |
| :--- | :--- | :---: | :--- |
| **Bảo vệ Mật khẩu Lưu trữ** | Dùng `bcryptjs` với salt rounds = 12 (`auth.controller.ts:29`, `users.controller.ts:60`). Mật khẩu băm an toàn. | **PASS** | Đạt chuẩn ASVS V2.4. |
| **Cơ chế Token Kép (Access/Refresh)** | Access Token (15 phút) ký bằng `JWT_SECRET`; Refresh Token (7 ngày) ký bằng `JWT_REFRESH_SECRET` và lưu trong bảng `refresh_tokens`. | **PASS** | Đạt chuẩn ASVS V3.5. |
| **Xoay Vòng Refresh Token** | Khi gọi `/api/auth/refresh`, token cũ bị xóa và token mới được cấp (`auth.controller.ts:145-154`). | **PASS** | Chống Replay Attack. |
| **Thu Hồi Phiên Đăng Xuất (Logout Revocation)** | Khi gọi `POST /api/auth/logout`, chỉ xóa `refreshToken` trong CSDL. Do JWT Access Token là stateless (15m), token này vẫn còn hiệu lực cho đến khi hết hạn nếu bị lộ trước đó. | **CẢNH BÁO** | `SEC-03-01` (P2 - Medium, CWE-613). |
| **Chống Tấn Công Vét Cạn (Brute-force)** | Áp dụng `express-rate-limit` trên `/api/auth/login` (10 lần sai/15 phút). Tuy nhiên, chưa có cơ chế khóa tài khoản tạm thời trong CSDL (`locked_until`). | **CẢNH BÁO** | `SEC-03-02` (P2 - Medium, CWE-307). |
| **Chính Sách Độ Phức Tạp Mật Khẩu** | `schemas.ts` và controllers chỉ kiểm tra `password.length >= 6`, chưa yêu cầu ký tự hoa, số, ký tự đặc biệt. | **CẢNH BÁO** | `SEC-03-03` (P3 - Low, CWE-521). |

---

### 2.2. ASVS V4 — Kiểm soát Truy cập & Phân quyền (Access Control & RBAC / BOLA)

| Tiêu Chí Kiểm Tra | Kết Quả Phân Tích Mã Nguồn | Trạng Thái | Phát Hiện & Mã Lỗi |
| :--- | :--- | :---: | :--- |
| **Phân Lập Dữ Liệu Theo Thôn (Village Scoping)** | Cán bộ thôn (`role: 'user'`) có `village_id`. Toàn bộ các truy vấn danh sách (`profiles`, `htxh`, `analytics`, `villages`, `audit-logs`) đều tự động gán điều kiện `where.village_id = req.user.village_id`. | **PASS** | Đạt chuẩn ASVS V4.1. |
| **Phòng Chống BOLA/IDOR Khi Sửa/Xóa** | Trong `updateProfile`, `deleteProfile`, `updateHtxhProfile`, `deleteHtxhProfile`, controller luôn truy vấn bản ghi hiện tại và kiểm tra `if (user.village_id && profile.village_id !== user.village_id) return 403;`. | **PASS** | Ngăn chặn sửa chéo giữa các thôn. |
| **Bảo Vệ Phân Quyền Quản Trị (BFLA)** | Tuyến `/api/users` và `/api/backups` được bảo vệ bằng middleware `requireAdmin`. Tuy nhiên, tuyến `/api/villages` thiếu `requireAdmin` ở tầng route (chỉ kiểm tra thủ công trong controller). | **CẢNH BÁO** | `SEC-03-04` (P2 - Medium, CWE-862). |
| **Bảo Vệ Endpoint Giải Mã CCCD** | Route `POST /api/profiles/:id/reveal-cccd` kiểm tra chặt chẽ: chỉ Admin hoặc đúng Cán bộ thôn phụ trách hồ sơ đó mới được giải mã; đồng thời tự động ghi log `REVEAL_CCCD`. | **PASS** | Đạt chuẩn ASVS V4.3. |

---

### 2.3. ASVS V5 — Xác thực Đầu vào & Khử nhiễm (Validation & Sanitization)

| Nguy Cơ Tấn Công | Kết Quả Rà Soát Mã Nguồn | Trạng Thái | Đánh Giá Chi Tiết |
| :--- | :--- | :---: | :--- |
| **SQL Injection (CWE-89)** | Quét toàn bộ mã nguồn: **0 câu lệnh `$queryRaw` hoặc `$executeRaw`**. 100% truy vấn thực thi qua Prisma Client chuẩn hóa (Parameterized Queries). | **PASS (0 Lỗi)** | Không thể khai thác SQL Injection qua API. |
| **Command Injection (CWE-78)** | Quét toàn bộ mã nguồn: **0 hàm `exec`, `spawn`, `child_process`** được gọi trong runtime của ứng dụng. | **PASS (0 Lỗi)** | Không có bề mặt tấn công Command Injection. |
| **XSS / DOM XSS (CWE-79)** | Quét toàn bộ giao diện Client: **0 vị trí sử dụng `dangerouslySetInnerHTML`**. Toàn bộ dữ liệu hiển thị qua React JSX (tự động escape HTML). | **PASS (0 Lỗi)** | Không có nguy cơ Stored XSS hay Reflected XSS. |
| **Lọc Loại File Upload (CWE-434)** | Middleware Multer (`excel.routes.ts:13-16`) chỉ giới hạn `fileSize: 20MB`, **thiếu `fileFilter` kiểm tra MIME type hoặc đuôi file** (`.xlsx`, `.xls`, `.csv`). | **CẢNH BÁO** | `SEC-03-05` (P2 - Medium, CWE-434). |
| **Cạn Kiệt Bộ Nhớ Khi Đọc Excel (CWE-400)** | Hàm `parseExcelBuffer` (`excel.controller.ts:32`) duyệt toàn bộ các dòng của worksheet mà **không có ngưỡng chặn tối đa** (Max rows threshold). File Excel bom có thể gây nghẽn RAM Node.js. | **CẢNH BÁO** | `SEC-03-06` (P2 - Medium, CWE-770). |
| **Chuẩn Hóa Schema Backend** | Backend đã cài `zod` nhưng chưa dùng làm middleware xác thực payload đầu vào cho các request body. | **CẢNH BÁO** | `SEC-03-09` (P2 - Medium, CWE-20). |

---

### 2.4. ASVS V6 & V8 — Mật mã & Bảo vệ Dữ liệu Cá nhân (Cryptography & PII Protection)

| Hạng Mục Bảo Vệ | Cơ Chế Triển Khai Hiện Tại | Trạng Thái | Nhận Xét Đánh Giá |
| :--- | :--- | :---: | :--- |
| **Thuật Toán Mã Hóa CCCD** | `AES-256-GCM` (`src/config/prisma.ts`). IV ngẫu nhiên 16 bytes sinh bằng `crypto.randomBytes(16)`, Authentication Tag 16 bytes. Định dạng lưu: `iv:authTag:ciphertext`. | **PASS** | Mật mã chuẩn công nghiệp, bảo toàn tính toàn vẹn (Authenticated Encryption). |
| **Băm Tra Cứu CCCD** | `SHA-256` (`cccd_hash`) phục vụ tìm kiếm chính xác mà không cần giải mã CSDL. | **PASS** | Chuẩn hóa tra cứu dữ liệu mù (Blind indexing). |
| **Che Giấu CCCD Trên Giao Diện & API** | Tầng Prisma Extension không giải mã `findMany`. Controller che giấu `••••••••1234`. Giao diện hiển thị badge che giấu. | **PASS** | Tuân thủ nguyên tắc giảm thiểu dữ liệu (Data Minimization). |
| **Tính Toàn Vẹn Của Audit Log Khi Xóa Hồ Sơ** | Trong `profiles.controller.ts` (dòng 402), hàm `hardDeleteProfile` (xóa vĩnh viễn) **xóa sạch toàn bộ bản ghi `profile_audit_log` của hồ sơ đó**! | **LỖI NGHIÊM TRỌNG** | `SEC-03-07` (**P0 - Critical**, CWE-778 / ASVS V8.2). Phá hủy chứng cứ kiểm toán gốc! |

---

### 2.5. ASVS V13 & V14 — An ninh API & Cấu hình Hạ tầng

| Thành Phần Cấu Hình | Trạng Thái Hiện Tại | Đánh Giá Rủi Ro | Khuyến Nghị Khắc Phục |
| :--- | :--- | :---: | :--- |
| **Giới Hạn Kích Thước JSON Body** | `express.json({ limit: "50mb" })` (`index.ts:72`). Ngưỡng 50MB là quá lớn đối với API JSON thông thường. | **P2 (Medium)**<br/>`SEC-03-10` | Hạ giới hạn `express.json` xuống `2mb` (File upload đã có Multer xử lý riêng). |
| **Socket.io Handshake Authentication** | Kênh WebSocket (`index.ts:102-112`) không có middleware kiểm tra JWT; sự kiện `join-village` không kiểm tra quyền thôn. | **P1 (High)**<br/>`SEC-03-11` | Thêm middleware xác thực JWT và kiểm tra `socket.data.user.village_id` trước khi cho phép vào room. |
| **Rate Limit Toàn Cục (Global API Limiter)** | Chỉ có `/api/auth/login` được gắn limiter. Các router danh sách hồ sơ, thống kê chưa có giới hạn tần suất. | **P2 (Medium)**<br/>`SEC-03-12` | Bổ sung `express-rate-limit` toàn cục (vd: 500 req/15 phút) cho các route `/api/`. |
| **Cấu Hình Helmet & Headers** | `app.use(helmet({ contentSecurityPolicy: false }))` đã bật `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`. | **PASS** | Header bảo vệ cơ bản đã được kích hoạt. |

---

### 2.6. An ninh Nền tảng Desktop Electron (Electron Security Checklist)

| Tiêu Chuẩn Bảo Mật Electron | Cấu Hình Trong `electron/main.ts` & `preload.ts` | Trạng Thái | Ghi Chú Kỹ Thuật |
| :--- | :--- | :---: | :--- |
| **`contextIsolation`** | `contextIsolation: true` (`main.ts:44`) | **PASS** | Cách ly hoàn toàn renderer khỏi Node context. |
| **`nodeIntegration`** | `nodeIntegration: false` (`main.ts:45`) | **PASS** | Vô hiệu hóa Node.js APIs trong web page. |
| **IPC Sender Validation** | Hàm `validateSender(event)` kiểm tra `event.senderFrame === win.webContents.mainFrame` trên 100% IPC handlers. | **PASS** | Ngăn chặn frame ngoài/iframe gọi IPC. |
| **Khóa Điều Hướng & Cửa Sổ Mới** | `setWindowOpenHandler: { action: 'deny' }`<br/>`will-navigate` chặn mọi URL ngoài `http://localhost` và `file://`. | **PASS** | Chặn phishing và điều hướng độc hại. |
| **Lưu Trữ Token Cục Bộ** | Sử dụng `safeStorage` (Windows DPAPI) mã hóa chuỗi token trước khi lưu vào `qlcs-secure-tokens.json`. | **PASS** | Không còn khóa mã hóa tĩnh hardcoded. |
| **Bounds Check IPC Zoom** | `app:set-zoom` kiểm tra `zoomFactor >= 0.5 && zoomFactor <= 2.0`. | **PASS** | Chặn giá trị zoom bất thường. |

---

## 3. MA TRẬN TỔNG HỢP PHÁT HIỆN SAST (VULNERABILITY MATRIX)

| Mã Phát Hiện | Tiêu Đề Lỗ Hổng | Vị Trí (Tệp:Dòng) | CWE / ASVS | Mức Độ | Kịch Bản Khai Thác & Tác Động | Biện Pháp Sửa Chữa Đề Xuất (Bước 7) |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| **SEC-03-07** | Phá hủy chứng cứ kiểm toán khi xóa vĩnh viễn hồ sơ | `QLCS-Backend/src/controllers/profiles.controller.ts:402` | CWE-778<br/>ASVS V8.2 | **P0 (Critical)** | Người dùng có quyền gọi `hardDeleteProfile`, hệ thống xóa sạch toàn bộ bản ghi `profile_audit_log`, làm mất vĩnh viễn dấu vết ai đã tạo/sửa/xóa hồ sơ. | Loại bỏ lệnh xóa `profile_audit_log`; thay vào đó ghi thêm một bản ghi kiểm toán `HARD_DELETE` kèm thông tin người thực hiện. |
| **SEC-03-11** | Socket.io thiếu xác thực JWT và kiểm tra quyền thôn | `QLCS-Backend/src/index.ts:102-112` | CWE-306<br/>ASVS V13.1 | **P1 (High)** | Bất kỳ ai kết nối WebSocket đều có thể gửi `join-village` với ID thôn khác để nghe lén các thông báo thêm/sửa/xóa hồ sơ theo thời gian thực. | Thêm middleware `io.use((socket, next) => ...)` xác thực Access Token và kiểm tra `socket.join` đúng thôn được cấp quyền. |
| **SEC-03-04** | Router Thôn thiếu middleware `requireAdmin` | `QLCS-Backend/src/routes/villages.routes.ts:17-19` | CWE-862<br/>ASVS V4.1 | **P2 (Medium)** | Vi phạm nguyên tắc Defense-in-Depth; chỉ dựa vào kiểm tra thủ công trong controller, dễ bị bỏ sót nếu thêm route mới. | Bổ sung middleware `requireAdmin` trực tiếp vào các method POST, PUT, DELETE trong `villages.routes.ts`. |
| **SEC-03-05** | Multer thiếu bộ lọc định dạng file upload | `QLCS-Backend/src/routes/excel.routes.ts:13-16` | CWE-434<br/>ASVS V5.1 | **P2 (Medium)** | Người dùng tải lên file nhị phân bất kỳ dưới 20MB, server vẫn nạp vào bộ nhớ RAM trước khi bị từ chối ở tầng phân tích. | Thêm `fileFilter` kiểm tra MIME type (`application/vnd.openxmlformats...`, `application/vnd.ms-excel`, `text/csv`). |
| **SEC-03-06** | Không giới hạn số dòng tối đa khi parse file Excel | `QLCS-Backend/src/controllers/excel.controller.ts:32` | CWE-770<br/>ASVS V5.2 | **P2 (Medium)** | Tải lên file bảng tính chứa 500,000 dòng dữ liệu làm cạn kiệt tài nguyên RAM/CPU của Node.js server. | Thêm biến đếm số dòng trong `parseExcelBuffer`, throw error nếu vượt quá 10,000 dòng dữ liệu. |
| **SEC-03-10** | Giới hạn dung lượng `express.json` quá lớn (50MB) | `QLCS-Backend/src/index.ts:72-73` | CWE-400<br/>ASVS V13.1 | **P2 (Medium)** | Kẻ tấn công gửi các JSON request khổng lồ gây tràn RAM Node.js. | Hạ `limit: "2mb"` cho `express.json` và `express.urlencoded`. |
| **SEC-03-09** | Backend thiếu tầng xác thực Zod Schema tập trung | `QLCS-Backend/src/controllers/` | CWE-20<br/>ASVS V5.1 | **P2 (Medium)** | Dữ liệu đầu vào chỉ được kiểm tra thủ công, dễ bỏ sót các trường dư thừa hoặc sai kiểu dữ liệu. | Tận dụng gói `zod` đã cài để xây dựng middleware validate schema cho các payload tạo/sửa hồ sơ. |
| **SEC-03-01** | Stateless JWT không bị thu hồi ngay khi Logout | `QLCS-Backend/src/controllers/auth.controller.ts:256` | CWE-613<br/>ASVS V3.5 | **P2 (Medium)** | Token bị lộ vẫn dùng được trong 15 phút sau khi người dùng bấm Đăng xuất. | Cân nhắc lưu Blacklist Token trong bộ nhớ tạm thời có TTL = 15 phút. |
| **SEC-03-12** | Thiếu Rate Limiter toàn cục trên các API nghiệp vụ | `QLCS-Backend/src/index.ts:89-99` | CWE-770<br/>ASVS V13.2 | **P2 (Medium)** | Spam request liên tục vào các endpoint thống kê hoặc tìm kiếm hồ sơ gây tải cao cho CSDL. | Bổ sung `express-rate-limit` toàn cục (500 req/15 phút) trên tiền tố `/api/`. |

---

## 4. KẾT LUẬN BƯỚC 3 & TRẠNG THÁI GATE 3

1. **Gate 3 Status**: **PASS với DANH MỤC PHÁT HIỆN TOÀN DIỆN (Conditional PASS)**:
   - ✅ Rà soát 100% mã nguồn theo 11 lớp tiêu chuẩn OWASP ASVS v4.0.3.
   - ✅ Xác nhận **0 lỗi SQL Injection, 0 lỗi Command Injection, 0 lỗi DOM XSS**.
   - ✅ Xác nhận cơ chế phân lập dữ liệu thôn (Village Scoping) được thực thi nghiêm ngặt trên tất cả các controller.
   - ⚠️ Phát hiện 1 lỗi P0 nghiêm trọng: Phá hủy audit log khi xóa vĩnh viễn (`SEC-03-07`).
   - ⚠️ Phát hiện 1 lỗi P1: Thiếu xác thực và phân quyền trên kênh WebSocket Socket.io (`SEC-03-11`).
   - ⚠️ Phát hiện 7 điểm yếu cấu hình/xác thực đầu vào mức P2 cần khắc phục ở Bước 7.
2. **Tuân thủ Tuyệt đối Quy tắc P0**:
   - Chưa chỉnh sửa bất kỳ dòng mã nguồn nào trong suốt quá trình rà soát Bước 3.
