# BÁO CÁO BƯỚC 4: CẤU HÌNH, HẠ TẦNG VÀ TRIỂN KHAI (CONFIGURATION & INFRASTRUCTURE AUDIT)
## Dự án: Quản Lý Chính Sách (QLCS v3.0.0) — UBND Xã Đăk Hà

---

## 1. MỤC TIÊU & PHẠM VI KIỂM TOÁN CẤU HÌNH HỆ THỐNG

### 1.1. Mục tiêu kiểm toán
1. Rà soát cấu hình mạng, chính sách chia sẻ tài nguyên nguồn gốc chéo (CORS Whitelist) của máy chủ Express và kênh WebSocket Socket.io.
2. Đánh giá tính đầy đủ của các HTTP Security Headers (`Helmet`, `HSTS`, `X-Content-Type-Options`, `X-Frame-Options`).
3. Đánh giá chính sách bảo mật nội dung (Content Security Policy - CSP) ở cả hai cấp độ: tệp `index.html` và phiên làm việc Electron trong môi trường đóng gói (Production).
4. Phân tích cơ chế truyền tải thông tin xác thực (Bearer Tokens vs Cookies) và khả năng kháng tấn công CSRF.
5. Thẩm tra cấu hình kết nối CSDL đám mây Supabase PostgreSQL (Connection Pooling, TLS, Row Level Security - RLS).
6. Đánh giá quy trình đóng gói phần mềm Desktop (`electron-builder.json5`) và cơ chế tự động cập nhật qua mạng (`electron-updater`).

> [!IMPORTANT]
> **Quy tắc P0**: Không chỉnh sửa mã nguồn hoặc thay đổi cấu hình hạ tầng trong giai đoạn kiểm toán (Bước 4). Toàn bộ phát hiện được lập danh mục để trình duyệt tại Bước 6 và khắc phục tại Bước 7.

---

## 2. RÀ SOÁT CẤU HÌNH MẠNG & CHÍNH SÁCH CORS (BACKEND)

### 2.1. Phân tích Logic Kiểm tra Nguồn gốc (`isOriginAllowed`)
Trong `QLCS-Backend/src/index.ts` (dòng 27–38):
```typescript
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

### 2.2. Các Rủi Ro An Ninh Phát Hiện:
1. **Chấp Nhận Toàn Bộ Cổng Localhost (`http://localhost:*`)**:
   - Biểu thức `origin.startsWith("http://localhost:")` chấp nhận mọi cổng trên máy cục bộ (ví dụ: `http://localhost:8080`, `http://localhost:3000`, `http://localhost:9999`).
   - Nếu cán bộ vô tình chạy một phần mềm hoặc script độc hại trên cổng bất kỳ của máy trạm, script đó có thể gửi request có `credentials: true` tới API server QLCS.
2. **Thiếu Ràng Buộc Giao Thức HTTPS Trên Subdomain**:
   - `origin.endsWith(".dulieudakha.vn")` không kiểm tra giao thức `https://`. Một kết nối không an toàn `http://subdomain.dulieudakha.vn` vẫn được chấp thuận, tạo kẽ hở cho tấn công Man-in-the-Middle (MitM) trên mạng mở.
3. **Chấp Nhận `origin: undefined` / `null`**:
   - Việc cho phép `!origin` là bắt buộc đối với Electron Desktop (khi nạp từ `file://`), cURL và mobile apps. Tuy nhiên, cần kết hợp kiểm tra User-Agent hoặc custom request headers (`X-Requested-With: QLCS-Client`) để tăng cường tính xác thực nguồn gốc.

---

## 3. THẨM TRA HTTP SECURITY HEADERS & HELMET

### 3.1. Đánh giá Cấu hình Helmet
Trong `QLCS-Backend/src/index.ts` (dòng 56):
```typescript
app.use(helmet({ contentSecurityPolicy: false }));
```

### 3.2. Bảng Đối Chiếu Các Security Headers Mặc Định của Helmet:
| Security Header | Giá Trị Thực Tế Được Thiết Lập | Đánh Giá An Toàn | Ghi Chú |
| :--- | :--- | :---: | :--- |
| `Strict-Transport-Security` (HSTS) | `max-age=15552000; includeSubDomains` | **TỐT (PASS)** | Buộc trình duyệt kết nối qua HTTPS trong 180 ngày. |
| `X-Content-Type-Options` | `nosniff` | **TỐT (PASS)** | Chặn trình duyệt tự đoán định kiểu MIME (MIME sniffing). |
| `X-Frame-Options` | `SAMEORIGIN` | **TỐT (PASS)** | Chống Clickjacking qua iframe. |
| `Referrer-Policy` | `no-referrer` | **TỐT (PASS)** | Không để lộ URL và token qua Referer header. |
| `Cross-Origin-Opener-Policy` | `same-origin` | **TỐT (PASS)** | Cách ly ngữ cảnh duyệt web. |
| `Cross-Origin-Resource-Policy` | `same-origin` | **TỐT (PASS)** | Bảo vệ tài nguyên trước các web khác. |
| `Content-Security-Policy` (API Server) | Đang tắt (`false`) | **CẦN CẢI THIỆN** | Do backend trả về JSON, nên đặt `default-src 'none'; frame-ancestors 'none';` để khóa hoàn toàn bề mặt framing. |

---

## 4. THẨM TRA CHÍNH SÁCH BẢO MẬT NỘI DUNG (CSP) CỦA CLIENT

Dự án hiện có 2 chính sách CSP hoạt động song song ở các ngữ cảnh khác nhau:

### 4.1. Chính Sách CSP Cấp Thấp Trong `index.html` (Dòng 7)
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' http://localhost:* http://127.0.0.1:* https://qlcs.dulieudakha.vn https://*.dulieudakha.vn ws://localhost:* ws://127.0.0.1:*;" />
```
- **Điểm yếu**:
  - `script-src` chứa `'unsafe-eval'`: Cho phép thực thi hàm `eval()`, `new Function()`, làm suy giảm khả năng phòng vệ trước DOM XSS.
  - Sử dụng wildcard mở rộng: `http://localhost:*`, `ws://localhost:*`, `https://*.dulieudakha.vn`.

### 4.2. Chính Sách CSP Cấp Cao Trong `electron/main.ts` (Dòng 103–105)
```typescript
win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      "Content-Security-Policy": [
        "default-src 'self'; connect-src 'self' http://localhost:5000 https://qlcs.dulieudakha.vn https://worldtimeapi.org https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data:; script-src 'self';",
      ],
    },
  });
});
```
- **Đánh giá An toàn**:
  - `script-src 'self'`: **Rất tốt**, đã loại bỏ hoàn toàn `'unsafe-eval'` trong bản đóng gói Production.
  - `connect-src`: Đã thu hẹp đúng danh sách endpoint cần thiết.
  - **Điểm cần tối ưu**:
    + Nguồn `https://worldtimeapi.org`: Gọi dịch vụ bên thứ ba để lấy giờ internet (có thể thay bằng máy chủ nội bộ).
    + Nguồn `https://fonts.googleapis.com`: Cần loại bỏ khi hoàn tất chuyển đổi sang font nội bộ (Self-hosted).

---

## 5. CƠ CHẾ TRUYỀN TẢI THÔNG TIN PHIÊN (SESSION & CSRF DEFENSE)

### 5.1. Mô hình Xác thực
- Hệ thống sử dụng mô hình xác thực dựa trên Header:
  `Authorization: Bearer <accessToken>`
- Toàn bộ request từ `QLCS-Client` được nạp tự động qua Axios Interceptor trong `src/api/apiClient.ts`.
- Token được lưu trữ trên máy trạm qua cơ chế an toàn `safeStorage` (Windows DPAPI) của Electron.

### 5.2. Đánh giá Khả năng Kháng CSRF (Cross-Site Request Forgery):
- **MIỄN NHIỄM 100% VỚI CSRF (PASS)**:
  Do ứng dụng không lưu trữ token trong trình duyệt bằng Cookie có cờ tự động gửi (`ambient credentials`), kẻ tấn công không thể dùng kỹ thuật giả mạo yêu cầu chéo trang (CSRF) để buộc trình duyệt gửi kèm token xác thực.

---

## 6. THẨM TRA CẤU HÌNH CƠ SỞ DỮ LIỆU ĐÁM MÂY SUPABASE

### 6.1. Kiến Trúc Kết Nối
- `DATABASE_URL`: Kết nối qua PgBouncer (Transaction Pooler) trên cổng `6543`, `sslmode=require`.
- `DIRECT_URL`: Kết nối trực tiếp PostgreSQL trên cổng `5432` phục vụ Prisma migrations.
- Mọi kết nối đều được mã hóa kênh truyền TLS/SSL.

### 6.2. Phát hiện Rủi ro SEC-04-01: Nguy cơ Lộ CSDL Qua Supabase PostgREST & RLS
- **Bản chất**: Dự án sử dụng chuỗi kết nối PostgreSQL trực tiếp với tài khoản superuser (`postgres`) từ máy chủ backend Express.
- **Rủi ro tiềm ẩn**:
  - Supabase mặc định mở sẵn cổng PostgREST API tại địa chỉ: `https://<project-ref>.supabase.co/rest/v1/`.
  - Nếu các bảng `profiles`, `htxh_profiles`, `users`, `villages` trong Supabase chưa được bật tính năng **Row Level Security (RLS)** (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`), bất kỳ ai có được Anon Public Key của dự án Supabase đều có thể dùng HTTP REST truy vấn trực tiếp vào CSDL để đọc dữ liệu công dân, bypass hoàn toàn các tầng kiểm soát của Express backend!
- **Khuyến nghị**:
  1. Đảm bảo 100% các bảng dữ liệu trong schema `public` trên Supabase đều được kích hoạt RLS (`ENABLE ROW LEVEL SECURITY`).
  2. Thu hồi toàn bộ quyền `SELECT`, `INSERT`, `UPDATE`, `DELETE` của các role `anon` và `authenticated` trong Supabase SQL Editor.

---

## 7. THẨM TRA ĐÓNG GÓI DESKTOP & CẬP NHẬT TỰ ĐỘNG

### 7.1. Phân tích `electron-builder.json5`
- `asar: true`: Mã nguồn ứng dụng được đóng gói thành tệp kho lưu trữ `app.asar`, ngăn chặn việc xem và sửa trực tiếp mã nguồn dạng thô trên máy người dùng.
- `directories.output`: Xuất bản gói cài đặt NSIS dành riêng cho Windows x64.

### 7.2. Phát hiện Rủi ro SEC-04-05: Thiếu Chứng chỉ Ký số (Code Signing)
- Cấu hình đóng gói hiện tại **chưa có chứng chỉ ký số (Code Signing Certificate)** cho tệp `.exe`.
- **Hệ quả**:
  1. Khi cài đặt trên Windows 11, Windows SmartScreen sẽ bật màn hình cảnh báo màu xanh: *"Windows protected your PC / Unknown Publisher"*.
  2. Kênh cập nhật tự động `electron-updater` tải tệp cài đặt từ GitHub Releases (`Umnuar/QLCS`). Nếu thiếu chữ ký số, tệp cập nhật không có cơ chế chứng thực nguồn gốc từ nhà phát triển hợp pháp.
- **Khuyến nghị**: Đối với phần mềm quản lý nhà nước/chính quyền cấp xã, nên trang bị chứng chỉ ký số doanh nghiệp hoặc sử dụng dịch vụ ký số đám mây (Azure Trusted Signing) trước khi phát hành chính thức.

---

## 8. MA TRẬN TỔNG HỢP PHÁT HIỆN CẤU HÌNH & HẠ TẦNG

| Mã Phát Hiện | Hạng Mục Cấu Hình | Mức Độ | Tác Động & Kịch Bản Khai Thác | Biện Pháp Khắc Phục Đề Xuất (Bước 7) |
| :---: | :--- | :---: | :--- | :--- |
| **SEC-04-01** | Bảng Supabase có thể bị đọc trực tiếp nếu thiếu RLS | **P1 (High)** | Dùng Supabase Anon Key truy vấn qua PostgREST bypass API server | Chạy lệnh SQL kích hoạt RLS trên toàn bộ bảng và thu hồi quyền role `anon` trên Supabase |
| **SEC-04-02** | Hàm CORS whitelist chấp nhận mọi cổng localhost và thiếu HTTPS | **P2 (Medium)** | Script cục bộ khác trên máy trạm gửi request có credentials; MitM trên HTTP | Siết chặt CORS chỉ cho phép `https://qlcs.dulieudakha.vn`, `https://dulieudakha.vn` và đúng port dev 5173 |
| **SEC-04-03** | CSP meta tag trong `index.html` chứa `'unsafe-eval'` | **P2 (Medium)** | Cho phép thực thi hàm `eval()`, nới lỏng phòng ngự XSS | Xóa bỏ `'unsafe-eval'` khỏi `index.html`, đồng bộ CSP sạch |
| **SEC-04-04** | Phụ thuộc dịch vụ đồng bộ giờ bên thứ ba `worldtimeapi.org` | **P2 (Medium)** | Dịch vụ ngoài sập hoặc trả về giờ sai làm sai lệch tính tuổi chúc thọ | Chuyển sang lấy mốc thời gian chuẩn từ chính máy chủ Backend qua `/api/health` |
| **SEC-04-05** | Thiếu Code Signing Certificate trong đóng gói Electron | **P2 (Medium)** | Cảnh báo SmartScreen khi cài đặt; rủi ro giả mạo gói cập nhật | Tích hợp chứng chỉ ký số cho Windows installer NSIS |
| **SEC-04-06** | Thiếu CSP chuyên dụng cho REST API Server | **P3 (Low)** | Khả năng bị tấn công MIME-sniffing hoặc framing trong trường hợp hy hữu | Cấu hình Helmet bổ sung `Content-Security-Policy: default-src 'none'; frame-ancestors 'none';` |

---

## 9. KẾT LUẬN BƯỚC 4 & TRẠNG THÁI GATE 4

1. **Gate 4 Status**: **PASS với MA TRẬN KHẮC PHỤC CẤU HÌNH (Conditional PASS)**:
   - ✅ Đã thẩm tra toàn diện 6 trụ cột cấu hình: CORS, Helmet, CSP, Session/CSRF, Supabase DB, và Electron Builder.
   - ✅ Xác nhận hệ thống **miễn nhiễm 100% với tấn công CSRF** nhờ kiến trúc Bearer Token + Windows DPAPI.
   - ✅ Nhận diện chính xác 1 rủi ro hạ tầng đám mây P1 (`SEC-04-01`) và 4 điểm yếu cấu hình mạng/CSP mức P2.
2. **Tuân thủ Tuyệt đối Quy tắc P0**:
   - Chưa sửa đổi bất kỳ tệp cấu hình hay mã nguồn nào trong Bước 4.
