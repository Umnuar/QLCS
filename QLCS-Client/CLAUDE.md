# QLCS-Client - Project Rules

## Commands
- `npm run dev` — Chạy Electron Desktop App môi trường phát triển (Vite + HMR)
- `npm run build:vite` — Biên dịch TypeScript & Vite Renderer (kiểm tra lỗi tsc & bundling)
- `npm run build:win` — Đóng gói file cài đặt Windows (.exe installer)

## Architecture
- React 18 + Vite + TailwindCSS 4 + Electron 42 + AppContext + IndexedDB
- Production Domain: `https://dulieudakha.com/api`
- Local dev API: `http://localhost:5000/api`

## Security & RBAC Rules (CRITICAL)
1. **Never send village_id manually**: The Client MUST NOT manually send `village_id` in request bodies or query params for create/update operations. The Backend automatically parses `village_id` from the user's JWT token.
2. **Token & Storage Security**:
   - Tokens (`accessToken`, `refreshToken`) và dữ liệu nhạy cảm BẮT BUỘC lưu qua `electron-store` (mã hóa AES cấp OS qua IPC `secureStorage.ts`). TUYỆT ĐỐI không lưu token vào `localStorage`.
3. **Session Security**:
   - Session Timeout là **30 phút** không hoạt động -> tự động đăng xuất và xóa cache nhạy cảm.
4. **Trưởng Thôn UI**:
   - Ẩn toàn bộ nút Sửa/Xóa Thôn, Danger Zone, tab Quản lý Cán bộ và chức năng Sao lưu/Khôi phục hệ thống đối với vai trò Trưởng thôn (`role === 'user'`).

## Architecture & Views (Cleaned v3.0.0)
- **7 Phân hệ chính (Active Views via AppContext `activeTab`):**
  - `villages`: `VillagesPage.tsx` (Quản lý danh sách thôn, gán cán bộ, thống kê theo thôn)
  - `chuctho`: `Dashboard` với `tabOverride="chuctho"` (Quản lý Chúc thọ, tính mốc tuổi 70-100+)
  - `htxh`: `Dashboard` với `tabOverride="htxh"` (Hưu trí xã hội, trợ cấp 6 diện đối tượng)
  - `analytics`: `AnalyticsPage.tsx` (Báo cáo biểu đồ, tổng hợp số liệu trực quan)
  - `recycle-bin`: `RecycleBinPage.tsx` (Thùng rác hợp nhất, phân trang, khôi phục & xóa vĩnh viễn)
  - `audit`: `AuditLogPage.tsx` (Nhật ký kiểm toán hệ thống)
  - `settings`: `Settings/index.tsx` (Cá nhân, Quản lý Cán bộ, Sao lưu/Khôi phục, Cấu hình mốc năm)
- **Legacy Cleanup (Manifest Audit Chặng 5):**
  - Đã loại bỏ hoàn toàn các view mồ côi: `DeletedProfiles/`, `VillageManager/`, `Dashboard/components/Pagination.tsx`, `BackupCard.tsx`, `UpdaterToast.tsx`, `api/index.ts`, `App.css`, `assets/react.svg`, `scripts/migrate-isDeleted.js`, `tailwind.config.js`.
  - Tailwind CSS v4 CSS-first: Cấu hình trực tiếp qua `@theme` trong `src/index.css`.

## Excel Import / Export Gotchas (CRITICAL)
- `xlsx-js-style` và `xlsx` BẮT BUỘC phải dùng **Dynamic Import (`await import(...)`)** bên trong các hàm xử lý, KHÔNG import ở top-level file để tránh kéo Node `stream` vào bundle khởi động gây crash màn hình trắng.
- `vite.config.ts` phải kích hoạt `vite-plugin-node-polyfills` cho `stream`, `buffer`, `util`.

## Data & State Management
- `AppContext` and `indexedDB.ts` manage application state, offline cache, auto-save drafts (every 5s), and sync queue.
- `formatDob` must safely handle string, number, and null/undefined values without throwing.
