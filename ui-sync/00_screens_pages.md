# BẢNG KIỂM KÊ 100% CÁC TRANG CHÍNH, MÀN HÌNH VÀ PHÂN HỆ TARGET APP (QLCS)

> **Chiến dịch**: Đồng Bộ Giao Diện UI-Sync (QLHK -> QLCS)  
> **Chuyên viên thực hiện**: Subagent 1A — Pages and Screens Inventory Specialist  
> **Đường dẫn TARGET**: `C:\Projects\QLCS\QLCS-Client\src`  
> **Đường dẫn REFERENCE**: `C:\Projects\QLHK\QLHK-Client\src`  
> **Ngày lập**: 03/10/2026  

---

## NGUYÊN TẮC BẤT BIẾN (INVARIANT PRINCIPLE)
1. **FORM** (Sao chép từ REFERENCE QLHK): Design tokens (màu sắc emerald/slate, layer surface, borders, radii rounded-2xl/3xl, shadows, spacing, typography, Lucide icons stroke 1.5, shell layout, interaction behavior, density, responsive).
2. **CONTENT** (Giữ nguyên 100% từ TARGET QLCS): Tên trang, nhãn tiếng Việt, dữ liệu, các cột bảng, bộ lọc, số lượng nút bấm, tính năng nghiệp vụ, logic tính toán, quyền hạn (Admin vs Cán bộ thôn). Tuyệt đối không dịch hay sửa đổi bất kỳ câu từ Tiếng Việt nào.
3. Mọi thứ TARGET có phải được giữ nguyên đầy đủ. Mọi thứ REFERENCE có mà TARGET thiếu sẽ không tự ý thêm vào mà chỉ ghi nhận đề xuất.

---

## I. BẢNG TỔNG HỢP KIỂM KÊ MÀN HÌNH & PHÂN HỆ (INVENTORY MASTER TABLE)

| ID | Tên Màn Hình / Phân Hệ | File Path Chính & Phụ | Loại | Trigger / Phân Quyền | Tokens & Classes Hiện Tại | Thành Phần Chính | Ghi Chú Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **S01** | Splash Loading | `src/App.tsx` | Splash Screen | `isInitializing === true` / Mọi Role | `bg-slate-100 dark:bg-slate-950`, `border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin`, `text-slate-600 dark:text-slate-300 font-semibold` | Spinner quay tròn, text "Đang khởi tạo hệ thống QLCS..." | Chạy khi nạp phiên đăng nhập & IndexedDB ban đầu |
| **S02** | Đăng Nhập | `src/pages/Login.tsx` | Page (Auth) | `!user && !isInitializing` / Chưa đăng nhập | `bg-slate-50 dark:bg-slate-950`, Card: `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl border-t-4 border-t-emerald-600` | Icon Users tròn, Title "Đăng nhập", Subtitle in hoa, Alert lỗi, Input Username/Password, Eye toggle, Button ĐĂNG NHẬP, Footer bảo mật | Nút đăng nhập xanh emerald, bảo mật dữ liệu Đăk Hà |
| **S03** | Khung Shell: Header | `src/components/Layout/Header.tsx` | Shell Component | Sau khi đăng nhập / Mọi Role | `h-16 bg-slate-900 border-b border-slate-800 sticky top-0 z-30 select-none shadow-xs text-white` | Brand Logo FileText + Text UBND XÃ ĐĂK HÀ, Zoom Pill (Ctrl -, Ctrl 0, Ctrl +), Theme toggle, Village Indicator, Network/Latency Pill, User profile avatar + Role badge, Logout button | Hiển thị cố định trên mọi màn hình làm việc |
| **S04** | Khung Shell: Sidebar | `src/components/Layout/Sidebar.tsx` | Shell Component | Sau khi đăng nhập / Phân quyền Admin vs Thôn | `bg-slate-950 text-slate-300 border-r border-slate-800/80 w-16 md:w-64 transition-[width]`, active item: `bg-emerald-600 text-white shadow-md shadow-emerald-950/30 rounded-2xl` | Header "DANH MỤC", Nút thu gọn/mở rộng Sidebar, Danh sách NavItems (Map, BarChart3, Award, Users, Trash2, History, Settings), Footer phiên bản QLCS v3.0.0 | Admin thấy 7 mục điều hướng; Cán bộ thôn thấy 4 mục (Thống Kê, Chúc Thọ, HTXH, Thùng Rác) |
| **S05** | Khung Shell: AppLayout | `src/components/Layout/AppLayout.tsx` | Shell Container | Sau khi đăng nhập / Bọc toàn bộ các trang | `flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950`, container: `p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-900/30` | Header + ConnectionBanner + Sidebar + `<main>` scrollable | Điều phối trạng thái kết nối mạng và scroll layout |
| **S06** | Quản Lý Thôn | `src/pages/VillagesPage.tsx` | Page | `activeTab === 'villages'` / Admin Only | Banner: `bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 rounded-3xl text-white shadow-xl`, Cards: `bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500` | Banner tổng quan toàn xã + Button xem đối soát, 4 KPI cards (Địa Bàn, Chúc Thọ, HTXH, Tiến Độ), Toolbar tìm kiếm thôn + Nút Thêm Thôn, Form thêm thôn mới, Lưới 7 thẻ thôn (đổi tên inline, xóa thôn, xem chi tiết) | Màn hình đầu tiên khi Admin đăng nhập |
| **S07** | Dashboard: Header Island & KPI | `src/pages/Dashboard/index.tsx`, `StatsCards.tsx` | Sub-shell / Container | `activeTab === 'chuctho'` hoặc `activeTab === 'htxh'` | Header Island: `bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm`, Cards: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-3xl` | Scope thôn badge, Title "Hồ Sơ Chúc Thọ" hoặc "Hưu Trí Xã Hội", Năm tính toán badge, Nút Đổi Thôn (Admin), Nút Nhập Excel, Nút Xuất Excel, Nút Thêm Hồ Sơ (Ctrl + N), 4 Thẻ KPI (Tổng số, Đã nhận, Chưa nhận, Tỷ lệ) | Dùng chung cho cả 2 phân hệ Chúc Thọ và Hưu Trí Xã Hội |
| **S08** | Dashboard: Thanh Công Cụ Lọc | `src/pages/Dashboard/components/ProfileFilterBar.tsx`, `YearSelector.tsx` | Toolbar Component | Nằm trên Dashboard / Mọi Role | `flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs` | Ô tìm kiếm họ tên/CCCD + nút xóa + nút refresh, YearSelector popover chọn năm, Dropdown Độ Tuổi (CT) / Diện Hưởng (HTXH), Dropdown Giới tính, Dropdown Dân tộc, Dropdown Cư trú, Dropdown/Badge Thôn, Dropdown Quà tặng, Nút Xóa Lọc | Tự động reset bộ lọc mốc tuổi khi đổi giữa 2 tab Chúc thọ <-> HTXH |
| **S09** | Dashboard: Bảng Dữ Liệu Hồ Sơ | `src/pages/Dashboard/components/MainTable.tsx`, `ProfileRow.tsx` | Data Table Component | Nằm trên Dashboard / Mọi Role | `bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden`, Thead sticky: `bg-slate-100/95 dark:bg-slate-950 font-black uppercase text-[11px]` | Info bar tổng số dòng + mẹo bấm dòng, Floating batch action toolbar (Đã nhận quà, Chưa nhận quà, Xóa đã chọn), Sticky checkbox (cột 1), Sticky thao tác (cột cuối), Phân nhóm mốc tuổi/diện, Tag lỗi inline, Toggle xem CCCD, Toggle trạng thái quà tặng nhanh | Tab Chúc Thọ: 11 cột; Tab HTXH: 13 cột (thêm cột Đủ 75+, 70-74 Nghèo, Chế độ hưởng) |
| **S10** | Modal: Thêm / Sửa Hồ Sơ | `src/pages/Dashboard/modals/ProfileModal.tsx` | Modal Dialog (Portal) | Mở khi bấm Thêm Hồ Sơ, phím tắt Ctrl+N, hoặc bấm dòng bảng | `fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs`, Container: `max-w-3xl h-[88vh] rounded-3xl bg-white dark:bg-slate-900 border shadow-2xl` | Header modal (icon User, title, badge mốc tuổi tính toán, tabs Thông Tin / Lịch Sử, nút X), Form 10 fields thông tin cá nhân + 6 checkboxes diện HTXH, Tab lịch sử audit log của hồ sơ, Footer nút Hủy Bỏ + nút Lưu Thay Đổi | Tự động tính toán mốc tuổi tròn theo năm dự toán đang chọn |
| **S11** | Modal: Nhập Excel Đối Soát | `src/pages/Dashboard/modals/ImportModal.tsx` | Modal Workflow (Portal) | Mở khi bấm `[Nhập Excel]` trên Dashboard | `fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs`, Container: `max-w-5xl h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border shadow-2xl` | 3 bước nghiệp vụ: (1) Drag-and-drop dropzone + tải template, (2) Khớp cột dữ liệu tự động/thủ công + lưu mẫu template, (3) Bảng preview đối soát 10 cột sticky 3 cột đầu + highlight ô lỗi ngày sinh + phân trang preview + Nút Xác nhận nhập | Tự động nhận dạng loại file Excel: Chúc Thọ, HTXH, hoặc Cử Tri |
| **S12** | Modal: Xuất Báo Cáo Excel | `src/pages/Dashboard/modals/ExportModal.tsx` | Modal Dialog (Portal) | Mở khi bấm `[Xuất Excel]` trên Dashboard | `fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-md`, Container: `max-w-lg rounded-3xl bg-white dark:bg-slate-900 border shadow-2xl` | Banner phạm vi xuất, Checkbox "Chỉ xuất N hồ sơ đang chọn", Danh sách nút chọn/bỏ chọn từng thôn, Chỉ báo tổng số hồ sơ xuất, Nút Hủy và Nút Xuất File | Giữ nguyên các bộ lọc tìm kiếm hiện hành khi kết xuất |
| **S13** | Trang Thống Kê Báo Cáo & Đối Soát | `src/pages/AnalyticsPage.tsx` | Page | `activeTab === 'analytics'` / Mọi Role | Cards: `bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm`, Table: `border-separate border-spacing-0 whitespace-nowrap` | Header chọn năm & thôn, 4 KPI cards (Tổng đối tượng, Đã nhận, Chưa nhận, Tiến độ), 2 Biểu đồ MiniDonut SVG tròn (Giới tính & Dân tộc), 2 Blocks thanh phân bố (10 mốc tuổi Chúc thọ & 6 diện HTXH), Bảng đối soát số liệu các thôn (10 cột) + Dòng tổng cộng toàn xã | Admin được lọc theo thôn hoặc xem toàn xã; Cán bộ thôn bị cố định tại địa bàn quản lý |
| **S14** | Trang Thùng Rác | `src/pages/RecycleBinPage.tsx` | Page | `activeTab === 'recycle-bin'` / Mọi Role | `space-y-6 pb-12`, Header banner: `bg-white dark:bg-slate-900 rounded-3xl border shadow-sm`, Table: `border-separate border-spacing-0 whitespace-nowrap` | Header banner + nút Khôi phục hàng loạt + nút Xóa vĩnh viễn hàng loạt (Admin), Tabs chuyển giữa "Thùng Rác Chúc Thọ" & "Thùng Rác Hưu Trí Xã Hội", Ô tìm kiếm, Bảng 8 cột hồ sơ đã xóa tạm, Thao tác khôi phục từng dòng / xóa vĩnh viễn, Phân trang TablePagination | Cán bộ thôn chỉ có quyền khôi phục; quyền xóa vĩnh viễn khỏi CSDL chỉ dành riêng cho Admin |
| **S15** | Trang Nhật Ký Hoạt Động & Biến Động | `src/pages/AuditLogPage.tsx` | Page | `activeTab === 'audit'` / Admin Only | `space-y-6 pb-12`, Timeline card: `bg-slate-50/60 dark:bg-slate-950/60 rounded-2xl border hover:border-emerald-500/40 p-4.5` | Header banner, Thanh lọc sự kiện nhanh (7 nút: Tất Cả, Thêm Mới, Cập Nhật, Đổi Trạng Thái, Xóa, Khôi Phục, Nhập Excel), Thanh lọc chi tiết 4 cột (Tìm kiếm, Thôn, Loại chính sách, Cán bộ), Dòng thời gian Timeline với node tròn màu sắc, Trình phân tích JSON Diff thân thiện (gạch ngang giá trị cũ, tô đậm giá trị mới), Nút Tải Thêm Dữ Liệu | Theo dõi và đối soát mọi thao tác can thiệp dữ liệu |
| **S16** | Trang Cài Đặt Hệ Thống | `src/pages/Settings/index.tsx`, `TimeCard.tsx`, `BackupRestoreTab.tsx` | Page / Tabbed Container | `activeTab === 'settings'` / Phân quyền Admin vs Thôn | `max-w-5xl mx-auto space-y-6 pb-12`, Tabs header: `bg-white dark:bg-slate-900 rounded-2xl border p-1.5`, Cards: `bg-white dark:bg-slate-900 rounded-3xl border shadow-sm p-6` | Thanh điều hướng 5 tabs: (1) Tài Khoản Của Tôi, (2) Quản Lý Cán Bộ Thôn [Admin], (3) Sao Lưu CSDL [Admin], (4) Thông Tin Đơn Vị & Hệ Thống, (5) Cài Đặt Thời Gian & Năm Tính Tuổi | Admin xem đủ 5 tabs; Cán bộ thôn xem 3 tabs (profile, system, time) |
| **S16a** | Cài Đặt: Tài Khoản Của Tôi | `src/pages/Settings/index.tsx` (lines 431-615) | Sub-tab | Mọi Role | `grid grid-cols-1 md:grid-cols-2 gap-6` | Card 1: Avatar chữ cái, Username, Trạng thái hoạt động, Vai trò, Đơn vị, Thôn phụ trách, Nút Đăng Xuất. Card 2: Form đổi mật khẩu cá nhân (Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới, Nút toggle Eye/EyeOff, Nút Cập Nhật Mật Khẩu) | Cho phép cán bộ đổi mật khẩu tự phục vụ |
| **S16b** | Cài Đặt: Quản Lý Cán Bộ Thôn | `src/pages/Settings/index.tsx` (lines 617-1045) | Sub-tab + Modals | Admin Only | Bảng danh sách: `bg-white dark:bg-slate-900 rounded-3xl border overflow-hidden` | Header danh sách cán bộ + Nút Thêm Cán Bộ, Form tạo tài khoản cán bộ mới, Bảng 5 cột quản lý cán bộ, Modal Đặt Lại Mật Khẩu Cán Bộ, Modal Phân Công Thôn | Admin cấp phát và quản trị tài khoản cán bộ thôn |
| **S16c** | Cài Đặt: Sao Lưu CSDL | `src/components/settings/BackupRestoreTab.tsx` | Sub-tab Component | Admin Only | Container: `max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border p-6 space-y-6` | Khối Xuất Bản Sao Lưu (Download snapshot JSON), Khối Phục Hồi Dữ Liệu (Upload file JSON ghi đè CSDL), Huy hiệu bảo mật CSDL quốc gia | Phục vụ an toàn dữ liệu và sao lưu dự phòng |
| **S16d** | Cài Đặt: Thông Tin Đơn Vị & Hệ Thống | `src/pages/Settings/index.tsx` (lines 1055-1272) | Sub-tab | Mọi Role | Form: `bg-white dark:bg-slate-900 rounded-3xl border p-6 space-y-4` | Form thông tin hành chính 6 ô (Cơ quan/UBND, Huyện, Tỉnh, Địa chỉ, Điện thoại, Email công vụ) + Nút Lưu; Khối hiển thị thông tin phần mềm (QLCS Desktop v3.0.0 Online-First, PostgreSQL Enterprise) | Đồng bộ tiêu đề xuất bản báo cáo hành chính |
| **S16e** | Cài Đặt: Thời Gian & Năm Tính Tuổi | `src/pages/Settings/TimeCard.tsx` | Sub-tab Component | Mọi Role | Container: `max-w-3xl space-y-6`, Live clock: `p-5 rounded-2xl bg-emerald-50/40 border-emerald-100 dark:bg-slate-800/50` | Khối 1: Năm Tính Toán Chúc Thọ Toàn Hệ Thống (Input số năm, nút Lưu, 4 nút chọn nhanh 2024-2027); Khối 2: Nguồn Thời Gian Ứng Dụng (Đồng hồ live hiển thị ngày/giờ/giây, độ lệch offset, 3 chế độ: Theo máy tính, Internet, Thiết lập thủ công) | Đảm bảo tính toán tuổi công dân chính xác theo niên khóa |
| **S17** | Shared: CustomSelect | `src/components/common/CustomSelect.tsx` | Shared Component | Dùng chung toàn app | Trigger: `rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800`, Portal: `z-[100000] rounded-2xl border shadow-2xl bg-white dark:bg-slate-900` | Trigger button với label/placeholder/chevron, Dropdown nổi React Portal, Ô tìm kiếm nhanh (khi >8 options), Danh sách tùy chọn highlight bàn phím, Nút xóa lựa chọn (Clearable) | Tránh tràn layout và che khuất trong bảng biểu / modal |
| **S18** | Shared: TablePagination | `src/components/common/TablePagination.tsx` | Shared Component | Dùng chung bảng dữ liệu | `p-3.5 bg-slate-50/90 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between` | Chỉ báo dòng hiển thị ("Hiển thị X-Y trong tổng số Z bản ghi"), Selector số dòng/trang (10, 20, 50, 100), Nút chuyển trang Trước/Sau, Chỉ báo trang hiện tại | Chuẩn phân trang đồng bộ trên toàn bộ các trang dữ liệu |
| **S19** | Shared: Network & Dialogs Hệ Thống | `ConnectionBanner.tsx`, `ServerStatusModal.tsx` | Shared Feedback | Khi mất mạng / phục hồi / kiểm tra độ trễ | Banner: `bg-gradient-to-r from-amber-600 to-rose-700` (Offline) hoặc `bg-emerald-600` (Reconnected); Modal: `max-w-sm rounded-3xl bg-white dark:bg-slate-900 border` | ConnectionBanner cảnh báo ngoại tuyến kèm nút Thử lại kết nối; ServerStatusModal chẩn đoán sức khỏe máy chủ (Trạng thái ONLINE/OFFLINE, Độ trễ phản hồi ms, Địa chỉ URL máy chủ, Phiên bản hệ thống) | Bảo đảm tính ổn định và minh bạch mạng |
| **S20** | Modal Chi Tiết Chính Sách HTXH | `ProfileRow.tsx` (lines 347-422) | Modal Dialog (Portal) | Mở khi bấm nút `{N} CHÍNH SÁCH` trên cột bảng | `fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs`, Dialog: `max-w-sm rounded-3xl bg-white dark:bg-slate-900 border shadow-2xl overflow-hidden` | Header modal (icon Activity, title "CHI TIẾT CHÍNH SÁCH", tên đối tượng, nút X), Danh sách chính sách đang hưởng (Bảo trợ xã hội, Hưu trí, Hưu tuất / Bảo hiểm, Người có công) kèm icon CheckCircle2 | Xem chi tiết chế độ hưởng của hồ sơ Hưu trí xã hội |
| **S21** | Màn Hình Bắt Lỗi Runtime | `src/components/ErrorBoundary.tsx` | Error Fallback Screen | Khi có lỗi JavaScript sập component tree | `min-h-screen flex flex-col items-center justify-center p-5 text-center` | Tiêu đề "Đã xảy ra lỗi", Lời nhắn người dùng, Khung hiển thị chi tiết stack trace kỹ thuật, Nút "Tải lại trang" | Bảo vệ ứng dụng không bị màn hình trắng (White Screen of Death) |

---

## II. CHI TIẾT KIỂM KÊ TỪNG MÀN HÌNH & PHÂN HỆ

### S01. Splash Loading Screen
- **Tên hiển thị tiếng Việt**: Khởi tạo hệ thống
- **Component File**: `src/App.tsx` (lines 16-25)
- **Loại**: Splash Screen toàn màn hình
- **Trigger**: Khi biến `isInitializing === true` từ `AppContext` (đang đọc token từ `secureStorage` và nạp cache IndexedDB ban đầu).
- **Phân quyền**: Tất cả người dùng khi mở ứng dụng.
- **Tokens & CSS Classes**:
  - Khung bao: `min-h-screen w-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-white select-none`
  - Vòng xoay Spinner: `w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4`
  - Nhãn trạng thái: `text-sm font-semibold text-slate-600 dark:text-slate-300`
- **Danh sách nhãn & nút bấm**:
  - Nhãn text: `"Đang khởi tạo hệ thống QLCS..."` (Không có nút bấm).

---

### S02. Trang Đăng Nhập (Login)
- **Tên hiển thị tiếng Việt**: Đăng nhập
- **Component File**: `src/pages/Login.tsx` (lines 1-185)
- **Loại**: Page (Xác thực người dùng)
- **Trigger**: Khi chưa đăng nhập (`!user && !isInitializing`).
- **Phân quyền**: Công khai cho cán bộ được cấp tài khoản.
- **Tokens & CSS Classes**:
  - Nền toàn trang: `min-h-screen w-screen flex items-center justify-center p-4 sm:p-6 font-sans select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`
  - Khối Card đăng nhập: `max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl border-t-4 border-t-emerald-600`
  - Biểu tượng Avatar: `w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 border-[3px] border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full mx-auto flex items-center justify-center mb-5 shadow-xs`
  - Hộp thông báo lỗi: `mb-6 p-3.5 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60 rounded-xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs`
  - Ô nhập liệu: `w-full h-12 pl-11 pr-4 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`
  - Nút đăng nhập: `w-full mt-2 h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md uppercase tracking-wider text-[13px]`
- **Danh sách nhãn & nút bấm**:
  - Tiêu đề chính: `"Đăng nhập"`
  - Tiêu đề phụ: `"QUẢN LÝ CHÍNH SÁCH XÃ HỘI & NGƯỜI CAO TUỔI — XÃ ĐĂK HÀ"`
  - Nhãn trường 1: `"Tên đăng nhập"` (Placeholder: `"Nhập tài khoản (admin, thon1...)"`)
  - Nhãn trường 2: `"Mật khẩu"` (Placeholder: `"Nhập mật khẩu"`)
  - Nút 1: Nút bật/tắt hiển thị mật khẩu (icon `Eye` / `EyeOff`, `aria-label="Ẩn mật khẩu" | "Hiện mật khẩu"`)
  - Nút 2: `"ĐĂNG NHẬP"` (Submit form, có spinner xoay tròn khi `isLoading`)
  - Chân trang: `"Bảo mật dữ liệu Chính sách xã hội & Người cao tuổi Xã Đăk Hà"` (kèm icon `ShieldCheck`)

---

### S03. Khung Shell: Header
- **Tên hiển thị tiếng Việt**: Thanh điều khiển trên cùng (Header)
- **Component File**: `src/components/Layout/Header.tsx` (lines 1-254)
- **Loại**: Shell Layout Component
- **Trigger**: Hiển thị cố định trên mọi màn hình sau khi đăng nhập thành công.
- **Phân quyền**: Tất cả cán bộ.
- **Tokens & CSS Classes**:
  - Khung Header: `h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 select-none`
  - Huy hiệu Logo: `w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0`
  - Zoom Pill: `hidden sm:flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-slate-300 text-xs`
  - Theme Toggle: `p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl border border-slate-700`
  - Village Indicator: `px-3 py-1.5 bg-slate-800 rounded-xl text-slate-200 text-xs font-bold border border-slate-700`
  - Latency Pill: `flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border` (Màu xanh `bg-emerald-950/60`, màu đỏ `bg-rose-950/60`, màu vàng `bg-amber-950/60`)
- **Danh sách thành phần & nút bấm**:
  - Nhãn thương hiệu: `"QUẢN LÝ CHÍNH SÁCH"`, Badge `"XÃ ĐĂK HÀ"`, Phụ đề `"Chúc Thọ & Hưu Trí Xã Hội Xã Đăk Hà"`
  - Nút 1: `ZoomOut` (icon `ZoomOut`, `aria-label="Thu nhỏ giao diện (Ctrl -)"`)
  - Nút 2: `ResetZoom` (chữ `{zoomLevel}%`, `aria-label="Đặt lại kích thước 100% (Ctrl 0)"`)
  - Nút 3: `ZoomIn` (icon `ZoomIn`, `aria-label="Phóng to giao diện (Ctrl +)"`)
  - Nút 4: `ToggleTheme` (icon `Sun` khi dark, `Moon` khi light)
  - Nút 5: `VillageIndicator` (Admin bấm để quay về Quản lý thôn / Toàn xã; Cán bộ thôn hiển thị badge tĩnh)
  - Nút 6: `NetworkStatusPill` (Bấm để mở ServerStatusModal, hiển thị `{latency}ms` / `"Ngoại tuyến"` / `"Thử lại..."`)
  - Avatar người dùng: Icon `User` hoặc 2 ký tự đầu username
  - Thông tin vai trò: Tên username, Role (`"Cán bộ Xã (Admin)"` hoặc `"Trưởng Thôn"`)
  - Nút 7: `Logout` (icon `LogOut`, `aria-label="Đăng xuất khỏi hệ thống"`)

---

### S04. Khung Shell: Sidebar
- **Tên hiển thị tiếng Việt**: Thanh điều hướng bên trái (Sidebar)
- **Component File**: `src/components/Layout/Sidebar.tsx` (lines 1-315)
- **Loại**: Shell Navigation Component
- **Trigger**: Hiển thị cố định bên trái màn hình sau khi đăng nhập.
- **Phân quyền**:
  - **Admin**: Thấy 7 mục (Quản Lý Thôn, Thống Kê, Hồ Sơ Chúc Thọ, Hưu Trí Xã Hội, Thùng Rác, Nhật Ký Hoạt Động, Cài Đặt Hệ Thống).
  - **Cán bộ thôn**: Thấy 4 mục (Thống Kê, Hồ Sơ Chúc Thọ, Hưu Trí Xã Hội, Thùng Rác).
- **Tokens & CSS Classes**:
  - Thanh Sidebar: `bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none transition-[width] duration-200 ease-out overflow-hidden w-16 md:w-64` (khi thu gọn: `w-16`)
  - Mục điều hướng Active: `bg-emerald-600 text-white shadow-md shadow-emerald-950/30 rounded-2xl`
  - Mục điều hướng Inactive: `text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-2xl`
  - Badge trên NavItem: `text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider`
- **Danh sách nhãn & nút bấm**:
  - Tiêu đề nhóm: `"DANH MỤC"` (kèm icon `Database`)
  - Nút 1: `ToggleSidebar` (icon `PanelLeftClose` khi mở, `PanelLeftOpen` khi thu gọn)
  - Mục 1: `"Quản Lý Thôn"` (icon `Map`, Desc: `"← Đổi thôn làm việc"` / `"Quản lý các thôn xã Đăk Hà"`)
  - Mục 2: `"Thống Kê"` (icon `BarChart3`, Badge: `"Chính"` hoặc `"Toàn Xã"`, Desc: `"Báo cáo số liệu thôn"` / `"Tổng hợp số liệu toàn xã"`)
  - Mục 3: `"Hồ Sơ Chúc Thọ"` (icon `Award`, Desc: `"Chính sách chúc thọ người cao tuổi"`)
  - Mục 4: `"Hưu Trí Xã Hội"` (icon `Users`, Desc: `"Trợ cấp hưu trí xã hội các diện"`)
  - Mục 5: `"Thùng Rác"` (icon `Trash2`, Desc: `"Quản lý hồ sơ đã xóa"` / `"Hồ sơ đã xóa tạm"`)
  - Mục 6: `"Nhật Ký Hoạt Động"` (icon `History`, Desc: `"Lịch sử biến động dữ liệu"` - Admin only)
  - Mục 7: `"Cài Đặt Hệ Thống"` (icon `SettingsIcon`, Desc: `"Tài khoản & sao lưu"` - Admin only)
  - Chân trang: `"QLCS v3.0.0"` (kèm icon `ShieldCheck`)

---

### S05. Khung Shell: AppLayout
- **Tên hiển thị tiếng Việt**: Khung bao ứng dụng (AppLayout)
- **Component File**: `src/components/Layout/AppLayout.tsx` (lines 1-65)
- **Loại**: Shell Container
- **Trigger**: Bọc toàn bộ các trang con khi user đã xác thực.
- **Tokens & CSS Classes**:
  - Wrapper toàn màn hình: `flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-150`
  - Khung nội dung chính: `flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-900/30`
  - Vùng chứa nội dung: `w-full max-w-none space-y-6`
- **Thành phần tích hợp**: `Header`, `ConnectionBanner`, `Sidebar`, `<main>`.

---

### S06. Trang Quản Lý Thôn (VillagesPage)
- **Tên hiển thị tiếng Việt**: Quản lý thôn
- **Component File**: `src/pages/VillagesPage.tsx` (lines 1-609)
- **Loại**: Trang chính (Page)
- **Trigger**: `activeTab === 'villages'`.
- **Phân quyền**: Quản trị viên Xã (Admin).
- **Tokens & CSS Classes**:
  - Toàn trang: `space-y-6 animate-in fade-in pb-12 select-none`
  - Banner Tổng quan: `rounded-3xl p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white shadow-xl shadow-emerald-950/20`
  - Thẻ KPI: `bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm`
  - Thẻ thôn: `bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 min-h-[180px]`
- **Thành phần & Nút bấm**:
  - Banner:
    - Nhãn: `"UBND Xã Đăk Hà"`, `"Địa Bàn 7 Thôn & Làng Bản"`, Tiêu đề: `"Tổng Quan Đối Tượng Chính Sách Toàn Xã"`
    - Số liệu: `"Tổng số: {totalAll} đối tượng chính sách • Đã nhận quà: {totalReceived} ({overallRate}%)"`
    - Nút 1: `"Xem Báo Cáo Đối Soát"` (icon `ArrowRight`, bấm chuyển sang tab Thống Kê toàn xã)
  - 4 Thẻ KPI:
    1. `"Địa Bàn Quản Lý"`: `{villages.length} Thôn`, phụ đề `"Toàn địa bàn Xã Đăk Hà"` (icon `MapPin`)
    2. `"Hồ Sơ Chúc Thọ"`: `{totalCt} Cụ`, phụ đề `"Đã nhận: {received} ({rate}%)"` (icon `Award`)
    3. `"Hưu Trí Xã Hội"`: `{totalHtxh} Đối tượng`, phụ đề `"Đã nhận: {received} ({rate}%)"` (icon `Users`)
    4. `"Tiến Độ Phát Quà"`: `{overallRate}%`, phụ đề `"{totalReceived} / {totalAll} đối tượng"` (icon `CheckCircle`)
  - Thanh công cụ Thôn:
    - Tiêu đề: `"Danh Sách {villages.length} Thôn Xã Đăk Hà"`
    - Phụ đề: `"Bấm vào thẻ thôn để chuyển nhanh đến màn hình làm việc của thôn đó"`
    - Ô tìm kiếm: `placeholder="Tìm kiếm thôn..."`, kèm icon `Search` và nút `X` xóa tìm kiếm
    - Nút 2: `"Thêm Thôn"` (icon `Plus`)
  - Form Thêm Thôn Mới (khi mở `isAdding`):
    - Tiêu đề: `"Thêm Thôn Mới"`
    - Trường: `"Tên Thôn *"` (placeholder: `"Vd: Thôn 6"`)
    - Nút 3: `"Hủy"`
    - Nút 4: `"Lưu Thôn Mới"` (icon `Check`)
  - Danh sách Thẻ Thôn (7 thôn):
    - Tiêu đề thẻ: Tên thôn (kèm icon `MapPin`)
    - Nút 5: Sửa tên thôn (icon `Edit3`)
    - Nút 6: Xóa thôn (icon `Trash2`)
    - Thông tin: `"Trưởng thôn: {assignedOfficer || 'Chưa phân công'}"`
    - Dòng Chúc Thọ: `"{ctCount} cụ ({ctReceived} đã nhận)"`
    - Dòng Hưu Trí XH: `"{htxhCount} người ({htxhReceived} đã nhận)"`
    - Nhãn chuyển tiếp: `"Xem chi tiết"` (icon `ArrowRight`)
    - Chế độ sửa tên inline: Ô input đổi tên thôn + Nút `"Hủy"` + Nút `"Lưu"`

---

### S07. Dashboard: Header Island & KPI (StatsCards)
- **Tên hiển thị tiếng Việt**: Đảo điều khiển & Thẻ chỉ số tổng quan
- **Component File**: `src/pages/Dashboard/index.tsx` (lines 304-396), `src/pages/Dashboard/components/StatsCards.tsx` (lines 1-98)
- **Loại**: Sub-shell & KPI Container
- **Trigger**: `activeTab === 'chuctho'` hoặc `activeTab === 'htxh'`.
- **Phân quyền**: Admin & Cán bộ thôn.
- **Tokens & CSS Classes**:
  - Header Island: `bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`
  - Scope Badge: `px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider`
  - Thẻ KPI: `bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between`
- **Thành phần & Nút bấm**:
  - Scope thôn: Tên thôn đang chọn hoặc `"Toàn xã Đăk Hà"`
  - Tiêu đề: `"Hồ Sơ Chúc Thọ"` (icon `Award`) hoặc `"Hưu Trí Xã Hội"` (icon `HeartHandshake`)
  - Phụ đề: `"Theo dõi, rà soát và thực hiện chế độ chính sách cho người cao tuổi xã Đăk Hà • Năm tính toán: {globalCalculationYear}"`
  - Nút 1: `"Đổi thôn"` (icon `ArrowLeft`, chỉ hiển thị khi Admin đang xem 1 thôn cụ thể)
  - Nút 2: `"Nhập Excel"` (icon `FileSpreadsheet`, mở ImportModal)
  - Nút 3: `"Xuất Excel"` (icon `Download`, mở ExportModal, nhãn chuyển `"Đang xuất..."` khi đang xử lý)
  - Nút 4: `"Thêm Hồ Sơ"` (icon `Plus`, mở ProfileModal, hỗ trợ phím tắt `Ctrl + N`)
  - 4 Thẻ KPI:
    1. `"TỔNG SỐ HỒ SƠ"`: Số lượng formatted, phụ đề `"Hồ sơ trong danh sách"` (icon `Users`)
    2. `"ĐÃ NHẬN QUÀ"`: Số lượng formatted (chữ xanh emerald), phụ đề `"Đã hoàn tất chi trả"` (icon `CheckCircle`)
    3. `"CHƯA NHẬN QUÀ"`: Số lượng formatted (chữ đỏ rose), phụ đề `"Cần rà soát & trao quà"` (icon `XCircle`)
    4. `"TỶ LỆ HOÀN THÀNH"`: `{rate}%` (chữ xanh blue), phụ đề `"Tiến độ giải ngân"` (icon `Activity`)

---

### S08. Dashboard: Thanh Công Cụ Lọc (ProfileFilterBar & YearSelector)
- **Tên hiển thị tiếng Việt**: Thanh công cụ lọc hồ sơ
- **Component File**: `src/pages/Dashboard/components/ProfileFilterBar.tsx` (lines 1-323), `src/pages/Dashboard/components/YearSelector.tsx` (lines 1-203)
- **Loại**: Toolbar Component
- **Trigger**: Nằm trên trang Dashboard (cho cả Chúc thọ và HTXH).
- **Phân quyền**: Admin & Cán bộ thôn (Admin có dropdown lọc Thôn; Cán bộ thôn có badge thôn cố định).
- **Tokens & CSS Classes**:
  - Khung Toolbar: `flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs`
  - Ô tìm kiếm: `w-56 sm:w-80 h-8 sm:h-9 pl-8.5 pr-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium`
  - Trigger YearSelector: `h-8 sm:h-9 px-2.5 py-1 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800`
  - Nút xóa lọc: `h-8 px-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl`
- **Danh sách 9 bộ lọc & nút bấm**:
  1. **Ô tìm kiếm**: `placeholder="Tìm theo họ tên, CCCD..."` + Nút `X` xóa tìm kiếm + Nút `RefreshCw` làm mới dữ liệu
  2. **YearSelector** (Chọn năm tính toán):
     - Trigger: `"Năm {year}"` kèm icon `ChevronDown`
     - Popover mở ra:
       - Stepper giảm 1 năm (icon `Minus`) + Ô gõ năm trực tiếp (4 số) + Stepper tăng 1 năm (icon `Plus`)
       - Danh sách 10 nút chọn nhanh năm (Từ `năm nay - 1` đến `năm nay + 8`)
       - Nút `"Năm nay ({currentYear})"`
       - Nút `"Áp dụng"`
  3. **Bộ lọc Độ Tuổi (Tab Chúc Thọ)** / **Diện Hưởng (Tab HTXH)**:
     - Tab Chúc Thọ: 11 lựa chọn (`"Tất cả độ tuổi"`, `"Tròn 60 tuổi"`, `"Tròn 65 tuổi"`, `"Tròn 70 tuổi"`, `"Tròn 75 tuổi"`, `"Tròn 80 tuổi"`, `"Tròn 85 tuổi"`, `"Tròn 90 tuổi"`, `"Tròn 95 tuổi"`, `"Tròn 100 tuổi"`, `"Trên 100 tuổi"`)
     - Tab HTXH: 7 lựa chọn (`"Tất cả diện hưởng"`, `"Đủ 75 tuổi trở lên"`, `"Từ 70-74 tuổi hộ nghèo"`, `"Đang hưởng Bảo trợ"`, `"Đang hưởng Hưu trí"`, `"Hưu tuất / Bảo hiểm"`, `"Người có công"`)
  4. **Bộ lọc Giới tính**: 3 lựa chọn (`"Tất cả giới tính"`, `"Nam"`, `"Nữ"`)
  5. **Bộ lọc Dân tộc**: `"Tất cả dân tộc"`, `"Dân tộc Kinh"`, `"Dân tộc thiểu số (DTTS)"`, và các dân tộc địa phương Đăk Hà (Xơ Đăng, Ba Na, Gia Rai...)
  6. **Bộ lọc Cư trú**: 4 lựa chọn (`"Tất cả cư trú"`, `"Thường trú"`, `"Tạm trú"`, `"Tạm vắng"`)
  7. **Bộ lọc Thôn**:
     - Khi là Admin xem toàn xã: Dropdown chọn thôn (`"Toàn xã"`, `"Thôn 1"`, `"Thôn 2"`, ...)
     - Khi là Cán bộ thôn: Badge cố định tên thôn quản lý (chấm tròn xanh emerald)
  8. **Bộ lọc Quà tặng**: 3 lựa chọn (`"Tất cả trạng thái"`, `"Đã nhận quà"`, `"Chưa nhận quà"`)
  9. **Nút "Xóa lọc"**: Icon `RotateCcw`, chỉ xuất hiện khi có ít nhất 1 bộ lọc đang được kích hoạt

---

### S09. Dashboard: Bảng Dữ Liệu Hồ Sơ (MainTable & ProfileRow)
- **Tên hiển thị tiếng Việt**: Bảng danh sách hồ sơ
- **Component File**: `src/pages/Dashboard/components/MainTable.tsx` (lines 1-398), `src/pages/Dashboard/components/ProfileRow.tsx` (lines 1-515)
- **Loại**: Data Table & Row Component
- **Trigger**: Nằm trên trang Dashboard.
- **Phân quyền**: Admin & Cán bộ thôn.
- **Tokens & CSS Classes**:
  - Khung bao: `bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative`
  - Header Info bar: `p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 text-xs`
  - Floating Batch Toolbar: `fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-md bg-white/95 dark:bg-slate-900/95`
  - Header bảng: `sticky top-0 z-20 bg-slate-100/95 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[11px] font-black uppercase tracking-wider`
  - Checkbox sticky trái: `sticky left-0 z-10 w-10 min-w-[40px] py-3 px-2 text-center border-b border-r border-slate-200/80 dark:border-slate-800/60`
  - Thao tác sticky phải: `py-3 px-3 text-center w-24 sticky right-0 z-10 border-b border-slate-200/80 dark:border-slate-800/60`
  - Phân nhóm mốc tuổi: `border-t-2 border-emerald-500/30 dark:border-emerald-500/50`
- **Danh sách cột dữ liệu**:
  - **Tab Chúc Thọ (11 cột)**:
    1. Checkbox chọn tất cả / từng dòng (Sticky trái)
    2. `STT` (Số thứ tự liên tục theo trang)
    3. `HỌ VÀ TÊN` (Sortable, có biểu tượng sắp xếp `SortIcon`)
    4. `MỨC TUỔI` (Huy hiệu xanh blue: `"Tròn 60 tuổi"`, ...)
    5. `GIỚI TÍNH` (`"Nam"` / `"Nữ"`)
    6. `NĂM SINH` (Sortable)
    7. `SỐ CCCD` (Masked `••••••••1234` kèm nút `Eye`/`EyeOff`)
    8. `NƠI CƯ TRÚ (HỘ KHẨU)`
    9. `MỐC CHÚC THỌ` (Sortable, nhãn `"TRÒN 70"`, ...)
    10. `QUÀ TẶNG` (Nút toggle trạng thái: `"Đã nhận"` / `"Chưa nhận"`)
    11. `THAO TÁC` (Sticky phải: Nút `Edit3` Sửa, Nút `Trash2` Xóa)
  - **Tab Hưu Trí Xã Hội (13 cột)**:
    1. Checkbox chọn tất cả / từng dòng (Sticky trái)
    2. `STT`
    3. `HỌ VÀ TÊN` (Sortable)
    4. `DIỆN HƯỞNG` (Huy hiệu tím purple: `"Đủ 75 tuổi+"`, ...)
    5. `GIỚI TÍNH`
    6. `NĂM SINH` (Sortable)
    7. `SỐ CCCD` (Masked kèm nút xem)
    8. `NƠI CƯ TRÚ (HỘ KHẨU)`
    9. `ĐỦ 75+` (Nhãn `"CÓ"` hoặc `"-"`)
    10. `70-74 NGHÈO` (Nhãn `"CÓ"` hoặc `"-"`)
    11. `CHẾ ĐỘ HƯỞNG` (Nút bấm xem chi tiết: `"{N} CHÍNH SÁCH"`)
    12. `QUÀ TẶNG` (Nút toggle trạng thái)
    13. `THAO TÁC` (Sticky phải: Nút Sửa, Nút Xóa)
- **Nút bấm trên thanh thao tác hàng loạt (Floating Batch Toolbar)**:
  - Chỉ báo: `"{selectedIds.size} đã chọn"`
  - Nút 1: `"Bỏ chọn"` (text link gạch chân)
  - Nút 2: `"Đã Nhận Quà"` (icon `CheckCircle2`)
  - Nút 3: `"Chưa Nhận Quà"` (icon `Circle`)
  - Nút 4: `"Xóa Đã Chọn"` (icon `Trash2`, màu đỏ rose)

---

### S10. Modal: Thêm / Sửa Hồ Sơ (ProfileModal)
- **Tên hiển thị tiếng Việt**: Cửa sổ thêm / chỉnh sửa thông tin hồ sơ
- **Component File**: `src/pages/Dashboard/modals/ProfileModal.tsx` (lines 1-755)
- **Loại**: Modal Dialog (React Portal)
- **Trigger**: Mở khi bấm `[+ Thêm Hồ Sơ]`, phím tắt `Ctrl + N`, hoặc bấm nút `Edit3` / bấm vào dòng hồ sơ trên bảng.
- **Phân quyền**: Admin & Cán bộ thôn.
- **Tokens & CSS Classes**:
  - Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs select-none`
  - Hộp Modal: `w-full max-w-3xl h-[88vh] max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden`
  - Input field: `w-full px-3.5 py-2.5 rounded-xl text-sm font-medium bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-100`
- **Thành phần & Nút bấm**:
  - Header:
    - Icon `User`
    - Tiêu đề: `"THÊM MỚI HỒ SƠ CHÚC THỌ"` / `"THÊM MỚI HỒ SƠ HƯU TRÍ XÃ HỘI"` (khi tạo mới) hoặc `"CHỈNH SỬA HỒ SƠ CHÚC THỌ"` / `"CHỈNH SỬA HỒ SƠ HƯU TRÍ XÃ HỘI"` (khi sửa)
    - Phụ đề: `"Năm tính toán: {calculationYear}"` + Huy hiệu mốc tuổi tự tính (vd: `"Tròn 70 tuổi"`)
    - 2 Tabs chuyển đổi (chỉ hiện khi chỉnh sửa): Tab `"Thông Tin"` và Tab `"Lịch Sử"` (icon `History`)
    - Nút đóng: Icon `X` (`aria-label="Đóng cửa sổ"`, hỗ trợ phím `Escape`)
  - Form Tab Thông Tin:
    1. Trường `"Họ và Tên *"` (Text input)
    2. Trường `"Năm sinh (hoặc Ngày sinh) *"` (Text input YYYY hoặc DD/MM/YYYY)
    3. Trường `"Giới tính"` (CustomSelect: Nam, Nữ)
    4. Trường `"Số CCCD (12 chữ số)"` (Text input font-mono, max 12 ký tự)
    5. Trường `"Dân tộc"` (CustomSelect searchable: 15 nhóm dân tộc)
    6. Trường `"Thuộc Thôn"` (CustomSelect với Admin; Cán bộ thôn hiển thị badge cố định `"Thôn quản lý: {name}"`)
    7. Trường `"Nơi thường trú (Hộ khẩu)"` (Text input)
    8. Trường `"Nơi ở hiện nay"` (Text input)
    9. Trường `"Trạng thái nhận quà"` (CustomSelect: Chưa nhận quà / Đã nhận quà)
    10. Trường `"Ghi chú"` (Text input)
    - Nếu là Tab HTXH: Khối 6 checkbox diện hưởng:
      - `[ ] Đủ 75 tuổi trở lên`
      - `[ ] 70-74 tuổi nghèo/cận nghèo`
      - `[ ] Đang hưởng Bảo trợ`
      - `[ ] Đang hưởng Hưu trí`
      - `[ ] Hưu tuất / Bảo hiểm`
      - `[ ] Người có công`
  - Tab Lịch Sử:
    - Danh sách các mục audit log ghi vết lịch sử thay đổi của hồ sơ (loại action, thời gian, ghi chú)
  - Footer:
    - Nút 1: `"Hủy Bỏ"` (icon `ArrowLeft`)
    - Nút 2: `"Lưu Thay Đổi"` (icon `Save`, nhãn đổi thành `"Đang lưu..."` kèm spinner khi đang lưu)

---

### S11. Modal: Nhập Excel Đối Soát (ImportModal)
- **Tên hiển thị tiếng Việt**: Cửa sổ nhập dữ liệu đối soát Excel
- **Component File**: `src/pages/Dashboard/modals/ImportModal.tsx` (lines 1-1527)
- **Loại**: Multi-step Modal Workflow (React Portal)
- **Trigger**: Mở khi bấm nút `[Nhập Excel]` trên Header Island Dashboard.
- **Phân quyền**: Admin & Cán bộ thôn.
- **Tokens & CSS Classes**:
  - Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs`
  - Hộp Modal: `w-full max-w-5xl h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden`
  - Dropzone: `border-2 border-dashed border-emerald-500/50 rounded-3xl p-8 text-center bg-emerald-50/20`
  - Table preview: `text-xs border-collapse`, 3 cột đầu sticky (`left-0`, `left-[48px]`, `left-[160px]`)
- **3 Giai đoạn làm việc & Nút bấm**:
  1. **Giai đoạn 1: Tải tệp lên (Dropzone)**:
     - Khu vực kéo thả file Excel (`.xlsx`, `.xls`)
     - Nút 1: `"Chọn tệp từ máy tính"` (icon `FolderOpen`)
     - Nút 2: `"Tải mẫu Excel chuẩn"` (icon `FileDown`)
  2. **Giai đoạn 2: Khớp Cột Dữ Liệu (Column Mapping)**:
     - Nhãn nhận diện: Tên file, loại mẫu (`CTH` / `HTXH` / `CUTRI`)
     - Dropdown `"Mẫu đã lưu"` (chọn template mapping trước đó)
     - Danh sách ánh xạ từng trường: STT, Họ và tên *, Năm sinh *, Giới tính Nam *, Giới tính Nữ *, CCCD, Dân tộc, Cư trú, Nơi ở hiện nay, Ghi chú, Đã nhận quà, và các diện HTXH
     - Ô nhập tên template mới + Nút 3: `"Lưu mẫu khớp cột"` (icon `Save`)
     - Checkbox: `"Tự động áp dụng cho các tệp tiếp theo"`
     - Nút 4: `"Quay lại"`
     - Nút 5: `"Tiếp Tục Đối Soát"` (icon `ArrowRight`)
  3. **Giai đoạn 3: Bảng Preview Đối Soát (10 cột, sticky 3 cột đầu)**:
     - 10 cột bảng: (1) `STT` (Sticky 1), (2) `Thôn / Diện` (Sticky 2), (3) `Họ và Tên` (Sticky 3), (4) `Ngày Sinh` (Tô đỏ cảnh báo lỗi định dạng), (5) `Giới Tính`, (6) `Dân Tộc`, (7) `CCCD`, (8) `Địa Chỉ`, (9) `Mốc Tuổi / Diện Hưởng`, (10) `Ghi Chú`
     - Thanh thống kê: Số bản ghi hợp lệ, số bản ghi lỗi
     - Phân trang preview: Selector số dòng (10, 20, 50, 100), Nút `"Trước"`, Nút `"Sau"`
     - Nút 6: `"Hủy Bỏ"`
     - Nút 7: `"Xác Nhận Nhập ({validRowsCount} Hợp Lệ)"`
  4. **Kết quả hoàn tất (Result View)**:
     - Thống kê: Số hồ sơ tạo mới, số hồ sơ cập nhật, số lỗi
     - Nút 8: `"Đóng"`

---

### S12. Modal: Xuất Báo Cáo Excel (ExportModal)
- **Tên hiển thị tiếng Việt**: Cửa sổ xuất báo cáo Excel
- **Component File**: `src/pages/Dashboard/modals/ExportModal.tsx` (lines 1-271)
- **Loại**: Modal Dialog (React Portal)
- **Trigger**: Mở khi bấm nút `[Xuất Excel]` trên Header Island Dashboard.
- **Phân quyền**: Admin & Cán bộ thôn.
- **Tokens & CSS Classes**:
  - Backdrop: `fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md`
  - Hộp Modal: `rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900`
- **Thành phần & Nút bấm**:
  - Header: Icon `Download`, Tiêu đề: `"XUẤT BÁO CÁO EXCEL"`, Nút đóng `X`
  - Khối thông báo: `"Hệ thống sẽ lấy dữ liệu hiện tại trên màn hình để xuất file. Bạn có thể thiết lập thêm giới hạn bên dưới nếu cần:"`
  - Checkbox: `"Chỉ xuất {selectedIds.size} hồ sơ đang được chọn (Bỏ qua lọc Thôn)"` (chỉ hiển thị khi có dòng được chọn trên bảng)
  - Danh sách nút chọn thôn (Admin): Grid các nút bấm chọn/bỏ chọn từng thôn (Thôn 1, Thôn 2... Kon Hnông Bách)
  - Dòng tổng kết: `"CHỌN: {finalCount} HỒ SƠ"`
  - Nút 1: `"Hủy"` (Đóng modal)
  - Nút 2: `"Xuất File"` (icon `Download`, nhãn chuyển `"Đang xuất..."` khi đang xử lý)

---

### S13. Trang Thống Kê Báo Cáo & Đối Soát (AnalyticsPage)
- **Tên hiển thị tiếng Việt**: Thống kê báo cáo & đối soát chính sách
- **Component File**: `src/pages/AnalyticsPage.tsx` (lines 1-843)
- **Loại**: Trang chính (Page)
- **Trigger**: `activeTab === 'analytics'`.
- **Phân quyền**:
  - **Admin**: Được chọn xem số liệu toàn xã hoặc lọc theo từng thôn cụ thể.
  - **Cán bộ thôn**: Cố định số liệu tại thôn mình phụ trách.
- **Tokens & CSS Classes**:
  - Toàn trang: `space-y-6 animate-in fade-in pb-12 select-none`
  - Cards: `bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm`
  - Biểu đồ Donut: Khung tròn SVG `w-24 h-24 -rotate-90`, thanh tiến độ `rounded-full h-1.5`
  - Bảng đối soát thôn: `text-xs text-left border-separate border-spacing-0 whitespace-nowrap min-w-[960px]`
- **Thành phần & Nút bấm**:
  - Header Panel:
    - Tiêu đề: `"Thống Kê Báo Cáo & Đối Soát Chính Sách"` (icon `BarChart3`)
    - Phụ đề: `"Phân tích số liệu đối tượng Chúc Thọ và Hưu Trí Xã Hội trên địa bàn {Xã Đăk Hà / Tên thôn} (Năm {selectedYear})"`
    - Bộ lọc 1: CustomSelect Năm tính toán (4 năm: N-2, N-1, N, N+1)
    - Bộ lọc 2: CustomSelect Thôn (Admin: Toàn xã & 7 thôn; Cán bộ thôn: Badge cố định)
    - Nút 1: Làm mới dữ liệu (icon `RefreshCw`)
  - 4 Thẻ KPI:
    1. `"Tổng Đối Tượng"`: `{totalAll} Người` (Chúc Thọ: {totalCt} • HTXH: {totalHtxh}) (icon `Users`)
    2. `"Đã Nhận Quà"`: `{totalReceived} Người` (`Đạt {overallRate}% toàn địa bàn`) (icon `CheckCircle`)
    3. `"Chưa Nhận Quà"`: `{totalUnreceived} Người` (`Còn {unreceivedRate}% đang xử lý`) (icon `Clock`)
    4. `"Tiến Độ Thực Hiện"`: `{overallRate}%` (Kèm thanh tiến độ ngang màu xanh emerald) (icon `TrendingUp`)
  - 2 Biểu đồ MiniDonut SVG tròn:
    1. `"Cơ Cấu Giới Tính"`: Nam (màu xanh `#3b82f6`) vs Nữ (màu hồng `#f43f5e`)
    2. `"Phân Bổ Dân Tộc"`: Dân tộc Kinh (màu xanh `#10b981`) vs Dân tộc khác (màu vàng `#f59e0b`)
  - 2 Blocks Phân Tích Cơ Cấu:
    1. `"Cơ Cấu 10 Mốc Tuổi Tròn Chúc Thọ"` (icon `Award`): Danh sách thanh bar ngang 10 mốc: Tròn 60, 65, 70, 75, 80, 85, 90, 95, 100, Trên 100 tuổi
    2. `"Cơ Cấu 6 Diện Hưu Trí Xã Hội"` (icon `Users`): Danh sách thanh bar ngang 6 diện: Đủ 75 tuổi trở lên, 70-74 tuổi hộ nghèo, Đang hưởng Bảo trợ, Đang hưởng Hưu trí, Hưu tuất / Bảo hiểm, Người có công
  - Bảng Đối Soát Số Liệu Các Thôn (10 cột):
    - Cột 1: `STT`
    - Cột 2: `Địa Bàn Thôn`
    - Cột 3-6: Nhóm Chúc Thọ (`Tổng số`, `Đã nhận`, `Chưa nhận`, `Tỷ lệ`)
    - Cột 7-10: Nhóm Hưu Trí Xã Hội (`Tổng số`, `Đã nhận`, `Chưa nhận`, `Tỷ lệ`)
    - Dòng tổng kết cuối bảng (`tfoot`): `"TỔNG CỘNG TOÀN XÃ"`

---

### S14. Trang Thùng Rác (RecycleBinPage)
- **Tên hiển thị tiếng Việt**: Quản lý hồ sơ đã xóa tạm (Thùng rác)
- **Component File**: `src/pages/RecycleBinPage.tsx` (lines 1-456)
- **Loại**: Trang chính (Page)
- **Trigger**: `activeTab === 'recycle-bin'`.
- **Phân quyền**: Admin & Cán bộ thôn (chức năng xóa vĩnh viễn giới hạn riêng cho Admin).
- **Tokens & CSS Classes**:
  - Toàn trang: `space-y-6 animate-in fade-in pb-12 select-none`
  - Header: `bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm`
  - Bảng dữ liệu: `border-separate border-spacing-0 whitespace-nowrap min-w-[900px] text-xs`
- **Thành phần & Nút bấm**:
  - Header:
    - Badge: `"Thùng Rác ({total})"`
    - Tiêu đề: `"Quản Lý Hồ Sơ Đã Xóa Tạm"` (icon `Trash2`)
    - Phụ đề: `"Khôi phục lại hồ sơ hoặc xóa vĩnh viễn khỏi cơ sở dữ liệu hệ thống"`
    - Nút 1: `"Khôi Phục ({selectedIds.length})"` (icon `RotateCcw`, hiện khi chọn checkbox)
    - Nút 2: `"Xóa Vĩnh Viễn ({selectedIds.length})"` (icon `ShieldAlert`, Admin only, hiện khi chọn checkbox)
    - Nút 3: Làm mới danh sách (icon `RefreshCw`)
  - Thanh chọn phân hệ & tìm kiếm:
    - Nút 4: Tab `"Thùng Rác Chúc Thọ"` (icon `Award`)
    - Nút 5: Tab `"Thùng Rác Hưu Trí Xã Hội"` (icon `Users`)
    - Ô tìm kiếm: `placeholder="Tìm theo họ tên, CCCD..."` (icon `Search`)
  - Bảng dữ liệu đã xóa (8 cột):
    1. Checkbox chọn tất cả / từng dòng
    2. `STT`
    3. `Họ và Tên`
    4. `Năm Sinh`
    5. `CCCD`
    6. `Hộ Khẩu / Nơi Ở`
    7. `Thời Điểm Xóa` (format ngày giờ VN)
    8. `Thao Tác`: Nút 6: `"Khôi Phục"` (icon `RotateCcw`) + Nút 7: `"Xóa"` (icon `Trash2`, Admin only)
  - Phân trang: Component `TablePagination`

---

### S15. Trang Nhật Ký Hoạt Động & Biến Động (AuditLogPage)
- **Tên hiển thị tiếng Việt**: Nhật ký hoạt động & biến động dữ liệu
- **Component File**: `src/pages/AuditLogPage.tsx` (lines 1-875)
- **Loại**: Trang chính (Page)
- **Trigger**: `activeTab === 'audit'`.
- **Phân quyền**: Quản trị viên Xã (Admin).
- **Tokens & CSS Classes**:
  - Toàn trang: `space-y-6 animate-in fade-in pb-12 select-none`
  - Banner: `bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm`
  - Timeline node: `w-4.5 h-4.5 rounded-full ring-4 ring-white dark:ring-slate-900`
  - Card sự kiện: `bg-slate-50/60 dark:bg-slate-950/60 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80`
- **Thành phần & Nút bấm**:
  - Header:
    - Badge: `"Hệ Thống Kiểm Soát"`
    - Tiêu đề: `"Nhật Ký Hoạt Động & Biến Động Dữ Liệu"` (icon `History`)
    - Phụ đề: `"Ghi vết tự động toàn bộ biến động hồ sơ Chúc Thọ, Hưu Trí Xã Hội, nhập xuất dữ liệu và thao tác nghiệp vụ tại Xã Đăk Hà"`
    - Nút 1: `"Làm Mới"` (icon `RefreshCw`)
  - Thanh lọc sự kiện nhanh (7 nút bấm):
    - Nút 2: `"Tất Cả"`
    - Nút 3: `"Thêm Mới"` (CREATE - xanh emerald)
    - Nút 4: `"Cập Nhật"` (UPDATE - xanh blue)
    - Nút 5: `"Đổi Trạng Thái"` (STATUS_CHANGE - xanh teal)
    - Nút 6: `"Xóa"` (DELETE - đỏ rose)
    - Nút 7: `"Khôi Phục"` (RESTORE - tím purple)
    - Nút 8: `"Nhập Excel"` (IMPORT - vàng amber)
  - Thanh tìm kiếm & lọc 4 cột:
    1. Ô tìm kiếm từ khóa: `placeholder="Tìm theo nội dung, tên đối tượng, cán bộ..."`
    2. Bộ lọc Thôn: CustomSelect Thôn hoặc Badge Thôn đã chọn kèm Nút 9: `"Xem Toàn Xã"`
    3. Bộ lọc Loại chính sách: CustomSelect (`"Cả 2 loại chính sách"`, `"Hồ sơ Chúc Thọ"`, `"Hưu Trí Xã Hội"`)
    4. Bộ lọc Cán bộ thực hiện: CustomSelect searchable từ danh sách cán bộ
  - Timeline Dòng Thời Gian:
    - Node icon tròn theo màu action
    - Card chi tiết: Badge loại thao tác, Badge loại hồ sơ, Tóm tắt ghi chú, Thời gian (`HH:MM:SS • DD/MM/YYYY`)
    - Trình thông dịch thay đổi dữ liệu (Friendly JSON Diff):
      - Cập nhật thông tin: Grid các thẻ hiển thị `{Tên trường}: {Giá trị cũ gạch ngang} → {Giá trị mới tô xanh}`
      - Thêm mới: Grid các thẻ thông tin khởi tạo (Họ tên, Năm sinh, Giới tính, CCCD, Thôn, Nơi ở)
      - Nhập Excel: Tên file Excel, số bản ghi, số thêm mới, số cập nhật
      - Xóa hồ sơ: Tên hồ sơ đã xóa, năm sinh, CCCD, thôn, lý do xóa
      - Khôi phục: Tên hồ sơ đã khôi phục, lý do
    - Chân card: Tên cán bộ thực hiện (icon `UserIcon`), Đơn vị thôn (icon `MapPin`)
  - Nút 10: `"Tải Thêm Dữ Liệu"` (icon `ArrowDownCircle`, hiển thị khi `page < totalPages`)

---

### S16. Trang Cài Đặt Hệ Thống (Settings & Các Phân Hệ)
- **Tên hiển thị tiếng Việt**: Cài đặt hệ thống
- **Component File**: `src/pages/Settings/index.tsx` (lines 1-1285), `TimeCard.tsx`, `BackupRestoreTab.tsx`
- **Loại**: Tabbed Container Page
- **Trigger**: `activeTab === 'settings'`.
- **Phân quyền**: Admin (5 tabs đầy đủ); Cán bộ thôn (3 tabs: profile, system, time).
- **Thanh 5 Tabs điều hướng**:
  1. Tab 1: `"Tài Khoản Của Tôi"` (icon `UserIcon`)
  2. Tab 2: `"Quản Lý Cán Bộ Thôn"` (icon `Users`, Admin only)
  3. Tab 3: `"Sao Lưu CSDL"` (icon `Database`, Admin only)
  4. Tab 4: `"Thông Tin Đơn Vị & Hệ Thống"` (icon `Building2`)
  5. Tab 5: `"Cài Đặt Thời Gian & Năm Tính Tuổi"` (icon `Clock`)

#### S16a. Sub-tab: Tài Khoản Của Tôi (`profile`)
- **Card 1: Thông tin tài khoản**:
  - Avatar 2 chữ cái đầu username
  - Tên username + Huy hiệu `"Hoạt động"` (chấm xanh pulse)
  - Phụ đề: `"Quản trị viên Xã (Admin)"` hoặc `"Cán bộ phụ trách Thôn"`
  - Dòng thông tin: Vai trò hệ thống, Đơn vị công tác, Địa bàn quản lý
  - Nút 1: `"Đăng Xuất Khỏi Hệ Thống"` (icon `LogOut`, màu đỏ rose)
- **Card 2: Đổi mật khẩu cá nhân**:
  - Tiêu đề: `"Đổi Mật Khẩu Cá Nhân"` (icon `KeyRound`)
  - Trường 1: `"Mật Khẩu Hiện Tại *"`
  - Trường 2: `"Mật Khẩu Mới *"` (kèm nút bật/tắt `Eye`/`EyeOff`)
  - Trường 3: `"Xác Nhận Mật Khẩu Mới *"`
  - Nút 2: `"Cập Nhật Mật Khẩu"` (icon `KeyRound`, nhãn chuyển `"Đang cập nhật..."` khi loading)

#### S16b. Sub-tab: Quản Lý Cán Bộ Thôn (`users` - Admin only)
- **Header danh sách**:
  - Tiêu đề: `"Danh Sách Tài Khoản Cán Bộ ({usersList.length})"`
  - Nút 1: Làm mới danh sách (icon `RefreshCw`)
  - Nút 2: `"Thêm Cán Bộ"` (icon `Plus`)
- **Form Thêm Cán Bộ Mới** (khi mở `isAddUserOpen`):
  - Trường 1: `"Tên Đăng Nhập *"`
  - Trường 2: `"Mật Khẩu Khởi Tạo *"`
  - Trường 3: CustomSelect `"Vai trò"` (`"Cán bộ Thôn (User)"` / `"Quản trị viên Xã (Admin)"`)
  - Trường 4: CustomSelect `"Phân công Thôn"` (chỉ hiện khi vai trò là User)
  - Nút 3: `"Hủy"`
  - Nút 4: `"Tạo Tài Khoản"` (icon `Plus`)
- **Bảng Quản Lý Cán Bộ (5 cột)**:
  1. `Tài Khoản`: Avatar chữ cái + Tên username
  2. `Vai Trò`: Huy hiệu `"Admin Xã"` (tím) hoặc `"Cán bộ thôn"` (xanh)
  3. `Địa Bàn Phụ Trách`: Tên thôn hoặc `"Toàn xã Đăk Hà"`
  4. `Trạng Thái`: Chấm tròn `"Hoạt động"`
  5. `Hành Động`: Nút 5: Phân công thôn (icon `Edit3`), Nút 6: Đổi mật khẩu (icon `KeyRound`), Nút 7: Xóa tài khoản (icon `Trash2`)
- **Modal Đặt Lại Mật Khẩu Cán Bộ** (`resetPwdUser`):
  - Tiêu đề: `"Đặt Lại Mật Khẩu Cho: {username}"`
  - Trường: `"Mật Khẩu Mới (ít nhất 6 ký tự)"` kèm nút `Eye`/`EyeOff`
  - Nút 8: `"Hủy"`
  - Nút 9: `"Lưu Mật Khẩu"`
- **Modal Phân Công Thôn** (`assignUser`):
  - Tiêu đề: `"Phân Công Thôn Cho: {username}"`
  - Trường 1: CustomSelect Vai trò
  - Trường 2: CustomSelect Thôn Phụ Trách
  - Nút 10: `"Hủy"`
  - Nút 11: `"Lưu Phân Công"`

#### S16c. Sub-tab: Sao Lưu CSDL (`backup` - Admin only)
- **Component File**: `src/components/settings/BackupRestoreTab.tsx` (lines 1-222)
- **Header**: Icon `Database`, Tiêu đề: `"Sao Lưu & Phục Hồi Dữ Liệu"`
- **Khối Xuất Bản Sao Lưu**:
  - Tiêu đề: `"Xuất Bản Sao Lưu (Export Backup)"`
  - Phụ đề: `"Tạo tệp dự phòng định dạng JSON chứa toàn bộ dữ liệu hồ sơ Chúc Thọ, Hưu Trí Xã Hội và cấu hình hệ thống."`
  - Nút 1: `"Tải Bản Sao Lưu"` (icon `Download`, nhãn chuyển `"Đang xuất..."` khi loading)
- **Khối Phục Hồi Dữ Liệu**:
  - Tiêu đề: `"Phục Hồi Dữ Liệu (Restore Database)"` (icon `AlertTriangle`, cảnh báo màu đỏ)
  - Phụ đề: `"Chọn tệp sao lưu (.json) từ máy tính để ghi đè phục hồi lại hệ thống dữ liệu hồ sơ chính sách."`
  - Input ẩn chọn file `.json`
  - Nút 2: `"Chọn Tệp Khôi Phục"` (icon `UploadCloud`, nhãn chuyển `"Đang khôi phục..."` khi loading)
- **Chân trang**: `"Tệp sao lưu được mã hóa và bảo mật an toàn theo tiêu chuẩn CSDL quốc gia."` (icon `ShieldCheck`)

#### S16d. Sub-tab: Thông Tin Đơn Vị & Hệ Thống (`system`)
- **Khối 1: Form Thông Tin Đơn Vị Hành Chính**:
  - Tiêu đề: `"Thông Tin Đơn Vị Hành Chính"` (icon `Building2`)
  - Nút 1: `"Lưu Thông Tin Đơn Vị"` (icon `CheckCircle2`)
  - Trường 1: `"Tên Cơ Quan / UBND Xã *"` (Mặc định: `"Ủy ban nhân dân Xã Đăk Hà"`)
  - Trường 2: `"Huyện / Thị Xã *"` (Mặc định: `"Huyện Đăk Hà"`)
  - Trường 3: `"Tỉnh / Thành Phố *"` (Mặc định: `"Tỉnh Kon Tum"`)
  - Trường 4: `"Địa Chỉ Trụ Sở UBND"` (Mặc định: `"Trung tâm Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum"`)
  - Trường 5: `"Số Điện Thoại Liên Hệ"` (Mặc định: `"0260.3822.123"`)
  - Trường 6: `"Email Công Vụ"` (Mặc định: `"ubnd.xadakha@kontum.gov.vn"`)
- **Khối 2: Thông Tin Phần Mềm & Bản Quyền**:
  - Tiêu đề: `"Thông Tin Phần Mềm & Bản Quyền"` (icon `Info`)
  - 4 Thẻ thông tin:
    1. Tên ứng dụng: `QLCS Desktop`
    2. Phiên bản hiện tại: `v3.0.0 (Online-First)`
    3. Cơ sở dữ liệu: `PostgreSQL Enterprise`
    4. Bản quyền & Sở hữu: `{communeName || "UBND Xã Đăk Hà"}`

#### S16e. Sub-tab: Cài Đặt Thời Gian & Năm Tính Tuổi (`time`)
- **Component File**: `src/pages/Settings/TimeCard.tsx` (lines 1-543)
- **Khối 1: Năm Tính Toán Chúc Thọ Toàn Hệ Thống**:
  - Tiêu đề: `"Năm Tính Toán Chúc Thọ Toàn Hệ Thống"` (icon `CalendarRange`)
  - Phụ đề: `"Quyết định mốc tuổi tròn (60, 65, 70, 75, 80, 85, 90, 95, 100, >100) trên toàn bộ danh sách hồ sơ"`
  - Trường: `"Năm Áp Dụng Tính Mốc Tuổi"` (Number input từ 1900 đến 2100)
  - Nút 1: `"Lưu Năm Tính"` (icon `Save`)
  - 4 Nút chọn nhanh mốc năm: `[2024]`, `[2025]`, `[2026]`, `[2027]`
  - Gợi ý nghiệp vụ: `"Ví dụ: Khi chọn năm 2026, công dân sinh năm 1956 sẽ được hệ thống xếp vào mốc Tròn 70 tuổi."`
- **Khối 2: Nguồn Thời Gian Ứng Dụng**:
  - Tiêu đề: `"Nguồn Thời Gian Ứng Dụng"` (icon `Clock`)
  - Live Clock Card: Hiển thị thời gian chạy thực (`Thứ, ngày DD/MM/YYYY - HH:MM:SS`), độ lệch so với máy tính (`offset ms`)
  - Nút 2: `"Đồng bộ lại"` (icon `RefreshCw`, chỉ hiện khi ở chế độ Internet)
  - 3 Nút chọn chế độ nguồn thời gian:
    - Chế độ 1: `"Theo máy tính"` (icon `Laptop`, dấu tick `Check`)
    - Chế độ 2: `"Internet (Chuẩn)"` (icon `Globe`, dấu tick `Check`)
    - Chế độ 3: `"Thiết lập thủ công"` (icon `Calendar`, dấu tick `Check`)
  - Khối Cài Đặt Thủ Công (khi chọn chế độ 3):
    - Ô chọn ngày giờ: `datetime-local`
    - Nút 3: `"Áp dụng thời gian này"`

---

### S17. Shared Component: Dropdown Tùy Biến (CustomSelect)
- **Tên hiển thị tiếng Việt**: Dropdown tùy biến React Portal
- **Component File**: `src/components/common/CustomSelect.tsx` (lines 1-508)
- **Loại**: Shared UI Primitive
- **Tokens & CSS Classes**:
  - Trigger Button: `px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center justify-between shadow-2xs`
  - Khung Dropdown Portal: `fixed z-[100000] rounded-2xl border shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`
  - Ô tìm kiếm trong dropdown: `p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2`
  - Mục được chọn: `bg-emerald-600 text-white font-bold rounded-xl`
  - Mục hover: `hover:bg-slate-100 dark:hover:bg-slate-800`
- **Tính năng nổi bật**:
  - Render qua React Portal tại `document.body` (tránh bị cắt cụt bởi `overflow-hidden` của bảng hoặc modal).
  - Tự động phát hiện hướng mở (mở lên trên nếu phía dưới màn hình còn dưới 260px).
  - Tìm kiếm trực tiếp trong dropdown khi có trên 8 options.
  - Hỗ trợ phím mũi tên `ArrowUp`, `ArrowDown`, `Enter` để chọn, `Escape` để đóng.
  - Hỗ trợ xóa chọn (`clearable` + nút `X`).

---

### S18. Shared Component: Thanh Phân Trang Chuẩn (TablePagination)
- **Tên hiển thị tiếng Việt**: Thanh phân trang bảng dữ liệu
- **Component File**: `src/components/common/TablePagination.tsx` (lines 1-98)
- **Loại**: Shared UI Primitive
- **Tokens & CSS Classes**:
  - Container: `p-3.5 bg-slate-50/90 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none`
  - Nút chuyển trang: `px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed`
  - Badge trang: `px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-xs text-slate-800 dark:text-slate-200`
- **Các thành phần điều khiển**:
  1. Chỉ báo số dòng: `"Hiển thị {startIdx}-{endIdx} trong tổng số {total} bản ghi"`
  2. Dropdown chọn giới hạn dòng: `"Số dòng:"` kèm CustomSelect (`10 dòng`, `20 dòng`, `50 dòng`, `100 dòng`)
  3. Nút 1: `"Trước"` (icon `ChevronLeft`, disabled khi `page <= 1`)
  4. Chỉ báo: `"Trang {page} / {totalPages || 1}"`
  5. Nút 2: `"Sau"` (icon `ChevronRight`, disabled khi `page >= totalPages`)

---

### S19. Shared Component: Network & Dialogs Hệ Thống
- **Tên hiển thị tiếng Việt**: Banner kết nối & Hộp thoại chẩn đoán máy chủ
- **Component Files**: `src/components/network/ConnectionBanner.tsx` (lines 1-64), `src/components/network/ServerStatusModal.tsx` (lines 1-154)
- **Loại**: Shared System Feedback
- **Tokens & CSS Classes**:
  - Banner mất kết nối: `bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md`
  - Banner kết nối lại: `bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs`
  - Modal chẩn đoán: `bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800`
- **Các nút bấm & nhãn**:
  - Banner ngoại tuyến: `"Mất kết nối tới máy chủ - Đang hoạt động ở chế độ ngoại tuyến (Offline Cache)"` (kèm icon `AlertTriangle` pulse) + Nút `"Thử lại kết nối"` (icon `RefreshCw`)
  - Banner phục hồi: `"Đã khôi phục kết nối thành công — Dữ liệu đã được đồng bộ tự động thời gian thực!"` (icon `CheckCircle2`)
  - Modal chẩn đoán (ServerStatusModal):
    - Tiêu đề: `"Trạng Thái Máy Chủ Backend"` (icon `Server`) + Nút đóng `X`
    - Thẻ 1: `"Kết Nối API"`: Badge `"ONLINE"` / `"OFFLINE"` (icon `CheckCircle2` / `AlertCircle`)
    - Thẻ 2: `"Độ Trễ Phản Hồi"`: Số `{latency} ms` (icon `Activity`)
    - Thẻ 3: `"Địa Chỉ Máy Chủ"`: URL API backend (icon `Globe`)
    - Thẻ 4: `"Phiên Bản Hệ Thống"`: `"v2.0.0"` / `"Xã Đăk Hà - Kon Tum"` (icon `ShieldCheck`)

---

### S20. Popover/Modal Chi Tiết Chính Sách HTXH (ProfileRow Modal Portal)
- **Tên hiển thị tiếng Việt**: Cửa sổ chi tiết chính sách hưu trí xã hội
- **Component File**: `src/pages/Dashboard/components/ProfileRow.tsx` (lines 347-422)
- **Loại**: Popover Dialog (React Portal)
- **Trigger**: Bấm vào nút `"{N} CHÍNH SÁCH"` trên cột CHẾ ĐỘ HƯỞNG của một hàng hồ sơ HTXH.
- **Tokens & CSS Classes**:
  - Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs`
  - Hộp thoại: `rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900`
  - Thẻ chính sách: `px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2`
- **Thành phần & Nút bấm**:
  - Header: Icon `Activity`, Tiêu đề: `"CHI TIẾT CHÍNH SÁCH"`, Tên đối tượng thụ hưởng, Nút đóng `X`
  - Thân hộp thoại: Danh sách các chế độ mà công dân đang được hưởng:
    - `"Bảo trợ xã hội"`
    - `"Hưu trí"`
    - `"Hưu, Tuất Bảo hiểm"`
    - `"Người có công"`
    (Mỗi chế độ đi kèm icon `CheckCircle2` màu xanh emerald)

---

### S21. Màn Hình Bắt Lỗi Runtime (ErrorBoundary)
- **Tên hiển thị tiếng Việt**: Màn hình sự cố hệ thống
- **Component File**: `src/components/ErrorBoundary.tsx` (lines 1-94)
- **Loại**: Error Fallback View
- **Trigger**: Khi xảy ra lỗi crash không bắt được trong cây component React.
- **Tokens & CSS Classes**:
  - Nền & căn giữa: `min-h-screen flex flex-col items-center justify-center p-5 text-center font-sans`
  - Khung log lỗi: `bg-[#f7fafc] border border-[#e2e8f0] rounded-lg p-4 max-w-[600px] text-left text-xs font-mono text-[#2d3748] mb-5 overflow-auto`
  - Nút tải lại: `px-6 py-2.5 bg-[#3182ce] text-white rounded-md font-sans text-sm cursor-pointer`
- **Thành phần**:
  - Tiêu đề: `"Đã xảy ra lỗi"` (màu đỏ `#e53e3e`)
  - Thông báo: `"Ứng dụng đã gặp sự cố. Vui lòng tải lại trang hoặc liên hệ quản trị viên."`
  - Nội dung lỗi: `{error.message}` và `{error.stack}`
  - Nút: `"Tải lại trang"` (gọi `window.location.reload()`)

---

## III. TỔNG KẾT SỐ LƯỢNG & ĐẶC ĐIỂM NGHIỆP VỤ ĐỐI SOÁT

### 1. Thống kê định lượng:
- **Tổng số trang chính (Pages)**: 6 trang (`Login`, `VillagesPage`, `Dashboard`, `AnalyticsPage`, `RecycleBinPage`, `AuditLogPage`, `Settings`).
- **Tổng số màn hình / phân hệ / modal được kiểm kê**: **21 mục (S01 -> S21)** bao gồm đầy đủ Shell, Dashboard phân hệ kép, Modals, Sub-tabs Cài đặt và Shared Components.
- **Các phân hệ nghiệp vụ chính**:
  1. *Hồ Sơ Chúc Thọ*: Tính tuổi tròn (60, 65, 70, 75, 80, 85, 90, 95, 100, >100) theo năm tính toán toàn hệ thống.
  2. *Hưu Trí Xã Hội*: Quản lý 6 diện đối tượng trợ cấp xã hội (75+, 70-74 nghèo, bảo trợ, hưu trí, tuất, người có công).
  3. *Quản Lý Thôn*: Quản trị 7 thôn/làng bản của xã Đăk Hà (Thôn 1, 2, 3, 4, 5, Kon Đao Yôp, Kon Hnông Bách).
  4. *Đối Soát & Báo Cáo*: Thống kê tiến độ phát quà, tỷ lệ giải ngân, nhân khẩu học (giới tính, dân tộc).
  5. *Kiểm Soát Dữ Liệu*: Thùng rác (khôi phục/xóa vĩnh viễn), Audit Log (ghi vết biến động dữ liệu).

### 2. Các điểm kỹ thuật đáng lưu ý (Discrepancies & Unclear Points):
1. **Đồng bộ phiên bản hiển thị (`ServerStatusModal.tsx:144` vs `Sidebar.tsx:292` vs `Settings/index.tsx:1250`)**:
   - Trong `ServerStatusModal.tsx:144`, phiên bản hiển thị là `v2.0.0`.
   - Trong `Sidebar.tsx:292` và `Settings/index.tsx:1250`, phiên bản hiển thị là `QLCS v3.0.0 (Online-First)`.
   - *Ghi chú*: Cần thống nhất nhãn hiển thị phiên bản `v3.0.0` trong quá trình đồng bộ token.
2. **Dashboard dùng chung cho 2 phân hệ (`Dashboard/index.tsx:50-52`)**:
   - `Dashboard` được tái sử dụng cho cả `activeTab === 'chuctho'` và `activeTab === 'htxh'`. Bảng `MainTable` tự động đổi 11 cột (Chúc Thọ) thành 13 cột (HTXH). Bộ lọc mốc tuổi tự động chuyển từ 11 mốc tuổi tròn sang 7 diện hưởng.
3. **Phân quyền chặt chẽ Admin vs Cán bộ thôn**:
   - Cán bộ thôn bị khóa cứng địa bàn thôn (`user.village_id`), không được đổi thôn, không có nút thêm/sửa/xóa thôn, không có quyền xóa vĩnh viễn trong thùng rác, và không xem được Audit Log hoặc Quản lý cán bộ / Sao lưu CSDL.
