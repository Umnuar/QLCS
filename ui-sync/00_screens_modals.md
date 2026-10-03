# Kiểm Kê Toàn Diện Modals, Drawers, Popups & Hộp Thoại Xác Nhận (QLCS Target App)

Tài liệu này ghi nhận 100% các thành phần **Modal, Drawer, Slide-Over, Popup, Confirm Dialog, Alert Dialog và Popover** của ứng dụng đích (**QLCS-Client**), phục vụ chiến dịch Đồng bộ Giao diện UI-Sync với Reference App (**QLHK**).

---

## 1. Bảng Tổng Hợp Kiểm Kê (Master Inventory Table)

| ID | Tên Thành Phần | File Path | Trigger Kích Hoạt | Kích Thước & Vị Trí | Tokens / Lớp CSS Hiện Tại | Danh Sách Inputs / Controls / Cột | Ghi Chú Đồng Bộ Form |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **M01** | `ProfileModal` (Thêm / Sửa Hồ Sơ Chúc Thọ & HTXH) | `src/pages/Dashboard/modals/ProfileModal.tsx` | Nút "Thêm Mới Hồ Sơ" (Toolbar), Nút "Sửa" (`Edit3`) trên dòng, Click dòng bảng | Centered Modal, `w-full max-w-3xl h-[88vh] max-h-[88vh]`, Portal `z-50` | `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl`, Backdrop `bg-slate-950/60 backdrop-blur-xs` | 10 Input cơ bản + 6 Checkbox diện HTXH + Tab Lịch Sử Thay Đổi (`auditLogs`) | Aliased là `ProfileDrawer`; đối ứng với `HouseholdDrawer` / `CitizenModal` của QLHK |
| **M02** | `ImportModal` - Màn 1: Dropzone & Tải Mẫu | `src/pages/Dashboard/modals/ImportModal.tsx` | Nút "Nhập Excel" trên thanh công cụ Dashboard | Centered Modal, `w-full max-w-6xl max-h-[92vh]`, Portal `z-50` | `bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl`, Backdrop `bg-slate-900/60 backdrop-blur-sm` | Vùng kéo thả tệp (`.xlsx,.xls,.csv`), Nút "Chọn Tệp Excel", Nút "Tải Biểu Mẫu Chuẩn (.xlsx)" | Màn hình đầu vào nhập liệu Excel đối ứng với `ExcelDropzone` của QLHK |
| **M03** | `ImportModal` - Màn 2: Khớp Cột Dữ Liệu (Column Mapping) | `src/pages/Dashboard/modals/ImportModal.tsx` | Tự động kích hoạt khi tải tệp Excel lên (`mappingData`) | Centered Modal, `w-full max-w-6xl max-h-[92vh]`, Portal `z-50` | `bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 shadow-2xl`, Backdrop `bg-slate-900/60 backdrop-blur-sm` | Dropdown "Mẫu đã lưu", Lưới khớp cột chung + mốc tuổi/diện HTXH, Checkbox áp dụng hàng loạt, Input lưu tên mẫu | Tính năng đặc thù thông minh của QLCS, giữ nguyên 100% logic và chuỗi văn bản Tiếng Việt |
| **M04** | `ImportModal` - Màn 3: Bảng Đối Soát 10 Cột & Phân Trang | `src/pages/Dashboard/modals/ImportModal.tsx` | Sau khi xác nhận khớp cột hoặc tải tệp có cấu trúc khớp chuẩn | Centered Modal, `w-full max-w-6xl max-h-[92vh]`, Portal `z-50` | Table `min-w-[1100px] border-separate border-spacing-0`, 3 cột đầu sticky, dòng lỗi tô màu rose | Bảng 10 cột dữ liệu (STT, Thôn, Họ tên, Ngày sinh, Giới tính, Dân tộc, CCCD, Địa chỉ, Mốc/Diện, Ghi chú), Badge đếm hợp lệ/lỗi, Phân trang 10/20/50/100 | Đối ứng với `ImportPreviewModal` của QLHK |
| **M05** | `ImportModal` - Màn 4: Tiến Trình Nhập Dữ Liệu | `src/pages/Dashboard/modals/ImportModal.tsx` | Bấm nút "Xác Nhận Nhập" (`isImporting === true`) | Lồng bên trong Modal `ImportModal` | Spinner xoay tròn màu emerald, Thanh tiến trình `h-3 bg-slate-100 rounded-full`, Thanh trượt `bg-emerald-600` | Tiêu đề "Đang xử lý dữ liệu...", Text cảnh báo, Thanh tiến trình, Nhãn % (`importProgress%`) | Hiển thị quá trình xử lý import dữ liệu lớn |
| **M06** | `ImportModal` - Màn 5: Báo Cáo Kết Quả Nhập Dữ Liệu | `src/pages/Dashboard/modals/ImportModal.tsx` | Import hoàn tất (`importResult !== null`) | Centered Dialog, `w-full max-w-3xl max-h-[80vh]`, Portal `z-[999999]` | `rounded-3xl shadow-2xl border`, Backdrop `bg-slate-900/80 backdrop-blur-md` | 3 Thẻ thống kê (Thêm mới, Cập nhật, Lỗi/Cảnh báo), Danh sách log lỗi viền cam, Nút "Lưu log lỗi ra file", Nút "ĐÓNG" | Báo cáo chi tiết sau khi ghi CSDL |
| **M07** | `ExportModal` (Cấu Hình Xuất Báo Cáo Excel) | `src/pages/Dashboard/modals/ExportModal.tsx` | Nút "Xuất Excel" trên thanh công cụ Dashboard | Centered Modal, `w-full max-w-lg`, Portal `z-[99999]` | `rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800`, Backdrop `bg-slate-900/60 backdrop-blur-md` | Checkbox "Chỉ xuất X hồ sơ đang được chọn", Bộ chọn nhiều thôn dạng nút toggle, Đếm tổng hồ sơ xuất động | Đối ứng với `ExportSettingsModal` của QLHK |
| **M08** | `ServerStatusModal` (Trạng Thái Máy Chủ Backend) | `src/components/network/ServerStatusModal.tsx` | Bấm Network/Latency Pill trên Header | Centered Modal, `w-full max-w-sm rounded-3xl shadow-2xl border`, `z-50` | `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`, Backdrop `bg-slate-900/60 backdrop-blur-sm` | 4 Khối thông số: Kết Nối API, Độ Trễ Phản Hồi (ms), Địa Chỉ Máy Chủ (URL), Phiên Bản Hệ Thống (v2.0.0) | Khớp hoàn toàn với pattern `ServerStatusModal` của QLHK |
| **M09** | `PolicyDetailsDialog` (Chi Tiết Chính Sách HTXH) | `src/pages/Dashboard/components/ProfileRow.tsx` | Nút "X CHÍNH SÁCH" trên dòng hồ sơ HTXH | Centered Dialog, `w-full max-w-sm rounded-3xl shadow-2xl`, Portal `z-50` | `rounded-3xl shadow-2xl border`, Backdrop `bg-slate-900/60 backdrop-blur-xs` | Header icon Activity xanh dương, Danh sách các badge chính sách kèm icon `CheckCircle2` xanh ngọc | Popover/Modal xem nhanh các trợ cấp xã hội của một cá nhân |
| **M10** | `ResetPasswordModal` (Đặt Lại Mật Khẩu Cán Bộ) | `src/pages/Settings/index.tsx` | Nút "Đổi MK" trên dòng tài khoản cán bộ (Tab Users) | Centered Modal, `max-w-md w-full rounded-3xl border-2 border-emerald-500 shadow-xl`, `z-50` | `bg-white dark:bg-slate-900 border-2 border-emerald-500`, Backdrop `bg-slate-900/50 backdrop-blur-xs` | Input Mật Khẩu Mới (toggle hiện/ẩn Eye/EyeOff), Nút "Hủy", Nút "Lưu Mật Khẩu" | Modal quản trị cán bộ của Admin Xã |
| **M11** | `AssignVillageModal` (Phân Công Thôn Cho Cán Bộ) | `src/pages/Settings/index.tsx` | Nút "Phân công" trên dòng tài khoản cán bộ (Tab Users) | Centered Modal, `max-w-md w-full rounded-3xl border-2 border-emerald-500 shadow-xl`, `z-50` | `bg-white dark:bg-slate-900 border-2 border-emerald-500`, Backdrop `bg-slate-900/50 backdrop-blur-xs` | CustomSelect "Vai trò" (Admin/User), CustomSelect "Thôn Phụ Trách" (15 thôn Đăk Hà), Nút "Hủy", Nút "Lưu Phân Công" | Modal phân quyền phân địa bàn của Admin Xã |
| **C01** | Xác nhận xóa mềm 1 hồ sơ vào Thùng rác | `src/pages/Dashboard/index.tsx:242` | Nút "Xóa" (`Trash2`) trên cột Thao tác dòng bảng | Global Alert Dialog (`showConfirm`), `max-w-md`, Portal `z-[9999999]` | `rounded-3xl shadow-2xl border`, Icon `AlertTriangle` vàng hổ phách, Nút xác nhận `bg-amber-600` | Tiêu đề: "Xác nhận xóa hồ sơ", Nội dung: "Bạn có chắc chắn muốn chuyển hồ sơ của... vào Thùng rác không?..." | Nút "Hủy" và "Xác Nhận" |
| **C02** | Xác nhận xóa mềm hàng loạt hồ sơ vào Thùng rác | `src/pages/Dashboard/index.tsx:262` | Nút "Xóa Đã Chọn" trên Floating Bottom Action Bar | Global Alert Dialog (`showConfirm`), `max-w-md`, Portal `z-[9999999]` | `rounded-3xl shadow-2xl border`, Icon `AlertTriangle` vàng hổ phách, Nút xác nhận `bg-amber-600` | Tiêu đề: "Xác nhận xóa hàng loạt", Nội dung: "Bạn có chắc chắn muốn chuyển X hồ sơ đã chọn vào Thùng rác không?..." | Nút "Hủy" và "Xác Nhận" |
| **C03** | Xác nhận xóa thôn quản lý | `src/pages/VillagesPage.tsx:155` | Nút "Xóa" (`Trash2`) trên card Thôn của VillagesPage | Global Alert Dialog (`showConfirm`), `max-w-md`, Portal `z-[9999999]` | `rounded-3xl shadow-2xl border`, Icon `AlertTriangle` vàng hổ phách, Nút xác nhận `bg-amber-600` | Tiêu đề: "Xác nhận xóa thôn", Nội dung: "Bạn có chắc muốn xóa \"...\" không? Thao tác này sẽ ảnh hưởng..." | Nút "Hủy" và "Xác Nhận" |
| **C04** | Xác nhận khôi phục CSDL từ tệp sao lưu (Restore) | `src/components/settings/BackupRestoreTab.tsx:80` | Chọn file `.json` sau khi bấm "Chọn Tệp Khôi Phục" | Global Alert Dialog (`showConfirm`), `max-w-md`, Portal `z-[9999999]` | `rounded-3xl shadow-2xl border`, Icon `AlertTriangle` vàng hổ phách, Nút xác nhận `bg-amber-600` | Tiêu đề: "Cảnh báo khôi phục dữ liệu", Nội dung: "Bạn có chắc chắn muốn khôi phục? Toàn bộ dữ liệu hồ sơ..." | Nút "Hủy" và "Xác Nhận" |
| **C05** | Xác nhận khôi phục 1 hồ sơ từ Thùng rác | `src/pages/RecycleBinPage.tsx:89` | Nút "Khôi Phục" trên dòng hồ sơ đã xóa | Global Alert Dialog (`showConfirm`), `max-w-md`, Portal `z-[9999999]` | `rounded-3xl shadow-2xl border`, Icon `AlertTriangle` vàng hổ phách, Nút xác nhận `bg-amber-600` | Tiêu đề: "Khôi phục hồ sơ", Nội dung: "Khôi phục hồ sơ của \"...\" về danh sách quản lý?" | Nút "Hủy" và "Xác Nhận" |
| **C06** | Xác nhận xóa vĩnh viễn 1 hồ sơ khỏi CSDL | `src/pages/RecycleBinPage.tsx:114` | Nút "Xóa" trên dòng hồ sơ trong Thùng rác | Global Alert Dialog (`showConfirm`), `max-w-md`, Portal `z-[9999999]` | `rounded-3xl shadow-2xl border`, Icon `XCircle` đỏ, Nút xác nhận `bg-rose-600` | Tiêu đề: "Xóa vĩnh viễn hồ sơ", Nội dung: "CẢNH BÁO: Bạn sắp xóa vĩnh viễn hồ sơ \"...\". Dữ liệu sẽ biến mất hoàn toàn..." | Nút "Hủy" và "Xác Nhận" |
| **C07** | Xác nhận khôi phục hàng loạt hồ sơ từ Thùng rác | `src/pages/RecycleBinPage.tsx:140` | Nút "Khôi Phục (X)" trên Banner Header Thùng rác | Global Alert Dialog (`showConfirm`), `max-w-md`, Portal `z-[9999999]` | `rounded-3xl shadow-2xl border`, Icon `AlertTriangle` vàng hổ phách, Nút xác nhận `bg-amber-600` | Tiêu đề: "Khôi phục hàng loạt", Nội dung: "Bạn có chắc muốn khôi phục X hồ sơ đã chọn?" | Nút "Hủy" và "Xác Nhận" |
| **C08** | Xác nhận xóa vĩnh viễn hàng loạt hồ sơ khỏi CSDL | `src/pages/RecycleBinPage.tsx:167` | Nút "Xóa Vĩnh Viễn (X)" trên Banner Header Thùng rác | Global Alert Dialog (`showConfirm`), `max-w-md`, Portal `z-[9999999]` | `rounded-3xl shadow-2xl border`, Icon `XCircle` đỏ, Nút xác nhận `bg-rose-600` | Tiêu đề: "Xóa vĩnh viễn hàng loạt", Nội dung: "NGUY HIỂM: Bạn có chắc chắn muốn xóa vĩnh viễn X hồ sơ đã chọn khỏi CSDL?..." | Nút "Hủy" và "Xác Nhận" |
| **C09** | Xác nhận xóa tài khoản cán bộ thôn | `src/pages/Settings/index.tsx:298` | Nút "Xóa" (`Trash2`) trên dòng tài khoản cán bộ | Global Alert Dialog (`showConfirm`), `max-w-md`, Portal `z-[9999999]` | `rounded-3xl shadow-2xl border`, Icon `AlertTriangle` vàng hổ phách, Nút xác nhận `bg-amber-600` | Tiêu đề: "Xác nhận xóa tài khoản", Nội dung: "Bạn có chắc chắn muốn xóa tài khoản cán bộ \"...\" không?..." | Nút "Hủy" và "Xác Nhận" |
| **P01** | `YearSelector` Popover | `src/pages/Dashboard/components/YearSelector.tsx` | Nút "Năm [YYYY]" trên thanh ProfileFilterBar | Absolute Popover, `w-56 p-3 rounded-2xl shadow-xl z-50` | `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl` | Stepper (- / input 4 số / +), Grid 3 cột chọn nhanh các năm (hiện tại - 1 đến + 8), Link "Năm nay (YYYY)", Nút "Áp dụng" | Đối ứng trực tiếp với `YearSelector` của QLHK |
| **P02** | `CustomSelect` Dropdown Popover | `src/components/common/CustomSelect.tsx` | Trigger chọn Thôn, Mốc tuổi, Giới tính, Dân tộc, Trạng thái quà... | Absolute Popover, độ rộng theo trigger, max-h-56, auto flip `z-[120]` | `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl` | Ô tìm kiếm Search input (>8 items), Danh sách options kèm badge/sublabel, Nút xóa Clearable (icon X), Icon check xanh | Khớp hoàn toàn với pattern `CustomSelect` của QLHK |
| **P03** | `MappingSelect` Dropdown Popover | `src/pages/Dashboard/modals/ImportModal.tsx:69` | Trigger chọn cột Excel trong bảng khớp cột | Fixed Coordinates Portal `z-[100000]`, max-h-60, auto flip | `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl` | Search input "Tìm cột...", Nút "-- Bỏ qua / Không có --", Danh sách tên cột từ header Excel | Dropdown riêng biệt tối ưu cho modal import |
| **P04** | `FloatingBatchToolbar` | `src/pages/Dashboard/components/MainTable.tsx:174` | Tự động xuất hiện khi có từ 1 hồ sơ được chọn (`selectedIds.size > 0`) | Fixed Bottom Center, `fixed bottom-6 left-1/2 -translate-x-1/2 z-40` | `rounded-2xl border shadow-2xl backdrop-blur-md px-5 py-3`, `bg-white/95 dark:bg-slate-900/95 border-slate-300 dark:border-slate-700` | Badge số lượng đã chọn font-mono, Nút "Bỏ chọn", Nút "Đã Nhận Quà", Nút "Chưa Nhận Quà", Nút "Xóa Đã Chọn" | Thanh công cụ thao tác hàng loạt nổi chuẩn QLHK |
| **P05** | `AddUserFormBlock` | `src/pages/Settings/index.tsx:657` | Nút "Thêm Cán Bộ" trên header tab Cán Bộ của Settings | Khối mở rộng (Card Form), `rounded-3xl border-2 border-emerald-500 shadow-xl p-6` | `bg-white dark:bg-slate-900 border-2 border-emerald-500` | Input Tên đăng nhập *, Mật khẩu khởi tạo *, CustomSelect Vai trò, CustomSelect Thôn phụ trách, Nút "Hủy", Nút "Tạo Tài Khoản" | Form tạo cán bộ cơ sở |
| **P06** | `AddVillageCard` / `EditVillageCard` | `src/pages/VillagesPage.tsx:389 & 448` | Nút "Thêm Thôn" (Admin) hoặc icon `Edit3` trên card thôn | Card Form inline, `rounded-3xl border-2 border-emerald-500 shadow-lg p-5` | `bg-white dark:bg-slate-900 border-2 border-emerald-500` | Input "Tên Thôn *", Nút "Hủy", Nút "Lưu Thôn Mới" / "Lưu" | Thêm / đổi tên thôn xã Đăk Hà |
| **G01** | Khung Thông Báo Toàn Cục (`showAlert`) | `src/hooks/useModal.tsx:168-281` | Gọi hàm `showAlert(title, message, type)` | Centered Modal Alert Dialog, `max-w-md w-full`, Portal `z-[9999999]` | `rounded-3xl shadow-2xl border`, Icon badge bo góc `rounded-xl` theo type (error: rose, success/info: emerald, warning: amber) | Tiêu đề thông báo, Nội dung thông báo hỗ trợ xuống dòng, Nút "Đóng" (tô màu theo type) | Khung alert thay thế hoàn toàn `window.alert` |

---

## 2. Chi Tiết Từng Modal & Hộp Thoại

### M01: `ProfileModal` (Thêm Mới & Chỉnh Sửa Hồ Sơ Chúc Thọ / Hưu Trí Xã Hội)
- **Tên Component**: `ProfileModal` (export cả alias `ProfileDrawer`).
- **File Path**: `src/pages/Dashboard/modals/ProfileModal.tsx`.
- **Kích Thước & Khung Shell**:
  - Backdrop: `fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs select-none animate-in fade-in duration-150`.
  - Khung Modal: `w-full max-w-3xl h-[88vh] max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-150 animate-in zoom-in-95 duration-150 relative outline-hidden`.
  - Focus Trap: Tích hợp xử lý Tab/Shift-Tab xoay vòng và phím Escape đóng modal.
- **Top Bar (Header Cố Định)**:
  - Lớp nền: `px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950/70`.
  - Icon User: `w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center shrink-0` với `<User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />`.
  - Tiêu đề động: `THÊM MỚI HỒ SƠ CHÚC THỌ` / `THÊM MỚI HỒ SƠ HƯU TRÍ XÃ HỘI` hoặc `CHỈNH SỬA HỒ SƠ CHÚC THỌ` / `CHỈNH SỬA HỒ SƠ HƯU TRÍ XÃ HỘI`.
  - Phụ đề thông tin: `Năm tính toán: <calculationYear>` kèm badge tính mốc tuổi tự động (ví dụ: `Tròn 70 tuổi`, `Trên 100 tuổi (102 tuổi)`).
  - Tab Switcher (khi sửa hồ sơ): Nút "Thông Tin" và nút "Lịch Sử" (icon `History`).
  - Nút đóng: Nút X (`p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800`).
- **Body Cuộn Độc Lập**:
  - Lớp cuộn: `flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar`.
  - Lưới trường thông tin (Tab "Thông Tin"):
    1. Họ và Tên (`#modal-input-name`): Bắt buộc (`*`), placeholder `"Nguyễn Văn A"`.
    2. Năm sinh (hoặc Ngày sinh) (`#modal-input-dob`): Bắt buộc (`*`), placeholder `"YYYY (vd: 1954) hoặc DD/MM/YYYY"`.
    3. Giới tính: `CustomSelect` options `["Nam", "Nữ"]`.
    4. Số CCCD: 12 chữ số (`#modal-input-cccd`), font-mono, maxLength 12, placeholder `"0600..."`.
    5. Dân tộc: `CustomSelect` searchable với 15 dân tộc địa phương (`ETHNIC_GROUPS`: Kinh, Xơ Đăng, Gia Rai, Giẻ Triêng, Ba Na, Cor, Cơ Ho, Dao, Dìu, Ê Đê, Giơ Lâng, Ha Lăng, Hoa, Hrê, Khác).
    6. Thuộc Thôn: Nếu cán bộ thôn -> hiển thị tên thôn cố định kèm badge `"Cố định"`. Nếu admin -> `CustomSelect` danh sách các thôn xã Đăk Hà.
    7. Nơi thường trú (Hộ khẩu) (`#modal-input-residence`): placeholder `"Thôn 1, Xã Đăk Hà..."`.
    8. Nơi ở hiện nay (`#modal-input-current-address`): placeholder `"Thôn 1, Xã Đăk Hà..."`.
    9. Trạng thái nhận quà: `CustomSelect` options `[{ value: "0", label: "Chưa nhận quà" }, { value: "1", label: "Đã nhận quà" }]`.
    10. Ghi chú (`#modal-input-notes`): placeholder `"Ghi chú thêm..."`.
    11. 6 Checkbox Phân loại diện hưởng Hưu Trí Xã Hội (Chỉ xuất hiện khi `activeTab === "htxh"`):
        - Đủ 75 tuổi trở lên (`age75plus`)
        - 70-74 tuổi nghèo/cận nghèo (`age70to74poor`)
        - Đang hưởng Bảo trợ (`bao_tro`)
        - Đang hưởng Hưu trí (`huu_tri`)
        - Hưu tuất / Bảo hiểm (`huu_tuat_bao_hiem`)
        - Người có công (`nguoi_co_cong`)
  - Danh sách Lịch Sử Thay Đổi (Tab "Lịch Sử"):
    - Spinner nạp (`Loader2`) hoặc thông báo rỗng `"Chưa có lịch sử thay đổi nào được ghi nhận cho hồ sơ này."`.
    - Danh sách thẻ sự kiện: Action in hoa (`log.action`), thời gian định dạng vi-VN, ghi chú/mô tả thay đổi (`log.note`).
- **Bottom Bar (Footer Cố Định)**:
  - Lớp nền: `px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-950/70`.
  - Nút "Hủy Bỏ": icon `ArrowLeft`, `h-10 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer`.
  - Nút "Lưu Thay Đổi": form submit, icon `Save` (hoặc `Loader2 animate-spin` khi đang lưu), `h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50`.

---

### M02 đến M06: `ImportModal` (Nhập Dữ Liệu Excel Đa Tầng)
- **Tên Component**: `ImportModal`.
- **File Path**: `src/pages/Dashboard/modals/ImportModal.tsx`.
- **Tổng Quan Kiến Trúc**: Modal này quản lý 5 trạng thái luồng làm việc tuần tự:
  1. **Trạng thái 1: Dropzone Kéo Thả & Tải Biểu Mẫu Chuẩn (M02)**
     - Khung modal: `w-full max-w-6xl max-h-[92vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden`.
     - Vùng kéo thả: `w-full max-w-xl p-10 border-2 border-dashed rounded-3xl text-center flex flex-col items-center justify-center space-y-4 cursor-pointer`. Trạng thái kéo tệp: `border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20`.
     - Icon Upload: `w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400`.
     - Văn bản hướng dẫn: Tiêu đề `"Kéo thả tệp Excel vào đây hoặc bấm để chọn"`, phụ đề định dạng hỗ trợ: `".xlsx, .xls, .csv"`.
     - Nút bấm:
       - `"Chọn Tệp Excel"`: icon `FolderOpen`, `h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-xs`.
       - `"Tải Biểu Mẫu Chuẩn (.xlsx)"`: icon `FileDown`, `h-10 px-4 bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-200 rounded-full text-xs font-bold shadow-2xs`.
  2. **Trạng thái 2: Khớp Cột Dữ Liệu Excel (Column Mapping) (M03)**
     - Kích hoạt khi phân tích tệp có cột không khớp 100% với tên chuẩn.
     - Header bar trong modal: Tiêu đề `"KHỚP CỘT DỮ LIỆU EXCEL"`, badge số thứ tự bảng `"Bảng X/Y"` (nếu nhập nhiều sheet/tệp), tên file kèm loại nhận diện tự động (`Chúc Thọ / Mừng Thọ` hoặc `Hưu trí xã hội (HTXH)` hoặc `Danh sách Cử tri`).
     - Chọn mẫu có sẵn: Dropdown `"Mẫu đã lưu"` dùng `MappingSelect`.
     - Lưới khớp trường dữ liệu (Grid 2 cột):
       - Nhóm trường chung: STT, Họ và tên (*), Năm sinh / Ngày sinh (*), Giới tính: Nam (*), Giới tính: Nữ (*), Số CCCD / CMND, Dân tộc, Cư trú, Nơi ở hiện nay, Ghi chú, Đã nhận quà.
       - Nhóm trường HTXH: Đủ 75 tuổi trở lên, Từ 70-74 tuổi hộ nghèo, Đang hưởng Bảo trợ xã hội, Đang hưởng Hưu trí, Đang hưởng Hưu, Tuất BH, Đang hưởng Người có công.
       - Nhóm trường Chúc thọ: Tròn 60, 65, 70, 75, 80, 85, 90, 95, 100, Trên 100 tuổi.
       - Mỗi ô khớp có badge `"Đã khớp"` (xanh ngọc) hoặc `"Chưa khớp"` (xám), cùng dropdown `MappingSelect` portal.
     - Tùy chọn nâng cao:
       - Checkbox `"Áp dụng thiết lập này cho tất cả bảng/tệp còn lại (X bảng)"` (`#autoApplyRemaining`).
       - Ô nhập lưu mẫu: `"Lưu mẫu khớp cột: "` kèm input `"Nhập tên mẫu (ví dụ: Mẫu huyện A)..."`.
     - Footer: Nút `"Hủy / Quay lại"` (icon `ArrowLeft`) và nút `"Tiếp tục"` (icon `ArrowRight`, `bg-emerald-600 text-white`, disabled nếu chưa khớp đủ trường bắt buộc).
  3. **Trạng thái 3: Bảng Xem Trước Đối Soát 10 Cột (Preview Table) (M04)**
     - Header modal: Tiêu đề `"Preview Bảng Đối Soát 10 Cột – File <Tên file>"`, thông tin tổng cộng X dòng dữ liệu, nút `"Đổi Tệp Khác"` (icon `RefreshCw`).
     - Thanh cảnh báo trạng thái:
       - Badge Hợp lệ: `"Hợp lệ: X hồ sơ"` (icon `CheckCircle2`, `bg-emerald-50 text-emerald-700 border-emerald-200`).
       - Badge Cảnh báo lỗi: `"Phát hiện Y dòng có cảnh báo/lỗi (tô đỏ)"` (icon `AlertTriangle`, `bg-rose-50 text-rose-700 border-rose-200`). Bấm để mở khối danh sách chi tiết lỗi thu gọn.
     - Khung Bảng 10 Cột Chromium (`w-full min-w-[1100px] text-left border-separate border-spacing-0 text-xs whitespace-nowrap`):
       - Cột 1: `1. STT` (Sticky left-0, w-12).
       - Cột 2: `2. Thôn / Diện` (Sticky left-12, w-28, badge bo tròn).
       - Cột 3: `3. Họ và Tên` (Sticky left-40, w-44, in hoa đậm, đổ bóng ngăn cách).
       - Cột 4: `4. Ngày Sinh (DD/MM/YYYY)` (Kiểm tra định dạng, tô nền hồng đậm `bg-rose-100/90 text-rose-950 font-bold` kèm icon `AlertTriangle` khi sai định dạng).
       - Cột 5: `5. Giới Tính` (Badge Nam xanh dương `bg-blue-100 text-blue-800` / Nữ hồng `bg-rose-100 text-rose-800`).
       - Cột 6: `6. Dân Tộc` (Mặc định Kinh).
       - Cột 7: `7. CCCD` (Ẩn 8 số đầu `••••••••1234` font-mono).
       - Cột 8: `8. Địa Chỉ` (Truncate max-w-52).
       - Cột 9: `9. Mốc Tuổi / Diện Hưởng` (Badge xanh lục bo tròn).
       - Cột 10: `10. Ghi Chú` (Truncate max-w-36).
     - Footer Phân Trang & Điều Khiển:
       - Dropdown `"Hiển thị"`: `CustomSelect` chọn 10, 20, 50, 100 bản ghi/trang.
       - Nút chuyển trang: `"Trước"`, nhãn `"X / Y"`, `"Sau"`.
       - Nút hành động: Nút `"Hủy Bỏ"` (`bg-white dark:bg-slate-800 border`) và nút `"Xác Nhận Nhập (X Hợp Lệ)"` (`h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl`).
  4. **Trạng thái 4: Màn Hình Thanh Tiến Trình (Import Progress) (M05)**
     - Hiển thị khi bấm xác nhận nhập (`isImporting === true`).
     - Spinner: Vòng quay lớn `w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin`.
     - Tiêu đề: `"ĐANG XỬ LÝ DỮ LIỆU..."`, phụ đề `"Vui lòng không đóng cửa sổ này"`.
     - Thanh Progress bar: Vỏ ngoài `w-full max-w-md bg-slate-100 dark:bg-slate-800 rounded-full h-3`, thanh tiến trình con `bg-emerald-600 h-3 rounded-full transition-all duration-300` với `width: ${importProgress}%`.
     - Nhãn: `${importProgress}%`.
  5. **Trạng thái 5: Hộp Thoại Báo Cáo Kết Quả Nhập Dữ Liệu (Import Result Dialog) (M06)**
     - Portal `z-[999999]`, Backdrop `bg-slate-900/80 backdrop-blur-md`.
     - Khung Dialog: `w-full max-w-3xl max-h-[80vh] rounded-3xl shadow-2xl border flex flex-col`.
     - Header: Icon `CheckCircle2` (nếu thành công 100%) hoặc `AlertTriangle` (nếu có lỗi/cảnh báo), Tiêu đề `"KẾT QUẢ NHẬP DỮ LIỆU"`, phụ đề `"Tổng: X hồ sơ"`, nút X đóng.
     - Body:
       - Trường hợp thành công toàn bộ: Icon tròn lớn xanh ngọc, tiêu đề `"NHẬP THÀNH CÔNG TOÀN BỘ!"`, thống kê `Thêm mới: X | Cập nhật: Y`.
       - Trường hợp có lỗi/cảnh báo: 3 hộp số liệu (Thêm mới, Cập nhật, Lỗi/Cảnh báo), tiêu đề `"DANH SÁCH CẢNH BÁO LỖI / TRÙNG LẶP DỮ LIỆU:"`, danh sách các thẻ lỗi viền cam `border-l-4 border-l-amber-500`, nút `"Xem tất cả (X lỗi)"` nếu > 100 lỗi, nút `"Lưu log lỗi ra file"` (icon `Save`, tải file text `import_errors_YYYY-MM-DD.txt`).
     - Footer: Nút `"ĐÓNG"` full-width (`h-11 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider`).

---

### M07: `ExportModal` (Cấu Hình & Xuất Báo Cáo Excel)
- **Tên Component**: `ExportModal`.
- **File Path**: `src/pages/Dashboard/modals/ExportModal.tsx`.
- **Kích Thước & Khung Shell**:
  - Portal: `z-[99999]`, Backdrop `fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in`.
  - Khung Modal: `w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border zoom-in-95 duration-150`.
- **Header**:
  - Lớp nền: `px-6 py-5 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800`.
  - Icon: Hộp vuông bo tròn `w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400` với `<Download className="h-5 w-5" strokeWidth={1.5} />`.
  - Tiêu đề: `"XUẤT BÁO CÁO EXCEL"` (font-black uppercase tracking-tight).
  - Nút đóng: Nút X (`p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`).
- **Body Nội Dung**:
  - Hộp thông báo màu xanh dương: Icon `AlertCircle`, nội dung `"Hệ thống sẽ lấy dữ liệu hiện tại trên màn hình để xuất file. Bạn có thể thiết lập thêm giới hạn bên dưới nếu cần:"`.
  - Tùy chọn 1 (khi có chọn hồ sơ): Checkbox `"Chỉ xuất X hồ sơ đang được chọn (Bỏ qua lọc Thôn)"`.
  - Tùy chọn 2 (khi không chọn xuất riêng): Bộ chọn danh sách các thôn (`Chỉ xuất các thôn/bảng (Bỏ trống = Xuất tất cả)`): Mỗi thôn là một nút toggle bấm bật/tắt (khi chọn: `bg-emerald-600 text-white border-emerald-600`, khi bỏ: `bg-white dark:bg-slate-800 border-slate-200 text-slate-600`).
- **Footer**:
  - Thông số tổng kết: `"CHỌN: <finalCount> HỒ SƠ"`.
  - Nút "Hủy": `h-10 px-5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300`.
  - Nút "Xuất File": icon `Download`, `h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5`.

---

### M08: `ServerStatusModal` (Thông Số Kết Nối Máy Chủ Backend)
- **Tên Component**: `ServerStatusModal`.
- **File Path**: `src/components/network/ServerStatusModal.tsx`.
- **Kích Thước & Khung Shell**:
  - Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in select-none`.
  - Khung: `w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900`.
- **Header**:
  - Icon: `<Server className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />`.
  - Tiêu đề: `"Trạng Thái Máy Chủ Backend"`.
  - Nút đóng: Nút X.
- **Body (4 Thẻ Trạng Thái)**:
  1. Thẻ Kết Nối API: Icon `CheckCircle2` (xanh) hoặc `AlertCircle` (đỏ), Tiêu đề `"Kết Nối API"`, Phụ đề `"Hoạt động ổn định"` / `"Mất kết nối máy chủ"`, Badge `"ONLINE"` (emerald) / `"OFFLINE"` (rose).
  2. Thẻ Độ Trễ Phản Hồi: Icon `Activity` xanh dương, Tiêu đề `"Độ Trễ Phản Hồi"`, Phụ đề `"Thời gian gửi & nhận gói tin"`, Giá trị latency font-mono `${latency} ms`.
  3. Thẻ Địa Chỉ Máy Chủ: Icon `Globe` tím, Tiêu đề `"Địa Chỉ Máy Chủ"`, Giá trị URL backend `API_BASE_URL` truncate.
  4. Thẻ Phiên Bản Hệ Thống: Icon `ShieldCheck` vàng hổ phách, Tiêu đề `"Phiên Bản Hệ Thống"`, Phụ đề `"Xã Đăk Hà - Kon Tum"`, Phiên bản `"v2.0.0"` font-mono xanh ngọc.

---

### M09: `PolicyDetailsDialog` (Chi Tiết Các Diện Chính Sách HTXH)
- **Tên Component**: Policy Popover/Dialog lồng trong `ProfileRow.tsx`.
- **File Path**: `src/pages/Dashboard/components/ProfileRow.tsx:347-422`.
- **Kích Thước & Khung Shell**:
  - Portal: Gắn trực tiếp `document.body`, `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in`.
  - Khung Dialog: `rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border`.
- **Header**:
  - Icon: Hộp vuông xanh dương với `<Activity className="w-4 h-4" strokeWidth={1.5} />`.
  - Tiêu đề: `"CHI TIẾT CHÍNH SÁCH"` (font-black uppercase tracking-tight).
  - Phụ đề: Họ và tên đối tượng (`profile.name`).
  - Nút đóng: Nút X.
- **Body**:
  - Danh sách các thẻ chính sách mà đối tượng đang hưởng: Icon `CheckCircle2` xanh ngọc kèm tên chính sách (`Bảo trợ xã hội`, `Hưu trí`, `Hưu, Tuất Bảo hiểm`, `Người có công`).
  - Lớp CSS thẻ: `px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2`.

---

### M10: `ResetPasswordModal` (Đặt Lại Mật Khẩu Cán Bộ Thôn)
- **Tên Component**: Modal đặt lại mật khẩu trong `Settings/index.tsx`.
- **File Path**: `src/pages/Settings/index.tsx:762-835`.
- **Kích Thước & Khung Shell**:
  - Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in`.
  - Khung Modal: `bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-emerald-500 shadow-xl space-y-4 max-w-md w-full animate-in fade-in`.
- **Header**:
  - Tiêu đề: `"Đặt Lại Mật Khẩu Cho: <username>"` (tên cán bộ tô màu xanh ngọc).
  - Nút đóng: Nút X.
- **Body Form**:
  - Label: `"Mật Khẩu Mới (ít nhất 6 ký tự)"`.
  - Input: `#reset-user-password-input`, type text/password, placeholder `"Nhập mật khẩu mới..."`, nút toggle ẩn/hiện mật khẩu (icon `Eye`/`EyeOff`).
- **Footer**:
  - Nút "Hủy": `px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold`.
  - Nút "Lưu Mật Khẩu": submit button, `px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs`.

---

### M11: `AssignVillageModal` (Phân Công Thôn Cho Cán Bộ)
- **Tên Component**: Modal phân công thôn trong `Settings/index.tsx`.
- **File Path**: `src/pages/Settings/index.tsx:838-900`.
- **Kích Thước & Khung Shell**:
  - Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in`.
  - Khung Modal: `bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-emerald-500 shadow-xl space-y-4 max-w-md w-full animate-in fade-in`.
- **Header**:
  - Tiêu đề: `"Phân Công Thôn Cho: <username>"`.
  - Nút đóng: Nút X.
- **Body Form**:
  - CustomSelect "Vai trò": "Cán bộ Thôn (User)" / "Quản trị viên Xã (Admin)".
  - CustomSelect "Thôn Phụ Trách": Danh sách 15 thôn xã Đăk Hà (chỉ hiện khi vai trò là Cán bộ Thôn).
- **Footer**:
  - Nút "Hủy": `px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold`.
  - Nút "Lưu Phân Công": submit button, `px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs`.

---

### C01 - C09: Hệ Thống Hộp Thoại Xác Nhận Toàn Cục (`useModal` -> `showConfirm`)
- **Tên Thành Phần**: `ModalProvider` render alertdialog portal `z-[9999999]`.
- **File Nguồn**: `src/hooks/useModal.tsx:168-281`.
- **Khung Dialog**: `rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border zoom-in-95 duration-150 outline-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`.
- **Icon Header**: Ô vuông bo góc `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border`:
  - Type `warning`: `bg-amber-100 text-amber-600 border-amber-200` với `<AlertTriangle className="w-5 h-5" strokeWidth={1.5} />`.
  - Type `error`: `bg-rose-100 text-rose-600 border-rose-200` với `<XCircle className="w-5 h-5" strokeWidth={1.5} />`.
  - Type `success` / `info`: `bg-emerald-100 text-emerald-600 border-emerald-200` với `<CheckCircle className="w-5 h-5" strokeWidth={1.5} />` hoặc `<Info className="w-5 h-5" strokeWidth={1.5} />`.
- **Hành Động Buttons**:
  - Nút "Hủy": `h-10 px-5 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300`.
  - Nút "Xác Nhận": `h-10 px-5 rounded-2xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95` (màu theo type: warning `bg-amber-600`, error `bg-rose-600`, success `bg-emerald-600`).
- **Danh Sách 9 Tình Huống Xác Nhận Cụ Thể Trong Ứng Dụng**:
  1. **C01 (`Dashboard/index.tsx:242`)**: Xóa mềm 1 hồ sơ vào Thùng rác.
     - Title: `"Xác nhận xóa hồ sơ"`.
     - Message: `"Bạn có chắc chắn muốn chuyển hồ sơ của \"${profile.name}\" vào Thùng rác không? Dữ liệu có thể khôi phục lại bất kỳ lúc nào từ Thùng rác."`.
     - Type: `"warning"`.
  2. **C02 (`Dashboard/index.tsx:262`)**: Xóa mềm hàng loạt hồ sơ vào Thùng rác.
     - Title: `"Xác nhận xóa hàng loạt"`.
     - Message: `"Bạn có chắc chắn muốn chuyển ${count} hồ sơ đã chọn vào Thùng rác không? Dữ liệu có thể khôi phục lại bất kỳ lúc nào từ Thùng rác."`.
     - Type: `"warning"`.
  3. **C03 (`VillagesPage.tsx:155`)**: Xóa thôn.
     - Title: `"Xác nhận xóa thôn"`.
     - Message: `"Bạn có chắc muốn xóa \"${name}\" không? Thao tác này sẽ ảnh hưởng đến các hồ sơ chính sách thuộc thôn này."`.
     - Type: `"warning"`.
  4. **C04 (`BackupRestoreTab.tsx:80`)**: Phục hồi CSDL từ bản sao lưu JSON.
     - Title: `"Cảnh báo khôi phục dữ liệu"`.
     - Message: `"Bạn có chắc chắn muốn khôi phục? Toàn bộ dữ liệu hồ sơ và cấu hình hiện tại sẽ được cập nhật từ tệp sao lưu."`.
     - Type: `"warning"`.
  5. **C05 (`RecycleBinPage.tsx:89`)**: Khôi phục 1 hồ sơ từ Thùng rác.
     - Title: `"Khôi phục hồ sơ"`.
     - Message: `"Khôi phục hồ sơ của \"${profile.name}\" về danh sách quản lý?"`.
     - Type: `"warning"`.
  6. **C06 (`RecycleBinPage.tsx:114`)**: Xóa vĩnh viễn 1 hồ sơ khỏi CSDL (Hard Delete).
     - Title: `"Xóa vĩnh viễn hồ sơ"`.
     - Message: `"CẢNH BÁO: Bạn sắp xóa vĩnh viễn hồ sơ \"${profile.name}\". Dữ liệu sẽ biến mất hoàn toàn khỏi CSDL và không thể hoàn tác!"`.
     - Type: `"error"`.
  7. **C07 (`RecycleBinPage.tsx:140`)**: Khôi phục hàng loạt hồ sơ từ Thùng rác.
     - Title: `"Khôi phục hàng loạt"`.
     - Message: `"Bạn có chắc muốn khôi phục ${selectedIds.length} hồ sơ đã chọn?"`.
     - Type: `"warning"`.
  8. **C08 (`RecycleBinPage.tsx:167`)**: Xóa vĩnh viễn hàng loạt hồ sơ khỏi CSDL (Hard Delete Batch).
     - Title: `"Xóa vĩnh viễn hàng loạt"`.
     - Message: `"NGUY HIỂM: Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} hồ sơ đã chọn khỏi CSDL? Thao tác này KHÔNG THỂ hoàn tác!"`.
     - Type: `"error"`.
  9. **C09 (`Settings/index.tsx:298`)**: Xóa tài khoản cán bộ thôn.
     - Title: `"Xác nhận xóa tài khoản"`.
     - Message: `"Bạn có chắc chắn muốn xóa tài khoản cán bộ \"${user.username}\" không? Cán bộ này sẽ không thể đăng nhập vào hệ thống nữa."`.
     - Type: `"warning"`.

---

### P01: `YearSelector` Popover
- **File Path**: `src/pages/Dashboard/components/YearSelector.tsx`.
- **Kích Thước & Vị Trí**: Popover gắn tuyệt đối `absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-56 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-100`.
- **Cấu Trúc Điều Khiển**:
  - Header nhỏ: `"NĂM TÍNH TOÁN"`.
  - Stepper 3 nút:
    - Nút trừ (-): `Minus className="w-3.5 h-3.5"`.
    - Ô nhập năm: `w-20 px-2 py-1 text-center font-mono font-bold text-sm bg-white dark:bg-slate-800 border rounded-lg`.
    - Nút cộng (+): `Plus className="w-3.5 h-3.5"`.
  - Lưới chọn nhanh (`Chọn nhanh`): Grid 3 cột các năm (năm hiện tại - 1 đến năm hiện tại + 8). Năm được chọn có nền `bg-emerald-50 text-emerald-600` và icon `Check`.
  - Hàng hành động dưới: Link `"Năm nay (2026)"` và nút `"Áp dụng"` (`px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold`).

---

### P02: `CustomSelect` Popover Dropdown
- **File Path**: `src/components/common/CustomSelect.tsx`.
- **Kích Thước & Vị Trí**: Gắn dưới trigger `absolute left-0 right-0 z-[120]`, tự động lật lên phía trên `bottom-full mb-1.5` nếu cách đáy màn hình < 240px.
- **Cấu Trúc Điều Khiển**:
  - Ô tìm kiếm tích hợp: Chỉ hiện khi số lượng tùy chọn > 8 hoặc `searchable={true}`. Icon `Search`, nút xóa tìm kiếm `X`.
  - Danh sách cuộn: `max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar`.
  - Option items: Tên lựa chọn, badge phụ, subLabel giải thích, icon `Check` xanh ngọc khi được chọn.
  - Điều hướng phím mũi tên: ArrowDown / ArrowUp di chuyển tiêu điểm, Enter để chọn, Escape để đóng.
  - Nút Clearable: Cho phép xóa trắng lựa chọn trực tiếp từ nút trigger (icon `X`).

---

### P04: `FloatingBatchToolbar` (Thanh Thao Tác Hàng Loạt Nổi Đáy Bàn Phím)
- **File Path**: `src/pages/Dashboard/components/MainTable.tsx:174-230`.
- **Kích Thước & Vị Trí**: `fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-2xl border shadow-2xl transition-all duration-200 flex items-center gap-3.5 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-slate-300 dark:border-slate-700`.
- **Cấu Trúc Điều Khiển**:
  - Badge đếm số lượng: Nền xanh nhạt `bg-emerald-50 text-emerald-600 font-extrabold font-mono px-2.5 py-0.5 rounded-xl border border-emerald-200`, nhãn `"đã chọn"`.
  - Nút `"Bỏ chọn"`: Link gạch chân màu xám.
  - Phân cách dọc: `w-px h-4 bg-slate-300 dark:bg-slate-700`.
  - Nút `"Đã Nhận Quà"`: icon `CheckCircle2`, `bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold`.
  - Nút `"Chưa Nhận Quà"`: icon `Circle`, `bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold`.
  - Nút `"Xóa Đã Chọn"`: icon `Trash2`, `bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold`. Bấm nút này sẽ mở Hộp thoại xác nhận C02.

---

## 3. Điểm Đặc Biệt & Kiến Nghị Kỹ Thuật (Notes & Proposals)

1. **Sự tương đồng cấu trúc giữa `ProfileModal` (QLCS) và `HouseholdDrawer` (QLHK)**:
   - Cả hai đều có kích thước chuẩn `w-full max-w-3xl h-[88vh] max-h-[88vh]` với lớp nền `rounded-3xl shadow-2xl`, Backdrop `bg-slate-950/60 backdrop-blur-xs`, Top Bar cố định và Bottom Bar cố định.
   - Khi tiến hành Layer 4C (Modals), `ProfileModal` chỉ cần đồng bộ Design Tokens (radii, shadow, border colors, button styling, scrollbars) từ QLHK mà không cần thay đổi cấu trúc lưới các input nghiệp vụ.
2. **Hệ thống cảnh báo `useModal` (`showAlert` / `showConfirm`)**:
   - QLCS sử dụng cùng mẫu `useModal.tsx` như QLHK với các loại cảnh báo `warning`, `error`, `success`, `info`. Cần bảo đảm Design Tokens của hộp thoại alertdialog này đồng bộ 100% với token chuẩn trong Layer 1 & Layer 3.
3. **Modal Nhập Dữ Liệu Excel Đa Tầng (`ImportModal.tsx`)**:
   - `ImportModal` của QLCS có tính năng khớp cột (`mappingData`) rất mạnh mẽ phục vụ chuyển đổi các mẫu biểu thực tế của địa phương. Tất cả nhãn, trường dữ liệu, thông điệp hướng dẫn đều được bảo toàn 100% theo Nguyên Tắc Bất Biến.
4. **Không phát hiện điểm mơ hồ (0 Unclear Issues)**:
   - Toàn bộ 11 Modals/Drawers/Dialogs, 9 Hộp thoại xác nhận (`showConfirm`) và 6 Popovers/Floating Toolbars đều có mã nguồn rõ ràng, tường minh về trạng thái đóng/mở và hành vi tương tác.
