# Quản Lý Chính Sách Người Cao Tuổi — Xã Đăk Hà (QLCS)

Hệ thống số hóa, rà soát và thực hiện chế độ chính sách chúc thọ và hưu trí xã hội cho người cao tuổi tại xã Đăk Hà.

![Phiên bản](https://img.shields.io/badge/Phi%C3%AAn_b%E1%BA%A3n-v1.5.0-emerald) ![Nền tảng](https://img.shields.io/badge/N%E1%BB%81n_t%E1%BA%A3ng-Web_%7C_Windows_Desktop-blue) ![Giấy phép](https://img.shields.io/badge/Gi%E1%BA%A5y_ph%C3%A9p-Proprietary-slate)

> [!IMPORTANT]
> **Bản quyền thuộc Ủy ban nhân dân Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum và Tác giả (Umnuar).**  
> Mọi quyền được bảo lưu. Dự án này là phần mềm nội bộ chuyên dụng, KHÔNG áp dụng giấy phép mã nguồn mở tự do (không dùng MIT, Apache, GPL). Chi tiết xem tại mục [Thông tin duy trì & Bản quyền pháp lý](#10-thong-tin-duy-tri--ban-quyen-phap-ly).

---

## 2. Mục lục

- [1. Tiêu đề & Huy hiệu nhận diện](#quan-ly-chinh-sach-nguoi-cao-tuoi--xa-dak-ha-qlcs)
- [2. Mục lục](#2-muc-luc)
- [3. Tổng quan & Hệ sinh thái số hóa công vụ Xã Đăk Hà](#3-tong-quan--he-sinh-thai-so-hoa-cong-vu-xa-dak-ha)
- [4. Ảnh chụp màn hình](#4-anh-chup-man-hinh)
- [5. Tính năng chính](#5-tinh-nang-chinh)
- [6. Kiến trúc hệ thống & Bảng công nghệ](#6-kien-truc-he-thong--bang-cong-nghe)
- [7. Bắt đầu nhanh](#7-bat-dau-nhanh)
- [8. Cấu trúc thư mục](#8-cau-truc-thu-muc)
- [9. Bảo mật, An toàn thông tin & Giới hạn đã biết](#9-bao-mat-an-toan-thong-tin--gioi-han-da-biet)
- [10. Thông tin duy trì & Bản quyền pháp lý](#10-thong-tin-duy-tri--ban-quyen-phap-ly)

---

## 3. Tổng quan & Hệ sinh thái số hóa công vụ Xã Đăk Hà

Hệ thống **Quản Lý Chính Sách (QLCS)** được xây dựng nhằm giải quyết triệt để các khó khăn trong công tác rà soát, lập danh sách và chi trả chế độ chính sách đối với người cao tuổi tại xã Đăk Hà. Ứng dụng số hóa toàn diện quy trình tính tuổi tự động theo năm tính toán, quản lý các mốc chúc thọ theo quy định, phân loại diện đối tượng hưởng trợ cấp hưu trí xã hội, đối soát bảng kê với dữ liệu dân cư và tự động hóa khâu xử lý biểu mẫu Excel phức tạp giữa UBND xã và các thôn.

### Bảng tham chiếu chéo toàn hệ sinh thái số hóa Xã Đăk Hà

| Ứng dụng | Tên đầy đủ | Vai trò chính | Kho lưu trữ |
| :--- | :--- | :--- | :--- |
| **QLCS** | Quản lý Chính sách | Chế độ người cao tuổi, chúc thọ, hưu trí xã hội | [Umnuar/QLCS](https://github.com/Umnuar/QLCS) |
| **QLHK** | Quản lý Hộ khẩu | Dữ liệu dân cư, nhân hộ khẩu, biến động cư trú | [Umnuar/QLHK](https://github.com/Umnuar/QLHK) |
| **QLNN** | Quản lý Nông nghiệp | Quy hoạch 18 chỉ tiêu nông nghiệp, cây trồng, vật nuôi | [Umnuar/QLNN](https://github.com/Umnuar/QLNN) |
| **Unified-Portal** | Cổng Hợp Nhất | Trạm điều phối dịch vụ, giám sát tiến trình và sao lưu | Nội bộ |

---

## 4. Ảnh chụp màn hình

| Danh sách Hồ Sơ Chúc Thọ | Bảng Thống Kê & Đối Soát |
| :---: | :---: |
| ![Hồ Sơ Chúc Thọ](docs/qa/screenshots/06-dashboard-chuctho.png) | ![Thống Kê](docs/qa/screenshots/05-analytics-village-selected.png) |
| *Giao diện quản lý hồ sơ chúc thọ và lọc mốc tuổi* | *Báo cáo tổng hợp số liệu chi trả theo từng thôn* |

| Danh sách Hưu Trí Xã Hội | Quản Lý Địa Bàn 11 Thôn |
| :---: | :---: |
| ![Hưu Trí Xã Hội](docs/qa/screenshots/09-dashboard-htxh.png) | ![Quản Lý Thôn](docs/qa/screenshots/03-villages-overview.png) |
| *Giao diện quản lý diện trợ cấp hưu trí xã hội* | *Quản trị danh sách thôn và phân quyền cán bộ* |

| Hộp Thoại Thêm / Sửa Hồ Sơ | Nhập Bảng Tính Excel Thông Minh |
| :---: | :---: |
| ![Chi Tiết Hồ Sơ](docs/qa/screenshots/11-modal-add-profile.png) | ![Nhập Dữ Liệu Excel](docs/qa/screenshots/flow06_01_import_modal.png) |
| *Modal chuẩn hóa thông tin cá nhân và định danh CCCD* | *Kéo thả bảng tính, tự động khớp cột và đối soát trùng lặp* |

---

## 5. Tính năng chính

### Quản lý nghiệp vụ chuyên ngành
- **Hồ sơ chúc thọ**: Theo dõi danh sách người cao tuổi theo các mốc tuổi tròn theo quy định (tròn 60, 65, 70, 75, 80, 85, 90, 95, 100 và trên 100 tuổi). Hệ thống tự động tính tuổi chính xác theo năm tính toán và ngày tháng năm sinh, hỗ trợ đánh dấu trạng thái đã nhận quà hoặc chưa nhận quà.
- **Hưu trí xã hội (HTXH)**: Quản lý đầy đủ các diện đối tượng hưởng chế độ bảo trợ và trợ cấp xã hội (từ 75 tuổi trở lên, từ 70 đến 74 tuổi thuộc hộ nghèo/cận nghèo, diện bảo trợ xã hội, hưu trí, tuất bảo hiểm xã hội, người có công với cách mạng).
- **Bộ lọc nghiệp vụ đa chiều**: Lọc tức thì theo địa bàn thôn, khoảng độ tuổi, giới tính, dân tộc, nơi cư trú thực tế và tình trạng chi trả.
- **Thùng rác phục hồi (Recycle Bin)**: Cơ chế xóa mềm (`is_deleted`) an toàn, hỗ trợ khôi phục hồ sơ đã xóa hoặc thanh lọc vĩnh viễn với đầy đủ xác nhận bảo mật.

### Xử lý dữ liệu & Bảng tính
- **Nhập bảng tính Excel thông minh**: Hỗ trợ kéo thả các định dạng `.xlsx`, `.xls`, `.csv`. Tự động nhận diện và ánh xạ tiêu đề cột biểu mẫu, kiểm tra trùng lặp thời gian thực qua mã băm CCCD (`cccd_hash`), hiển thị hộp thoại đối soát trước khi ghi nhận vào CSDL.
- **Xử lý nền đa luồng qua Web Worker**: Tách biệt luồng xử lý phân tích hàng nghìn dòng Excel vào Web Workers (`importChucthoWorker.ts`, `importHtxhWorker.ts`), đảm bảo giao diện luôn mượt mà và không bị gián đoạn.
- **Xuất báo cáo hành chính công**: Kết xuất danh sách chi trả và danh sách chúc thọ ra file Excel theo đúng quy chuẩn hành chính công với phông chữ Times New Roman, đầy đủ tiêu ngữ, chữ ký, đường kẻ bảng và bảng tổng hợp số liệu.

### Bảo mật & Kiểm soát truy cập
- **Mã hóa dữ liệu cá nhân (CCCD)**: Sử dụng thuật toán chuẩn quân sự **AES-256-GCM** với khóa đối xứng 256-bit để mã hóa số CCCD trước khi lưu vào CSDL; hiển thị dạng che mờ an toàn `••••••••1234` trên giao diện người dùng.
- **Tìm kiếm bảo mật qua HMAC-SHA256**: Sử dụng trường băm `cccd_hash` kết hợp secret pepper để kiểm tra trùng lặp và tra cứu hồ sơ mà không cần giải mã hàng loạt.
- **Phân quyền truy cập theo địa bàn (RBAC)**: Phân quyền chặt chẽ giữa Cán bộ cấp Xã (Admin - toàn quyền quản trị và xem dữ liệu 11 thôn) và Cán bộ Thôn (User - chỉ được xem và cập nhật hồ sơ trong phạm vi `village_id` được giao).
- **Khóa lạc quan (Optimistic Concurrency Control - OCC)**: Quản lý tương tranh thông qua trường `version` trên từng bản ghi, ngăn chặn tình trạng cán bộ ghi đè dữ liệu của nhau khi cùng thao tác.
- **Nhật ký kiểm toán kép (Audit Trail)**: Ghi vết toàn bộ hành vi hệ thống (`audit_logs`) và lịch sử thay đổi chi tiết từng trường dữ liệu của hồ sơ (`profile_audit_log` ghi nhận giá trị cũ/mới dạng JSON).

### Quản trị & Báo cáo
- **Thống kê đa chiều & Đối soát**: Tổng hợp chỉ số KPI, tỷ lệ đã nhận/chưa nhận theo từng thôn hoặc toàn xã theo từng năm tính toán.
- **Đồng bộ thời gian chuẩn hệ thống**: Dịch vụ `systemTimeService` định kỳ quét ngầm 15 phút, đồng bộ thời gian chuẩn Việt Nam (`Asia/Ho_Chi_Minh` UTC+7) với cơ chế fallback đa tầng (NTP, HTTP Headers, Local Clock).
- **Lưu trữ ngoại tuyến & Bộ đệm IndexedDB**: Tích hợp IndexedDB (`idb` v8.0.2) lưu trữ an toàn cấu hình và hỗ trợ vận hành liên tục khi mất kết nối mạng.
- **Tự động sao lưu CSDL**: Cron job tự động xuất bản sao lưu CSDL vào lúc 02:00 AM hàng ngày và lưu trữ có mã hóa.

---

## 6. Kiến trúc hệ thống & Bảng công nghệ

```mermaid
graph TD
    Client["QLCS-Client (Web & Desktop Tauri v2)<br/>React 18 • Vite 5 • Tailwind CSS v4 • TypeScript"]
    Backend["QLCS-Backend (REST API :5000)<br/>Express 4.21 • TypeScript 5.6 • Prisma 6.0"]
    DB[("Cơ sở dữ liệu PostgreSQL<br/>Mã hóa AES-256-GCM • Khóa OCC (version) • Trigram Index")]
    Worker["Web Workers (Xử lý bảng tính nền)<br/>importChucthoWorker • importHtxhWorker"]

    Client -->|"HTTP / REST API (JWT Bearer Token)"| Backend
    Client -->|"Phân tích dữ liệu Excel đa luồng"| Worker
    Backend -->|"Prisma ORM Client"| DB
```

### Bảng chi tiết phiên bản công nghệ thực tế

| Thành phần | Công nghệ sử dụng | Phiên bản thực tế | Ghi chú kiến trúc |
| :--- | :--- | :--- | :--- |
| **Giao diện người dùng** | React | `^18.2.0` | React DOM `^18.2.0`, Hooks, Context API |
| **Định kiểu & Giao diện** | Tailwind CSS | `^4.2.4` | Tích hợp `@tailwindcss/postcss` v4 |
| **Bộ icon công vụ** | Lucide React | `^1.14.0` | Icon nhất quán với QLHK và QLNN |
| **Nền tảng Desktop** | Tauri v2 | `^2.2.0` | Thin-client Rust, đóng gói NSIS Installer |
| **Công cụ xây dựng Web** | Vite | `^5.1.6` | `@vitejs/plugin-react` v4.2.1 |
| **Ngôn ngữ Client** | TypeScript | `^5.2.2` | Định kiểu dữ liệu tập trung tại `src/types/` |
| **Lưu trữ ngoại tuyến** | idb (IndexedDB) | `^8.0.2` | Bộ đệm ngoại tuyến và lưu cấu hình bảo mật |
| **Máy chủ API** | Express | `^4.21.0` | RESTful API, Router module hóa |
| **Môi trường Backend** | Node.js / tsx | Node `>= 18`, tsx `^4.19.0` | TypeScript `^5.6.0` trên máy chủ |
| **Cơ sở dữ liệu & ORM** | PostgreSQL & Prisma | Prisma `^6.0.0` | Hỗ trợ tiện ích `pg_trgm` và `uuid-ossp` |
| **Bảo mật & Mã hóa** | AES-256-GCM, bcryptjs, JWT | bcryptjs `^2.4.3`, JWT `^9.0.2` | Helmet `^8.0.0`, Rate Limit `^8.0.0` |
| **Xử lý Bảng tính Excel** | xlsx, xlsx-js-style, ExcelJS | xlsx `^0.18.5`, ExcelJS `^4.4.0` | Hỗ trợ định dạng in ấn hành chính công |
| **Kiểm thử tự động** | Vitest | `^2.1.8` (BE), `^4.1.6` (FE) | Phân tầng Unit, Security, Integration |

---

## 7. Bắt đầu nhanh

### Yêu cầu môi trường
- **Node.js**: Phiên bản `>= 18.0.0` (Khuyến nghị Node.js 20+ LTS).
- **Trình quản lý gói**: `npm` phiên bản `>= 9.0.0`.
- **Cơ sở dữ liệu**: PostgreSQL `>= 14.0` (hỗ trợ tiện ích mở rộng `pg_trgm`, `uuid-ossp`) hoặc Supabase PostgreSQL.
- **Rust Toolchain**: `rustc` và `cargo` (nếu cần biên dịch gói Desktop Tauri v2).

---

### 1. Cài đặt mã nguồn

```bash
# Tải mã nguồn từ kho chính thức
git clone https://github.com/Umnuar/QLCS.git
cd QLCS

# Cài đặt phụ thuộc cho Backend
cd QLCS-Backend
npm install

# Cài đặt phụ thuộc cho Client
cd ../QLCS-Client
npm install
```

---

### 2. Cấu hình biến môi trường

#### Cấu hình Máy chủ Backend (`QLCS-Backend/.env`)
Khởi tạo tệp `.env` tại thư mục `QLCS-Backend/` từ mẫu `.env.example`:

| Tên biến | Ý nghĩa & Mô tả nghiệp vụ | Bắt buộc | Giá trị mẫu / Mặc định |
| :--- | :--- | :---: | :--- |
| `PORT` | Cổng mạng máy chủ API Express lắng nghe | Không | `5000` |
| `NODE_ENV` | Chế độ môi trường vận hành (`development` / `production`) | Không | `development` |
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL (Session / Pooler) | **Có** | `postgresql://postgres:pass@localhost:5432/qlcs_db` |
| `DIRECT_URL` | Chuỗi kết nối trực tiếp PostgreSQL (phục vụ di chuyển lược đồ) | **Có** | `postgresql://postgres:pass@localhost:5432/qlcs_db` |
| `JWT_SECRET` | Khóa bí mật dùng để ký và xác thực Access Token (tối thiểu 32 ký tự) | **Có** | *Chuỗi ngẫu nhiên bảo mật 32+ ký tự* |
| `JWT_REFRESH_SECRET` | Khóa bí mật ký Refresh Token xoay vòng (tối thiểu 32 ký tự) | **Có** | *Chuỗi ngẫu nhiên bảo mật 32+ ký tự* |
| `ENCRYPTION_KEY` | Khóa đối xứng 256-bit (đúng 64 ký tự hex) mã hóa số CCCD qua AES-256-GCM | **Có** | `0123456789abcdef0123456789abcdef...` |
| `CCCD_HASH_PEPPER` | Khóa gia vị bí mật (Pepper) dùng cho hàm băm HMAC tra cứu CCCD | **Có** | *Chuỗi gia vị bảo mật* |
| `BACKUP_ENCRYPTION_KEY` | Khóa bí mật mã hóa tệp sao lưu dữ liệu xuất ra | Không | *Chuỗi khóa mã hóa sao lưu* |
| `CORS_ORIGIN` | Danh sách nguồn gốc được phép kết nối API (phân tách bằng dấu phẩy) | **Có** | `https://qlcs.dulieudakha.vn,http://localhost:5173,http://tauri.localhost` |

#### Cấu hình Ứng dụng Client (`QLCS-Client/.env` hoặc `.env.local`)

| Tên biến | Ý nghĩa & Mô tả nghiệp vụ | Bắt buộc | Giá trị mẫu / Mặc định |
| :--- | :--- | :---: | :--- |
| `VITE_API_URL` | Địa chỉ endpoint API Backend phục vụ giao diện | **Có** | `http://localhost:5000/api` (dev) hoặc `https://qlcs.dulieudakha.vn/api` (prod) |

---

### 3. Khởi chạy môi trường phát triển

```bash
# CỬA SỔ TERMINAL 1: Khởi chạy Máy chủ Backend
cd QLCS-Backend
npm run prisma:generate      # Sinh mã nguồn Prisma Client
npm run prisma:push          # Đồng bộ cấu trúc bảng vào CSDL
npm run seed                 # Nạp dữ liệu 11 thôn và tài khoản cán bộ mặc định
npm run dev                  # Khởi chạy Express API tại http://localhost:5000

# CỬA SỔ TERMINAL 2: Khởi chạy Giao diện Client Web
cd QLCS-Client
npm run dev                  # Khởi chạy Vite dev server tại http://localhost:5173

# HOẶC KHỞI CHẠY BẢN DESKTOP TAURI V2 (Cửa sổ ứng dụng độc lập)
cd QLCS-Client
npm run tauri dev            # Khởi chạy ứng dụng Windows Desktop với tính năng Hot-Reload
```

---

### 4. Kiểm thử tự động (Automated Tests)

Toàn bộ hệ thống được bảo vệ bởi **22 tệp kiểm thử tự động với 224 bài test đạt tỷ lệ vượt qua 100%**:

```bash
# 1. Kiểm thử Backend (8 tệp, 69 bài test: Unit, Security RBAC, OCC, Crypto, SystemTime)
cd QLCS-Backend
npm test

# 2. Kiểm thử Client (14 tệp, 155 bài test: Unit, IndexedDB, Excel, Schemas, TimeCard)
cd QLCS-Client
npm test
```

---

### 5. Đóng gói phát hành (Build & Packaging)

```bash
# Đóng gói bản Web Client phục vụ triển khai máy chủ
cd QLCS-Client
npm run build          # Biên dịch TypeScript và tạo gói tĩnh tại QLCS-Client/dist/

# Đóng gói bản Windows Desktop Installer (.exe) qua Tauri v2
cd QLCS-Client
npm run tauri build    # Tạo bộ cài NSIS tại src-tauri/target/release/bundle/nsis/
```

---

## 8. Cấu trúc thư mục

```
QLCS/
├── QLCS-Backend/                 # Máy chủ REST API Express, Prisma ORM và dịch vụ lõi
│   ├── prisma/                   # Lược đồ cơ sở dữ liệu (schema.prisma) & PostgreSQL extensions
│   ├── scripts/                  # Kịch bản nạp dữ liệu thôn/cán bộ, xoay khóa, dọn dẹp CSDL
│   ├── src/
│   │   ├── config/               # Cấu hình Prisma Client, môi trường và kết nối
│   │   ├── controllers/          # Bộ điều khiển xử lý logic (chuctho, htxh, auth, villages...)
│   │   ├── middlewares/          # Xác thực JWT, phân quyền RBAC thôn, rate limiting, logger
│   │   ├── routes/               # Khai báo các điểm cuối API RESTful
│   │   ├── services/             # Dịch vụ đồng bộ thời gian (systemTime), kiểm toán (audit)
│   │   └── utils/                # Tiện ích mật mã học AES-256-GCM, tính tuổi, xử lý chuỗi
│   └── tests/                    # Bộ kiểm thử tự động phân tầng (unit, security, integration)
├── QLCS-Client/                  # Ứng dụng Desktop Tauri v2 và giao diện người dùng React
│   ├── public/                   # Tài sản tĩnh (File_Mau_Chuc_Tho.xlsx, favicon, icons)
│   ├── src/
│   │   ├── api/                  # Axios HTTP client, interceptors tự động làm mới JWT
│   │   ├── components/           # Thành phần UI phân tách theo domain (dashboard, settings, common)
│   │   │   ├── dashboard/        # Bảng hồ sơ, thanh lọc, thẻ thống kê, modal nhập/xuất/chi tiết
│   │   │   └── settings/         # Thẻ hiển thị/đồng bộ thời gian (TimeCard), sao lưu CSDL
│   │   ├── contexts/             # React Context quản lý phiên đăng nhập và quyền cán bộ
│   │   ├── db/                   # Lớp lưu trữ ngoại tuyến IndexedDB (idb)
│   │   ├── hooks/                # Custom hooks (useProfiles, useFilters, useImportExport...)
│   │   ├── pages/                # Kiến trúc tệp phẳng (DashboardPage, SettingsPage, AnalyticsPage...)
│   │   ├── types/                # Định nghĩa kiểu dữ liệu tập trung toàn hệ thống (types/index.ts)
│   │   ├── utils/                # Tiện ích phân tích Excel, tính tuổi, kiểm tra dữ liệu Zod
│   │   └── workers/              # Web Workers phân tích bảng tính Excel đa luồng trong nền
│   └── src-tauri/                # Mã nguồn tiến trình gốc Rust, cấu hình cửa sổ & NSIS bundle
├── docs/                         # Tài liệu thẩm định kỹ thuật, an toàn thông tin & ảnh chụp màn hình
├── qlcs_document.md              # Sổ tay kỹ thuật kiến trúc toàn diện của phân hệ QLCS
├── SECURITY.md                   # Chính sách an toàn thông tin và quy trình xử lý lỗ hổng
└── README.md                     # Tài liệu tổng quan dự án chuẩn hóa v1.5.0
```

---

## 9. Bảo mật, An toàn thông tin & Giới hạn đã biết

### Chính sách an toàn thông tin cốt lõi
- **Mã hóa dữ liệu định danh**: Dữ liệu số CCCD được mã hóa đối xứng bằng khóa AES-256-GCM trước khi lưu trữ; tuyệt đối không lưu CCCD dạng bản rõ (plaintext).
- **Phân tách thẩm quyền nghiêm ngặt**: Cán bộ cấp thôn bị giới hạn truy cập dữ liệu cứng tại tầng Database Query (`WHERE village_id = user.village_id`), ngăn chặn triệt để hành vi leo thang đặc quyền (Privilege Escalation).
- **Nhật ký kiểm toán bất biến**: Mọi thao tác thêm, cập nhật, xóa, khôi phục hoặc xuất dữ liệu đều được lưu vết đầy đủ trong `audit_logs` và `profile_audit_log`.
- **Chính sách báo cáo lỗ hổng**: Để báo cáo vấn đề an ninh bảo mật hoặc lỗ hổng kỹ thuật, vui lòng tham chiếu quy trình chi tiết tại tệp [SECURITY.md](SECURITY.md).

### Trạng thái vận hành & Giới hạn đã biết
- **Trạng thái**: Hệ thống v1.5.0 đã hoàn thành kiểm thử toàn diện, hoạt động ổn định trên cả môi trường Web và Desktop Windows trong mạng nội bộ xã Đăk Hà.
- **Giới hạn đã biết**:
  - Tính năng nhập bảng tính Excel yêu cầu dữ liệu nguồn tuân thủ các cột định danh cơ bản; trường hợp biểu mẫu bị xáo trộn thứ tự cột, cán bộ cần kiểm tra lại tại màn hình xem trước đối soát.
  - Bộ cài đặt Desktop hiện tại được tối ưu hóa cho hệ điều hành Windows 10/11 x64; các phiên bản dành cho macOS và Linux sẽ được cấu hình khi có yêu cầu thực tế.
- **Lộ trình nâng cấp**: Tiếp tục mở rộng tính năng liên thông dữ liệu danh bạ dân cư với QLHK và chuẩn bị tích hợp cơ chế đăng nhập một lần (SSO) qua Unified-Portal.

---

## 10. Thông tin duy trì & Bản quyền pháp lý

- **Đơn vị quản lý & thụ hưởng**: Ban Chỉ đạo Chuyển đổi số Ủy ban nhân dân Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum.
- **Tác giả phát triển**: [Umnuar (GitHub)](https://github.com/Umnuar).
- **Kênh tiếp nhận kỹ thuật & nghiệp vụ**: `baotruongminh201@gmail.com`.

### Tuyên bố bản quyền & Giấy phép độc quyền

```
BẢN QUYỀN SỞ HỮU TRÍ TUỆ © 2026 THUỘC VỀ:
ỦY BAN NHÂN DÂN XÃ ĐĂK HÀ, HUYỆN ĐĂK HÀ, TỈNH KON TUM VÀ TÁC GIẢ (UMNUAR).
TOÀN BỘ QUYỀN ĐƯỢC BẢO LƯU (ALL RIGHTS RESERVED).

Dự án này là phần mềm nội bộ chuyên dụng thuộc chương trình Chuyển đổi số 
công vụ của UBND Xã Đăk Hà. Dự án KHÔNG áp dụng các giấy phép mã nguồn mở tự do 
như MIT, Apache, GNU General Public License (GPL) hay các giấy phép tương đương.

Nghiêm cấm mọi hành vi sao chép, trích xuất mã nguồn, phân phối lại, sửa đổi, 
cho thuê hoặc thương mại hóa một phần hoặc toàn bộ hệ thống dưới bất kỳ hình thức 
nào khi chưa có văn bản chấp thuận chính thức từ Ủy ban nhân dân Xã Đăk Hà.
```
