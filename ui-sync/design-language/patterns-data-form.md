# PATTERNS HIỂN THỊ DỮ LIỆU & BIỂU MẪU CHUẨN (REFERENCE: QLHK)

> **Chiến dịch**: Đồng Bộ Giao Diện UI-Sync (QLHK -> QLCS)  
> **Tài liệu nguồn**: `QLHK-Client/src/components/households/HouseholdTable.tsx`, `HouseholdModal.tsx`, `ImportPreviewModal.tsx`, `ExportSettingsModal.tsx`  
> **Nguyên tắc**: SỐ LIỆU ĐO THẬT (Computed Styles: px, rem, hex, rgb, oklch), KHÔNG ĐOÁN MÒ CLASS.

---

## 1. KIẾN TRÚC BẢNG DỮ LIỆU CHÍNH (DATA TABLE ARCHITECTURE)

Bảng dữ liệu của QLHK được thiết kế đạt chuẩn phần mềm doanh nghiệp: cuộn mượt mà với hàng ngàn bản ghi, cột cố định không giật layout, phân cấp thị giác rõ ràng.

### 1.1 Khung Bao Ngoài Của Bảng (Table Outer Container)
- **Bo góc**: `rounded-3xl` (`24px`)
- **Đường viền**: `border border-slate-200/90` (Light) / `dark:border-slate-800` (Dark)
- **Màu nền**: `bg-white` (Light) / `dark:bg-slate-900` (Dark)
- **Bóng đổ**: `shadow-sm`
- **Quy tắc tràn**: `overflow-hidden` (Đảm bảo góc 24px bo tròn không bị bảng con đâm thủng).

### 1.2 Thanh Banner Tiêu Đề Bảng (Table Top Info Banner)
- **Padding**: `px-4 py-3`
- **Màu nền**: `bg-slate-50/70` (Light) / `dark:bg-slate-950/70` (Dark)
- **Đường viền dưới**: `border-b border-slate-100 dark:border-slate-800`
- **Bên trái**: Icon `<Users className="w-4 h-4 text-emerald-600" />` + Tiêu đề danh sách in đậm (`text-xs font-bold text-slate-700 dark:text-slate-300`).
- **Bên phải**: Mẹo hướng dẫn người dùng: Chấm tròn xanh lá `w-1.5 h-1.5 rounded-full bg-emerald-500` + `"Mẹo: Bấm vào dòng hoặc mũi tên để mở xem danh sách chi tiết"`.

### 1.3 Dòng Tiêu Đề Cột Cố Định (Sticky Table Header - thead)
- **Vị trí**: `sticky top-0 z-20` (Luôn ghim trên cùng khi người dùng cuộn xem dữ liệu).
- **Màu nền**: `bg-slate-100/95` (Light) / `dark:bg-slate-950/95` (Dark) kết hợp `backdrop-blur-xs`.
- **Chiều cao dòng**: `h-10` (`40px`).
- **Typography cột**: `font-black uppercase text-[11px] tracking-wider text-slate-500 dark:text-slate-400`.
- **Đường viền dưới**: `border-b border-slate-200/90 dark:border-slate-800`.
- **Đặc tính dòng chữ**: `whitespace-nowrap select-none`.

### 1.4 Kỹ Thuật Ghim Cột Dính (Sticky Columns)
1. **Cột 1: Checkbox Chọn Dòng (Sticky Left 0px)**:
   - Chiều rộng: Cố định `w-12` (`48px`).
   - Căn chỉnh: `text-center sticky left-0 z-10`.
   - Nền ô: Đồng bộ màu nền thead hoặc tbody tương ứng.
2. **Cột Thao Tác (Sticky Right 0px)**:
   - Chiều rộng: `w-20` (`80px`) hoặc `w-24`.
   - Căn chỉnh: `text-center sticky right-0 z-10`.
   - Hiệu ứng bóng đổ ngăn cách: Cột sticky có bóng mờ tinh tế phân tách với các cột đang cuộn bên dưới.

### 1.5 Từng Hàng Dữ Liệu (Table Row - tbody tr)
- **Chiều cao hàng**: `h-12` đến `h-14` (`48px` - `56px`), giãn dòng thoải mái không chèn ép.
- **Đường viền ngăn hàng**: `border-b border-slate-100 dark:border-slate-800/80`.
- **Trạng thái Bình thường**:
  - Họ và Tên: `font-bold text-slate-900 dark:text-white uppercase text-xs tracking-tight`.
  - Cột STT: `font-mono text-xs text-slate-500 text-center`.
  - Cột Dân Tộc / Trạng Thái: Badge viên thuốc bo tròn `rounded-md` hoặc `rounded-full`.
- **Trạng thái Rê Chuột (Row Hover)**:
  `hover:bg-emerald-50/40 dark:hover:bg-slate-800/60`
  *Bắt buộc đồng bộ màu hover sang cả các ô Sticky (Checkbox và Thao tác) thông qua class `group-hover:bg-...` để không bị đứt đoạn màu.*
- **Trạng thái Đang Chọn (Row Selected)**:
  `bg-emerald-50/60 dark:bg-emerald-950/40`
  Checkbox có màu xanh ngọc chủ đạo `accent-emerald-600`.
- **Trạng thái Hàng Cảnh Báo Lỗi (Row Error)**:
  `bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/60`
  Hiển thị các tag lỗi inline: `[Ngày sinh]`, `[CCCD]` màu đỏ rose.

### 1.6 Mở Rộng Bảng Con Trong Dòng (Inline Sub-Table Expansion)
- Khi bấm mũi tên mở rộng: dòng kế tiếp render sub-table nằm thụt lề vào trong.
- Header sub-table có chấm tròn xanh lá `• DANH SÁCH NHÂN KHẨU (N NGƯỜI)`.
- Các cột bảng con hiển thị đầy đủ chi tiết với nền `bg-slate-50/80 dark:bg-slate-950/80 rounded-2xl p-4`.

---

## 2. KHỐI HEADER ISLAND & THẺ THỐNG KÊ KPI

### 2.1 Header Island (Đảo Thông Tin Đầu Trang)
- **Khung bao**: `p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4`.
- **Khối Bên Trái (Thông Tin Tiêu Đề)**:
  - Hàng 1: Badge địa bàn `THÔN 1` (`bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 rounded-full px-3 py-1 text-xs`) + Icon `<Users className="w-5 h-5 text-emerald-600" />` + Tiêu đề chính `text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight`.
  - Hàng 2: Dòng phụ đề mô tả nghiệp vụ `text-xs text-slate-500 dark:text-slate-400 font-medium mt-1`.
- **Khối Bên Phải (Hàng Nút Thao Tác Chuẩn QLHK)**:
  - Thứ tự từ trái qua phải:
    1. Nút `[← Đổi thôn]` (Admin): `h-10 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-full text-xs font-bold`.
    2. Nút `[📄 Nhập Excel]`: Nền trắng/xám `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-full h-10 px-4 text-xs font-bold shadow-xs flex items-center gap-2`, icon `FileSpreadsheet` xanh lục `text-emerald-500`. *(TUYỆT ĐỐI KHÔNG DÙNG NỀN CAM)*.
    3. Nút `[📥 Xuất Excel]`: Nền trắng/xám `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-full h-10 px-4 text-xs font-bold shadow-xs flex items-center gap-2`, icon `Download` xanh dương `text-blue-500`.
    4. Nút `[+ Thêm Hồ Sơ]`: Nút chính nổi bật `bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-full h-10 px-5 text-xs shadow-xs flex items-center gap-1.5 transition-all`.

### 2.2 Thẻ Thống Kê KPI (KPI Stat Cards)
- **Bố cục lưới**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.
- **Khung thẻ**: `p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex items-center justify-between min-h-[110px]`.
- **Khối số liệu (Left)**:
  - Nhãn KPI: `text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1`.
  - Con số chính: `text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-sans`.
  - Chỉ số phụ: Tỷ lệ % hoặc phân bổ nam/nữ (`text-xs font-semibold text-emerald-600 dark:text-emerald-400`).
- **Khối Icon (Right)**:
  - Hộp tròn: `w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/40`.

---

## 3. BIỂU MẪU NHẬP LIỆU (FORM INPUTS & VALIDATION PATTERNS)

### 3.1 Quy Chuẩn Nhãn (Form Labels)
- Typography: `block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 select-none`.
- Đánh dấu bắt buộc: Dấu `*` màu đỏ `text-rose-500 font-bold ml-1`.

### 3.2 Quy Chuẩn Ô Nhập Liệu (Input Fields)
- **Chiều cao**: `h-11` (`44px`) hoặc `h-12` (`48px`).
- **Padding**: `px-3.5 py-2.5`.
- **Bo góc**: `rounded-xl` (`12px`).
- **Màu nền**: `bg-white dark:bg-slate-950`.
- **Đường viền**: `border border-slate-300 dark:border-slate-700`.
- **Màu chữ**: `text-sm font-medium text-slate-900 dark:text-slate-100`.
- **Placeholder**: `placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm`.
- **Trạng thái Focus**:
  ```css
  focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors
  ```
- **Trạng thái Bị Lỗi (Invalid Input)**:
  `border-rose-500 dark:border-rose-500 focus:ring-rose-500/20 focus:border-rose-500`

### 3.3 Thông Báo Lỗi Xác Thực (Validation Error Messages)
- Đặt ngay bên dưới trường nhập:
  `<p className="mt-1 text-xs text-rose-500 font-semibold flex items-center gap-1 animate-in fade-in">{error}</p>`

---

## 4. HỘP THOẠI MODAL (MODAL DIALOG ARCHITECTURE)

Áp dụng chuẩn mực cho: `ProfileModal`, `ImportModal`, `ExportModal`, `ServerStatusModal`.

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Icon Box] TIÊU ĐỀ MODAL IN HOA                        [✕ Đóng]        │
│            Dòng phụ đề giải thích thông tin modal                      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   (Vùng Body Cuộn Độc Lập - flex-1 overflow-y-auto p-6 space-y-6)      │
│   Các trường Form / Bảng Preview Đối Soát 10 Cột / Cấu Hình Xuất...    │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                                         [Nút Hủy Bỏ]  [Nút Xác Nhận]   │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Lớp Nền Phủ (Backdrop Overlay)
- `fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in duration-150`

### 4.2 Khung Hộp Thoại (Modal Shell)
- **Bo góc**: `rounded-3xl` (`24px`).
- **Đường viền**: `border border-slate-200 dark:border-slate-800`.
- **Màu nền**: `bg-white dark:bg-slate-900`.
- **Bóng đổ**: `shadow-2xl`.
- **Kích thước độ rộng**:
  - Modal chuẩn (`ProfileModal`): `max-w-3xl h-[88vh]`.
  - Modal lớn (`ImportModal`): `max-w-6xl max-h-[92vh]`.
  - Modal vừa (`ExportModal`): `max-w-lg`.
  - Modal chẩn đoán / nhỏ (`ServerStatusModal`): `max-w-sm`.
- **Animation**: `animate-in zoom-in-95 duration-150`.
- **Hành vi tương tác**: Focus Trap xoay vòng phím `Tab`, bấm phím `Escape` đóng modal an toàn.

### 4.3 Phần Đầu Modal (Modal Header Cố Định)
- `px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950/70`.
- Hộp biểu tượng: `w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center`.
- Tiêu đề: `text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight`.
- Nút đóng X: `p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`.

### 4.4 Phần Đáy Modal (Modal Footer Cố Định)
- `px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-950/70`.
- Nút `"Hủy Bỏ"`: `h-10 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all active:scale-95`.
- Nút `"Lưu Thay Đổi"` / `"Xác Nhận"`: `h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5 disabled:opacity-50`.

---

## 5. HỘP THOẠI XÁC NHẬN RỦI RO (CONFIRM DIALOGS PATTERN)

Áp dụng cho 9 hộp thoại C01 - C09:
- Khung: `max-w-md w-full rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[9999999]`.
- Icon cảnh báo:
  - Cảnh báo chuyển thùng rác / khôi phục: Hộp icon vàng hổ phách `w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400` + Icon `AlertTriangle`. Nút bấm xác nhận: `bg-amber-600 hover:bg-amber-700 text-white rounded-2xl`.
  - Nguy hiểm xóa vĩnh viễn: Hộp icon đỏ `w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400` + Icon `XCircle`. Nút bấm xác nhận: `bg-rose-600 hover:bg-rose-700 text-white rounded-2xl`.
