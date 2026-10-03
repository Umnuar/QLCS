# Reference Design Language: Feedback, Alerts, Buttons & States

> **Source**: Reference App (`C:\Projects\QLHK\QLHK-Client`)  
> **Extraction Type**: Visual & Code Invariant Specification  
> **Invariant Principle**: Copy FORM only (colors, radii, animations, typography, icons, layout). Keep TARGET app CONTENT intact (never rewrite Vietnamese text, labels, or data).

---

## 1. Button Design Hierarchy

All buttons in the reference app follow strict ergonomics:
- **Font**: Be Vietnam Pro, `text-xs` (12px) or `text-sm` (13.5px), `font-bold` (700).
- **Height**: Standard `h-10` (40px) on toolbars and Header Island; compact `h-8` or `h-9` in filters/tables.
- **Radii**: `rounded-2xl` (16px) for standard action buttons; `rounded-xl` (12px) for table action triggers; `rounded-full` (9999px) for primary CTA pills.
- **Transitions**: `transition-all active:scale-[0.99] cursor-pointer`.
- **Icons**: Lucide icons `w-4 h-4` with `strokeWidth={1.5}`.

### 1.1 Primary CTA Button (Action Chính)
Used for: Thêm mới, Lưu dữ liệu, Xác nhận chính.
```tsx
<button
  type="button"
  className="h-10 flex items-center justify-center gap-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-[0.99] cursor-pointer"
>
  <Plus className="w-4 h-4" strokeWidth={1.5} />
  <span>{targetLabel}</span>
</button>
```

### 1.2 Secondary / Surface Button (Hành động phụ / Xuất nhập Excel)
Used for: Nhập Excel, Xuất Excel, Đổi danh mục, Hủy bỏ trong modals.
```tsx
<button
  type="button"
  className="h-10 flex items-center gap-1.5 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all active:scale-[0.99] cursor-pointer border border-slate-200 dark:border-slate-700"
>
  <FileSpreadsheet className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
  <span>Nhập Excel</span>
</button>
```
*Note on Excel Buttons*:
- **Nhập Excel**: Background `bg-slate-100 dark:bg-slate-800`, text `text-slate-700 dark:text-slate-200`, Icon `FileSpreadsheet text-emerald-600`.
- **Xuất Excel**: Background `bg-slate-100 dark:bg-slate-800`, text `text-slate-700 dark:text-slate-200`, Icon `Download text-blue-600`.
- *Zero orange/amber buttons for Excel actions.*

### 1.3 Destructive / Bulk Delete Button (Xóa hàng loạt)
Used for: Xóa các mục đã chọn, Xóa vĩnh viễn.
```tsx
<button
  type="button"
  className="h-10 flex items-center gap-1.5 px-3.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold transition-all border border-rose-200 dark:border-rose-800 cursor-pointer animate-in fade-in"
>
  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
  <span>{targetLabel}</span>
</button>
```

### 1.4 Table Row Inline Action Buttons
Used for: Sửa, Xóa, Chi tiết, Khôi phục trên từng hàng dữ liệu.
```tsx
<div className="flex items-center justify-center gap-1">
  {/* Edit */}
  <button
    type="button"
    title="Sửa thông tin"
    className="p-1.5 text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-xl transition-colors cursor-pointer"
  >
    <Edit3 strokeWidth={1.5} className="w-4 h-4" />
  </button>

  {/* Delete */}
  <button
    type="button"
    title="Xóa"
    className="p-1.5 text-slate-400 hover:text-rose-700 dark:text-slate-400 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-xl transition-colors cursor-pointer"
  >
    <Trash2 strokeWidth={1.5} className="w-4 h-4" />
  </button>
</div>
```

---

## 2. Badges, Tags & Status Pills

### 2.1 Status Badges (Trạng Thái Nghiệp Vụ)
Padding `px-2.5 py-0.5`, `rounded-md` (6px) or `rounded-lg` (8px), font `text-[11px] font-bold border`:
- **Thường trú / Active / Hoàn thành**:
  `bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800`
- **Tạm trú / Đang xử lý / In-progress**:
  `bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800`
- **Tạm vắng / Chờ duyệt / Warning**:
  `bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800`
- **Chuyển đi / Đã hủy / Inactive / Mặc định**:
  `bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700`
- **Lỗi / Vi phạm / Danger**:
  `bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800`

### 2.2 Category / Village / Area Badge
Used for: Thôn, Đơn vị hành chính, Phân loại.
```tsx
<span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold border bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
  {categoryName}
</span>
```

### 2.3 Status Notice / Offline Cache Banner Badge
Used on Header Island when operating offline or on cached data:
```tsx
<div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold shadow-xs animate-in fade-in">
  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block mr-1.5" />
  <span>{statusNoticeText}</span>
</div>
```

---

## 3. Global Alerts & Network Banners

### 3.1 Connection State Banners (Thanh thông báo trạng thái mạng)
Placed immediately below the Global Header (`top-16`):

- **Success / Reconnected Banner**:
```tsx
<div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs animate-in slide-in-from-top duration-300">
  <CheckCircle2 className="w-4 h-4" />
  <span>Đã khôi phục kết nối thành công — Dữ liệu đã được đồng bộ tự động thời gian thực!</span>
</div>
```

- **Offline / Server Lost Banner**:
```tsx
<div className="bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
  <div className="flex items-center gap-2">
    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />
    <span><strong>Mất kết nối tới máy chủ - Đang hoạt động ở chế độ ngoại tuyến (Offline)</strong></span>
  </div>
  <button
    onClick={onRetry}
    className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
  >
    <RefreshCw className="w-3.5 h-3.5" />
    <span>Thử kết nối ngay</span>
  </button>
</div>
```

---

## 4. Confirmation Dialogs & System Modals

All confirmation dialogs (Xác nhận xóa, Cảnh báo xung đột, Thông báo hoàn thành) use a centered portal modal:
- Backdrop: `fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in`
- Container: `w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95`
- Header:
  - Warning/Conflict: `p-5 px-6 border-b border-slate-200 dark:border-slate-800 bg-amber-50/70 dark:bg-amber-950/30 flex items-center justify-between` with `w-10 h-10 rounded-2xl bg-amber-500 text-white`
  - Info/Success: `bg-emerald-50/70 dark:bg-emerald-950/30` with `bg-emerald-600 text-white`
  - Destructive: `bg-rose-50/70 dark:bg-rose-950/30` with `bg-rose-600 text-white`
- Action Buttons Bar:
  `p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-end gap-3`

---

## 5. Loading States & Skeletons

### 5.1 Inline Table Loading
Replaces `<tbody>` rows when fetching data:
```tsx
<tr>
  <td colSpan={totalColumns} className="py-16 text-center text-slate-400 dark:text-slate-500">
    <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
    <span className="font-bold text-sm">Đang tải dữ liệu...</span>
  </td>
</tr>
```

### 5.2 Page Suspense / Lazy Module Loading
Used in lazy router boundaries:
```tsx
<div className="flex flex-col items-center justify-center py-20 min-h-[300px]">
  <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-3" />
  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
    Đang tải dữ liệu phân hệ...
  </span>
</div>
```

### 5.3 Fullscreen Initialization Screen
Used during initial session authentication check:
```tsx
<div className="min-h-screen w-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-900 dark:text-white">
  <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
    Đang khởi tạo phiên làm việc...
  </div>
</div>
```

---

## 6. Empty States

### 6.1 Empty Table / Search Result
Used when `data.length === 0`:
```tsx
<tr>
  <td colSpan={totalColumns} className="py-16 text-center text-slate-400 dark:text-slate-500">
    <div className="text-base font-bold text-slate-600 dark:text-slate-300">
      Không tìm thấy dữ liệu phù hợp
    </div>
    <p className="text-xs text-slate-400 mt-1">
      Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
    </p>
  </td>
</tr>
```

### 6.2 Empty Recycle Bin
Used when no soft-deleted items exist:
```tsx
<tr>
  <td colSpan={totalColumns} className="py-16 text-center text-slate-400 dark:text-slate-500">
    <div className="text-base font-bold text-slate-600 dark:text-slate-300">
      Thùng rác hiện đang trống
    </div>
    <p className="text-xs text-slate-400 mt-1">
      Không có bản ghi nào bị xóa tạm
    </p>
  </td>
</tr>
```
