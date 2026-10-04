# Changelog

## 3.0.0 (2026-09-18)

### Architecture & Modernization
- **Online-First Architecture**: Chuyển đổi toàn diện sang kiến trúc REST API tập trung với Backend PostgreSQL + Prisma ORM và bộ đệm offline IndexedDB qua AppContext.
- **Unified Views**:
  - `VillagesPage` thay thế hoàn toàn `VillageManager` cũ với khả năng gán cán bộ và thống kê trực quan.
  - `RecycleBinPage` thay thế `DeletedProfiles` với cơ chế Soft Delete an toàn, phân trang và phục hồi linh hoạt.
  - `TablePagination` chuẩn hóa phân trang dữ liệu toàn hệ thống, thay thế `Pagination.tsx` cũ.
  - Tích hợp sao lưu dữ liệu tập trung trong `Settings/index.tsx`, loại bỏ `BackupCard.tsx` mồ côi.
- **Tailwind CSS v4 CSS-First**: Nâng cấp toàn diện lên Tailwind CSS v4, quản lý biến màu sắc qua `@theme` trong `index.css`, loại bỏ hoàn toàn `tailwind.config.js` cũ.

### Manifest-Driven Audit & Cleanup (Chặng 5)
- **Xóa bỏ 12 file và 3 thư mục mồ côi (giảm 1,681 dòng mã)**:
  - `src/pages/DeletedProfiles/` (`index.tsx` & thư mục)
  - `src/pages/VillageManager/` (`index.tsx`, `VillageCard.tsx` & thư mục)
  - `src/pages/Dashboard/components/Pagination.tsx`
  - `src/pages/Settings/BackupCard.tsx`
  - `src/components/UpdaterToast.tsx`
  - `src/api/index.ts` (barrel export không dùng)
  - `src/App.css` (boilerplate Vite thừa)
  - `src/assets/` (`react.svg` & thư mục)
  - `public/electron-vite.animate.svg`
  - `scripts/migrate-isDeleted.js` (script migration SQLite cũ)
  - `tailwind.config.js` (cấu hình thừa của Tailwind v3)
- **Tối ưu hóa hiệu năng & đóng gói**:
  - CSS bundle giảm 10.28 kB (từ 107.00 kB xuống 96.72 kB, gzip 14.18 kB).
  - Main Electron process giảm 11 modules transformed (từ 943 xuống 932 modules).
  - Thời gian build giảm 35.2% (từ 15.28s xuống 9.90s).
  - Thời gian chạy bộ kiểm thử Vitest giảm từ 5.62s xuống 2.67s.

### Verification & Stability
- 8/8 test files, 117/117 test cases Vitest PASS 100%.
- Biên dịch TypeScript cả Frontend (`build:vite`) và Backend (`tsc`) thành công 100% không cảnh báo lỗi.

## 2.0.0 (2026-05-18)

### Added
- **DatabaseManager** with Promise-based query queue for serialized async database access
- **Zod validation schemas** for all forms (login, profile, HTXH, village, bulk delete, export params)
- **ErrorBoundary** component wrapping the entire React app
- **useUndo** hook with localStorage persistence (max 50 entries per profile type)
- **useFormValidation** hook wrapping Zod schemas with field-level error collection
- **Soft delete** support with `isDeleted`/`deletedAt` columns and restore/hard-delete functionality
- **DeletedProfiles page** with tab switcher, search, restore, and hard-delete actions
- **Export deleted profiles** to Excel with formatted report
- **Year selection** — `calculationYear` column for milestone calculation in a configurable year
- **Service module split** — `database.ts` refactored into 9 service modules (auth, profile, htxh, village, settings, audit, age, init, helpers)
- **Performance benchmarks** verifying 10k-row operations (bulk insert, pagination, search, filter, soft delete)
- Comprehensive test coverage (139 tests) for schemas, DatabaseManager, age calculation, search helpers, useUndo, useFormValidation, and worker utilities

### Changed
- `database.ts` now delegates to `DatabaseManager` instead of direct `DatabaseSync` usage
- `buildProfileQuery` filters out soft-deleted profiles when `isDeleted` column exists
- All user-facing text using Vietnamese `localeCompare` with `'vi'` locale
- `calcMilestonesFromDob` uses stored `calculationYear` instead of always using current year
- Database schema migrations run automatically on startup (ensureIsDeletedColumns, migrateTable)
- Electron builder Linux target includes Office category

### Fixed
- "no such column: isDeleted" error on existing databases — automatic ALTER TABLE migration on startup
- Race conditions in database writes resolved via serialized query queue
- TypeScript strict mode compliance across all source files
