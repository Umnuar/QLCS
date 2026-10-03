# Kiến Trúc App Shell & Thông Số Kỹ Thuật Chi Tiết (Reference: QLHK)

Tài liệu này trích xuất toàn bộ cấu trúc DOM, thông số đo đạc thực tế (computed styles), design tokens, hành vi tương tác và luật responsive của **App Shell** từ ứng dụng tham chiếu (**QLHK**). Tài liệu phục vụ làm chuẩn mực kỹ thuật (Single Source of Truth) để đồng bộ cho **Layer 2 (App Shell)** của ứng dụng đích (**QLCS**).

---

## 1. Nguyên Tắc Bất Biến (Invariant Principle) Cho App Shell

```
┌────────────────────────────────────────────────────────────────────────┐
│                   COPY FORM ONLY, KEEP CONTENT INTACT                  │
├────────────────────────────────────────────────────────────────────────┤
│ FORM (Sao chép 100% từ Reference QLHK):                                │
│ • Header cố định h-16 (64px), nền slate-900 (cả Light & Dark mode).    │
│ • Sidebar w-64 (256px) mở / w-16 (64px) thu gọn, nền slate-950.        │
│ • NavItems: bo góc rounded-2xl (16px), min-h-[48px], active emerald-600│
│ • Mobile Drawer với Backdrop Overlay mờ (slate-950/60 backdrop-blur).  │
│ • Controls: Zoom Pill, Theme Toggle, Latency Pill, User Profile, Banner│
│ • Custom Scrollbar 6px bo tròn với track/thumb phân tách theme.        │
├────────────────────────────────────────────────────────────────────────┤
│ CONTENT (Bảo toàn 100% từ Target QLCS):                                │
│ • Brand Title: "QUẢN LÝ CHÍNH SÁCH", Subtitle: "Chúc Thọ & Hưu Trí..."  │
│ • Logo Icon: Lucide <FileText /> (thay vì <Users /> của QLHK).         │
│ • Danh mục điều hướng: Thống Kê, Hồ Sơ Chúc Thọ (<Award />),           │
│   Hưu Trí Xã Hội (<Users />), Thùng Rác, Nhật Ký Hoạt Động, Cài Đặt... │
│ • Phiên bản chân Sidebar: "QLCS v3.0.0" (không đổi thành QLHK).        │
│ • Toàn bộ nhãn, thông báo kết nối, vai trò người dùng của QLCS.        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Header (Thanh Điều Hướng Trên Cùng)

### 2.1 Cấu Trúc Tổng Quan & Thông Số Cố Định
* **Vị trí**: `sticky top-0 z-30 select-none`
* **Chiều cao**: Cố định `h-16` = `64px` (`4rem`)
* **Padding ngang**: `px-4 sm:px-6` (Mobile: `16px` / `1rem`; Tablet/Desktop: `24px` / `1.5rem`)
* **Màu nền**: `bg-slate-900`
  * Hex: `#0f172a`
  * OKLCH: `oklch(0.208 0.042 265.755)`
  * *Đặc thù thiết kế*: Nền Header luôn giữ tông Dark Slate-900 trong **cả Light Mode và Dark Mode**, tạo độ tương phản mạnh và nhận diện thương hiệu nhất quán.
* **Đường viền dưới**: `border-b border-slate-800`
  * Độ dày: `1px` (`border-width: 0 0 1px 0`)
  * Màu sắc: `oklch(0.279 0.041 260.031)` / Hex `#1e293b`
* **Bóng đổ**: `shadow-xs` (`rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`)
* **Transition**: `transition-colors duration-150` (`150ms cubic-bezier(0.4, 0, 0.2, 1)`)

### 2.2 Khối Nhận Diện Thương Hiệu (Brand & Logo Cluster)
Nằm bên trái Header: `<div className="flex items-center gap-3">` (`gap: 12px` / `0.75rem`).

```
┌───────────────────────────────────────────────────────────────┐
│ [Icon Box]  QUẢN LÝ HỘ KHẨU [XÃ ĐĂK HÀ]                       │
│  (36x36)    Dữ liệu Hộ khẩu & Nhân khẩu số Xã Đăk Hà          │
└───────────────────────────────────────────────────────────────┘
```

| Thành phần | Class Tailwind | Số liệu đo thực tế | Ghi chú & Quy tắc Form/Content |
|---|---|---|---|
| **Hộp Icon Logo** | `w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0` | Kích thước: `36px × 36px`<br>Bo góc: `12px` (`rounded-xl`)<br>Nền: `rgba(16, 185, 129, 0.1)` (`oklab(0.696 -0.162 0.051 / 0.1)`)<br>Viền: `1px solid rgba(16, 185, 129, 0.2)`<br>Màu Icon: `oklch(0.765 0.177 163.223)` (`#34d399`) | Icon kích thước `w-5 h-5` (`20px × 20px`), `strokeWidth: 1.5`.<br>• QLHK: `<Users />`<br>• **QLCS**: Giữ `<FileText />`. |
| **Tiêu Đề Chính (Title)** | `text-sm font-black text-white tracking-tight` | Font: `"Be Vietnam Pro"`<br>Size: `14px` (`0.875rem`)<br>Weight: `900` (`font-black`)<br>Line-height: `20px`<br>Letter-spacing: `-0.025em` (`-0.35px`)<br>Color: `#ffffff` | • QLHK: `QUẢN LÝ HỘ KHẨU`<br>• **QLCS**: Giữ `QUẢN LÝ CHÍNH SÁCH` (trên mobile <640px có thể áp dụng `text-xs sm:text-sm`). |
| **Huy Hiệu Địa Bàn (Village Badge)** | `px-2 py-0.5 text-[10px] font-bold bg-emerald-950/80 text-emerald-300 rounded-full border border-emerald-800 uppercase tracking-wider hidden sm:inline-block` | Padding: `2px 8px`<br>Bo góc: `9999px` (`rounded-full`)<br>Nền: `rgba(2, 44, 34, 0.8)` (`oklab(0.262 -0.051 0.007 / 0.8)`)<br>Viền: `1px solid #065f46` (`oklch(0.432 0.095 166.913)`)<br>Màu chữ: `#6ee7b7` (`oklch(0.845 0.143 164.978)`)<br>Size: `10px`, Weight: `700`, Spacing: `0.05em` | Huy hiệu pill hiển thị: `XÃ ĐĂK HÀ`. Ẩn trên mobile (<640px), hiển thị từ `sm:inline-block`. |
| **Phụ Đề (Subtitle)** | `text-[11px] text-slate-400 font-medium leading-none mt-0.5 hidden sm:block` | Size: `11px`, Weight: `500`<br>Line-height: `11px` (`leading-none`)<br>Màu chữ: `oklch(0.704 0.04 256.788)` (`#94a3b8`)<br>Margin-top: `2px` (`0.125rem`) | Ẩn trên mobile (<640px).<br>• QLHK: `Dữ liệu Hộ khẩu & Nhân khẩu số Xã Đăk Hà`<br>• **QLCS**: Giữ `Chúc Thọ & Hưu Trí Xã Hội Xã Đăk Hà`. |

### 2.3 Khối Điều Khiển Bên Phải (Right Controls Cluster)
Container: `<div className="flex items-center gap-2 sm:gap-3.5">` (`gap: 10px` trên mobile, `14px` trên sm+).

#### A. Zoom Controls Pill (Cụm Phóng to / Thu nhỏ)
* **Hiển thị**: `hidden sm:flex` (ẩn trên mobile <640px, hiển thị trên tablet/desktop).
* **Khung vỏ (Pill Container)**:
  * Classes: `bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-slate-300 text-xs`
  * Padding: `2px` (`p-0.5`)
  * Bo góc: `12px` (`rounded-xl`)
  * Nền: `bg-slate-800` (`#1e293b` / `oklch(0.279 0.041 260.031)`)
  * Viền: `1px solid #334155` (`border-slate-700`)
* **Nút Thu nhỏ (ZoomOut)**:
  * Classes: `p-1.5 hover:bg-slate-700 hover:text-emerald-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`
  * Padding: `6px`, Bo góc: `8px` (`rounded-lg`)
  * Icon: `<ZoomOut className="w-3.5 h-3.5" />` (`14px × 14px`)
  * Disabled khi `zoomLevel <= 80%`.
* **Nút Reset / Hiển thị Phần trăm**:
  * Classes: `px-2 py-1 font-mono tabular-nums font-bold text-[11px] hover:text-emerald-400 transition-colors cursor-pointer`
  * Padding: `4px 8px`, Font: `JetBrains Mono`, `font-bold`, Size: `11px`.
  * Giá trị: `{zoomLevel}%` (Dải: 80%, 90%, 100%, 110%, 120%, 130%, 140%).
  * Click: Đặt lại 100%. Phím tắt: `Ctrl 0`. Phóng to: `Ctrl +`. Thu nhỏ: `Ctrl -`.
* **Nút Phóng to (ZoomIn)**:
  * Classes: `p-1.5 hover:bg-slate-700 hover:text-emerald-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`
  * Icon: `<ZoomIn className="w-3.5 h-3.5" />` (`14px × 14px`).
  * Disabled khi `zoomLevel >= 140%`.

#### B. Theme Toggle Button (Chuyển Giao Diện Sáng / Tối)
* **Classes**: `p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-all active:scale-95 border border-slate-700 cursor-pointer`
* **Kích thước thực tế**: `34px × 34px` (Padding: `8px`).
* **Bo góc**: `12px` (`rounded-xl`).
* **Viền**: `1px solid #334155` (`border-slate-700`).
* **Màu sắc & Icon**:
  * Khi đang ở Dark Mode (bấm để sang Light): Icon `<Sun className="w-4 h-4 text-amber-400" />` (`16px × 16px`, màu `#fbbf24`).
  * Khi đang ở Light Mode (bấm để sang Dark): Icon `<Moon className="w-4 h-4 text-slate-300" />` (`16px × 16px`, màu `#cbd5e1`).
* **Hiệu ứng**: `active:scale-95` nhún nhẹ khi click.

#### C. Thẻ Hiển Thị Địa Bàn Thôn (Village Indicator Pill)
* **Hiển thị**: `hidden md:flex` (ẩn trên mobile và tablet nhỏ <768px, hiện từ 768px).
* **Classes**: `items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl text-slate-200 text-xs font-bold border border-slate-700`
* **Padding**: `6px 12px` (`px-3 py-1.5`).
* **Bo góc**: `12px` (`rounded-xl`).
* **Màu sắc**: Nền `#1e293b` (`bg-slate-800`), viền `#334155` (`border-slate-700`), chữ `#e2e8f0` (`text-slate-200`).
* **Icon**: `<MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />` (`14px × 14px`, `#34d399`).
* **Text**: `<span className="max-w-[140px] truncate">{selectedVillageName || "Toàn xã"}</span>` (rộng tối đa `140px`, tự động rút gọn ba chấm).
* **Biến thể tương tác cho Admin trong QLCS**: Được bọc bằng thẻ `<button>` với `hover:bg-slate-700 hover:text-emerald-300 hover:border-emerald-500/50 cursor-pointer` để cán bộ xã có thể bấm nhanh quay về xem toàn xã.

#### D. Network / Latency Pill (Trạng Thái Kết Nối & Ping)
Nút bấm kích hoạt cửa sổ chẩn đoán: `<button onClick={() => setShowStatusModal(true)} ...>`

* **Kích thước & Bo góc**: Padding `6px 10px` (`px-2.5 py-1.5`), bo góc `12px` (`rounded-xl`), font `text-xs font-bold` (`12px`, 700).
* **Trạng thái Trực tuyến (Online & Healthy)**:
  * Classes: `bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60`
  * Nền: `rgba(2, 44, 34, 0.6)`, Viền: `#065f46`, Chữ: `#6ee7b7`.
  * Chấm trạng thái: `<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />` (`8px × 8px`).
  * Icon: `<Wifi className="w-3.5 h-3.5 text-emerald-400" />` (`14px × 14px`).
  * Latency Text: `<span className="font-mono tabular-nums text-[11px]">{latency}ms</span>` (Font số JetBrains Mono).
* **Trạng thái Ngoại tuyến (Offline)**:
  * Classes: `bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/60`
  * Nền: `rgba(76, 5, 25, 0.6)`, Viền: `#9f1239`, Chữ: `#fca5a5`.
  * Icon: `<WifiOff className="w-3.5 h-3.5 text-rose-400" />`.
  * Text: "Ngoại tuyến" (`font-bold text-[11px]`).

#### E. Đường Phân Cách (Vertical Divider)
* **Element**: `<div className="h-5 w-px bg-slate-700" />`
* **Kích thước**: Cao `20px` (`h-5`), rộng `1px`, màu `#334155` (`bg-slate-700`).

#### F. Thông Tin Người Dùng & Nút Đăng Xuất (User Profile & Logout)
* **Container**: `flex items-center gap-2 sm:gap-3`.
* **Avatar Tròn**:
  * Classes: `w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs`
  * Kích thước: `32px × 32px` (`w-8 h-8`).
  * Bo góc: `9999px` (`rounded-full`).
  * Nền: `#1e293b`, Viền: `1px solid #334155`.
  * Nội dung: 2 ký tự viết hoa đầu của username (ví dụ: `AD`, `TT`) hoặc fallback `<UserIcon className="w-4 h-4" />`.
* **Nhãn Tên & Chức Danh (Text Info)**:
  * Hiển thị: `hidden lg:block` (ẩn trên mobile và tablet <1024px, hiển thị từ desktop `lg`).
  * Dòng 1 (Username): `text-xs font-black text-slate-200 leading-snug` (Size: `12px`, Weight: `900`).
  * Dòng 2 (Role Badge): `flex items-center gap-1 text-[10px] font-semibold text-slate-400`.
    * Icon: `<Shield className="w-3 h-3 text-emerald-400" />` (`12px × 12px`, `#34d399`).
    * Role text: `Cán bộ Xã (Admin)` hoặc `Trưởng Thôn`.
* **Nút Đăng Xuất (Logout Button)**:
  * Classes: `p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-xl transition-all active:scale-95 cursor-pointer`
  * Padding: `8px`, Bo góc: `12px` (`rounded-xl`).
  * Màu sắc: Mặc định `#94a3b8`, hover text `#fb7185`, hover nền `rgba(76, 5, 25, 0.5)`.
  * Icon: `<LogOut className="w-4 h-4" />` (`16px × 16px`, `strokeWidth: 1.5`).

---

## 3. Sidebar (Thanh Điều Hướng Bên Trái)

### 3.1 Kích Thước & Nguyên Tắc Co Giãn (Dimensions & Responsive Modes)
Sidebar trong Reference QLHK có 3 trạng thái hoạt động chính:

```
1. Desktop Mở Rộng (Desktop Expanded, >= 768px):
   ┌──────────────────────────────────────────────┐
   │ w-64 (256px)                                 │
   │ [DB] DANH MỤC                    [Thu gọn <] │
   ├──────────────────────────────────────────────┤
   │ [Icon] Tiêu Đề Item                          │
   │        Dòng mô tả chi tiết                   │
   │ ...                                          │
   ├──────────────────────────────────────────────┤
   │ [Shield] QLCS v3.0.0                         │
   └──────────────────────────────────────────────┘

2. Desktop Thu Gọn (Desktop Collapsed):
   ┌──────┐
   │ w-16 │ (64px)
   │ [ >] │
   ├──────┤
   │ [Icon] -> [ Tooltip Popover khi hover ]
   │ ...  │
   ├──────┤
   │ [SH] │
   └──────┘

3. Mobile Drawer (< 768px):
   • Khi đóng: w-14 (56px) hoặc ẩn gọn.
   • Khi mở: Trượt thành Drawer đè lên trên với Backdrop:
     fixed inset-y-0 left-0 z-40 w-64 shadow-2xl
     Backdrop: fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30
```

| Thông số | Giá trị Reference (QLHK) | Giá trị Đo Thực Tế (computed_dump.json) |
|---|---|---|
| **Chiều rộng khi Mở** | `w-64` (`16rem`) | `256px` |
| **Chiều rộng khi Thu gọn** | `w-14 sm:w-16` | Mobile: `56px`, Desktop: `64px` |
| **Màu nền (Background)** | `bg-slate-950` | `oklch(0.129 0.042 264.695)` / Hex `#020617` |
| **Đường viền phải (Border Right)**| `border-r border-slate-800/80` | `border-width: 0 1px 0 0`<br>`border-color: oklab(0.279 -0.007 -0.040 / 0.8)` (`rgba(30, 41, 59, 0.8)`) |
| **Màu chữ cơ sở** | `text-slate-300` | `oklch(0.869 0.022 252.894)` / Hex `#cbd5e1` |
| **Transition co giãn** | `transition-all duration-200 ease-out` | `0.2s cubic-bezier(0, 0, 0.2, 1)` |
| **Tự động thu gọn trên Mobile** | `window.innerWidth < 768` | Tự đóng khi click chọn bất kỳ NavItem nào. |

### 3.2 Khối Đầu Sidebar (Top Header / Danh Mục)
* **Container**: `p-3 flex items-center justify-between border-b border-slate-900 min-h-[56px] overflow-hidden`
  * Padding: `12px` (`p-3`)
  * Chiều cao tối thiểu: `56px` (`min-h-[56px]`)
  * Đường viền dưới: `1px solid #0f172a` (`border-slate-900`)
* **Khi Sidebar Mở**:
  * Khối Title: `text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2 whitespace-nowrap overflow-hidden`
    * Icon: `<Database className="w-4 h-4 text-emerald-400 shrink-0" />` (`16px × 16px`, `#34d399`).
    * Nhãn chữ: `DANH MỤC` (Size: `12px`, Weight: `900`, Spacing: `0.1em` / `tracking-widest`).
  * Nút Thu gọn: `<PanelLeftClose className="w-4 h-4" />` trong nút `p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-xl transition-all cursor-pointer shrink-0`.
* **Khi Sidebar Thu Gọn**:
  * Nút Mở rộng: `<PanelLeftOpen className="w-4 h-4" />` trong nút `w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer`.

### 3.3 Danh Sách Mục Điều Hướng (NavItems Pattern)
Danh sách bọc trong `<div className="p-2.5 flex-1 overflow-y-auto overflow-x-hidden">` với `<nav className="flex flex-col gap-2">` (khoảng cách giữa các mục là `8px`).

Mỗi mục điều hướng là một thẻ `<button>` với 2 cấu trúc:
1. **Khi Mở Rộng**:
   * Kích thước: `w-full py-2.5 px-3 min-h-[48px]` (rộng thực tế `235px`, chiều cao thực tế `58.92px` khi có 2 dòng text).
   * Bo góc: `rounded-2xl` = `16px` (`1rem`).
   * Bố cục: Icon bên trái (`w-5 h-5`), khối text 2 dòng bên phải cách `gap-3` (`12px`).
2. **Khi Thu Gọn**:
   * Kích thước: `w-12 h-12 justify-center shrink-0 mx-auto` (`48px × 48px`).
   * Bo góc: `rounded-2xl` = `16px` (`1rem`).
   * Căn giữa tuyệt đối icon.

#### A. Trạng Thái Active (Đang Được Chọn)
* **Màu nền**: `bg-emerald-600` (`oklch(0.596 0.145 163.225)` / Hex `#059669`).
* **Màu chữ**: `text-white font-bold` (`#ffffff`).
* **Bóng đổ**: `shadow-md shadow-emerald-950/30`
  * Đo đạc thực tế: `oklab(0.262 -0.051 0.007 / 0.3) 0px 4px 6px -1px, oklab(...) 0px 2px 4px -2px`.
* **Màu Icon**: `text-white` (`20px × 20px`).
* **Dòng mô tả (Subtitle)**: `text-emerald-100/90` (`rgba(209, 250, 229, 0.9)`).
* **Huy hiệu Badge (nếu có)**: `bg-emerald-800/90 text-emerald-100`.

#### B. Trạng Thái Bình Thường & Hover (Inactive & Hover)
* **Bình thường**:
  * Nền: Trong suốt (`rgba(0, 0, 0, 0)`).
  * Chữ: `text-slate-400` (`oklch(0.704 0.04 256.788)` / Hex `#94a3b8`).
  * Icon: `text-slate-400`.
  * Dòng mô tả: `text-slate-500` (`#64748b`).
  * Huy hiệu Badge: `bg-slate-800 text-slate-300`.
* **Khi Rê Chuột (Hover)**:
  * Nền: `hover:bg-slate-800/50` (`rgba(30, 41, 59, 0.5)`).
  * Chữ: `hover:text-emerald-400` (`#34d399`).
  * Icon: `text-emerald-400`.
  * Dòng mô tả: `group-hover:text-slate-400` (`#94a3b8`).

#### C. Phân Cấp Typography Trong NavItem
* **Dòng 1 (Title + Badge)**:
  * Tiêu đề: `text-[13.5px] tracking-tight font-bold` (Cỡ chữ `13.5px`, đậm `700`, khoảng cách chữ `-0.025em`).
  * Huy hiệu Badge: `text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-1.5`
    * Padding: `2px 6px`
    * Bo góc: `6px` (`rounded-md`)
    * Size: `10px`, Đậm, Viết hoa, Spacing: `0.05em`.
* **Dòng 2 (Description)**:
  * `text-xs truncate mt-0.5`
  * Size: `12px` (`text-xs`), Margin-top: `2px` (`mt-0.5`).
  * Truncate: Tự động cắt ngắn và hiện dấu ba chấm nếu tràn khung `180px`.

#### D. Thẻ Tooltip Popover (Khi Sidebar Thu Gọn)
Khi sidebar ở trạng thái thu gọn, người dùng rê chuột vào icon sẽ xuất hiện popover bay sang bên phải:
* **Classes**: `absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl border border-slate-700/90 whitespace-nowrap pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150`
* **Vị trí**: Nằm bên phải icon `12px` (`ml-3`), căn giữa theo chiều dọc (`top-1/2 -translate-y-1/2`), `z-50`.
* **Nền & Viền**: Nền `bg-slate-900` (`#0f172a`), viền `border border-slate-700/90` (`rgba(51, 65, 85, 0.9)`).
* **Bo góc**: `16px` (`rounded-2xl`).
* **Bóng đổ**: `shadow-2xl` (`rgba(0, 0, 0, 0.25) 0px 25px 50px -12px`).
* **Cấu trúc bên trong**:
  * Dòng 1: `<span className="text-sm font-bold">{item.label}</span>` kèm badge nếu có.
  * Dòng 2: `<div className="text-xs text-slate-400 font-medium mt-0.5">{item.desc}</div>`.

### 3.4 Chân Sidebar (Footer)
* **Classes**: `p-3.5 border-t border-slate-900 bg-slate-950 text-xs text-slate-400 overflow-hidden`
* **Padding**: `14px` (`p-3.5`), Chiều cao: `45px`.
* **Đường viền trên**: `1px solid #0f172a` (`border-t border-slate-900`).
* **Nền**: `bg-slate-950` (`#020617`).
* **Nội dung khi Mở**:
  * `<div className="flex items-center gap-2 text-slate-200 font-bold text-xs">`
  * Icon: `<ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />` (`16px × 16px`, `#34d399`).
  * Text Phiên bản: `QLHK v1.0.0` (Đối với QLCS: **`QLCS v3.0.0`**).
* **Nội dung khi Thu Gọn**:
  * Căn giữa icon: `<div className="flex justify-center"><ShieldCheck className="w-4 h-4 text-emerald-400" /></div>`.

---

## 4. AppLayout, Vùng Main & Banner Kết Nối

### 4.1 Khung Toàn Màn Hình (Viewport Frame)
```tsx
<div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-150">
  <Header />
  <ConnectionBanner ... />
  <div className="flex flex-1 overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-900/30">
      <div className="w-full max-w-none space-y-6">
        {children}
      </div>
    </main>
  </div>
</div>
```

* **Khung tổng thể**: `h-screen w-screen overflow-hidden flex flex-col`. Toàn bộ app khóa cuộn ở cấp độ `window/body`, chỉ cuộn bên trong `<main>` và `<Sidebar>`.
* **Màu nền khung**:
  * Light Mode: `bg-slate-100` (`#f1f5f9`).
  * Dark Mode: `dark:bg-slate-950` (`#020617`).
* **Vùng nội dung chính `<main>`**:
  * Cuộn dọc: `overflow-y-auto`.
  * Padding: Mobile `p-4` (`16px`), Tablet/Desktop `sm:p-6` (`24px`).
  * Màu nền nội dung:
    * Light Mode: `bg-slate-100/70` (`rgba(241, 245, 249, 0.7)` / `oklab(0.968 -0.003 -0.006 / 0.7)`).
    * Dark Mode: `dark:bg-slate-900/30` (`rgba(15, 23, 42, 0.3)`).
  * Vùng chứa con: `<div className="w-full max-w-none space-y-6">` (không ép max-width cố định, khoảng cách giữa các khối card là `space-y-6` = `24px`).

### 4.2 Custom Scrollbar (Đặc Tả Thanh Cuộn 6px)
Trích xuất từ `QLHK-Client/src/index.css`:
```css
/* Thanh cuộn siêu mảnh bo tròn toàn hệ thống */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

/* Light Mode */
::-webkit-scrollbar-track {
  background: #f1f5f9; /* slate-100 */
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1; /* slate-300 */
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; /* slate-400 */
}

/* Dark Mode (html.dark) */
html.dark ::-webkit-scrollbar-track {
  background: #0f172a; /* slate-900 */
}
html.dark ::-webkit-scrollbar-thumb {
  background: #334155; /* slate-700 */
  border-radius: 9999px;
}
html.dark ::-webkit-scrollbar-thumb:hover {
  background: #475569; /* slate-600 */
}
```

### 4.3 ConnectionBanner (Banner Cảnh Báo Trạng Thái Mạng)
Đặt ngay bên dưới `<Header />`, trượt xuống bằng hiệu ứng animation `animate-in slide-in-from-top duration-300`:

#### A. Banner Khôi Phục Kết Nối Thành Công (`isReconnected`)
* **Classes**: `bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs animate-in slide-in-from-top duration-300 select-none`
* **Nền**: `bg-emerald-600` (`#059669`).
* **Chữ**: `text-white`, `text-xs font-bold` (`12px`, 700).
* **Icon**: `<CheckCircle2 className="w-4 h-4" />` (`16px × 16px`).
* **Thời gian hiển thị**: Tự ẩn sau `3500ms` (3.5 giây).
* **Thông điệp**: "Đã khôi phục kết nối thành công — Dữ liệu đã được đồng bộ tự động thời gian thực!"

#### B. Banner Ngoại Tuyến / Mất Kết Nối (`isOffline`)
* **Classes**: `bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300 select-none`
* **Nền**: Dải gradient `linear-gradient(to right, #d97706, #e11d48, #be123c)` (tạo hiệu ứng báo động sắc sảo).
* **Padding**: `8px 16px` (`px-4 py-2`).
* **Icon Cảnh Báo**: `<AlertTriangle className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />` (`16px × 16px`, nhấp nháy pulse).
* **Thông điệp (QLCS giữ nguyên)**: `Mất kết nối tới máy chủ - Đang hoạt động ở chế độ ngoại tuyến (Offline Cache)`.
* **Nút Thử Lại (Retry Button)**:
  * Classes: `flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold rounded-lg text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer`
  * Padding: `4px 12px` (`px-3 py-1`), Bo góc: `8px` (`rounded-lg`).
  * Icon: `<RefreshCw className="w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}" />` (`14px × 14px`, xoay spin khi đang thử lại).
  * Nhãn nút: `isRetrying ? "Đang thử lại..." : "Thử kết nối ngay"`.

---

## 5. Cơ Chế Chuyển Đổi Dark / Light Mode & Zoom Giao Diện

### 5.1 Dark / Light Mode Mechanism
1. **Lưu trữ**: Khóa `localStorage.getItem("qlcs_theme")` với giá trị `'dark'` hoặc `'light'`.
2. **Khởi tạo thông minh**:
   ```ts
   const saved = localStorage.getItem("qlcs_theme");
   if (saved === "dark" || saved === "light") return saved;
   return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
   ```
3. **Kích hoạt CSS**: Thêm/xóa class `dark` trực tiếp trên phần tử gốc `document.documentElement` (`<html>`).
4. **Tailwind v4 Variant**: Khai báo `@custom-variant dark (&:where(.dark, .dark *));` trong `index.css`.
5. **Đổi màu toàn cục**: Thuộc tính `transition-colors duration-150` trên thẻ gốc giúp chuyển nền êm dịu, không giật màn hình.

### 5.2 Zoom Mechanism (Phóng To / Thu Nhỏ Giao Diện)
1. **Dải Zoom**: `80%` đến `140%`, bước nhảy `10%`. Mặc định `100%`.
2. **Lưu trữ**: `localStorage.getItem("qlcs_zoom")`.
3. **Electron IPC Binding**: Đồng bộ tỉ lệ zoom với cửa sổ ứng dụng desktop thông qua:
   ```ts
   if (window.electronAPI?.setZoom) {
     window.electronAPI.setZoom(zoomLevel);
   } else if (window.api?.app?.setZoom) {
     window.api.app.setZoom(zoomLevel);
   }
   ```
4. **Phím Tắt Bàn Phím Toàn Cục**:
   * `Ctrl` + `+` (hoặc `=`): Phóng to giao diện (+10%).
   * `Ctrl` + `-` (hoặc `_`): Thu nhỏ giao diện (-10%).
   * `Ctrl` + `0`: Đặt lại tỉ lệ mặc định 100%.

---

## 6. Ma Trận Bố Cục Theo Breakpoint (Responsive Layout Matrix)

| Breakpoint | Viewport Rộng | Chiều Cao Header | Khối Trái Header | Zoom Pill | Theme Btn | Thẻ Thôn | Latency Pill | User Profile | Sidebar Desktop / Mobile | Main Padding |
|---|---|---|---|---|---|---|---|---|---|---|
| **Mobile** | `< 640px` (ví dụ: `360px`) | `64px` (`h-16`) | Hộp icon (36px) + Tiêu đề. Ẩn huy hiệu xã, ẩn subtitle. | Ẩn (`hidden sm:flex`) | Hiện (`34px × 34px`) | Ẩn (`hidden md:flex`) | Hiện (Chấm xanh + Wifi + latency) | Chỉ hiện Avatar tròn (`32px`). Ẩn tên/chức danh. | Thu gọn `w-14` (56px) hoặc Drawer Overlay `w-64` (256px) kèm Backdrop | `16px` (`p-4`) |
| **Tablet Nhỏ** | `640px - 767px` | `64px` (`h-16`) | Hiện đầy đủ Icon, Tiêu đề, Huy hiệu xã, Subtitle. | Hiện đầy đủ (`- 100% +`) | Hiện | Ẩn (`hidden md:flex`) | Hiện | Chỉ hiện Avatar tròn (`32px`). Ẩn tên/chức danh. | Thu gọn `w-16` (64px) hoặc Drawer Overlay `w-64` (256px) kèm Backdrop | `24px` (`p-6`) |
| **Tablet Lớn** | `768px - 1023px` (ví dụ: `768px`) | `64px` (`h-16`) | Hiện đầy đủ | Hiện | Hiện | Hiện (`MapPin + Thôn`) | Hiện | Chỉ hiện Avatar tròn (`32px`). Ẩn tên/chức danh (`hidden lg:block`). | Cột cố định: Mở rộng `w-64` (256px) hoặc Thu gọn `w-16` (64px) | `24px` (`p-6`) |
| **Laptop / PC** | `1024px - 1279px` (ví dụ: `1100px`) | `64px` (`h-16`) | Hiện đầy đủ | Hiện | Hiện | Hiện | Hiện | Hiện đầy đủ: Avatar + Username + Role + Shield icon | Cột cố định: Mở rộng `w-64` hoặc Thu gọn `w-16` | `24px` (`p-6`) |
| **Desktop Chuẩn**| `>= 1280px` (ví dụ: `1366px`, `1920px`) | `64px` (`h-16`) | Hiện đầy đủ | Hiện | Hiện | Hiện | Hiện | Hiện đầy đủ | Cột cố định: Mở rộng `w-64` hoặc Thu gọn `w-16` | `24px` (`p-6`) |

---

## 7. Bảng Đối Chiếu Hiện Trạng QLCS & Đề Xuất Đồng Bộ (Action Plan Cho Layer 2)

Nhằm đảm bảo **Nguyên Tắc Bất Biến (Invariant Principle)**, bảng dưới đây phân định rõ những chi tiết FORM cần chuẩn hóa theo Reference QLHK và những chi tiết CONTENT phải giữ nguyên của Target QLCS:

| Khu vực / Thành phần | Hiện trạng QLCS | Chuẩn Reference QLHK | Quyết định Đồng bộ cho Layer 2 |
|---|---|---|---|
| **Header: Logo Icon** | Dùng `<FileText />` | Dùng `<Users />` | **GIỮ NGUYÊN CONTENT**: Giữ icon `<FileText />` vì QLCS là phần mềm quản lý hồ sơ chính sách. Áp dụng FORM: Kích thước `36px × 36px`, `rounded-xl`, `bg-emerald-500/10`, viền `border-emerald-500/20`, màu `text-emerald-400`. |
| **Header: Tiêu đề & Phụ đề** | "QUẢN LÝ CHÍNH SÁCH", "Chúc Thọ & Hưu Trí..." | "QUẢN LÝ HỘ KHẨU", "Dữ liệu Hộ khẩu..." | **GIỮ NGUYÊN CONTENT**: Tuyệt đối không đổi text sang hộ khẩu. Áp dụng FORM: `text-sm font-black text-white tracking-tight` và `text-[11px] text-slate-400 font-medium mt-0.5`. |
| **Header: Huy hiệu xã** | Có `XÃ ĐĂK HÀ` | Có `XÃ ĐĂK HÀ` | **CHUẨN FORM**: `px-2 py-0.5 text-[10px] font-bold bg-emerald-950/80 text-emerald-300 rounded-full border border-emerald-800 uppercase tracking-wider`. |
| **Header: Controls** | Đã có Zoom, Theme, Village, Latency, User, Logout | Đã có Zoom, Theme, Village, Latency, User, Logout | **CHUẨN FORM**: Tinh chỉnh đúng pixel và bo góc: Zoom Pill `bg-slate-800 rounded-xl border border-slate-700`, Theme `34px × 34px rounded-xl`, Latency Pill `px-2.5 py-1.5 rounded-xl`. |
| **Sidebar: Mobile Drawer** | Chưa có Backdrop Overlay, chỉ đổi width co cụm `w-16` | Có Backdrop Overlay `bg-slate-950/60 backdrop-blur-xs z-30 md:hidden` và Drawer fixed `max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:shadow-2xl w-64` | **NÂNG CẤP FORM (P0)**: Áp dụng 100% Drawer Overlay và Backdrop từ QLHK vào `Sidebar.tsx` của QLCS để trải nghiệm mobile mượt mà, chuyên nghiệp. |
| **Sidebar: Tự đóng trên Mobile** | Chưa tự đóng khi click item trên mobile | Có `window.innerWidth < 768 && setSidebarCollapsed(true)` | **NÂNG CẤP HÀNH VI (P0)**: Thêm logic tự động thu gọn drawer khi người dùng chọn trang trên thiết bị di động. |
| **Sidebar: Danh Mục NavItems** | Quản Lý Thôn, Thống Kê, Hồ Sơ Chúc Thọ, Hưu Trí Xã Hội, Thùng Rác, Nhật Ký Hoạt Động, Cài Đặt | Quản Lý Thôn, Thống Kê, Hộ Gia Đình, Thùng Rác, Nhật Ký Hoạt Động, Cài Đặt | **GIỮ NGUYÊN CONTENT**: Giữ nguyên toàn bộ 7 mục nghiệp vụ và phân quyền Admin/Cán bộ thôn của QLCS (gồm cả icon `<Award />` cho Chúc Thọ). Áp dụng FORM: Bo góc `rounded-2xl`, min-height `48px`, active `bg-emerald-600 text-white shadow-md shadow-emerald-950/30`, hover `hover:bg-slate-800/50 hover:text-emerald-400`, text 2 dòng (title `13.5px bold` + desc `12px truncate`). |
| **Sidebar: Popover Tooltip khi Thu Gọn** | Có popover | Có popover | **CHUẨN FORM**: Bo góc `rounded-2xl`, viền `border-slate-700/90`, shadow `shadow-2xl`, padding `px-3.5 py-2`. |
| **Sidebar: Chân Footer** | `QLCS v3.0.0` | `QLHK v1.0.0` | **GIỮ NGUYÊN CONTENT**: Giữ chuỗi "QLCS v3.0.0". Áp dụng FORM: `ShieldCheck w-4 h-4 text-emerald-400`, padding `p-3.5`, viền `border-t border-slate-900`. |
| **AppLayout: Vùng Main** | `p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-900/30` | `p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-900/30` | **ĐÃ KHỚP HOÀN TOÀN**. |
| **Custom Scrollbars** | Thanh cuộn mặc định trình duyệt | Thanh cuộn 6px bo tròn với track/thumb theo theme | **NÂNG CẤP FORM (Layer 1)**: Đưa khối CSS `::-webkit-scrollbar` 6px từ QLHK vào `QLCS-Client/src/index.css`. |

---
*Bản đặc tả được lập bởi Subagent 2B (App Shell Architect) trong chiến dịch UI-Sync.*
