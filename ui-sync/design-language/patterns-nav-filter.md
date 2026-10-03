# PATTERNS ĐIỀU HƯỚNG & BỘ LỌC CHUẨN (REFERENCE: QLHK)

> **Chiến dịch**: Đồng Bộ Giao Diện UI-Sync (QLHK -> QLCS)  
> **Tài liệu nguồn**: `QLHK-Client/src/components/households/HouseholdFilterBar.tsx`, `YearSelector.tsx`, `CustomSelect.tsx`, `TablePagination.tsx`  
> **Nguyên tắc**: SỐ LIỆU ĐO THẬT (Computed Styles: px, rem, hex, rgb, oklch), KHÔNG ĐOÁN MÒ CLASS.

---

## 1. KHUNG THANH CÔNG CỤ LỌC (FILTER TOOLBAR CONTAINER)

### 1.1 Thông Số Kỹ Thuật Đo Đạc Thực Tế
- **Cấu trúc**: Hộp đơn dòng bo góc mềm mại, đặt ngay phía trên bảng dữ liệu.
- **Padding**: `p-2.5 sm:p-3` (10px - 12px)
- **Bo góc**: `rounded-2xl` (16px)
- **Đường viền**: `border border-slate-200/80` (Light) / `dark:border-slate-800` (Dark)
- **Màu nền**: `bg-white` (Light) / `dark:bg-slate-900` (Dark)
- **Bóng đổ**: `shadow-xs` (`rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`)
- **Bố cục**: `flex flex-wrap items-center gap-2` (Khoảng cách giữa các bộ lọc là `8px`).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [🔍 Tìm theo...]  [📅 Năm 2026 ∨]  [Lọc Độ Tuổi ∨]  [Giới Tính ∨]  [Dân Tộc ∨]  [🔄]  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Ô NHẬP TÌM KIẾM THÔNG MINH (SEARCH INPUT PATTERN)

### 2.1 Cấu Trúc DOM & Thông Số Đo Thật
- **Phần tử bao ngoài**: `<div className="relative flex-1 min-w-[220px] max-w-md">`
- **Chiều cao input**: `h-10` = `40px` (hoặc `h-9` = `36px` trên màn hình nhỏ)
- **Padding**: `pl-9 pr-8 py-2` (Left: `36px` cho icon search; Right: `32px` cho nút clear search)
- **Bo góc**: `rounded-xl` (`12px`)
- **Màu nền**: `bg-slate-50` (Light) / `dark:bg-slate-800/60` (Dark)
- **Đường viền**: `border border-slate-200` (Light) / `dark:border-slate-700` (Dark)
- **Màu chữ**: `text-sm font-medium text-slate-900` / `dark:text-white`
- **Màu Placeholder**: `placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm`
- **Icon Tìm kiếm (Left)**: `<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />`
- **Trạng thái Focus**:
  ```css
  focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900
  ```
- **Nút xóa nhanh từ khóa (Right)**: Khi có từ khóa tìm kiếm (`searchTerm.trim() !== ''`):
  Icon `<X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />` đặt trong nút tròn `p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700`.

---

## 3. BỘ CHỌN NĂM DỰ TOÁN (YEARSELECTOR PATTERN)

### 3.1 Nút Trigger Ngoài Toolbar
- **Cấu trúc**: `<button className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 flex items-center gap-2 text-xs font-bold shadow-2xs">`
- **Icon**: `<Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />`
- **Nhãn hiển thị**: `"Năm " + globalCalculationYear` (font-bold)
- **Mũi tên**: `<ChevronDown className="w-3.5 h-3.5 text-slate-400" />`

### 3.2 Khung Popover Chọn Năm (Absolute Popover)
- **Vị trí**: `absolute top-full mt-1.5 left-0 z-50`
- **Kích thước**: `w-64 p-3.5`
- **Bo góc**: `rounded-2xl` (`16px`)
- **Màu nền & Viền**: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl`
- **Animation**: `animate-in fade-in zoom-in-95 duration-150`
- **Bộ Stepper Tăng Giảm Năm (Top)**:
  - Hàng flex: Nút `-` (icon `Minus`), Input số năm (`type="text" maxLength={4}` font-mono text-center font-black text-base w-20), Nút `+` (icon `Plus`).
  - Cho phép người dùng gõ trực tiếp bất kỳ năm nào (ví dụ: `2027`, `2030` để lập dự toán trước).
- **Lưới Chọn Nhanh (Quick Pick Grid - Middle)**:
  - Lưới `grid grid-cols-3 gap-1.5 my-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800`.
  - Hiển thị các năm: `[currentYear - 1]` đến `[currentYear + 7]`.
  - Năm đang chọn: `bg-emerald-600 text-white font-black shadow-xs rounded-xl`.
  - Năm khác: `bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl`.
- **Thanh Tác Vụ (Bottom)**:
  - Nút link: `"Năm nay (" + currentYear + ")"` bên trái.
  - Nút `"Áp dụng"` bên phải (`bg-emerald-600 text-white rounded-xl px-3 py-1.5 text-xs font-bold`).

---

## 4. DROPDOWN TÙY BIẾN NỔI (CUSTOMSELECT PATTERN)

Được thiết kế để giải quyết triệt để vấn đề dropdown bị cắt (overflow clip) khi nằm trong modal hoặc bảng biểu.

### 4.1 Nút Kích Hoạt (Select Trigger)
- **Chiều cao**: `h-10` (`40px`)
- **Bo góc**: `rounded-xl` (`12px`)
- **Padding**: `px-3 py-2`
- **Trạng thái Bình thường (Chưa chọn)**:
  `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 text-xs font-medium`
- **Trạng thái Đang Chọn (Active Filter Highlight)**:
  `border-emerald-500/80 bg-emerald-50/50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 font-bold shadow-2xs`
  *Khi có giá trị lọc, trigger đổi màu xanh ngọc rõ rệt giúp nhận biết nhanh.*
- **Trạng thái Mở**: `ring-2 ring-emerald-500/20 border-emerald-500` kèm mũi tên `<ChevronDown />` xoay 180 độ.
- **Nút Xóa Lựa Chọn (Clearable X)**: Icon `X` xuất hiện khi đã chọn giá trị, cho phép reset 1-click mà không cần mở menu.

### 4.2 Menu Danh Sách Lựa Chọn (React Portal Dropdown)
- **Cơ chế**: Render ra ngoài DOM qua `createPortal(..., document.body)` với tọa độ tính toán theo vị trí trigger (`getBoundingClientRect`).
- **Z-Index**: `z-[100000]` (Luôn nổi trên mọi Modal và Header).
- **Kích thước**: Chiều rộng khớp theo trigger (hoặc tối thiểu `180px`), chiều cao tối đa `max-h-60 overflow-y-auto`.
- **Bo góc & Nền**: `rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5`.
- **Ô Tìm Kiếm Trong Dropdown**: Tự động kích hoạt khi số lượng lựa chọn `> 8 options` (VD: danh sách thôn, danh sách dân tộc).
  - Input: `h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 mb-1`.
- **Từng Dòng Option**:
  - `p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center justify-between`
  - Đang chọn: `bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold` + Icon `Check` màu xanh ngọc.
  - Hover / Keyboard Highlight: `bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white`.

---

## 5. NÚT XÓA TOÀN BỘ LỌC (CLEAR ALL FILTERS BUTTON)

- **Điều kiện xuất hiện**: Tự động xuất hiện khi có **ít nhất 1 bộ lọc đang được kích hoạt** (Tìm kiếm khác rỗng, hoặc chọn độ tuổi/thôn/dân tộc).
- **Cấu trúc**: `<button className="h-10 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer animate-in fade-in">`
- **Icon**: `<RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />`
- **Nhãn hiển thị**: `"Xóa lọc"`

---

## 6. THANH PHÂN TRANG BẢNG CHUẨN (TABLEPAGINATION PATTERN)

### 6.1 Cấu Trúc Bố Cục
Nằm ở chân bảng dữ liệu, ngăn cách bằng đường viền trên `border-t border-slate-200/80 dark:border-slate-800`:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Hiển thị [20 ∨]  Hiển thị 1 - 20 trong tổng số 521 bản ghi       [< Trước]  [1/27]  [Sau >]│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Chi Tiết Các Khối Thành Phần
1. **Khối Bên Trái (Selector số dòng / trang)**:
   - Nhãn: `"Hiển thị"` (text-slate-500 text-xs)
   - Bộ chọn limit: Dropdown nhỏ `h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs`.
   - Các mức tùy chọn: `10`, `20`, `50`, `100` dòng/trang.
2. **Khối Ở Giữa (Chỉ số bản ghi)**:
   - Dòng văn bản: `"Hiển thị " + startIdx + " - " + endIdx + " trong tổng số " + total + " bản ghi"`
   - Typography: `text-xs text-slate-600 dark:text-slate-300 font-medium`.
3. **Khối Bên Phải (Điều hướng trang)**:
   - Nút `[Trước]`: icon `ChevronLeft`, `h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed`.
   - Chỉ số trang: Badge `px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200`.
   - Nút `[Sau]`: icon `ChevronRight`, `h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed`.
