# BẢNG TỔNG HỢP KIỂM KÊ 100% GIAO DIỆN TARGET APP (QLCS)

> **Chiến dịch**: Đồng Bộ Giao Diện UI-Sync (QLHK -> QLCS)  
> **Người thực hiện**: Orchestrator (Hợp nhất kết quả từ Subagent 1A, Subagent 1B, Subagent 1C)  
> **Tài liệu nguồn**: `ui-sync/00_screens_pages.md`, `ui-sync/00_screens_modals.md`, `ui-sync/00_screens_states.md`, `ui-sync/map.md`  
> **Ngày phê chuẩn**: 03/10/2026  
> **Trạng thái**: 🟢 **100% ĐỘ PHỦ — SẴN SÀNG CHO PHA 2**

---

## NGUYÊN TẮC BẤT BIẾN (INVARIANT PRINCIPLE - BẢO LƯU 100%)

> **COPY FORM ONLY, KEEP CONTENT INTACT**
>
> 1. **FORM (Sao chép từ REFERENCE QLHK)**: Design tokens (màu sắc emerald/slate, layer surface, borders, radii rounded-2xl/3xl, shadows, spacing, typography Be Vietnam Pro / JetBrains Mono, Lucide icons stroke 1.5, shell layout, interaction behavior, density, responsive rules).
> 2. **CONTENT (Giữ nguyên 100% từ TARGET QLCS)**: Tên trang, nhãn tiếng Việt, dữ liệu nghiệp vụ, các cột bảng, bộ lọc, số lượng nút bấm, tính năng nghiệp vụ, logic tính toán, quyền hạn (Admin vs Cán bộ thôn).
> 3. **Tuyệt đối không dịch, sửa hay "cải tiến" bất kỳ câu từ Tiếng Việt nào của ứng dụng đích.**
> 4. Mọi thứ TARGET có phải được giữ nguyên đầy đủ. Mọi thứ REFERENCE có mà TARGET thiếu sẽ không tự ý thêm vào mà chỉ ghi nhận đề xuất.
> 5. Tuyệt đối không chuyển dịch logic nghiệp vụ, dữ liệu hoặc văn bản giữa 2 ứng dụng.

---

## TỔNG HỢP SỐ LIỆU KIỂM KÊ HỆ THỐNG

- **Tổng số Trang & Shell Screens**: 21 màn hình / phân hệ (**S01 – S21**).
- **Tổng số Modals, Drawers & Popovers**: 17 thành phần (**M01 – M11, P01 – P06**).
- **Tổng số Hộp thoại xác nhận rủi ro (Confirm Dialogs)**: 9 hộp thoại (**C01 – C09**).
- **Tổng số Trạng thái bên trong & Phản hồi (Inner-Screen & Feedback States)**: 129 trạng thái chi tiết (**ST01 – ST129**).
- **Tổng số cột bảng dữ liệu đối soát**: 11 cột (Chúc Thọ) và 13 cột (Hưu Trí Xã Hội).
- **Tỷ lệ bảo tồn nội dung Tiếng Việt**: **100.0%** (0 từ bị thay đổi hoặc dịch lại).

---

## I. MASTER INVENTORY TABLE: CÁC TRANG CHÍNH & KHUNG SHELL (S01 - S21)

| ID | Name (Tên Màn Hình) | Path / File | Type | Trigger / Phân Quyền | Current Tokens & Classes | Key Components | Notes (Ghi Chú Nghiệp Vụ) |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **S01** | Splash Loading | `src/App.tsx` | Splash Screen | `isInitializing === true` / Mọi Role | `bg-slate-100 dark:bg-slate-950`, `border-3 border-emerald-500/30 border-t-emerald-500 animate-spin` | Spinner quay tròn, text "Đang khởi tạo hệ thống QLCS..." | Chạy khi nạp token từ `secureStorage` và IndexedDB ban đầu |
| **S02** | Đăng Nhập | `src/pages/Login.tsx` | Page (Auth) | `!user && !isInitializing` / Công khai | `bg-slate-50 dark:bg-slate-950`, Card: `rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl border-t-4 border-t-emerald-600` | Icon Users, Title "Đăng nhập", Subtitle UBND ĐĂK HÀ, Alert lỗi, Input Username/Password, Eye toggle, Nút ĐĂNG NHẬP | Nút đăng nhập xanh emerald, bảo mật dữ liệu Đăk Hà |
| **S03** | Khung Shell: Header | `src/components/Layout/Header.tsx` | Shell Component | Sau khi đăng nhập / Mọi Role | `h-16 bg-slate-900 border-b border-slate-800 sticky top-0 z-30 select-none shadow-xs text-white` | Brand Logo FileText + UBND XÃ ĐĂK HÀ, Zoom Pill, Theme toggle, Village Indicator, Network/Latency Pill, User avatar, Nút Đăng xuất | Cố định trên mọi màn hình làm việc |
| **S04** | Khung Shell: Sidebar | `src/components/Layout/Sidebar.tsx` | Shell Component | Sau khi đăng nhập / RBAC Admin vs Thôn | `bg-slate-950 text-slate-300 border-r border-slate-800/80 w-16 md:w-64`, active: `bg-emerald-600 text-white shadow-md rounded-2xl` | Header "DANH MỤC", Nút thu gọn/mở rộng, 7 NavItems (Admin) / 4 NavItems (Thôn), Footer QLCS v3.0.0 | Admin thấy 7 mục điều hướng; Cán bộ thôn thấy 4 mục (Thống Kê, Chúc Thọ, HTXH, Thùng Rác) |
| **S05** | Khung Shell: AppLayout | `src/components/Layout/AppLayout.tsx` | Shell Container | Sau khi đăng nhập / Bọc toàn bộ các trang | `flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950`, container: `p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-900/30` | Header + ConnectionBanner + Sidebar + `<main>` scrollable | Điều phối trạng thái kết nối mạng và scroll layout |
| **S06** | Quản Lý Thôn | `src/pages/VillagesPage.tsx` | Page | `activeTab === 'villages'` / Admin Only | Banner: `bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 rounded-3xl text-white shadow-xl`, Cards: `rounded-3xl border-2 hover:border-emerald-500` | Banner tổng quan toàn xã + Button xem đối soát, 4 KPI cards (Địa Bàn, Chúc Thọ, HTXH, Tiến Độ), Toolbar tìm kiếm thôn + Nút Thêm Thôn, Lưới 7 thẻ thôn | Màn hình đầu tiên khi Admin đăng nhập |
| **S07** | Dashboard: Header Island & KPI | `src/pages/Dashboard/index.tsx`, `StatsCards.tsx` | Sub-shell / Container | `activeTab === 'chuctho'` hoặc `activeTab === 'htxh'` | Header Island: `bg-white dark:bg-slate-900 p-5 rounded-3xl border shadow-sm`, Cards: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-3xl` | Scope thôn badge, Title "Hồ Sơ Chúc Thọ" / "Hưu Trí Xã Hội", Năm tính toán badge, Nút Đổi Thôn, Nút Nhập Excel, Nút Xuất Excel, Nút Thêm Hồ Sơ, 4 Thẻ KPI | Dùng chung cho cả 2 phân hệ Chúc Thọ và Hưu Trí Xã Hội |
| **S08** | Dashboard: Thanh Công Cụ Lọc | `src/pages/Dashboard/components/ProfileFilterBar.tsx`, `YearSelector.tsx` | Toolbar Component | Nằm trên Dashboard / Mọi Role | `flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border shadow-xs` | Ô tìm kiếm họ tên/CCCD + nút xóa + nút refresh, YearSelector popover chọn năm, Dropdown Độ Tuổi (CT) / Diện Hưởng (HTXH), Dropdown Giới tính, Dân tộc, Cư trú, Thôn, Quà tặng, Nút Xóa Lọc | Tự động reset bộ lọc mốc tuổi khi đổi giữa 2 tab Chúc thọ <-> HTXH |
| **S09** | Dashboard: Bảng Dữ Liệu Hồ Sơ | `src/pages/Dashboard/components/MainTable.tsx`, `ProfileRow.tsx` | Data Table Component | Nằm trên Dashboard / Mọi Role | `bg-white dark:bg-slate-900 rounded-3xl border shadow-sm overflow-hidden`, Thead sticky: `bg-slate-100/95 dark:bg-slate-950 font-black uppercase text-[11px]` | Info bar tổng số dòng + mẹo bấm dòng, Floating batch action toolbar, Sticky checkbox (cột 1), Sticky thao tác (cột cuối), Phân nhóm mốc tuổi/diện, Tag lỗi inline, Toggle xem CCCD, Toggle trạng thái quà tặng nhanh | Tab Chúc Thọ: 11 cột; Tab HTXH: 13 cột (thêm 3 cột: Đủ 75+, 70-74 Nghèo, Chế độ hưởng) |
| **S10** | Modal: Thêm / Sửa Hồ Sơ | `src/pages/Dashboard/modals/ProfileModal.tsx` | Modal Dialog (Portal) | Bấm Thêm Hồ Sơ, Ctrl+N, hoặc bấm dòng bảng | `fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs`, Container: `max-w-3xl h-[88vh] rounded-3xl bg-white dark:bg-slate-900 border shadow-2xl` | Header modal (icon User, title, badge mốc tuổi tính toán, tabs Thông Tin / Lịch Sử, nút X), Form 10 fields thông tin cá nhân + 6 checkboxes diện HTXH, Tab lịch sử audit log, Footer nút Hủy Bỏ + nút Lưu Thay Đổi | Tự động tính toán mốc tuổi tròn theo năm dự toán đang chọn |
| **S11** | Modal: Nhập Excel Đối Soát | `src/pages/Dashboard/modals/ImportModal.tsx` | Modal Workflow (Portal) | Bấm `[Nhập Excel]` trên Dashboard | `fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs`, Container: `max-w-6xl max-h-[92vh] rounded-3xl bg-white dark:bg-slate-900 border shadow-2xl` | 3 bước: (1) Drag-and-drop dropzone + tải template, (2) Khớp cột dữ liệu tự động/thủ công + lưu mẫu template, (3) Bảng preview đối soát 10 cột sticky 3 cột đầu + highlight ô lỗi ngày sinh + phân trang preview + Nút Xác nhận nhập | Tự động nhận dạng loại file Excel: Chúc Thọ, HTXH, hoặc Cử Tri |
| **S12** | Modal: Xuất Báo Cáo Excel | `src/pages/Dashboard/modals/ExportModal.tsx` | Modal Dialog (Portal) | Bấm `[Xuất Excel]` trên Dashboard | `fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-md`, Container: `max-w-lg rounded-3xl bg-white dark:bg-slate-900 border shadow-2xl` | Banner phạm vi xuất, Checkbox "Chỉ xuất N hồ sơ đang chọn", Danh sách nút chọn/bỏ chọn từng thôn, Chỉ báo tổng số hồ sơ xuất, Nút Hủy và Nút Xuất File | Giữ nguyên các bộ lọc tìm kiếm hiện hành khi kết xuất |
| **S13** | Trang Thống Kê Báo Cáo & Đối Soát | `src/pages/AnalyticsPage.tsx` | Page | `activeTab === 'analytics'` / Mọi Role | Cards: `bg-white dark:bg-slate-900 rounded-3xl border shadow-sm`, Table: `border-separate border-spacing-0 whitespace-nowrap` | Header chọn năm & thôn, 4 KPI cards (Tổng đối tượng, Đã nhận, Chưa nhận, Tiến độ), 2 Biểu đồ MiniDonut SVG tròn (Giới tính & Dân tộc), 2 Blocks thanh phân bố, Bảng đối soát số liệu các thôn (10 cột) + Dòng tổng cộng toàn xã | Admin được lọc theo thôn hoặc xem toàn xã; Cán bộ thôn bị cố định tại địa bàn quản lý |
| **S14** | Trang Thùng Rác | `src/pages/RecycleBinPage.tsx` | Page | `activeTab === 'recycle-bin'` / Mọi Role | `space-y-6 pb-12`, Header banner: `bg-white dark:bg-slate-900 rounded-3xl border shadow-sm`, Table: `border-separate border-spacing-0 whitespace-nowrap` | Header banner + nút Khôi phục hàng loạt + nút Xóa vĩnh viễn hàng loạt (Admin), Tabs chuyển "Thùng Rác Chúc Thọ" & "Thùng Rác HTXH", Ô tìm kiếm, Bảng 8 cột, Nút khôi phục / xóa vĩnh viễn, Phân trang TablePagination | Cán bộ thôn chỉ có quyền khôi phục; quyền xóa vĩnh viễn khỏi CSDL chỉ dành riêng cho Admin |
| **S15** | Trang Nhật Ký Hoạt Động & Biến Động | `src/pages/AuditLogPage.tsx` | Page | `activeTab === 'audit'` / Admin Only | `space-y-6 pb-12`, Timeline card: `bg-slate-50/60 dark:bg-slate-950/60 rounded-2xl border hover:border-emerald-500/40 p-4.5` | Header banner, Thanh lọc sự kiện nhanh (7 nút: Tất Cả, Thêm Mới, Cập Nhật, Đổi Trạng Thái, Xóa, Khôi Phục, Nhập Excel), Thanh lọc chi tiết 4 cột, Dòng thời gian Timeline, Trình phân tích JSON Diff, Nút Tải Thêm Dữ Liệu | Theo dõi và đối soát mọi thao tác can thiệp dữ liệu |
| **S16** | Trang Cài Đặt Hệ Thống | `src/pages/Settings/index.tsx`, `TimeCard.tsx`, `BackupRestoreTab.tsx` | Page / Tabbed Container | `activeTab === 'settings'` / Phân quyền Admin vs Thôn | `max-w-5xl mx-auto space-y-6 pb-12`, Tabs header: `rounded-2xl border p-1.5`, Cards: `rounded-3xl border shadow-sm p-6` | Thanh điều hướng 5 tabs: (1) Tài Khoản Của Tôi, (2) Quản Lý Cán Bộ Thôn [Admin], (3) Sao Lưu CSDL [Admin], (4) Thông Tin Đơn Vị & Hệ Thống, (5) Cài Đặt Thời Gian & Năm Tính Tuổi | Admin xem đủ 5 tabs; Cán bộ thôn xem 3 tabs (profile, system, time) |
| **S16a** | Cài Đặt: Tài Khoản Của Tôi | `src/pages/Settings/index.tsx` (lines 431-615) | Sub-tab | Mọi Role | `grid grid-cols-1 md:grid-cols-2 gap-6` | Card 1: Avatar chữ cái, Username, Trạng thái, Vai trò, Đơn vị, Thôn phụ trách, Nút Đăng Xuất. Card 2: Form đổi mật khẩu cá nhân (MK hiện tại, MK mới, Xác nhận MK mới, Eye toggle, Nút Cập Nhật Mật Khẩu) | Cán bộ tự đổi mật khẩu tài khoản |
| **S16b** | Cài Đặt: Quản Lý Cán Bộ Thôn | `src/pages/Settings/index.tsx` (lines 617-1045) | Sub-tab + Modals | Admin Only | Bảng: `bg-white dark:bg-slate-900 rounded-3xl border overflow-hidden` | Header danh sách + Nút Thêm Cán Bộ, Form tạo tài khoản, Bảng 5 cột quản lý cán bộ, Modal Đặt Lại Mật Khẩu, Modal Phân Công Thôn | Admin cấp phát và quản trị tài khoản cán bộ thôn |
| **S16c** | Cài Đặt: Sao Lưu CSDL | `src/components/settings/BackupRestoreTab.tsx` | Sub-tab Component | Admin Only | Container: `max-w-3xl rounded-3xl border p-6 space-y-6` | Khối Xuất Bản Sao Lưu (Download snapshot JSON), Khối Phục Hồi Dữ Liệu (Upload file JSON ghi đè CSDL), Huy hiệu bảo mật CSDL quốc gia | Phục vụ an toàn dữ liệu và sao lưu dự phòng |
| **S16d** | Cài Đặt: Thông Tin Đơn Vị & Hệ Thống | `src/pages/Settings/index.tsx` (lines 1055-1272) | Sub-tab | Mọi Role | Form: `rounded-3xl border p-6 space-y-4` | Form thông tin hành chính 6 ô (Cơ quan/UBND, Huyện, Tỉnh, Địa chỉ, Điện thoại, Email công vụ) + Nút Lưu; Khối thông tin phần mềm (QLCS Desktop v3.0.0 Online-First, PostgreSQL Enterprise) | Đồng bộ tiêu đề xuất bản báo cáo hành chính |
| **S16e** | Cài Đặt: Thời Gian & Năm Tính Tuổi | `src/pages/Settings/TimeCard.tsx` | Sub-tab Component | Mọi Role | Container: `max-w-3xl space-y-6`, Live clock: `p-5 rounded-2xl bg-emerald-50/40 border-emerald-100 dark:bg-slate-800/50` | Khối 1: Năm Tính Toán Chúc Thọ Toàn Hệ Thống (Input số năm, nút Lưu, 4 nút chọn nhanh 2024-2027); Khối 2: Nguồn Thời Gian (Đồng hồ live, độ lệch offset, 3 chế độ: Theo máy tính, Internet, Thiết lập thủ công) | Đảm bảo tính toán tuổi công dân chính xác theo niên khóa |
| **S17** | Shared: CustomSelect | `src/components/common/CustomSelect.tsx` | Shared Component | Dùng chung toàn app | Trigger: `rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800`, Portal: `z-[100000] rounded-2xl border shadow-2xl` | Trigger button với label/placeholder/chevron, Dropdown nổi React Portal, Ô tìm kiếm nhanh (>8 options), Danh sách tùy chọn highlight bàn phím, Nút xóa lựa chọn (Clearable) | Tránh tràn layout và che khuất trong bảng biểu / modal |
| **S18** | Shared: TablePagination | `src/components/common/TablePagination.tsx` | Shared Component | Dùng chung bảng dữ liệu | `p-3.5 bg-slate-50/90 dark:bg-slate-950/80 border-t flex items-center justify-between` | Chỉ báo dòng hiển thị ("Hiển thị X-Y trong tổng số Z bản ghi"), Selector số dòng/trang (10, 20, 50, 100), Nút chuyển trang Trước/Sau, Chỉ báo trang hiện tại | Chuẩn phân trang đồng bộ trên toàn bộ các trang dữ liệu |
| **S19** | Shared: Network & Dialogs Hệ Thống | `ConnectionBanner.tsx`, `ServerStatusModal.tsx` | Shared Feedback | Khi mất mạng / phục hồi / kiểm tra độ trễ | Banner: `bg-gradient-to-r from-amber-600 to-rose-700` (Offline) / `bg-emerald-600` (Reconnected); Modal: `max-w-sm rounded-3xl border` | ConnectionBanner cảnh báo ngoại tuyến kèm nút Thử lại kết nối; ServerStatusModal chẩn đoán sức khỏe máy chủ (ONLINE/OFFLINE, ms, URL, Phiên bản) | Bảo đảm tính ổn định và minh bạch mạng |
| **S20** | Modal Chi Tiết Chính Sách HTXH | `ProfileRow.tsx` (lines 347-422) | Modal Dialog (Portal) | Bấm nút `{N} CHÍNH SÁCH` trên cột bảng | `fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs`, Dialog: `max-w-sm rounded-3xl border shadow-2xl` | Header modal (icon Activity, title "CHI TIẾT CHÍNH SÁCH", tên đối tượng, nút X), Danh sách chính sách đang hưởng (Bảo trợ, Hưu trí, Hưu tuất, Người có công) + icon CheckCircle2 | Xem chi tiết chế độ hưởng của hồ sơ Hưu trí xã hội |
| **S21** | Màn Hình Bắt Lỗi Runtime | `src/components/ErrorBoundary.tsx` | Error Fallback Screen | Khi có lỗi JavaScript sập component tree | `min-h-screen flex flex-col items-center justify-center p-5 text-center` | Tiêu đề "Đã xảy ra lỗi", Lời nhắn người dùng, Khung hiển thị chi tiết stack trace kỹ thuật, Nút "Tải lại trang" | Bảo vệ ứng dụng không bị màn hình trắng (White Screen of Death) |

---

## II. MASTER INVENTORY TABLE: MODALS, DRAWERS & POPOVERS (M01 - M11, P01 - P06, G01)

| ID | Name (Tên Thành Phần) | Path / File | Type | Trigger | Current Tokens & Classes | Key Components / Controls | Notes (Ghi Chú Đồng Bộ Form) |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **M01** | `ProfileModal` (Thêm / Sửa Hồ Sơ) | `src/pages/Dashboard/modals/ProfileModal.tsx` | Centered Modal / Drawer | Nút Thêm Mới Hồ Sơ, Nút Sửa, Click dòng | `max-w-3xl h-[88vh] rounded-3xl bg-white dark:bg-slate-900 border shadow-2xl`, Backdrop `bg-slate-950/60 backdrop-blur-xs` | 10 Input cơ bản + 6 Checkbox diện HTXH + Tab Lịch Sử Thay Đổi (`auditLogs`), Nút Hủy Bỏ, Nút Lưu Thay Đổi | Aliased là `ProfileDrawer`; đối ứng với `HouseholdDrawer` / `CitizenModal` của QLHK |
| **M02** | `ImportModal` - Màn 1: Dropzone | `src/pages/Dashboard/modals/ImportModal.tsx` | Centered Modal | Nút Nhập Excel | `max-w-6xl max-h-[92vh] rounded-3xl border shadow-2xl`, Backdrop `bg-slate-900/60` | Vùng kéo thả tệp (`.xlsx,.xls,.csv`), Nút "Chọn Tệp Excel", Nút "Tải Biểu Mẫu Chuẩn (.xlsx)" | Màn hình đầu vào nhập liệu Excel đối ứng với `ExcelDropzone` của QLHK |
| **M03** | `ImportModal` - Màn 2: Khớp Cột (Mapping) | `src/pages/Dashboard/modals/ImportModal.tsx` | Centered Modal | Sau khi chọn tệp Excel (`mappingData`) | `max-w-6xl max-h-[92vh] rounded-3xl border shadow-2xl` | Dropdown "Mẫu đã lưu", Lưới khớp cột chung + mốc tuổi/diện HTXH, Checkbox áp dụng hàng loạt, Input lưu tên mẫu | Tính năng đặc thù thông minh của QLCS, giữ nguyên 100% logic và chuỗi văn bản Tiếng Việt |
| **M04** | `ImportModal` - Màn 3: Bảng Đối Soát 10 Cột | `src/pages/Dashboard/modals/ImportModal.tsx` | Centered Modal | Sau khi xác nhận khớp cột | Table `min-w-[1100px]`, 3 cột đầu sticky, dòng lỗi tô màu rose | Bảng 10 cột dữ liệu (STT, Thôn, Họ tên, Ngày sinh, Giới tính, Dân tộc, CCCD, Địa chỉ, Mốc/Diện, Ghi chú), Badge đếm hợp lệ/lỗi, Phân trang 10/20/50/100 | Đối ứng với `ImportPreviewModal` của QLHK |
| **M05** | `ImportModal` - Màn 4: Tiến Trình Nhập | `src/pages/Dashboard/modals/ImportModal.tsx` | Modal State | Bấm nút "Xác Nhận Nhập" (`isImporting === true`) | Spinner xoay tròn màu emerald, Thanh tiến trình `h-3 bg-slate-100 rounded-full`, Thanh trượt `bg-emerald-600` | Tiêu đề "Đang xử lý dữ liệu...", Text cảnh báo, Thanh tiến trình, Nhãn % (`importProgress%`) | Hiển thị quá trình xử lý import dữ liệu lớn |
| **M06** | `ImportModal` - Màn 5: Kết Quả Nhập | `src/pages/Dashboard/modals/ImportModal.tsx` | Centered Dialog | Import hoàn tất (`importResult !== null`) | `max-w-3xl max-h-[80vh] rounded-3xl shadow-2xl border`, Backdrop `bg-slate-900/80` | 3 Thẻ thống kê (Thêm mới, Cập nhật, Lỗi/Cảnh báo), Danh sách log lỗi viền cam, Nút "Lưu log lỗi ra file", Nút "ĐÓNG" | Báo cáo chi tiết sau khi ghi CSDL |
| **M07** | `ExportModal` (Cấu Hình Xuất Báo Cáo Excel) | `src/pages/Dashboard/modals/ExportModal.tsx` | Centered Modal | Nút "Xuất Excel" trên Dashboard | `max-w-lg rounded-3xl shadow-2xl border`, Backdrop `bg-slate-900/60 backdrop-blur-md` | Checkbox "Chỉ xuất X hồ sơ đang được chọn", Bộ chọn nhiều thôn dạng nút toggle, Đếm tổng hồ sơ xuất động | Đối ứng với `ExportSettingsModal` của QLHK |
| **M08** | `ServerStatusModal` (Trạng Thái Server) | `src/components/network/ServerStatusModal.tsx` | Centered Modal | Bấm Network/Latency Pill trên Header | `max-w-sm rounded-3xl shadow-2xl border`, Backdrop `bg-slate-900/60 backdrop-blur-sm` | 4 Khối thông số: Kết Nối API, Độ Trễ Phản Hồi (ms), Địa Chỉ Máy Chủ (URL), Phiên Bản Hệ Thống (v2.0.0) | Khớp hoàn toàn với pattern `ServerStatusModal` của QLHK |
| **M09** | `PolicyDetailsDialog` (Chi Tiết Chính Sách HTXH) | `src/pages/Dashboard/components/ProfileRow.tsx` | Centered Dialog | Nút "X CHÍNH SÁCH" trên dòng hồ sơ HTXH | `max-w-sm rounded-3xl shadow-2xl border`, Backdrop `bg-slate-900/60 backdrop-blur-xs` | Header icon Activity xanh dương, Danh sách các badge chính sách kèm icon `CheckCircle2` xanh ngọc | Popover/Modal xem nhanh các trợ cấp xã hội của một cá nhân |
| **M10** | `ResetPasswordModal` (Đặt Lại Mật Khẩu Cán Bộ) | `src/pages/Settings/index.tsx` | Centered Modal | Nút "Đổi MK" trên dòng tài khoản cán bộ | `max-w-md w-full rounded-3xl border-2 border-emerald-500 shadow-xl`, `z-50` | Input Mật Khẩu Mới (toggle hiện/ẩn Eye/EyeOff), Nút "Hủy", Nút "Lưu Mật Khẩu" | Modal quản trị cán bộ của Admin Xã |
| **M11** | `AssignVillageModal` (Phân Công Thôn) | `src/pages/Settings/index.tsx` | Centered Modal | Nút "Phân công" trên dòng tài khoản cán bộ | `max-w-md w-full rounded-3xl border-2 border-emerald-500 shadow-xl`, `z-50` | CustomSelect "Vai trò" (Admin/User), CustomSelect "Thôn Phụ Trách" (15 thôn Đăk Hà), Nút "Hủy", Nút "Lưu Phân Công" | Modal phân quyền phân địa bàn của Admin Xã |
| **P01** | `YearSelector` Popover | `src/pages/Dashboard/components/YearSelector.tsx` | Absolute Popover | Nút "Năm [YYYY]" trên ProfileFilterBar | `w-56 p-3 rounded-2xl shadow-xl z-50 bg-white dark:bg-slate-900 border` | Stepper (- / input 4 số / +), Grid 3 cột chọn nhanh các năm, Link "Năm nay (YYYY)", Nút "Áp dụng" | Đối ứng trực tiếp với `YearSelector` của QLHK |
| **P02** | `CustomSelect` Dropdown Popover | `src/components/common/CustomSelect.tsx` | Absolute Popover / Portal | Trigger chọn Thôn, Mốc tuổi, Giới tính, Dân tộc... | `rounded-2xl border shadow-xl bg-white dark:bg-slate-900` | Ô tìm kiếm Search input (>8 items), Danh sách options kèm badge/sublabel, Nút xóa Clearable (icon X), Icon check xanh | Khớp hoàn toàn với pattern `CustomSelect` của QLHK |
| **P03** | `MappingSelect` Dropdown Popover | `src/pages/Dashboard/modals/ImportModal.tsx` | Fixed Coordinates Portal | Trigger chọn cột Excel trong bảng khớp cột | `rounded-2xl border shadow-2xl bg-white dark:bg-slate-900` | Search input "Tìm cột...", Nút "-- Bỏ qua / Không có --", Danh sách tên cột từ header Excel | Dropdown riêng biệt tối ưu cho modal import |
| **P04** | `FloatingBatchToolbar` | `src/pages/Dashboard/components/MainTable.tsx` | Fixed Bottom Center Toolbar | Tự động xuất hiện khi `selectedIds.size > 0` | `fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-2xl border shadow-2xl backdrop-blur-md px-5 py-3` | Badge số lượng đã chọn font-mono, Nút "Bỏ chọn", Nút "Đã Nhận Quà", Nút "Chưa Nhận Quà", Nút "Xóa Đã Chọn" | Thanh công cụ thao tác hàng loạt nổi chuẩn QLHK |
| **P05** | `AddUserFormBlock` | `src/pages/Settings/index.tsx` | Card Form | Nút "Thêm Cán Bộ" trên header tab Cán Bộ | `rounded-3xl border-2 border-emerald-500 shadow-xl p-6 bg-white dark:bg-slate-900` | Input Tên đăng nhập *, Mật khẩu khởi tạo *, CustomSelect Vai trò, CustomSelect Thôn, Nút "Hủy", Nút "Tạo Tài Khoản" | Form tạo cán bộ cơ sở |
| **P06** | `AddVillageCard` / `EditVillageCard` | `src/pages/VillagesPage.tsx` | Inline Card Form | Nút "Thêm Thôn" (Admin) hoặc icon `Edit3` trên card thôn | `rounded-3xl border-2 border-emerald-500 shadow-lg p-5 bg-white dark:bg-slate-900` | Input "Tên Thôn *", Nút "Hủy", Nút "Lưu Thôn Mới" / "Lưu" | Thêm / đổi tên thôn xã Đăk Hà |
| **G01** | Khung Thông Báo Toàn Cục (`showAlert`) | `src/hooks/useModal.tsx` | Centered Modal Alert | Gọi hàm `showAlert(title, message, type)` | `rounded-3xl shadow-2xl border max-w-md w-full`, Icon badge bo góc `rounded-xl` | Tiêu đề thông báo, Nội dung thông báo, Nút "Đóng" (tô màu theo type) | Khung alert thay thế hoàn toàn `window.alert` |

---

## III. MASTER INVENTORY TABLE: HỘP THOẠI XÁC NHẬN RỦI RO (C01 - C09)

| ID | Name (Mục Đích Xác Nhận) | Path / File & Line | Trigger Kích Hoạt | Kích Thước & Loại Icon | Tokens & Action Color | Văn Bản Thông Báo Tiếng Việt (Nguyên Bản) | Nút Thao Tác |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **C01** | Xác nhận xóa mềm 1 hồ sơ vào Thùng rác | `src/pages/Dashboard/index.tsx:242` | Icon `Trash2` trên dòng hồ sơ | `max-w-md`, Icon `AlertTriangle` vàng hổ phách | `rounded-3xl shadow-2xl border`, Confirm `bg-amber-600 hover:bg-amber-700` | Tiêu đề: "Xác nhận xóa hồ sơ"<br>Nội dung: "Bạn có chắc chắn muốn chuyển hồ sơ của \"[name]\" vào Thùng rác không? Dữ liệu có thể khôi phục lại bất kỳ lúc nào từ Thùng rác." | "Hủy" / "Xác Nhận" |
| **C02** | Xác nhận xóa mềm hàng loạt hồ sơ vào Thùng rác | `src/pages/Dashboard/index.tsx:262` | Nút "Xóa Đã Chọn" trên Floating Toolbar | `max-w-md`, Icon `AlertTriangle` vàng hổ phách | `rounded-3xl shadow-2xl border`, Confirm `bg-amber-600 hover:bg-amber-700` | Tiêu đề: "Xác nhận xóa hàng loạt"<br>Nội dung: "Bạn có chắc chắn muốn chuyển [count] hồ sơ đã chọn vào Thùng rác không? Dữ liệu có thể khôi phục lại bất kỳ lúc nào từ Thùng rác." | "Hủy" / "Xác Nhận" |
| **C03** | Xác nhận xóa thôn quản lý | `src/pages/VillagesPage.tsx:155` | Icon `Trash2` trên thẻ Thôn | `max-w-md`, Icon `AlertTriangle` vàng hổ phách | `rounded-3xl shadow-2xl border`, Confirm `bg-amber-600 hover:bg-amber-700` | Tiêu đề: "Xác nhận xóa thôn"<br>Nội dung: "Bạn có chắc muốn xóa \"[name]\" không? Thao tác này sẽ ảnh hưởng đến các hồ sơ chính sách thuộc thôn này." | "Hủy" / "Xác Nhận" |
| **C04** | Xác nhận khôi phục CSDL từ tệp sao lưu | `src/components/settings/BackupRestoreTab.tsx:80` | Chọn file `.json` sao lưu | `max-w-md`, Icon `AlertTriangle` vàng hổ phách | `rounded-3xl shadow-2xl border`, Confirm `bg-amber-600 hover:bg-amber-700` | Tiêu đề: "Cảnh báo khôi phục dữ liệu"<br>Nội dung: "Bạn có chắc chắn muốn khôi phục? Toàn bộ dữ liệu hồ sơ hiện tại sẽ được thay thế bằng dữ liệu từ tệp sao lưu này. Thao tác này KHÔNG THỂ HOÀN TÁC." | "Hủy" / "Xác Nhận" |
| **C05** | Xác nhận khôi phục 1 hồ sơ từ Thùng rác | `src/pages/RecycleBinPage.tsx:89` | Nút "Khôi Phục" trên dòng Thùng rác | `max-w-md`, Icon `AlertTriangle` vàng hổ phách | `rounded-3xl shadow-2xl border`, Confirm `bg-amber-600 hover:bg-amber-700` | Tiêu đề: "Khôi phục hồ sơ"<br>Nội dung: "Khôi phục hồ sơ của \"[name]\" về danh sách quản lý?" | "Hủy" / "Xác Nhận" |
| **C06** | Xác nhận xóa vĩnh viễn 1 hồ sơ khỏi CSDL | `src/pages/RecycleBinPage.tsx:114` | Nút "Xóa" trên dòng Thùng rác (Admin) | `max-w-md`, Icon `XCircle` đỏ | `rounded-3xl shadow-2xl border`, Confirm `bg-rose-600 hover:bg-rose-700` | Tiêu đề: "Xóa vĩnh viễn hồ sơ"<br>Nội dung: "CẢNH BÁO: Bạn sắp xóa vĩnh viễn hồ sơ \"[name]\". Dữ liệu sẽ biến mất hoàn toàn khỏi hệ thống và không thể khôi phục lại. Bạn có chắc chắn muốn tiếp tục?" | "Hủy" / "Xác Nhận" |
| **C07** | Xác nhận khôi phục hàng loạt hồ sơ từ Thùng rác | `src/pages/RecycleBinPage.tsx:140` | Nút "Khôi Phục (X)" trên Banner Thùng rác | `max-w-md`, Icon `AlertTriangle` vàng hổ phách | `rounded-3xl shadow-2xl border`, Confirm `bg-amber-600 hover:bg-amber-700` | Tiêu đề: "Khôi phục hàng loạt"<br>Nội dung: "Bạn có chắc muốn khôi phục [count] hồ sơ đã chọn?" | "Hủy" / "Xác Nhận" |
| **C08** | Xác nhận xóa vĩnh viễn hàng loạt hồ sơ khỏi CSDL | `src/pages/RecycleBinPage.tsx:167` | Nút "Xóa Vĩnh Viễn (X)" trên Banner Thùng rác (Admin) | `max-w-md`, Icon `XCircle` đỏ | `rounded-3xl shadow-2xl border`, Confirm `bg-rose-600 hover:bg-rose-700` | Tiêu đề: "Xóa vĩnh viễn hàng loạt"<br>Nội dung: "NGUY HIỂM: Bạn có chắc chắn muốn xóa vĩnh viễn [count] hồ sơ đã chọn khỏi CSDL? Thao tác này không thể khôi phục!" | "Hủy" / "Xác Nhận" |
| **C09** | Xác nhận xóa tài khoản cán bộ thôn | `src/pages/Settings/index.tsx:298` | Icon `Trash2` trên dòng tài khoản cán bộ | `max-w-md`, Icon `AlertTriangle` vàng hổ phách | `rounded-3xl shadow-2xl border`, Confirm `bg-amber-600 hover:bg-amber-700` | Tiêu đề: "Xác nhận xóa tài khoản"<br>Nội dung: "Bạn có chắc chắn muốn xóa tài khoản cán bộ \"[name]\" không? Thao tác này sẽ thu hồi quyền truy cập của cán bộ này." | "Hủy" / "Xác Nhận" |

---

## IV. ĐIỂM KIỂM KÊ TRẠNG THÁI NỘI DÒNG & VI TƯƠNG TÁC TIÊU BIỂU (TỪ 129 TRẠNG THÁI ST01 - ST129)

Chi tiết đầy đủ 129 trạng thái được lưu tại `ui-sync/00_screens_states.md`. Dưới đây là các trạng thái then chốt cần đồng bộ trực tiếp với QLHK:

1. **Trạng thái Rỗng (Empty States)**:
   - `ST35` / `ST36` (*Bảng Hồ Sơ*): Hộp biểu tượng `SearchX` bo góc `rounded-2xl bg-slate-100 dark:bg-slate-800` nằm giữa bảng với thông điệp *"Không tìm thấy hồ sơ phù hợp / Vui lòng kiểm tra lại từ khóa tìm kiếm..."*.
   - `ST52` (*Nhập Excel*): Vùng kéo thả tệp viền đứt đoạn bo góc `rounded-3xl` kèm icon `UploadCloud` và nút *"Chọn Tệp Excel"*.
   - `ST79` (*Lịch Sử Hồ Sơ*): Khung ghi nhận rỗng *"Chưa có lịch sử thay đổi nào được ghi nhận cho hồ sơ này."*.
   - `ST82` (*Bảng Đối Soát Thống Kê*): Dòng rỗng *"Chưa có số liệu đối soát cho năm [selectedYear]."*.
   - `ST102` (*Thùng Rác*): Biểu tượng `Trash2` với tiêu đề *"Thùng rác trống"*.
   - `ST116` (*Nhật Ký Audit*): Biểu tượng `FileText` với thông điệp *"Không có nhật ký nào phù hợp với bộ lọc."*.

2. **Trạng thái Đang Tải (Loading & Skeleton States)**:
   - `ST01` (*Splash Khởi Động*): Vòng xoay spinner `border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin`.
   - `ST34` (*Bảng Dữ Liệu*): Cần đồng bộ Table Skeleton Rows chuẩn QLHK (hàng loạt thẻ div mờ xung nhịp `animate-pulse` bo góc `rounded-xl`).
   - `ST57` (*Tiến Trình Nhập Excel*): Vòng xoay spinner trung tâm kèm thanh tiến trình `h-3 rounded-full bg-slate-100` với fill `bg-emerald-600` và chỉ số `%`.
   - `ST81` (*Thống Kê Báo Cáo*): Icon `RefreshCw animate-spin` phản hồi khi tính toán lại toàn bộ chỉ số.

3. **Trạng thái Lỗi & Phục Hồi (Error & Recovery States)**:
   - `ST02` (*ErrorBoundary Crash Screen*): Chuyển đổi toàn bộ inline styles cũ (`#e53e3e`, `#4a5568`) sang chuẩn Tailwind tokens của QLHK (`bg-slate-50 dark:bg-slate-950`, icon `AlertTriangle` trong vòng tròn đỏ `bg-rose-100`, nút `bg-emerald-600 text-white rounded-2xl`).
   - `ST03` & `ST04` (*ConnectionBanner*): Banner gradient hổ phách - đỏ (`from-amber-600 via-rose-600 to-rose-700`) khi offline và xanh ngọc (`bg-emerald-600`) khi đã kết nối lại.
   - `ST51` (*Xung Đột OCC 409*): Hộp thoại cảnh báo *"Xung Đột Dữ Liệu (409) — Hồ sơ này đã được cập nhật bởi một thao tác khác..."*.
   - `ST61` (*Dòng Lỗi Trong Bảng Đối Soát Import*): Dòng dữ liệu tô đỏ `bg-rose-50/90 dark:bg-rose-950/60` kèm icon `AlertTriangle` tại ô ngày sinh không hợp lệ.

4. **Trạng thái Vi Tương Tác (Micro-Interactions)**:
   - `ST37` & `ST38` (*Row Hover & Selection*): Rê chuột highlight `hover:bg-emerald-50/40 dark:hover:bg-slate-800/60`; chọn checkbox highlight `bg-emerald-50/60 dark:bg-emerald-950/40` với cột sticky đồng bộ.
   - `ST40` (*Floating Batch Toolbar*): Nổi giữa đáy màn hình `fixed bottom-6 left-1/2 -translate-x-1/2 z-40` với hiệu ứng kính mờ `backdrop-blur-md` bo góc `rounded-2xl`.
   - `ST44` (*CCCD Masking Toggle*): Che giấu bảo mật `••••••••[4 số cuối]` và toggle icon mắt `Eye` / `EyeOff`.
   - `ST75` (*Realtime Age Milestone Badge*): Tự động tính toán mốc tuổi tròn ngay khi gõ năm sinh trong `ProfileModal`.

---

## V. ĐỐI CHIẾU & KIỂM TRA ĐỘ PHỦ VỚI BẢN ĐỒ KIẾN TRÚC (`map.md`)

- [x] **100% Trang & Shell**: Khớp hoàn toàn S01 đến S19 trong `map.md`, đồng thời mở rộng thêm **S20** (`PolicyDetailsDialog`) và **S21** (`ErrorBoundary Fallback Screen`).
- [x] **100% Modals & Popups**: Kiểm kê toàn diện 11 Modals, 9 Confirm dialogs, 6 Popovers/Toolbars, 1 Global Alert dialog.
- [x] **100% Phân Hệ Kép**: Tách bạch rõ 11 cột dữ liệu của phân hệ Chúc Thọ và 13 cột dữ liệu của phân hệ Hưu Trí Xã Hội.
- [x] **100% Phân Quyền**: Ghi nhận chính xác ranh giới hiển thị giữa Admin (toàn xã) và Cán bộ thôn (khóa địa bàn, ẩn quản lý cán bộ, thùng rác chỉ khôi phục).
- [x] **100% Văn Bản Tiếng Việt**: Toàn bộ nhãn, tiêu đề, placeholder, thông báo thành công và thông báo lỗi được ghi nhận nguyên bản.

---

## VI. CÁC ĐIỂM CẦN LƯU Ý KHI THỰC THI (DESIGN IMPLEMENTATION NOTES)

1. **Đồng Bộ Nhãn Phiên Bản**:
   - `ServerStatusModal.tsx:144` đang ghi cứng `v2.0.0`, trong khi `Sidebar.tsx:292` và `Settings/index.tsx:1250` hiển thị `v3.0.0 (Online-First)`. Sẽ chuẩn hóa đồng bộ hiển thị `v3.0.0` trên toàn hệ thống.
2. **Khử Bỏ Inline CSS Trong ErrorBoundary**:
   - `src/components/ErrorBoundary.tsx` đang dùng style nội dòng CSS cũ. Sẽ đưa về toàn bộ design tokens chuẩn của QLHK trong Pha 4.
3. **Chuẩn Hóa Bo Góc Theo Thang Đo QLHK**:
   - Khung Modal & Drawer lớn: `rounded-3xl` (24px).
   - Card container & Khung bảng: `rounded-2xl` (16px) hoặc `rounded-3xl` (24px).
   - Nút bấm, Inputs, CustomSelect: `rounded-xl` (12px) hoặc `rounded-2xl` (16px).
   - Badges, Tag trạng thái: `rounded-lg` (8px) hoặc `rounded-full` (9999px).
4. **Nút Thao Tác Header Island Trên Dashboard**:
   - Nút `[📄 Nhập Excel]`: Nền trắng/xám viền nhạt, icon `FileSpreadsheet` màu xanh lục `text-emerald-500`.
   - Nút `[📥 Xuất Excel]`: Nền trắng/xám viền nhạt, icon `Download` màu xanh dương `text-blue-500`.
   - Nút `[+ Thêm Hồ Sơ]`: Nền xanh ngọc nổi bật `bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full`.

---

**KẾT LUẬN PHA 1**: Kiểm kê hoàn tất 100% giao diện Target App với độ chính xác tuyệt đối. Đủ điều kiện chuyển sang **PHA 2: TRÍCH XUẤT NGÔN NGỮ THIẾT KẾ MẪU (REFERENCE DESIGN LANGUAGE EXTRACTION)**.
