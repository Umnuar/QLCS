# Quản Lý Chính Sách Người Cao Tuổi (QLCS) - v3.0.0

Ứng dụng desktop cấp doanh nghiệp phục vụ công tác quản lý danh sách người cao tuổi hưởng chính sách Chúc thọ & Trợ cấp Hưu trí xã hội, theo dõi chi trả, import/export Excel và đồng bộ trực tuyến.

## Công Nghệ Hiện Đại

- **Electron 42** — Khung đóng gói ứng dụng Desktop an toàn
- **React 18 + TypeScript** — Giao diện người dùng dạng đơn trang, kiểm soát kiểu chặt chẽ
- **Tailwind CSS v4** — Thiết kế hiện đại CSS-first với `@theme`
- **IndexedDB + AppContext** — Lưu trữ cache offline, tự động lưu nháp (auto-save draft 5s)
- **REST API + Prisma + PostgreSQL** — Kết nối đồng bộ CSDL tập trung bảo mật cao
- **Web Workers + xlsx-js-style** — Xử lý import/export file Excel đa luồng mượt mà

## Phát Triển & Kiểm Thử

```bash
npm run dev         # Khởi chạy Desktop App môi trường development (Vite HMR)
npm run build:vite  # Kiểm tra biên dịch TypeScript & đóng gói Vite Renderer
npm test            # Chạy toàn bộ 8 test suites (117 test cases) qua Vitest
npm run build:win   # Đóng gói bộ cài đặt Windows (.exe installer)
```

## 7 Phân Hệ Chức Năng Chính

1. **Quản Lý Thôn (`VillagesPage`)**: Quản lý danh mục thôn/buôn, phân bổ cán bộ phụ trách, xem nhanh thống kê theo địa bàn.
2. **Quản Lý Chúc Thọ (`Dashboard - chuctho`)**: Theo dõi người cao tuổi mừng thọ các mốc tròn 70, 75, 80, 85, 90, 95, 100+, cấp phát quà.
3. **Trợ Cấp Hưu Trí Xã Hội (`Dashboard - htxh`)**: Quản lý 6 diện đối tượng người cao tuổi hưởng trợ cấp xã hội hàng tháng.
4. **Báo Cáo & Thống Kê (`AnalyticsPage`)**: Biểu đồ trực quan, phân tích độ tuổi, cơ cấu trợ cấp và độ phủ chính sách.
5. **Thùng Rác Hợp Nhất (`RecycleBinPage`)**: Cơ chế Soft Delete an toàn, tìm kiếm, phân trang, khôi phục và xóa vĩnh viễn (chỉ Admin).
6. **Nhật Ký Kiểm Toán (`AuditLogPage`)**: Ghi nhận chi tiết mọi thao tác nhạy cảm (thêm, sửa, xóa, nhập/xuất Excel).
7. **Cài Đặt Hệ Thống (`Settings`)**: Quản lý cán bộ, phân quyền RBAC (Admin/Trưởng thôn), sao lưu & khôi phục CSDL, cấu hình năm mốc tính tuổi.
