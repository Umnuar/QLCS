# Architecture & Component Map: QLHK (Reference) vs QLCS (Target)

Bản đồ đối chiếu kiến trúc cây thư mục, trang (page), thành phần giao diện (component), và stylesheet giữa ứng dụng Mẫu (Reference - QLHK) và ứng dụng Đích (Target - QLCS).

---

## 1. Reference App (QLHK — "C:\Users\umnuar\Documents\Projects\QLHK" / "C:\Projects\QLHK")

* **Tech Stack**: React 18.2.0, Vite 5.1.6, Tailwind CSS v4.2.4 (`@tailwindcss/postcss`), Lucide Icons, TypeScript 5.2.2.
* **Stylesheet chính**: `QLHK-Client/src/index.css` (Tailwind v4 theme variables, Be Vietnam Pro font, JetBrains Mono font, custom scrollbar).
* **Quản lý Context**: `QLHK-Client/src/AppContext.tsx` (User, Theme, ActiveTab, SelectedVillageId, ZoomLevel, Offline/Network).

### Cây Thành Phần Giao Diện Reference (QLHK-Client)
```
QLHK-Client/src/
├── index.css                             # Tokens, typography, scrollbar, Tailwind v4
├── App.tsx                               # Router switch theo activeTab, loading splash
├── AppContext.tsx                        # Global state (user, theme, zoom, activeTab)
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx                 # Shell bao ngoài (Header, Sidebar, ConnectionBanner, main container)
│   │   ├── Header.tsx                    # Logo, Brand text, Village indicator, Zoom pill, Theme toggle, User avatar
│   │   └── Sidebar.tsx                   # Nhóm điều hướng, NavItems, active indicator pill, collapse mode, version footer
│   ├── auth/
│   │   └── LoginView.tsx                 # Card đăng nhập bo tròn rounded-3xl, floating inputs, icon Lock/User
│   ├── common/
│   │   ├── CustomSelect.tsx              # Select dropdown bo góc, search filter, portal floating
│   │   ├── TablePagination.tsx           # Thanh phân trang chuẩn: limit selector, previous/next, jump
│   │   └── ErrorBoundary.tsx             # Bắt lỗi sập giao diện, reload recovery
│   ├── network/
│   │   ├── ConnectionBanner.tsx          # Banner cảnh báo mất kết nối backend / đã kết nối lại
│   │   └── ServerStatusModal.tsx         # Modal chi tiết độ trễ, sức khỏe server
│   ├── households/                       # Phân hệ dữ liệu chính (Hộ khẩu & Nhân khẩu)
│   │   ├── HouseholdTable.tsx            # Bảng dữ liệu chính, sticky headers, tag badges, actions menu
│   │   ├── HouseholdFilterBar.tsx        # Toolbar lọc: Search, thôn, độ tuổi, loại hộ, năm tính toán, action buttons
│   │   ├── HouseholdDrawer.tsx           # Drawer slide-over xem chi tiết nhân khẩu trong hộ
│   │   ├── HouseholdModal.tsx            # Modal thêm / sửa thông tin hộ khẩu
│   │   ├── CitizenModal.tsx              # Modal thêm / sửa thông tin nhân khẩu
│   │   ├── ConflictResolutionModal.tsx   # Modal giải quyết xung đột dữ liệu CCCD
│   │   ├── AgeFilterPopover.tsx          # Popover chọn mốc tuổi
│   │   └── YearSelector.tsx              # Component chọn / nhập năm dự toán
│   ├── excel/
│   │   ├── ExcelDropzone.tsx             # Vùng kéo thả file Excel hiện đại
│   │   ├── ImportPreviewModal.tsx        # Modal preview đối soát 10 cột, sticky 3 cột đầu, phân trang import
│   │   └── ExportSettingsModal.tsx       # Modal cấu hình tham số xuất file Excel
│   ├── analytics/
│   │   └── AnalyticsDashboard.tsx        # Bảng biểu đồ KPI, thống kê phân bố theo thôn, độ tuổi
│   ├── audit/
│   │   └── AuditLogView.tsx              # Bảng nhật ký biến động dữ liệu, lọc thời gian, user
│   └── settings/
│       └── BackupRestoreTab.tsx          # Thẻ sao lưu / khôi phục dữ liệu
└── pages/
    ├── VillagesPage.tsx                  # Màn hình Quản lý Thôn (Grid VillageCards, banner đối soát, thêm thôn)
    ├── HouseholdsPage.tsx                # Trang Hộ khẩu (chứa HouseholdFilterBar + HouseholdTable + Modals)
    ├── AnalyticsPage.tsx                 # Trang Thống kê
    ├── RecycleBinPage.tsx                # Trang Thùng rác (RecycleBinTable)
    └── SettingsPage.tsx                  # Trang Cài đặt (ProfileCard, TimeCard, BackupRestoreTab)
```

---

## 2. Target App (QLCS — "C:\Users\umnuar\Documents\Projects\QLCS" / "C:\Projects\QLCS")

* **Tech Stack**: React 18.2.0, Vite 5.1.6, Tailwind CSS v4.2.4 (`@tailwindcss/postcss`), Lucide Icons, TypeScript 5.2.2.
* **Stylesheet chính**: `QLCS-Client/src/index.css`.
* **Quản lý Context**: `QLCS-Client/src/AppContext.tsx`.

### Cây Thành Phần Giao Diện Target Hiện Tại (QLCS-Client)
```
QLCS-Client/src/
├── index.css                             # Stylesheet toàn cục
├── App.tsx                               # Router switch theo activeTab (villages, chuctho, htxh, analytics...)
├── AppContext.tsx                        # Global state
├── components/
│   ├── Layout/
│   │   ├── AppLayout.tsx                 # Shell bao ngoài (Header, Sidebar, ConnectionBanner, main)
│   │   ├── Header.tsx                    # Header ứng dụng
│   │   └── Sidebar.tsx                   # Sidebar điều hướng
│   ├── common/
│   │   ├── CustomSelect.tsx              # Dropdown tùy biến
│   │   └── TablePagination.tsx           # Phân trang bảng
│   ├── network/
│   │   ├── ConnectionBanner.tsx          # Banner cảnh báo mạng
│   │   └── ServerStatusModal.tsx         # Modal trạng thái server
│   ├── settings/
│   │   └── BackupRestoreTab.tsx          # Thẻ sao lưu/khôi phục
│   └── ErrorBoundary.tsx                 # Bắt lỗi runtime
└── pages/
    ├── Login.tsx                         # Trang đăng nhập
    ├── VillagesPage.tsx                  # Trang Quản lý thôn
    ├── Dashboard/                        # Trang dữ liệu chính (dùng chung cho cả Chúc Thọ và Hưu Trí Xã Hội)
    │   ├── index.tsx                     # Header Island, stats, render ProfileFilterBar, MainTable, Modals
    │   ├── components/
    │   │   ├── MainTable.tsx             # Bảng danh sách hồ sơ
    │   │   ├── ProfileRow.tsx            # Hàng dữ liệu hồ sơ
    │   │   ├── ProfileFilterBar.tsx      # Thanh công cụ lọc hồ sơ
    │   │   ├── StatsCards.tsx            # Thẻ KPI thống kê
    │   │   └── YearSelector.tsx          # Chọn năm tính toán
    │   ├── modals/
    │   │   ├── ProfileModal.tsx          # Modal thêm / sửa hồ sơ chúc thọ / HTXH
    │   │   ├── ImportModal.tsx           # Modal import Excel đối soát
    │   │   └── ExportModal.tsx           # Modal xuất file Excel
    │   └── hooks/
    │       ├── useFilters.ts             # State lọc và phân trang
    │       ├── useProfiles.ts            # Data fetching & AbortController
    │       └── useImportExport.ts        # Worker upload / download
    ├── AnalyticsPage.tsx                 # Trang Báo cáo & Thống kê
    ├── RecycleBinPage.tsx                # Trang Thùng rác (khôi phục hồ sơ đã xóa)
    ├── AuditLogPage.tsx                  # Trang Nhật ký hoạt động
    └── Settings/
        ├── index.tsx                     # Trang Cài đặt hệ thống
        └── TimeCard.tsx                  # Thẻ điều chỉnh cấu hình thời gian
```

---

## 3. Bảng Đối Chiếu Trực Tiếp Từng Màn Hình (Screen-to-Screen Mapping Matrix)

| STT | Màn hình / Phân hệ | File Target (QLCS) | File Reference Tương Ứng (QLHK) | Ghi chú chuyển giao Visual Design |
| :---: | :--- | :--- | :--- | :--- |
| **S01** | Splash Loading | `QLCS-Client/src/App.tsx` | `QLHK-Client/src/App.tsx` | Áp dụng spinner, text typography, layout nền của QLHK |
| **S02** | Đăng Nhập | `QLCS-Client/src/pages/Login.tsx` | `QLHK-Client/src/components/auth/LoginView.tsx` | Card login bo góc 3xl, shadow, viền, floating label / icon, gradient buttons |
| **S03** | Khung Shell: Header | `QLCS-Client/src/components/Layout/Header.tsx` | `QLHK-Client/src/components/layout/Header.tsx` | Đồng bộ Logo, typography tiêu đề, badge thôn làm việc, zoom pill, user profile avatar |
| **S04** | Khung Shell: Sidebar | `QLCS-Client/src/components/Layout/Sidebar.tsx` | `QLHK-Client/src/components/layout/Sidebar.tsx` | Đồng bộ typography nhóm "DANH MỤC", bo góc item, màu hover/active emerald, icon stroke, footer QLCS v3.0.0 |
| **S05** | Khung Shell: AppLayout | `QLCS-Client/src/components/Layout/AppLayout.tsx` | `QLHK-Client/src/components/layout/AppLayout.tsx` | Đồng bộ nền `bg-slate-100/70 dark:bg-slate-900/30`, padding container, scrollbar |
| **S06** | Quản Lý Thôn | `QLCS-Client/src/pages/VillagesPage.tsx` | `QLHK-Client/src/pages/VillagesPage.tsx` | Grid cards thôn, banner đối soát toàn xã, nút thêm thôn, modal quản lý thôn |
| **S07** | Dashboard: Header Island & KPI | `QLCS-Client/src/pages/Dashboard/index.tsx`, `StatsCards.tsx` | `QLHK-Client/src/pages/HouseholdsPage.tsx` | Card Header Island bo góc 3xl, KPI badges, icon Lucide stroke 1.5, nút thao tác `[📄 Nhập Excel]` `[📥 Xuất Excel]` `[+ Thêm Hồ Sơ]` |
| **S08** | Dashboard: Filter Toolbar | `QLCS-Client/src/pages/Dashboard/components/ProfileFilterBar.tsx`, `YearSelector.tsx` | `QLHK-Client/src/components/households/HouseholdFilterBar.tsx`, `YearSelector.tsx` | Single-row filter toolbar, ô tìm kiếm không dấu, popover chọn năm dự toán, CustomSelect |
| **S09** | Dashboard: Data Table | `QLCS-Client/src/pages/Dashboard/components/MainTable.tsx`, `ProfileRow.tsx` | `QLHK-Client/src/components/households/HouseholdTable.tsx` | Sticky table header, typography tabular mono, hover hàng, badge giới tính/mốc tuổi, checkbox selection |
| **S10** | Modal: Thêm / Sửa Hồ Sơ | `QLCS-Client/src/pages/Dashboard/modals/ProfileModal.tsx` | `QLHK-Client/src/components/households/HouseholdModal.tsx`, `CitizenModal.tsx` | Modal bo góc 3xl, backdrop blur, form input style, focus trap, validation errors, nút hành động |
| **S11** | Modal: Nhập Excel Đối Soát | `QLCS-Client/src/pages/Dashboard/modals/ImportModal.tsx` | `QLHK-Client/src/components/excel/ImportPreviewModal.tsx`, `ExcelDropzone.tsx` | Vùng kéo thả file, bảng preview 10 cột đối soát sticky 3 cột đầu, status pills (hợp lệ/lỗi), phân trang modal |
| **S12** | Modal: Xuất Excel | `QLCS-Client/src/pages/Dashboard/modals/ExportModal.tsx` | `QLHK-Client/src/components/excel/ExportSettingsModal.tsx` | Tùy chọn phạm vi xuất dữ liệu, định dạng file, progress bar |
| **S13** | Trang Thống Kê | `QLCS-Client/src/pages/AnalyticsPage.tsx` | `QLHK-Client/src/pages/AnalyticsPage.tsx`, `AnalyticsDashboard.tsx` | Layout lưới card KPI, bảng tổng hợp phân bố thôn, mốc tuổi |
| **S14** | Trang Thùng Rác | `QLCS-Client/src/pages/RecycleBinPage.tsx` | `QLHK-Client/src/pages/RecycleBinPage.tsx`, `RecycleBinTable.tsx` | Bảng hồ sơ đã xóa tạm, nút khôi phục, nút xóa vĩnh viễn, alert banner |
| **S15** | Trang Nhật Ký Hoạt Động | `QLCS-Client/src/pages/AuditLogPage.tsx` | `QLHK-Client/src/components/audit/AuditLogView.tsx` | Bộ lọc nhật ký, timeline sự kiện, badge hành động (CREATE/UPDATE/DELETE/REVEAL_CCCD) |
| **S16** | Trang Cài Đặt Hệ Thống | `QLCS-Client/src/pages/Settings/index.tsx`, `TimeCard.tsx`, `BackupRestoreTab.tsx` | `QLHK-Client/src/pages/SettingsPage.tsx`, `ProfileCard.tsx`, `TimeCard.tsx`, `BackupRestoreTab.tsx` | Card cài đặt tài khoản, cấu hình mốc năm, sao lưu / khôi phục CSDL |
| **S17** | Shared: CustomSelect | `QLCS-Client/src/components/common/CustomSelect.tsx` | `QLHK-Client/src/components/common/CustomSelect.tsx` | Dropdown nổi qua React Portal, search trong dropdown, highlight item |
| **S18** | Shared: TablePagination | `QLCS-Client/src/components/common/TablePagination.tsx` | `QLHK-Client/src/components/common/TablePagination.tsx` | Selector số dòng/trang (10/20/50/100), nút Trước/Sau, chỉ báo trang hiện tại |
| **S19** | Shared: Network & Dialogs | `ConnectionBanner.tsx`, `ServerStatusModal.tsx`, `ErrorBoundary.tsx` | `ConnectionBanner.tsx`, `ServerStatusModal.tsx`, `ErrorBoundary.tsx` | Banner mất mạng/kết nối lại, modal kiểm tra độ trễ server, fallback màn hình crash |
