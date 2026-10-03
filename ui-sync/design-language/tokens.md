# HỆ THỐNG DESIGN TOKENS CHUẨN (REFERENCE: QLHK)

> **Chiến dịch**: Đồng Bộ Giao Diện UI-Sync (QLHK -> QLCS)  
> **Tài liệu nguồn**: `QLHK-Client/src/index.css`, `computed_dump.json`, các ảnh chụp màn hình trong `ui-sync/shots/ref/`  
> **Công nghệ nền tảng**: Tailwind CSS v4.2.4 (`@tailwindcss/postcss`), Lucide Icons (`strokeWidth={1.5}`), Be Vietnam Pro, JetBrains Mono  
> **Nguyên tắc**: SỐ LIỆU ĐO THẬT (Computed Styles: px, rem, hex, rgb, oklch), KHÔNG ĐOÁN MÒ CLASS.

---

## 1. BẢNG MÀU HỆ THỐNG (COLOR PALETTE & SURFACE LAYERS)

### 1.1 Thang Lớp Bề Mặt (Surface Layers 0..3)

Hệ thống phân tầng không gian (Spatial Z-Elevation) chia làm 4 lớp bề mặt rõ rệt cho cả Light Mode và Dark Mode:

| Tầng Bề Mặt | Tên Layer | Màu Light Mode (Hex / OKLCH) | Màu Dark Mode (Hex / OKLCH) | Mục Đích Sử Dụng |
| :---: | :--- | :--- | :--- | :--- |
| **Layer 0** | Body Background | `#f8fafc` / `oklch(0.984 0.003 247.858)` (`slate-50`) | `#020617` / `oklch(0.129 0.042 264.695)` (`slate-950`) | Nền tổng thể toàn trang (body) |
| **Layer 1** | Primary Surface | `#ffffff` / `rgb(255, 255, 255)` (`white`) | `#0f172a` / `oklch(0.208 0.042 265.755)` (`slate-900`) | Cards, Bảng dữ liệu (Table), Main Header Island, Village Cards |
| **Layer 2** | Secondary Surface | `#f1f5f9` / `oklch(0.968 0.007 247.896)` (`slate-100`) | `#020617` / `oklch(0.129 0.042 264.695)` (`slate-950`) | Table Header (thead sticky), App Shell Sidebar, Sub-header bar |
| **Layer 3** | Overlay & Floating | `#ffffff` / `rgb(255, 255, 255)` + `backdrop-blur` | `#0f172a` / `oklch(0.208 0.042 265.755)` + `backdrop-blur` | Modals (`z-50`), Slide-over Drawer, Floating Batch Toolbar (`z-40`), Portal Dropdowns (`z-[100000]`) |

*Đặc thù bất biến của App Shell*: Thanh Header trên cùng luôn mang màu `#0f172a` (`bg-slate-900`) trên **cả 2 giao diện Sáng và Tối** để bảo đảm nhận diện thương hiệu công vụ vững chắc.

---

### 1.2 Bảng Màu Thương Hiệu & Điểm Nhấn (Brand & Accent Colors)

Tone màu chủ đạo là **Emerald** (Đại diện cho nông thôn mới, hành chính xanh xã Đăk Hà):

| Tên Token | Class Tailwind | Giá Trị Hex | Giá Trị OKLCH / RGB | Vai Trò Ứng Dụng |
| :--- | :--- | :--- | :--- | :--- |
| `color-primary-50` | `emerald-50` | `#ecfdf5` | `oklch(0.979 0.021 166.113)` | Nền badge nhẹ, hover dòng bảng, trigger dropdown active |
| `color-primary-100`| `emerald-100` | `#d1fae5` | `oklch(0.95 0.052 163.051)` | Nền hộp icon tròn, pill đếm bản ghi hợp lệ |
| `color-primary-200`| `emerald-200` | `#a7f3d0` | `oklch(0.905 0.093 164.15)` | Đường viền badge, viền hộp thoại |
| `color-primary-500`| `emerald-500` | `#10b981` | `oklch(0.696 0.17 162.48)` | Focus ring, viền active, icon điểm nhấn |
| `color-primary-600`| `emerald-600` | `#059669` | `oklch(0.596 0.145 163.225)` | **Màu nút hành động chính (Primary Button)**, NavItem Active |
| `color-primary-700`| `emerald-700` | `#047857` | `oklch(0.508 0.118 165.612)` | Hover trạng thái nút chính, text badge đậm |
| `color-primary-800`| `emerald-800` | `#065f46` | `oklch(0.432 0.095 166.913)` | Nền gradient banner, text tiêu đề xanh |
| `color-primary-900`| `emerald-900` | `#064e3b` | `oklch(0.365 0.076 168.154)` | Nền gradient điểm cuối của banner đối soát |
| `color-primary-950`| `emerald-950` | `#022c22` | `oklch(0.24 0.05 168.0)` | Nền badge trong Dark mode (`dark:bg-emerald-950/60`) |

---

### 1.3 Thang Màu Trung Tính (Neutral Slate Scale)

| Tên Token | Class Tailwind | Giá Trị Hex | Giá Trị OKLCH | Vai Trò Ứng Dụng |
| :--- | :--- | :--- | :--- | :--- |
| `slate-50` | `bg-slate-50` | `#f8fafc` | `oklch(0.984 0.003 247.858)` | Nền Body Light mode, nền input |
| `slate-100` | `bg-slate-100` | `#f1f5f9` | `oklch(0.968 0.007 247.896)` | Nền thead table, nút thứ cấp (Secondary button) |
| `slate-200` | `border-slate-200` | `#e2e8f0` | `oklch(0.929 0.013 255.508)` | Đường viền card, viền table Light mode |
| `slate-300` | `border-slate-300` | `#cbd5e1` | `oklch(0.869 0.022 252.894)` | Viền ô nhập liệu input, thumb scrollbar |
| `slate-400` | `text-slate-400` | `#94a3b8` | `oklch(0.704 0.04 256.788)` | Icon mờ, placeholder, text mô tả phụ |
| `slate-500` | `text-slate-500` | `#64748b` | `oklch(0.554 0.046 257.417)` | Tiêu đề cột thead, icon search |
| `slate-600` | `text-slate-600` | `#475569` | `oklch(0.446 0.043 257.281)` | Nhãn label trường, text phụ đề |
| `slate-700` | `text-slate-700` | `#334155` | `oklch(0.372 0.044 257.287)` | Nút outline, viền input Dark mode |
| `slate-800` | `bg-slate-800` | `#1e293b` | `oklch(0.279 0.041 260.031)` | Viền Header/Sidebar, viền card Dark mode |
| `slate-900` | `bg-slate-900` | `#0f172a` | `oklch(0.208 0.042 265.755)` | Header, Card Dark mode, Modal container |
| `slate-950` | `bg-slate-950` | `#020617` | `oklch(0.129 0.042 264.695)` | Sidebar, Body Dark mode, Backdrop overlay |

---

### 1.4 Màu Trạng Thái Nghiệp Vụ (Semantic & Feedback Colors)

- **Cảnh báo lỗi / Xóa / Ngắt kết nối (Rose / Red)**:
  - Nền nhẹ: `bg-rose-50` (`#fff1f2`) / `dark:bg-rose-950/40`
  - Viền: `border-rose-200` (`#fecdd3`) / `dark:border-rose-800`
  - Text & Icon: `text-rose-600` (`#e11d48`) / `text-rose-700` (`#be123c`)
  - Nút bấm nguy hiểm (Danger button): `bg-rose-600 hover:bg-rose-700 text-white`
- **Cảnh báo nhắc nhở / Xóa mềm (Amber / Warning)**:
  - Nền nhẹ: `bg-amber-50` (`#fffbeb`) / `dark:bg-amber-950/40`
  - Viền: `border-amber-200` (`#fde68a`) / `dark:border-amber-800`
  - Text & Icon: `text-amber-600` (`#d97706`) / `text-amber-700` (`#b45309`)
  - Nút xác nhận xóa tạm: `bg-amber-600 hover:bg-amber-700 text-white`
- **Thông tin / Giới tính Nam / Xuất Excel (Blue / Info)**:
  - Nền nhẹ: `bg-blue-50` (`#eff6ff`) / `dark:bg-blue-950/40`
  - Badge Nam: `bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300`
  - Icon Download / Xuất Excel: `text-blue-500` (`#3b82f6`)
- **Giới tính Nữ (Rose / Pink)**:
  - Badge Nữ: `bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300`

---

## 2. HỆ THỐNG TYPOGRAPHY (CHUẨN HÓA BE VIETNAM PRO)

Cấu hình `@theme` từ `QLHK-Client/src/index.css`:
```css
@theme {
  --font-sans: "Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```

### 2.1 Thang Cỡ Chữ & Đo Đạc Thực Tế (Font Scale & Line Heights)

| Cỡ Chữ | Chiều Cao Dòng (Line Height) | Cân Nặng (Font Weight) | Tracking (Letter Spacing) | Đối Tượng Áp Dụng |
| :---: | :---: | :---: | :---: | :--- |
| **`10px`** | `14px` (`1.4`) | 800 (extrabold) | `+0.05em` | Huy hiệu xã `XÃ ĐĂK HÀ`, tags lỗi inline `[CCCD]`, `[Ngày sinh]` |
| **`11px`** | `16px` (`1.45`) | 900 (black) | `+0.05em` (`tracking-wider`) | Tiêu đề cột `<thead>` (STT, HỌ VÀ TÊN...), Tiêu đề Sidebar `DANH MỤC` |
| **`12px`** | `16px` (`1.33`) | 600 / 700 (bold) | `-0.01em` | Phụ đề, mô tả NavItem, nút hành động nhỏ, số liệu đếm |
| **`13px`** | `20px` (`1.54`) | 700 (bold) | `+0.05em` (`tracking-wider`) | Nút `ĐĂNG NHẬP`, Nút `[+ Thêm Hồ Sơ]`, Action buttons |
| **`14px`** | `20px` (`1.43`) | 500 / 600 (semibold) | `-0.01em` | Ô nhập liệu (`input`, `select`), nội dung dòng bảng thường |
| **`15px`** | `23.25px` (`1.55`) | 400 (regular) | `-0.01em` (`-0.15px`) | Base body text toàn ứng dụng |
| **`18px`** | `24px` (`1.33`) | 800 / 900 (black) | `-0.02em` (`tracking-tight`) | Tiêu đề thẻ Thôn (Village Card), Tiêu đề hộp thoại Modal |
| **`24px`** | `32px` (`1.33`) | 900 (black) | `-0.025em` (`tracking-tight`) | Tiêu đề Header Island `Quản Lý Hồ Sơ Chúc Thọ` |
| **`30px`** | `36px` (`1.2`) | 900 (black) | `-0.03em` | Chỉ số KPI chính trên thẻ thống kê (521 Hộ, 1821 Người) |

---

## 3. THANG BO GÓC (BORDER RADII SCALE)

Đo đạc chính xác theo pixel từ Tailwind v4 theme:

```
┌────────────────────────────────────────────────────────┐
│ rounded-3xl (24px) ── Modals, Cards Lớn, Header Island │
├────────────────────────────────────────────────────────┤
│ rounded-2xl (16px) ── NavItems, FilterBar, Toolbars    │
├────────────────────────────────────────────────────────┤
│ rounded-xl  (12px) ── Buttons, Inputs, CustomSelect    │
├────────────────────────────────────────────────────────┤
│ rounded-lg  (8px)  ── Badges, Tags, Checkboxes         │
├────────────────────────────────────────────────────────┤
│ rounded-full(9999px)─ Action Buttons, Pills, Avatars   │
└────────────────────────────────────────────────────────┘
```

| Class | Giá Trị Pixel | Phần Tử Áp Dụng Chuẩn Mực |
| :--- | :---: | :--- |
| `rounded-3xl` | **`24px`** | Khung Modal (`ProfileModal`, `ImportModal`), Banner Quản lý thôn, Header Island Dashboard, Card thống kê lớn |
| `rounded-2xl` | **`16px`** | Card đăng nhập (Login Card), Khung Filter Toolbar, Thẻ sự kiện Timeline, Thẻ Thôn, Floating Batch Toolbar, NavItem Sidebar |
| `rounded-xl` | **`12px`** | Ô nhập liệu (Input), CustomSelect trigger, Nút thứ cấp, Hộp biểu tượng logo Header (36×36px) |
| `rounded-lg` | **`8px`** | Badge mốc tuổi, Badge diện chính sách HTXH, Tag lỗi inline `[Ngày sinh]` |
| `rounded-full` | **`9999px`** | Nút `[+ Thêm Hồ Sơ]`, Nút `[Nhập Excel]`, Nút `[Xuất Excel]`, Zoom Pill, Latency Pill, User Avatar, Thanh tiến trình Import |

---

## 4. HỆ THỐNG ĐỔ BÓNG & NÂNG ĐỘ CAO (ELEVATION & SHADOW SCALE)

Trích xuất chuỗi CSS đổ bóng thực tế từ `computed_dump.json`:

| Cấp Độ | Class Tailwind | Chuỗi CSS Box-Shadow Đo Thật | Ứng Dụng |
| :---: | :--- | :--- | :--- |
| **0** | `shadow-none` | `none` | Ô nhập liệu bình thường, nền phẳng |
| **1** | `shadow-2xs` | `rgba(0, 0, 0, 0.05) 0px 1px 0px 0px` | Nút thứ cấp nền trắng |
| **2** | `shadow-xs` | `rgba(0, 0, 0, 0.05) 0px 1px 2px 0px` | Header cố định (`h-16`), Nút hành động chuẩn |
| **3** | `shadow-sm` | `rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px` | Header Island, Khung bảng dữ liệu, Card KPI |
| **4** | `shadow-md` | `rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px` | Nút `ĐĂNG NHẬP`, NavItem Active (kèm bóng đổ xanh `shadow-emerald-950/30`) |
| **5** | `shadow-xl` | `rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px` | Card đăng nhập, Card thôn khi rê chuột (hover) |
| **6** | `shadow-2xl` | `rgba(0, 0, 0, 0.25) 0px 25px 50px -12px` | Hộp thoại Modal, Slide-over Drawer, Floating Batch Toolbar |

---

## 5. THANG ĐO Z-INDEX (Z-INDEX HIERARCHY)

Tránh hoàn toàn hiện tượng che khuất hoặc đè nhầm lớp:

| Cấp Bậc | Giá Trị Z-Index | Thành Phần |
| :---: | :---: | :--- |
| **Nền** | `z-0` | Bảng dữ liệu, Cards, Layout container |
| **Cột Sticky** | `z-10` | Cột Checkbox ghim trái (left 0), Cột Thao tác ghim phải (right 0) |
| **Thead Sticky**| `z-20` | Dòng tiêu đề cột `<thead>` cố định khi cuộn dữ liệu |
| **App Header** | `z-30` | Thanh điều hướng trên cùng (Header) |
| **Mobile Drawer**| `z-40` | Sidebar khi bật trên điện thoại di động / tablet |
| **Floating Bar**| `z-40` | Thanh thao tác hàng loạt nổi đáy màn hình (`FloatingBatchToolbar`) |
| **Modals Core** | `z-50` | Hộp thoại `ProfileModal`, `ImportModal`, `ExportModal`, `ServerStatusModal` |
| **Portal Alerts**| `z-[99999]` | Hộp thoại xác nhận rủi ro `showConfirm`, `showAlert` |
| **Portal Select**| `z-[100000]`| Dropdown danh sách lựa chọn của `CustomSelect` (nổi trên cả Modal) |

---

## 6. ANIMATION ENGINE & TRANSITIONS

Polyfill Animation CSS từ `QLHK-Client/src/index.css`:

```css
.animate-in {
  animation-name: enter;
  animation-duration: var(--animation-duration, 150ms);
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: both;
}

.fade-in { --tw-enter-opacity: 0; }
.zoom-in-95 { --tw-enter-scale: 0.95; }
.slide-in-from-top { --tw-enter-translate-y: -100%; }
.slide-in-from-bottom { --tw-enter-translate-y: 1rem; }
```

- **Thời gian chuyển động (Durations)**:
  - `duration-100` (`100ms`): Nút hover, highlight checkbox.
  - `duration-150` (`150ms`): Dropdown mở, nút active co nhẹ (`active:scale-[0.98]`).
  - `duration-200` (`200ms`): Modal zoom-in, Card hover nâng độ cao.
  - `duration-300` (`300ms`): Sidebar mở rộng / thu gọn chiều rộng.
- **Trợ năng giảm chuyển động**: `@media (prefers-reduced-motion: reduce) { .animate-in { animation: none !important; } }`.

---

## 7. QUY CHUẨN BIỂU TƯỢNG (ICONOGRAPHY TOKENS)

- **Thư viện duy nhất**: `lucide-react`.
- **Nét vẽ chuẩn**: Bắt buộc **`strokeWidth={1.5}`** trên 100% biểu tượng.
- **Quy chuẩn kích thước (Size Scale)**:
  - `w-3.5 h-3.5` (14px): Icon trong badge, icon xóa filter (X), chevron dropdown nhỏ.
  - `w-4 h-4` (16px): Icon trên nút bấm action, icon search input, icon calendar.
  - `w-5 h-5` (20px): Icon NavItem Sidebar, icon Logo Header, icon trên thẻ Thôn.
  - `w-6 h-6` (24px): Icon cảnh báo trong hộp thoại confirm, icon lỗi ErrorBoundary.
  - `w-10 h-10` đến `w-14 h-14`: Icon minh họa vùng kéo thả tệp (`UploadCloud`).
