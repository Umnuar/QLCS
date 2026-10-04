# Hệ Thống Quản Lý Chính Sách (QLCS v3.0.0)

> **Cơ quan chủ quản:** Ủy ban Nhân dân Xã Đăk Hà, Tỉnh Kon Tum  
> **Ứng dụng:** Quản Lý Chế Độ Chính Sách Người Cao Tuổi & Hưu Trí Xã Hội  
> **Phiên bản:** v3.0.0 (Enterprise Desktop & Local Web)  

---

## ⚠️ Thông Báo Bản Quyền & Giấy Phép (Copyright & License Notice)

> [!IMPORTANT]
> **DỰ ÁN KHÔNG ÁP DỤNG GIẤY PHÉP MÃ NGUỒN MỞ MIT HAY BẤT KỲ GIẤY PHÉP TỰ DO NÀO KHÁC.**  
> Kho lưu trữ này được đăng tải công khai (Public Repository) nhằm mục đích lưu trữ, minh bạch kỹ thuật và tham khảo kiến trúc.  
> **Bản quyền thuộc về Ủy ban Nhân dân Xã Đăk Hà và Tác giả (Umnuar). Toàn bộ quyền được bảo lưu (All Rights Reserved).**  
> Nghiêm cấm mọi hành vi sao chép, phân phối lại, chỉnh sửa hoặc sử dụng vào mục đích thương mại khi chưa có văn bản chấp thuận chính thức từ tác giả và cơ quan chủ quản.

---

## 1. Giới Thiệu Tổng Quan

**Hệ thống Quản Lý Chính Sách (QLCS)** là giải pháp phần mềm chuyên dụng phục vụ công tác rà soát, đối soát dữ liệu và thực hiện chế độ chính sách cho người cao tuổi tại địa bàn xã Đăk Hà. Hệ thống giải quyết bài toán quản lý danh sách chúc thọ, trợ cấp hưu trí xã hội, tự động hóa quy trình nhập liệu từ các biểu mẫu Excel phức tạp và đảm bảo an toàn thông tin định danh công dân.

### Điểm nổi bật:
- **Tự động phân loại mốc tuổi:** Tự động tính tuổi theo năm tính toán chính sách hiện hành để xếp hồ sơ vào các diện chúc thọ (70, 75, 80, 85, 90, 95, 100+ tuổi) hoặc diện hưu trí xã hội (70–74 tuổi, từ 75 tuổi trở lên).
- **Nhập dữ liệu Excel đa luồng (Web Workers):** Xử lý tệp bảng tính lớn nhanh chóng trên client, không làm đơ giao diện; thuật toán đối soát tự động nhận diện và khớp cột thông minh.
- **Bảo mật dữ liệu công dân chuẩn ASVS:** Mã hóa số CCCD bằng thuật toán `AES-256-GCM`, mặc định che giấu dữ liệu `••••••••1234`, nhật ký kiểm toán bất biến (`profile_audit_log`) tuân thủ Nghị định 13/2023/NĐ-CP.
- **Thống nhất hệ sinh thái Đăk Hà:** Đồng bộ giao diện Dark/Light mode, thẻ KPI số liệu, biểu đồ phân tích và quy chuẩn lớp phủ modal với 2 hệ thống vệ tinh: *Quản Lý Hộ Khẩu (QLHK)* và *Quản Lý Nông Nghiệp (QLNN)*.

---

## 2. Kiến Trúc Hệ Thống (Monorepo)

Hệ thống được tổ chức theo cấu trúc Monorepo thống nhất:

```
QLCS/
├── QLCS-Client/                 # Ứng dụng Frontend (React + Vite + Electron)
│   ├── electron/                # Khung Desktop Electron (main & preload)
│   ├── src/
│   │   ├── api/                 # Axios HTTP client kết nối Backend
│   │   ├── components/          # Thư viện UI components (Modal, Toast, ExcelDropzone...)
│   │   ├── pages/               # Các trang: Dashboard, Thống Kê, Thôn, Lịch Sử, Cài Đặt
│   │   ├── workers/             # Web Workers xử lý phân tích Excel nền
│   │   ├── validation/          # Zod schema kiểm tra dữ liệu đầu vào
│   │   └── utils/               # Tiện ích mã hóa, định dạng ngày tháng, xuất Excel
│   ├── package.json
│   └── vite.config.ts
│
├── QLCS-Backend/                # Máy chủ Backend (Node.js + Express + Prisma)
│   ├── prisma/                  # Lược đồ cơ sở dữ liệu (schema.prisma)
│   ├── scripts/                 # Kịch bản bảo trì, seed CSDL, xoay khóa AES-256
│   ├── src/
│   │   ├── controllers/         # Điều khiển nghiệp vụ (profiles, htxh, excel, analytics...)
│   │   ├── middlewares/         # Xác thực JWT, phân quyền thôn, Helmet CSP, ghi log
│   │   ├── routes/              # Định tuyến RESTful API
│   │   └── utils/               # Tiện ích mã hóa AES-256, ký JWT, kiểm toán
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                        # Tài liệu đặc tả kỹ thuật, hướng dẫn UI & quy chuẩn
├── tests/                       # Kịch bản kiểm thử tích hợp & an ninh
├── SECURITY.md                  # Chính sách bảo mật & quy trình báo cáo lỗ hổng
└── README.md                    # Tài liệu tổng quan dự án
```

---

## 3. Công Nghệ Sử Dụng

### Frontend (`QLCS-Client`)
- **Core:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React Icons, Clsx
- **State & Data:** React Hooks, Web Workers API, Axios
- **Desktop Runtime:** Electron (hỗ trợ đóng gói ứng dụng máy trạm Windows)
- **Kiểm thử:** Vitest (107 bài test đơn vị & logic tính tuổi tự động)

### Backend (`QLCS-Backend`)
- **Core:** Node.js, Express, TypeScript, tsx
- **CSDL & ORM:** SQLite / PostgreSQL, Prisma ORM
- **An ninh & Bảo mật:** Helmet, CORS, Crypto (AES-256-GCM), bcryptjs, jsonwebtoken (JWT)
- **Xử lý tệp:** ExcelJS, xlsx-js-style

---

## 4. Hướng Dẫn Cài Đặt & Vận Hành

### 4.1. Yêu cầu môi trường
- **Node.js:** Phiên bản `>= 18.0.0` (khuyến nghị Node 20 LTS hoặc Node 22)
- **Trình quản lý gói:** `npm` (kèm theo Node.js)
- **Hệ điều hành:** Windows 10/11 (đã tối ưu hóa đường dẫn và dịch vụ)

### 4.2. Khởi chạy Máy chủ Backend (`QLCS-Backend`)

```bash
# 1. Di chuyển vào thư mục backend
cd QLCS-Backend

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Tạo cấu hình môi trường từ mẫu
cp .env.example .env
# Chỉnh sửa khóa bí mật JWT_SECRET và ENCRYPTION_KEY trong tệp .env

# 4. Khởi tạo cơ sở dữ liệu Prisma
npx prisma db push

# 5. Nạp tài khoản quản trị mặc định (Admin Xã)
npx tsx scripts/seed-admin.ts

# 6. Khởi chạy dịch vụ backend ở chế độ phát triển (Cổng 5000)
npm run dev
```

### 4.3. Khởi chạy Ứng dụng Giao diện (`QLCS-Client`)

Mở một cửa sổ dòng lệnh mới:

```bash
# 1. Di chuyển vào thư mục client
cd QLCS-Client

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi chạy giao diện phát triển (Cổng 5173)
npm run dev
```

Sau khi khởi chạy, truy cập trình duyệt tại địa chỉ: `http://localhost:5173/`

### 4.4. Chạy kiểm thử tự động (Unit Tests)

```bash
cd QLCS-Client
npm test
```

---

## 5. Chính Sách An Toàn Thông Tin

Dự án tuân thủ nghiêm ngặt các quy định về an toàn bảo mật và bảo vệ dữ liệu cá nhân theo **Nghị định 13/2023/NĐ-CP**:
- Mọi dữ liệu định danh (số CCCD) được mã hóa tại mức lưu trữ bằng `AES-256-GCM`.
- Dữ liệu hiển thị mặc định che mờ `••••••••1234`.
- Xem chi tiết chính sách tiếp nhận và xử lý sự cố an ninh tại tệp [SECURITY.md](SECURITY.md).

---

## 6. Liên Hệ & Quản Trị Hệ Thống

- **Bộ phận phụ trách:** Ban Chuyển đổi số & Công nghệ Thông tin — UBND Xã Đăk Hà
- **Quản trị viên kho mã nguồn:** [Umnuar (GitHub)](https://github.com/Umnuar)
- **Báo cáo an ninh thông tin:** Vui lòng thực hiện theo hướng dẫn trong [SECURITY.md](SECURITY.md).
