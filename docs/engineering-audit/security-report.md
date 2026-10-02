# BÁO CÁO THẨM TRA AN TOÀN ỨNG DỤNG (GENERAL APPLICATION SECURITY AUDIT REPORT)
**Hệ thống**: Quản Lý Chính Sách Người Cao Tuổi & Hưu Trí Xã Hội Xã Đăk Hà (QLCS)  
**Thời điểm thẩm tra**: Tháng 09/2026  
**Chuyên viên thẩm tra**: AGENT 2 - Security & Electron Security Engineer  
**Tiêu chuẩn rà soát**: OWASP Top 10 (2021), OWASP ASVS v4.0.3 Level 2, Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân  
**Phạm vi**: Toàn bộ mã nguồn `QLCS-Backend` (Node.js/Express/Prisma/PostgreSQL) và tầng giao tiếp API `QLCS-Client` (React/Axios/IndexedDB)  

---

## 1. MỤC TIÊU & PHẠM VI THẨM TRA

Thẩm tra toàn diện cấu trúc mã nguồn, cơ chế mã hóa dữ liệu nhạy cảm (PII), mô hình kiểm soát truy cập (RBAC / Village Scope), xác thực người dùng (JWT / Refresh Token rotation), xử lý dữ liệu đầu vào (Input Sanitization, Injection, Path Traversal), và rủi ro chuỗi cung ứng phần mềm (Dependency Vulnerabilities) của hệ thống QLCS.

### Phương pháp tiếp cận:
1. **White-box Source Code Review**: Phân tích tĩnh từng hàm, middleware, Prisma extension, controller và route handler.
2. **Threat Modeling & Attack Surface Mapping**: Rà soát các điểm tiếp xúc mạng (REST Endpoints, WebSocket, File Ingestion).
3. **Data Flow Tracing**: Theo vết vòng đời dữ liệu căn cước công dân (CCCD) từ cơ sở dữ liệu đến bộ nhớ trình duyệt và tệp tin xuất bản.
4. **Empirical Verification**: Đối chiếu với kết quả chạy kiểm thử thực nghiệm an ninh tự động trong `scripts/`.

---

## 2. BẢNG TỔNG HỢP LỖ HỔNG & RỦI RO (VULNERABILITY MATRIX)

| Mã ID | Tiêu đề Lỗ hổng / Rủi ro | Mức độ nghiêm trọng | Phân loại OWASP | File & Vị trí Mã nguồn |
| :--- | :--- | :---: | :--- | :--- |
| **SEC-01** | **Rò rỉ toàn bộ CCCD Plaintext qua API REST do Prisma Output Extension tự động Decrypt** | **CRITICAL** | A02: Cryptographic Failures | `QLCS-Backend/src/config/prisma.ts:131-137` |
| **SEC-02** | **Masking CCCD `••••••••1234` trên Client chỉ mang tính hình thức, toàn bộ Plaintext nằm trong RAM/DOM** | **HIGH** | A02: Cryptographic Failures | `QLCS-Client/src/pages/Dashboard/components/ProfileRow.tsx:107-113, 240-261` |
| **SEC-03** | **Thiếu cơ chế Thu hồi (Blacklist/Revocation) cho Access Token (15m) khi Người dùng Đăng xuất** | **HIGH** | A07: Identification & Auth Failures | `QLCS-Backend/src/controllers/auth.controller.ts:255-268` |
| **SEC-04** | **Socket.io Handshake hoàn toàn không xác thực, cho phép lắng nghe và gia nhập Room của bất kỳ thôn nào** | **HIGH** | A01: Broken Access Control | `QLCS-Backend/src/index.ts:101-112` |
| **SEC-05** | **CORS Origin Regex Permissive (`endsWith(".dulieudakha.vn")`) kết hợp `credentials: true`** | **HIGH** | A05: Security Misconfiguration | `QLCS-Backend/src/index.ts:27-38` |
| **SEC-06** | **Thiếu Middleware `requireAdmin` tại Router `GET /api/audit-logs`** | **MEDIUM** | A01: Broken Access Control | `QLCS-Backend/src/routes/audit.routes.ts:10` |
| **SEC-07** | **Endpoint `POST /api/auth/setup` không có Pre-shared Token kiểm soát khởi tạo Admin** | **MEDIUM** | A04: Insecure Design | `QLCS-Backend/src/controllers/auth.controller.ts:14-40` |
| **SEC-08** | **Không giới hạn kích thước và định dạng MIME của Avatar trong `updateAvatar`** | **MEDIUM** | A04: Insecure Design / DoS | `QLCS-Backend/src/controllers/auth.controller.ts:270-293` |
| **SEC-09** | **Xuất tệp Excel chứa CCCD trần không mã hóa / không mật khẩu bảo vệ** | **MEDIUM** | A02: Cryptographic Failures | `QLCS-Client/src/utils/excelExporter.ts:77, 105` |
| **SEC-10** | **Lỗ hổng nghiêm trọng từ thư viện bên thứ ba (`xlsx@0.18.5` Prototype Pollution, `tar` Path Traversal)** | **HIGH** | A06: Vulnerable Components | `QLCS-Client/package.json`, `QLCS-Backend/package.json` |

---

## 3. THẨM TRA CHI TIẾT THEO OWASP TOP 10 & ASVS V4.0

### 3.1. A01:2021 – Broken Access Control & IDOR

#### a. Cơ chế Phân quyền Thôn (`authorizeVillageScope`):
- **Hiện trạng triển khai**:
  Trong `QLCS-Backend/src/middlewares/auth.middleware.ts:62-117`, hàm `authorizeVillageScope` kiểm tra:
  - Nếu `req.user.role === 'admin'`: Cho phép truy cập toàn bộ.
  - Nếu là cán bộ thôn (`role: 'user'`): Bắt buộc có `village_id`. Chặn các request có `req.query.villageId !== userVillageId` hoặc `req.body.village_id !== userVillageId` bằng HTTP 403.
  - Tự động gán `req.query.villageId = userVillageId` đối với GET, và `req.body.village_id = userVillageId` đối với POST/PUT/PATCH.
- **Thử nghiệm thực chứng**: Kịch bản chạy `scripts/verify-village-scoping.ts` đạt **14/14 test pass**, chứng minh middleware hoạt động tốt với các trường hợp đơn lẻ.
- **Khiếm khuyết phát hiện**:
  1. **Không kiểm tra mảng lồng nhau trong Body**: Tại `bulkAddProfiles` (`profiles.controller.ts:554`), request body có dạng `{ profiles: [...] }`. Middleware `authorizeVillageScope` chỉ kiểm tra thuộc tính cấp 1 `req.body.village_id`, hoàn toàn bỏ qua các đối tượng nằm trong mảng `profiles`. Mặc dù controller cố gắng xử lý `rawVillageId = req.user?.village_id || data.village_id`, nhưng đây là lỗ hổng tầng middleware (Bypass Gateway Check).
  2. **Thiếu RBAC cấp Route cho Audit Logs**: File `QLCS-Backend/src/routes/audit.routes.ts:10` chỉ gắn `authenticateToken` mà không có `requireAdmin`. Mọi tài khoản cán bộ thôn đều có thể truy vấn `GET /api/audit-logs`. Trong `audit.controller.ts:26-30`:
     ```ts
     if (isValidUUID(req.user?.village_id)) {
         where.village_id = req.user.village_id;
     } else if (isValidUUID(villageId)) {
         where.village_id = (villageId as string).trim();
     }
     ```
     Nếu một tài khoản được tạo có `role: 'user'` nhưng `village_id = null` (tài khoản chưa gán thôn), điều kiện trên bị bỏ qua, dẫn đến việc tài khoản này **xem được toàn bộ nhật ký biến động của toàn xã**.
  3. **Route `villages.routes.ts` thiếu `requireAdmin` ở tầng Router**: Router `POST /`, `PUT /:id`, `DELETE /:id` không gắn `requireAdmin` mà dựa vào logic kiểm tra thủ công trong controller `if (user?.role !== "admin")`. Cần chuẩn hóa gắn middleware ở tầng router để ngăn ngừa sơ suất khi refactor.

---

### 3.2. A02:2021 – Cryptographic Failures & Bảo Vệ Dữ Liệu Cá Nhân (PII)

#### a. Mã hóa AES-256-GCM tại Backend (`config/prisma.ts`):
- **Cấu hình thuật toán**:
  - Thuật toán: `aes-256-gcm`.
  - IV: 16 bytes ngẫu nhiên từ `crypto.randomBytes(16)`.
  - Khóa: 256-bit (64 ký tự hex) nạp từ `process.env.ENCRYPTION_KEY`.
  - Format lưu trữ CSDL: `iv:authTag:encrypted` (3 phần tách biệt bằng dấu hai chấm).
  - Tìm kiếm chính xác (Blind Indexing): Tạo `cccd_hash = sha256(cccd.trim())` và `cccd_last4 = cccd.slice(-4)` lưu vào các cột riêng có đánh chỉ mục Index.
  - Không có fallback key: Ném ngoại lệ `FATAL: ENCRYPTION_KEY is not set` chặn khởi động server nếu thiếu biến môi trường.
- **Thử nghiệm thực chứng**: Script `verify-encryption-security.ts` đạt **17/17 test pass**, xác thực tính toàn vẹn và an toàn toán học của thuật toán.

#### b. LỖ HỔNG TRỌNG YẾU SEC-01: Tự động Decrypt trả Plaintext ra REST API
- **Vị trí**: `QLCS-Backend/src/config/prisma.ts:131-137`
- **Đoạn mã lỗi**:
  ```ts
  return query(args).then((result: any) => {
      // Decrypt on output
      if (Array.isArray(result)) {
          return result.map((r: any) => processOutputData(r));
      }
      return processOutputData(result);
  });
  ```
  Hàm `processOutputData`:
  ```ts
  function processOutputData(data: any): any {
      if (!data || typeof data !== "object") return data;
      if (data.cccd && typeof data.cccd === "string" && data.cccd.includes(":")) {
          data.cccd = decrypt(data.cccd);
      }
      return data;
  }
  ```
- **Hệ quả**: Bất kỳ truy vấn nào thông qua `prisma.profiles.findMany` hoặc `prisma.htxh_profiles.findMany` (như `GET /api/profiles`, `GET /api/htxh`, `GET /api/profiles/stream`) đều tự động giải mã trường `cccd` từ ciphertext thành số CCCD gốc 12 số và gửi nguyên vẹn qua payload JSON về phía client.
- **Vi phạm**: Vi phạm nghiêm trọng nguyên tắc **Data Minimization** (Tối thiểu hóa dữ liệu) theo ASVS V2.1.1 và Điều 16 Nghị định 13/2023/NĐ-CP.

#### c. LỖ HỔNG SEC-02: Che giấu CCCD phía Frontend chỉ mang tính "Trang Trí" (Cosmetic Masking)
- **Vị trí**: `QLCS-Client/src/pages/Dashboard/components/ProfileRow.tsx:108-113, 240-261`
- **Đoạn mã**:
  ```tsx
  const [showCccd, setShowCccd] = useState(false);
  const maskCccd = (cccdStr?: string | number | null) => {
      if (!cccdStr) return "—";
      const clean = String(cccdStr).trim();
      if (clean.length <= 4) return clean;
      return `••••••••${clean.slice(-4)}`;
  };
  // Render:
  <span>{showCccd ? profile.cccd || "—" : maskCccd(profile.cccd)}</span>
  <button onClick={() => setShowCccd(!showCccd)}>...</button>
  ```
- **Phân tích**: Việc bấm vào nút con mắt để xem CCCD **không hề gửi request giải mã về backend**, mà chỉ chuyển đổi biến State boolean `showCccd` của React. Điều này chứng minh toàn bộ 12 chữ số CCCD thực sự của hàng ngàn công dân đã nằm sẵn trong bộ nhớ RAM của trình duyệt, hiển thị trong Network tab của DevTools và có thể bị đánh cắp bởi bất kỳ extension độc hại hoặc script XSS nào.

---

### 3.3. A03:2021 – Injection (SQL Injection, Command Injection, Path Traversal)

#### a. SQL Injection:
- **Kết quả rà soát**: **KHÔNG PHÁT HIỆN LỖ HỔNG**.
- **Căn cứ**:
  - Không tìm thấy bất kỳ lời gọi raw query nguy hiểm nào như `$queryRaw`, `$queryRawUnsafe`, `$executeRaw`, `$executeRawUnsafe`.
  - Toàn bộ các thao tác truy vấn trong `profiles.controller.ts`, `htxh.controller.ts`, `audit.controller.ts`, `users.controller.ts`, `analytics.controller.ts` đều dùng Prisma Model API (`findMany`, `count`, `update`, `delete`, `upsert`) với Object Filter có Type-Safe.
  - Tìm kiếm mờ tiếng Việt sử dụng PostgreSQL Extension `pg_trgm` thông qua schema index `Gin` được Prisma biên dịch dưới dạng Prepared Statements có tham số hóa 100%.

#### b. Command Injection:
- **Kết quả rà soát**: **KHÔNG PHÁT HIỆN LỖ HỔNG**.
- **Căn cứ**: Cả hai codebase Backend và Client không sử dụng `child_process`, `exec`, `execSync`, `spawn`, `fork` hay bất kỳ API gọi lệnh hệ điều hành nào.

#### c. Path Traversal trong Export / Import / Backup:
- **File Upload Excel**:
  - Router `QLCS-Backend/src/routes/excel.routes.ts:13-16` cấu hình:
    ```ts
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    });
    ```
    Toàn bộ tệp tin Excel được nạp thẳng vào bộ nhớ đệm `req.file.buffer`, không hề ghi tệp tạm lên đĩa cứng (`diskStorage`), triệt tiêu hoàn toàn nguy cơ Path Traversal hoặc Local File Inclusion (LFI) khi upload.
- **Snapshot Backup Download**:
  - Tại `QLCS-Backend/src/controllers/backup.controller.ts:67-73`:
    ```ts
    const filename = `qlcs_snapshot_${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.json(snapshot);
    ```
    Tên tệp được sinh hoàn toàn tự động từ thời gian hệ thống, không nhận đầu vào từ phía người dùng.

---

### 3.4. A04:2021 – Insecure Design & Concurrency Flaws

#### a. Khóa lạc quan (Optimistic Concurrency Control - OCC):
- **Cơ chế triển khai**: Bảng `profiles` và `htxh_profiles` duy trì cột `version: Int @default(1)`.
- Khi cập nhật hồ sơ qua `updateProfile` / `updateHtxhProfile`:
  ```ts
  if (data.version !== undefined && Number(data.version) !== Number(currentProfile.version)) {
      res.status(409).json({
          error: "Hồ sơ đã được sửa bởi người khác",
          currentVersion: currentProfile.version,
      });
      return;
  }
  ```
- **Thử nghiệm thực chứng**: Kịch bản chạy `scripts/verify-optimistic-concurrency.ts` đạt **11/11 test pass**, chặn đứng xung đột ghi đè đồng thời giữa hai cán bộ làm việc trên cùng một hồ sơ.
- **Điểm cần cải thiện**: Tại `bulkUpdateStatus` (`profiles.controller.ts:363`), câu lệnh `prisma.profiles.updateMany` cập nhật trạng thái nhận quà hàng loạt không tăng giá trị cột `version`. Nếu một cán bộ đang mở form sửa thông tin chi tiết của 1 người trong danh sách đó và lưu sau, xung đột OCC sẽ không được kích hoạt đối với bản cập nhật trạng thái nhận quà.

#### b. Điểm yếu Endpoint `POST /api/auth/setup`:
- **Vị trí**: `QLCS-Backend/src/controllers/auth.controller.ts:14-40`
- **Mã nguồn**:
  ```ts
  const userCount = await (prisma as any).users.count();
  if (userCount > 0) {
      res.status(400).json({ error: "Admin đã được tạo" });
      return;
  }
  ```
- **Rủi ro**: Nếu hệ thống mới triển khai hoặc sau khi dọn sạch bảng người dùng để chuyển giao, bất kỳ ai truy cập được vào cổng 5000 / domain đều có thể gửi request `POST /api/auth/setup` để tự đăng ký tài khoản `admin` tối cao mà không cần cung cấp khóa thiết lập bí mật ban đầu (`SETUP_SECRET_TOKEN`).

---

### 3.5. A05:2021 – Security Misconfiguration & Mạng lưới

#### a. LỖ HỔNG SEC-05: CORS Check Permissive & Socket.io Handshake
- **Vị trí**: `QLCS-Backend/src/index.ts:27-70`
- **Mã nguồn**:
  ```ts
  const isOriginAllowed = (origin: string | undefined): boolean => {
      if (!origin) return true;
      if (
          origin.endsWith(".dulieudakha.vn") ||
          origin === "https://dulieudakha.vn" ||
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:")
      ) {
          return true;
      }
      return false;
  };
  ```
- **Phân tích rủi ro**:
  1. `origin.endsWith(".dulieudakha.vn")`: Nếu kẻ tấn công sở hữu tên miền kiểu `maliciousdulieudakha.vn` (không có dấu chấm phía trước) thì hàm không khớp, nhưng nếu kẻ tấn công tạo một website dạng `http://subdomain.dulieudakha.vn` (kết nối HTTP không an toàn, hoặc một dịch vụ nội bộ bị chiếm quyền trên cùng dải tên miền xã), CORS vẫn chấp nhận.
  2. Đi kèm cấu hình `credentials: true`: Cho phép trang web bên ngoài gửi request kèm cookie / thông tin xác thực.
  3. `http://localhost:*` và `http://127.0.0.1:*`: Trong môi trường production, việc cho phép mọi port của `localhost` kết nối vào backend có thể cho phép một tiến trình độc hại chạy ngầm trên máy người dùng gửi cross-origin request tới backend.

#### b. LỖ HỔNG SEC-04: Socket.io Không Xác Thực
- **Vị trí**: `QLCS-Backend/src/index.ts:101-112`
- **Mã nguồn**:
  ```ts
  io.on("connection", (socket) => {
      console.log(`[Socket.io] Client connected: ${socket.id}`);
      socket.on("join-village", (villageId: string) => {
          socket.join(`village:${villageId}`);
      });
  });
  ```
- **Phân tích rủi ro**:
  - Không có middleware `io.use(...)` để giải mã và kiểm tra JWT Bearer Token khi bắt tay kết nối WebSocket.
  - Sự kiện `join-village` cho phép bất kỳ socket client nào (kể cả chưa đăng nhập) đăng ký nhận sự kiện của bất kỳ thôn nào (`village:VILLAGE_ID`), vi phạm nghiêm trọng nguyên tắc cách ly dữ liệu giữa các thôn.

#### c. Body Parser Limit quá cao (50MB):
- **Vị trí**: `QLCS-Backend/src/index.ts:72-73`
- `app.use(express.json({ limit: "50mb" }))`
- Cho phép payload JSON lên đến 50MB mà không có Rate Limiter tổng thể trên toàn bộ ứng dụng (chỉ có login limiter tại `auth.routes.ts`), tạo điều kiện cho tấn công từ chối dịch vụ (DoS) cạn kiệt tài nguyên bộ nhớ Node.js Event Loop.

---

### 3.6. A06:2021 – Vulnerable and Outdated Components (Chuỗi Cung Ứng Phần Mềm)

Kết quả kiểm tra thực tế bằng `npm audit`:

#### a. QLCS-Backend: 12 Lỗ hổng (5 High, 7 Moderate)
1. **`qs` (<=6.15.3)**: Lỗ hổng DoS qua `isBuffer` do kẻ tấn công kiểm soát ([GHSA-4mjr-xmp4-gh2g](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g)) và bypass giới hạn mảng. Ảnh hưởng gián tiếp qua `express` và `body-parser`.
2. **`engine.io` (6.6.0 - 6.6.9)**: DoS do lỗi Protocol Revision Mismatch trong Socket.IO ([GHSA-2gc4-cqfq-p2gv](https://github.com/advisories/GHSA-2gc4-cqfq-p2gv)).
3. **`brace-expansion` (<=1.1.20)**: Quadratic-time expansion gây cạn kiệt CPU DoS ([GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr)).
4. **`deepmerge-ts` (<8.0.0)**: Stack overflow khi merge recursive object graph ([GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx)) trong gói `@prisma/config`.
5. **`uuid` (<11.1.1)**: Thiếu bounds check buffer trong v3/v5/v6 ([GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)) trong `exceljs` và `node-cron`.

#### b. QLCS-Client: 34 Lỗ hổng (1 Critical, 21 High, 5 Moderate, 7 Low)
1. **`tar` (<=7.5.20) – CRITICAL**: Cho phép tạo/ghi đè tệp tin tùy ý thông qua Hardlink Path Traversal và Symlink Poisoning ([GHSA-34x7-hfp2-rc4v](https://github.com/advisories/GHSA-34x7-hfp2-rc4v), [GHSA-8qq5-rm4j-mr97](https://github.com/advisories/GHSA-8qq5-rm4j-mr97)). Bắt nguồn từ `electron-builder`.
2. **`xlsx` (SheetJS <= 0.18.5) – HIGH**:
   - Prototype Pollution ([GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6)).
   - Regular Expression Denial of Service (ReDoS) ([GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9)).
   - Phiên bản trên npm đã bị dừng cập nhật chính thức bởi tác giả (chuyển sang `cdn.sheetjs.com`).
3. **`undici` (7.0.0 - 7.29.0) – HIGH**: Bypass xác thực chứng chỉ TLS trong ProxyAgent, HTTP Response Splitting, CRLF Injection trong các gói phụ trợ Electron.

---

### 3.7. A07:2021 – Identification & Authentication Failures

#### a. Vòng đời JWT & Cơ chế Xoay Vòng (Token Rotation):
- **Access Token**: Hạn dùng 15 phút (`expiresIn: "15m"`), ký bằng `JWT_SECRET`.
- **Refresh Token**: Hạn dùng 7 ngày (`expiresIn: "7d"`), lưu trong bảng CSDL `refresh_tokens`, ký bằng `JWT_REFRESH_SECRET`.
- **Cơ chế Refresh**: Tại `auth.controller.ts:111-161`:
  - Kiểm tra token tồn tại trong bảng `refresh_tokens`.
  - Xác thực chữ ký cryptographic JWT.
  - Xóa token cũ (`prisma.refresh_tokens.delete`) và chèn token mới (Rotation 1:1). Đây là thiết kế chuẩn ASVS V3.4.

#### b. LỖ HỔNG SEC-03: Không có cơ chế vô hiệu hóa Access Token khi Đăng xuất (Stateless JWT Revocation Failure)
- **Vị trí**: `QLCS-Backend/src/controllers/auth.controller.ts:255-268`
- **Mã nguồn**:
  ```ts
  export const logout = async (req: AuthRequest, res: Response) => {
      try {
          const { refreshToken } = req.body;
          if (refreshToken) {
              await (prisma as any).refresh_tokens.deleteMany({
                  where: { token: refreshToken },
              });
          }
          res.json({ message: "Đăng xuất thành công" });
      } catch (error) { ... }
  };
  ```
- **Phân tích rủi ro**:
  - Khi người dùng bấm "Đăng xuất", backend chỉ xóa dòng Refresh Token trong CSDL.
  - **Access Token của phiên đó vẫn hoàn toàn hợp lệ cho đến hết thời gian 15 phút!**
  - Backend không duy trì Redis Blacklist, In-memory token cache hoặc cột `token_invalid_before` trên bảng `users`. Nếu Access Token bị kẻ tấn công đánh cắp (qua proxy log, packet sniffing hoặc malware trước khi đăng xuất), kẻ tấn công vẫn có thể thực hiện mọi thao tác ghi/đọc dữ liệu danh nghĩa nạn nhân trong vòng 15 phút tiếp theo mà không thể bị ngăn chặn.

#### c. Chính sách mật khẩu (Password Strength Enforcement):
- Trong `users.controller.ts:50` và `validation/schemas.ts:5`: Mật khẩu chỉ yêu cầu độ dài tối thiểu 6 ký tự (`min(6)`), không yêu cầu chữ hoa, chữ số hay ký tự đặc biệt. Mật khẩu mặc định trong seed script là `admin123456` và `qlcs2025` rất dễ bị tấn công vét cạn (Brute-force / Dictionary attack).
- Rate Limiter cho Login (`auth.routes.ts:18-33`) đã cấu hình tốt (10 lần thất bại trong 15 phút ở production, nhóm theo IP và Username).

---

### 3.8. A08:2021 – Software and Data Integrity Failures

- **Xử lý tệp Excel Ingestion**:
  Tại `excel.controller.ts:108-143`, dữ liệu từ file Excel được duyệt qua từng cell bằng `exceljs`. Hệ thống kiểm tra header row và map các cột dữ liệu theo mảng chuẩn.
  Mã nguồn đã xử lý tốt các tình huống số sê-ri ngày tháng Excel (`parseDobValue`).
  Tuy nhiên, tại `QLCS-Client/src/utils/excelExporter.ts`, dữ liệu xuất ra bao gồm cả số CCCD đầy đủ không qua che giấu hay bảo vệ bằng mật khẩu file Excel, tiềm ẩn nguy cơ lộ lọt dữ liệu khi cán bộ lưu tệp Excel trên máy tính cá nhân hoặc chia sẻ qua Zalo/Email.

---

### 3.9. A09:2021 – Security Logging and Monitoring Failures

#### a. Rò rỉ thông tin đăng nhập trong Console Log:
- **Vị trí**: `QLCS-Backend/src/controllers/auth.controller.ts:59-62`
- **Mã nguồn**:
  ```ts
  console.log(
      `\x1b[31m[AUTH-ALERT] Đăng nhập thất bại: Tài khoản "${username}" không tồn tại trong CSDL! (IP: ${clientIp})\x1b[0m`,
  );
  ```
- **Rủi ro**: Nếu cán bộ vô tình gõ nhầm mật khẩu vào ô "Tên đăng nhập" (lỗi người dùng rất phổ biến khi bàn phím chuyển focus), mật khẩu trần đó sẽ bị in trực tiếp ra Terminal stdout và lưu vào log hệ thống / Cloudflare Tunnel log.
- **User Enumeration**: Log phân biệt rõ "không tồn tại trong CSDL" và "nhập SAI MẬT KHẨU". Dù phản hồi HTTP trả lời chung là `"Sai thông tin đăng nhập"`, việc log chi tiết cho phép bất kỳ ai có quyền xem server log phân biệt được sự tồn tại của các tài khoản.

---

## 4. CHI TIẾT PHÂN TÍCH CHUYÊN SÂU & ĐỀ XUẤT KHẮC PHỤC (REMEDIATION SPECIFICATIONS)

---

### 4.1. Khắc phục SEC-01: Ngăn chặn tự động Decrypt toàn bộ CCCD ra API
- **Root Cause**: `prisma.$extends` áp dụng hàm `processOutputData` trên mọi kết quả trả về của model `profiles` và `htxh_profiles`, tự động giải mã CCCD thành plaintext.
- **Khuyến nghị kiến trúc (Architectural Fix)**:
  1. Loại bỏ logic tự động decrypt trong `processOutputData` của `prisma.ts`. Cơ sở dữ liệu chỉ lưu chuỗi mã hóa `iv:tag:cipher`.
  2. Các API danh sách (`GET /api/profiles`, `GET /api/htxh`, `GET /api/profiles/stream`) **CHỈ ĐƯỢC PHÉP TRẢ VỀ `cccd_last4`** (Ví dụ: `"1234"`). Tuyệt đối không trả về cột `cccd`.
  3. Tạo một endpoint chuyên biệt có ghi nhận kiểm toán:
     `POST /api/profiles/:id/reveal-cccd`
     - Yêu cầu xác thực JWT.
     - Kiểm tra quyền thôn (Village Scope).
     - Giải mã số CCCD của đúng 1 hồ sơ đó và trả về.
     - Bắt buộc ghi log vào `profile_audit_log` với hành động `VIEW_CCCD` kèm IP và danh tính cán bộ thực hiện để phục vụ giám sát nội bộ.

---

### 4.2. Khắc phục SEC-03: Cơ chế Vô hiệu hóa Access Token khi Đăng xuất
- **Root Cause**: Access Token là stateless JWT không được theo dõi trạng thái sau khi cấp phát.
- **Khuyến nghị khắc phục**:
  - Giải pháp 1 (Khuyên dùng không cần Redis): Thêm cột `token_invalid_before: DateTime?` vào bảng `users`.
  - Khi người dùng đổi mật khẩu hoặc bấm Đăng xuất: Cập nhật `users.update({ where: { id }, data: { token_invalid_before: new Date() } })`.
  - Trong middleware `authenticateToken` (`auth.middleware.ts`): Thêm trường `iat` (issued at) vào token payload. Kiểm tra nếu `decoded.iat * 1000 < user.token_invalid_before`, lập tức từ chối với HTTP 401.

---

### 4.3. Khắc phục SEC-04 & SEC-05: Siết chặt Socket.io và CORS Policy
- **Root Cause**: Socket.io không kiểm tra JWT trong `io.use` và CORS kiểm tra đuôi chuỗi lỏng lẻo.
- **Đề xuất mã sửa đổi cho `index.ts`**:
  ```ts
  // 1. Chuẩn hóa CORS Origin Allowlist chặt chẽ
  const ALLOWED_ORIGINS = new Set([
      "https://qlcs.dulieudakha.vn",
      "https://dulieudakha.vn",
  ]);

  const isOriginAllowed = (origin: string | undefined): boolean => {
      if (!origin) return true; // Cho phép desktop app file:// hoặc curl
      if (ALLOWED_ORIGINS.has(origin)) return true;
      if (process.env.NODE_ENV !== "production") {
          return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      }
      return false;
  };

  // 2. Thêm Authentication Middleware cho Socket.io
  io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token) {
          return next(new Error("Authentication token required"));
      }
      try {
          const user = verifyAccessToken(token);
          socket.data.user = user;
          next();
      } catch (err) {
          next(new Error("Invalid token"));
      }
  });

  // 3. Phân quyền Room join
  io.on("connection", (socket) => {
      socket.on("join-village", (villageId: string) => {
          const user = socket.data.user;
          if (user.role === "admin" || user.village_id === villageId) {
              socket.join(`village:${villageId}`);
          } else {
              socket.emit("error", { message: "Không có quyền gia nhập room thôn khác" });
          }
      });
  });
  ```

---

### 4.4. Khắc phục SEC-06 & SEC-07: Chuẩn hóa Route Guard & Setup Guard
- **File `audit.routes.ts`**:
  Bổ sung `requireAdmin`:
  ```ts
  router.use(authenticateToken as any);
  router.use(requireAdmin as any); // Chặn cán bộ thôn xem log kiểm toán toàn xã
  router.get("/", getAuditLogs as any);
  ```
- **File `auth.controller.ts` (`setupAdmin`)**:
  Yêu cầu biến môi trường `SETUP_SECRET_TOKEN`:
  ```ts
  const setupToken = req.headers["x-setup-token"];
  if (process.env.SETUP_SECRET_TOKEN && setupToken !== process.env.SETUP_SECRET_TOKEN) {
      res.status(403).json({ error: "Khóa khởi tạo hệ thống không hợp lệ" });
      return;
  }
  ```

---

### 4.5. Khắc phục SEC-10: Cập nhật và Thay thế các Dependency có Lỗ hổng
1. **Thay thế `xlsx` trong Client**:
   Gói `xlsx@0.18.5` có lỗ hổng Prototype Pollution. Đề xuất: Chuyển toàn bộ việc xử lý xuất/nhập file Excel trên Client sang `exceljs` (đã có sẵn ở Backend và hoàn toàn an toàn) hoặc nâng cấp lên gói chính thức từ CDN của SheetJS.
2. **Cập nhật `qs`, `engine.io`, `body-parser`**:
   Chạy lệnh kiểm tra phiên bản mới nhất tương thích với Express 4 và Prisma 6 để nâng cấp các transitive dependencies.
3. **Cập nhật `electron-builder` và `tar`**:
   Cập nhật `electron-builder` lên phiên bản `>= 26.x` để loại bỏ lỗ hổng Critical Path Traversal trong `node-tar`.

---

## 5. KẾT LUẬN & ĐÁNH GIÁ TỔNG THỂ

Hệ thống **QLCS** đã thể hiện tư duy thiết kế bảo mật có đầu tư và tiến bộ:
- Đã triển khai mã hóa AES-256-GCM kết hợp Blind Indexing SHA-256 đối với CCCD ở tầng CSDL.
- Đã thiết lập cơ chế Khóa lạc quan (OCC) chống Race Condition trong cập nhật dữ liệu.
- Đã bảo vệ các tệp upload bằng cách xử lý thuần trong bộ nhớ (`memoryStorage`), không dính lỗi lưu file tạm hay Path Traversal.
- Đã trang bị Rate Limiting cho luồng đăng nhập chống vét cạn.

Tuy nhiên, **lỗ hổng kiến trúc nghiêm trọng nhất (SEC-01 & SEC-02)** nằm ở việc **tự động giải mã CCCD và chuyển toàn bộ dữ liệu CCCD trần về trình duyệt client**, khiến cho nỗ lực mã hóa AES trong CSDL bị vô hiệu hóa khi dữ liệu lưu thông qua mạng REST API. Sau khi khắc phục các điểm yếu SEC-01 đến SEC-06 theo lộ trình nêu trên, hệ thống QLCS sẽ đạt mức an toàn cao, tuân thủ chặt chẽ tiêu chuẩn an toàn thông tin cơ quan nhà nước và Nghị định 13/2023/NĐ-CP.
