# BÁO CÁO BƯỚC 2: CHUỖI CUNG ỨNG & PHỤ THUỘC (SUPPLY CHAIN & DEPENDENCIES AUDIT)
## Dự án: Quản Lý Chính Sách (QLCS v3.0.0) — UBND Xã Đăk Hà

---

## 1. MỤC TIÊU & PHƯƠNG PHÁP KIỂM TOÁN CHUỖI CUNG ỨNG

### 1.1. Mục tiêu kiểm toán
1. Đánh giá tính toàn vẹn và mức độ rủi ro của toàn bộ thư viện bên thứ ba (Third-party dependencies) trong `QLCS-Backend` và `QLCS-Client`.
2. Nhận diện các lỗ hổng đã công bố (CVE / GitHub Security Advisories) qua `npm audit`.
3. Thực hiện **Phân tích Khả năng Khai thác Thực tế (Reachability Analysis)**: Phân định rạch ròi giữa lỗ hổng chỉ xuất hiện trong môi trường phát triển/đóng gói (`devDependencies`) và lỗ hổng có thể chạm tới mã nguồn lúc ứng dụng vận hành (`Runtime Reachable`).
4. Rà soát các script vòng đời (`preinstall`, `postinstall`) để phòng ngừa mã độc chuỗi cung ứng (Malicious Packages / Typosquatting).
5. Đánh giá việc tải tài nguyên bên ngoài (Google Fonts, CDNs) và tác động đối với chế độ vận hành Ngoại tuyến (Offline Mode).

> [!IMPORTANT]
> **Quy tắc P0**: Không tự ý chạy `npm audit fix` hoặc cài đặt/gỡ bỏ package trong giai đoạn kiểm toán (Bước 2). Mọi đề xuất nâng cấp sẽ được tổng hợp vào Bước 6 và thực thi tại Bước 7 sau khi có phê duyệt.

---

## 2. TỔNG HỢP KẾT QUẢ QUÉT LỖ HỔNG (VULNERABILITY SCAN SUMMARY)

### 2.1. Bảng Tổng Hợp Số Lượng Lỗ Hổng

| Phân Hệ Dự Án | Tổng Số Package | Critical | High | Moderate | Low | Tổng Số Lỗ Hổng | Trạng Thái Audit |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **QLCS-Backend** | 296 (254 prod, 42 dev) | 0 | 5 | 7 | 0 | **12** | `npm audit` exit 1 |
| **QLCS-Client** | 724 (97 prod, 627 dev) | 1 | 22 | 5 | 7 | **35** | `npm audit` exit 1 |
| **Toàn Hệ Thống** | **1,020 dependencies** | **1** | **27** | **12** | **7** | **47** | Cần xử lý có chọn lọc |

---

## 3. PHÂN TÍCH KHẢ NĂNG KHAI THÁC THỰC TẾ (REACHABILITY ANALYSIS)

Không phải mọi cảnh báo của `npm audit` đều có thể bị khai thác ngoài đời thực. Dưới đây là kết quả đối chiếu mã nguồn thực tế với các hàm bị lỗi:

### 3.1. Các Lỗ Hổng Có Thể Khai Thác Lúc Vận Hành (Runtime Reachable — CẦN KHẮC PHỤC)

| Mã | Gói Phụ Thuộc | Phiên Bản | Mức Độ & CVE/GHSA | CVSS | Vị Trí Sử Dụng Trong Mã Nguồn | Khả Năng Khai Thác Thực Tế & Tác Động |
| :---: | :--- | :---: | :--- | :---: | :--- | :--- |
| **DEP-01** | `xlsx` (SheetJS) | `^0.18.5` (Client) | **High**<br/>GHSA-4r6h-8v6p-xvw6 (Prototype Pollution)<br/>GHSA-5pgg-2g8v-p4x9 (ReDoS) | **7.8** | `QLCS-Client/src/pages/Dashboard/hooks/useImportExport.ts:504`<br/>Gọi `XLSX.read(buffer)` khi preview file Excel | **KHẢ THI (Reachable)**: Cán bộ tải lên file Excel được tạo thủ công có thuộc tính đặc thù (`__proto__`) có thể gây Prototype Pollution trong Chromium Renderer hoặc làm treo giao diện qua ReDoS. |
| **DEP-02** | `engine.io` (via `socket.io`) | `6.6.0 - 6.6.9` (Backend) | **High**<br/>GHSA-2gc4-cqfq-p2gv (DoS via Revision Mismatch) | **7.5** | `QLCS-Backend/src/index.ts:41`<br/>Khởi tạo SocketServer gắn vào `httpServer` | **KHẢ THI (Reachable)**: Kẻ tấn công gửi gói tin WebSocket với giao thức không khớp có thể làm crash tiến trình Node.js của backend. |
| **DEP-03** | `qs` (via `express` / `body-parser`) | `2.2.5 - 6.15.3` (Backend) | **Moderate**<br/>GHSA-4mjr-xmp4-gh2g (DoS via isBuffer)<br/>GHSA-x5fp-wj9c-mxmx (Array-limit bypass) | **5.3** | `QLCS-Backend/src/index.ts:73`<br/>`app.use(express.urlencoded({ extended: true }))` | **KHẢ THI (Reachable)**: Kẻ xấu gửi query payload phức tạp có thể gây nghẽn CPU hoặc bypass giới hạn mảng của parser. |

---

### 3.2. Các Lỗ Hổng Thuộc Môi Trường Đóng Gói & Phát Triển (Build-time / Dev-Only — UNREACHABLE)

| Mã | Gói Phụ Thuộc | Mức Độ | Nguồn Gốc Phụ Thuộc | Đánh Giá Khả Năng Khai Thác Runtime |
| :---: | :--- | :---: | :--- | :--- |
| **DEP-04** | `tar` | **Critical** (CVSS 8.8) | `electron-builder` $\rightarrow$ `app-builder-lib` $\rightarrow$ `tar` (Client devDependencies) | **KHÔNG THỂ KHAI THÁC TRÊN RUNTIME (Unreachable)**: Thư viện `tar` chỉ chạy trên máy trạm của lập trình viên khi đóng gói binary Windows (`.exe`). Mã nguồn không nằm trong gói phần mềm người dùng cuối. |
| **DEP-05** | `vite` | **High** (CVSS 7.5) | `vite` dev server (Client devDependencies) | **KHÔNG THỂ KHAI THÁC TRÊN RUNTIME (Unreachable)**: Lỗ hổng path traversal của Vite dev server chỉ xảy ra khi chạy `npm run dev`. Ứng dụng production tải từ file tĩnh bundle trong `dist/`. |
| **DEP-06** | `deepmerge-ts` | **High** | `@prisma/config` $\rightarrow$ `prisma` CLI (Backend devDependencies) | **KHÔNG THỂ KHAI THÁC TRÊN RUNTIME (Unreachable)**: Chỉ được nạp khi chạy lệnh CLI của Prisma (`prisma db push`, `prisma generate`). Không nạp trong file chạy `dist/index.js`. |
| **DEP-07** | `undici` | **High** | `@electron/get` (Build-time helper) | **KHÔNG THỂ KHAI THÁC TRÊN RUNTIME (Unreachable)**: Chỉ dùng lúc download Electron binary về máy dev. |

---

## 4. RÀ SOÁT VÒNG ĐỜI CÀI ĐẶT & NGUY CƠ CHUỖI CUNG ỨNG

### 4.1. Kiểm tra Lifecycle Scripts (`package.json`)
- **Backend**:
  - Không có script `preinstall`, `postinstall`, hay `prepare`.
  - Các script `seed`, `dev`, `build` đều dùng công cụ tiêu chuẩn (`tsx`, `tsc`).
- **Client**:
  - Không có script `preinstall` hay `postinstall`.
- **Kết luận**: **AN TOÀN (PASS)** — Không có nguy cơ thực thi mã độc tùy ý tự động khi chạy `npm install`.

---

### 4.2. Đánh giá Nguy cơ Bỏ hoang & Typosquatting
- Thư viện `xlsx` (SheetJS) đã ngừng cập nhật bản vá miễn phí trên npm registry từ sau phiên bản `0.18.5`. Việc duy trì `xlsx` lâu dài tiềm ẩn nguy cơ tích tụ nợ kỹ thuật bảo mật.
- Ngược lại, tầng Backend đang dùng `exceljs` (^4.4.0) — một thư viện mã nguồn mở hiện đại, được duy trì chủ động và hỗ trợ stream an toàn.

---

## 5. TÀI NGUYÊN BÊN NGOÀI & CHẾ ĐỘ NGOẠI TUYẾN (OFFLINE READINESS)

### 5.1. Rà soát Tải Phông chữ từ Google Fonts
Trong `QLCS-Client/index.html` (dòng 9–11):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:...&family=JetBrains+Mono:...&display=swap" rel="stylesheet">
```

### 5.2. Các Rủi Ro An Ninh & Vận Hành Phát Hiện:
1. **Mâu thuẫn với Chế độ Offline Mode**: Khi máy tính cán bộ không có kết nối Internet hoặc mạng xã Đăk Hà chập chờn, trình duyệt sẽ bị nghẽn (render-blocking) khi cố gắng kết nối đến máy chủ Google, gây hiện tượng FOUT (Flash of Unstyled Text) hoặc lỗi giao diện.
2. **Nới Lỏng Chính Sách CSP**: Để tải được font, cả `index.html` và `main.ts` buộc phải thêm `https://fonts.googleapis.com` vào `style-src` và `https://fonts.gstatic.com` vào `font-src`.
3. **Thiếu Subresource Integrity (SRI)**: Thẻ `<link>` không có thuộc tính `integrity="sha384-..."`.

### 5.3. Khuyến nghị Giải Pháp:
- Chuyển đổi sang **Font Nội Bộ (Self-Hosted Fonts)** bằng cách tải trực tiếp tệp WOFF2/TTF của `Be Vietnam Pro` và `JetBrains Mono` vào `src/assets/fonts/` hoặc cài đặt qua gói `@fontsource/be-vietnam-pro`.
- Giúp hệ thống hoạt động 100% mượt mà ngoại tuyến, đồng thời siết chặt CSP thành `font-src 'self' data:; style-src 'self' 'unsafe-inline';`.

---

## 6. MA TRẬN TỔNG HỢP VÀ ĐỀ XUẤT NÂNG CẤP AN TOÀN

| Mã Phát Hiện | Thư Viện / Thành Phần | Mức Độ | Tác Động Thực Tế | Đề Xuất Khắc Phục (Bước 7) | Rủi Ro Khi Nâng Cấp |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **DEP-01** | `xlsx` (^0.18.5) trong Client | **High (P1)** | Prototype Pollution khi parse file Excel | Di chuyển logic đọc Excel của Client sang dùng `exceljs` (giống Backend) hoặc cập nhật SheetJS an toàn | Cần kiểm tra lại định dạng xuất/nhập Excel |
| **DEP-02** | `engine.io` trong Backend | **High (P1)** | DoS tiến trình máy chủ WebSocket | Cập nhật `socket.io` lên bản mới nhất (`^4.8.1+`) giải quyết triệt để `engine.io` DoS | Thấp (hoàn toàn tương thích ngược) |
| **DEP-03** | `qs` trong Backend | **Moderate (P2)** | DoS bộ nhớ qua URL query | Cập nhật `express` / lockfile lên bản vá mới nhất | Thấp |
| **DEP-04** | Google Fonts nạp từ Internet | **Moderate (P2)** | Mất phông khi offline, mở rộng CSP | Tải font về lưu cục bộ (Self-hosted fonts) | Thấp (chỉ cần thêm file font tĩnh) |
| **DEP-05** | `tar` / `vite` (Dev/Build tools) | **Low (P3)** | Chỉ ảnh hưởng lúc build, không lộ trên runtime | Cập nhật dần các devDependencies qua lockfile | Không ảnh hưởng runtime |

---

## 7. KẾT LUẬN BƯỚC 2 & TRẠNG THÁI GATE 2

1. **Gate 2 Status**: **PASS với BẢN KẾ HOẠCH NÂNG CẤP AN TOÀN (Conditional PASS)**:
   - ✅ Đã chạy và phân tích chi tiết `npm audit` trên cả Backend và Client.
   - ✅ Đã phân tích Reachability: Nhận diện chính xác 3 lỗ hổng runtime cần ưu tiên vá (`DEP-01`, `DEP-02`, `DEP-03`) và xác nhận lỗ hổng Critical (`tar`) chỉ nằm ở khâu build dev.
   - ✅ 0 script vòng đời độc hại trong `package.json`.
   - ✅ Đã đưa ra giải pháp chuyển đổi Self-hosted fonts đảm bảo vận hành offline an toàn.
2. **Tuân thủ Tuyệt đối Quy tắc P0**:
   - Chưa chỉnh sửa bất kỳ dòng mã nguồn nào, chưa cài đặt thêm bất kỳ thư viện nào trong Bước 2.
