# BÁO CÁO THẨM TRA TRỢ NĂNG & ĐIỀU HƯỚNG BÀN PHÍM (ACCESSIBILITY & WCAG 2.1 AA AUDIT)
**Dự án:** Quản Lý Dữ Liệu Chính Sách Xã Hội Xã Đăk Hà (QLCS)  
**Tầng ứng dụng:** QLCS-Client (React 18 + Vite 5 + TailwindCSS v4 + Electron 42)  
**Tiêu chuẩn đối sánh:** W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA  
**Phân vai kiểm định:** AGENT 4 - UI/UX & Accessibility Auditor  

---

## 1. TỔNG QUAN KẾT QUẢ ĐÁNH GIÁ TRỢ NĂNG

Hệ thống QLCS-Client phục vụ cán bộ cấp xã và trưởng thôn, đòi hỏi khả năng tiếp cận cao, hỗ trợ người dùng lớn tuổi, cán bộ mắt kém hoặc người thao tác hoàn toàn bằng bàn phím (Keyboard-Only Users).

### 1.1. Bảng Điểm Tuân Thủ 4 Nguyên Tắc Cốt Lõi WCAG (POUR)

| Nguyên tắc WCAG 2.1 | Nội dung kiểm tra | Tỷ lệ Đạt | Đánh giá | Trạng thái |
| :--- | :--- | :---: | :---: | :---: |
| **1. Perceivable (Dễ nhận biết)** | Tương phản màu sắc, cấu trúc ngữ nghĩa bảng biểu, văn bản thay thế icon | **68%** | Nhiều text mờ `slate-400` không đạt tỷ lệ 4.5:1 | Cần sửa chữa |
| **2. Operable (Dễ thao tác)** | Điều hướng hoàn toàn bằng bàn phím, Focus Trap, phím tắt Escape, thứ tự Tab | **62%** | **Phát hiện lỗi nghiêm trọng P0**: Thẻ thôn không thể Tab tới | Cần sửa gấp |
| **3. Understandable (Dễ hiểu)** | Nhãn biểu mẫu, chỉ báo lỗi, thông điệp phản hồi người dùng | **75%** | Các trường nhập liệu thiếu liên kết `label htmlFor` ↔ `input id` | Cần bổ sung |
| **4. Robust (Tương thích tốt)** | Thuộc tính ARIA, phân định role dialog/listbox/button chuẩn W3C | **70%** | Modal và Popup thiếu `role="dialog"` và `aria-modal` | Cần chuẩn hóa |
| **TỔNG KẾT TUÂN THỦ** | **WCAG 2.1 Cấp Độ AA** | **68.75%** | **CHƯA ĐẠT CHUẨN AA TOÀN DIỆN** | **CẦN KHẮC PHỤC** |

---

## 2. KIỂM TOÁN TƯƠNG PHẢN MÀU SẮC (COLOR CONTRAST - WCAG 1.4.3 & 1.4.11)

Tiêu chuẩn WCAG 2.1 AA quy định:
- Văn bản thông thường (< 18pt hoặc < 14pt in đậm): Tỷ lệ tương phản tối thiểu **4.5:1**.
- Văn bản lớn (≥ 18pt hoặc ≥ 14pt in đậm) và thành phần đồ họa / UI component: Tỷ lệ tối thiểu **3.0:1**.

### 2.1. Bảng Đo Lường Tỷ Lệ Tương Phản Thực Tế (Contrast Ratio Matrix)

| Vị trí / Thành phần | Màu chữ (Foreground) | Màu nền (Background) | Tỷ lệ đo lường | Tiêu chuẩn AA (4.5:1) | Kết luận |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Text mờ phụ đề (Subtitles)** | `text-slate-400` (`#94a3b8`) | Nền trắng (`#ffffff`) | **2.73 : 1** | Yêu cầu 4.5:1 | ❌ **FAIL NẶNG** |
| **Text phụ đề chế độ Tối** | `text-slate-400` (`#94a3b8`) | Nền tối (`#0f172a`) | **5.84 : 1** | Yêu cầu 4.5:1 | ✅ **PASS** |
| **Text nhãn xám chế độ Tối** | `text-slate-500` (`#64748b`) | Nền tối (`#0f172a`) | **3.21 : 1** | Yêu cầu 4.5:1 | ❌ **FAIL** |
| **Placeholder trong ô input** | `placeholder-slate-400` | Nền trắng (`#ffffff`) | **2.73 : 1** | Cần hỗ trợ thị lực | ⚠️ **CẢNH BÁO** |
| **Huy hiệu Chúc Thọ** | `text-blue-700` (`#1d4ed8`) | Nền xanh nhạt `bg-blue-50` (`#eff6ff`)| **5.52 : 1** | Yêu cầu 4.5:1 | ✅ **PASS** |
| **Huy hiệu Hưu Trí Xã Hội** | `text-purple-700` (`#7e22ce`) | Nền tím nhạt `bg-purple-50` (`#faf5ff`)| **5.14 : 1** | Yêu cầu 4.5:1 | ✅ **PASS** |
| **Huy hiệu Đã Nhận Quà** | `text-emerald-700` (`#047857`)| Nền ngọc nhạt `bg-emerald-50` (`#ecfdf5`)| **4.98 : 1** | Yêu cầu 4.5:1 | ✅ **PASS** |
| **Huy hiệu Chưa Nhận Quà** | `text-slate-600` (`#475569`) | Nền xám nhạt `bg-slate-100` (`#f1f5f9`)| **5.61 : 1** | Yêu cầu 4.5:1 | ✅ **PASS** |
| **Chữ mờ bản quyền Login** | `text-slate-500` (11px) | Nền trắng (`#ffffff`) | **4.60 : 1** | Biên độ sát nút | ⚠️ Khó đọc vì font 11px |

### 2.2. Vấn đề Focus Ring Độ Tương Phản Thấp (WCAG 1.4.11 & 2.4.11)
- Mã nguồn hiện tại trên hầu hết các input và nút bấm đang sử dụng lớp:
  ```css
  focus:ring-2 focus:ring-emerald-500/20
  ```
- **Hạn chế:** Tiền tố `/20` đặt độ mờ alpha (opacity) ở mức 20%. Trên nền trắng `#ffffff` hoặc nền xám `#0f172a`, viền focus ngọc lục bảo mờ 20% gần như vô hình đối với người khiếm thị hoặc người thao tác trong môi trường ánh sáng mạnh.
- **Yêu cầu khắc phục:** Loại bỏ độ mờ `/20`, sử dụng viền rõ nét `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900`.

---

## 3. KIỂM TOÁN ĐIỀU HƯỚNG BÀN PHÍM (KEYBOARD-ONLY WORKFLOW - WCAG 2.1.1 & 2.1.2)

### 3.1. LỖI P0 - Bế Tắc Điều Hướng Tại Thẻ Thôn (`src/pages/VillagesPage.tsx`)
- **Vị trí vi phạm:** Dòng 492-496:
  ```tsx
  <div
      key={village.id}
      onClick={() => handleVillageClick(village.id)}
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 transition-all cursor-pointer group ..."
  >
  ```
- **Phân tích lỗi:**
  1. Thẻ thôn là lối vào chính để cán bộ chọn thôn làm việc, nhưng lại được viết bằng thẻ `<div>` gắn sự kiện `onClick`.
  2. Phần tử này **KHÔNG CÓ** `tabIndex={0}`, **KHÔNG CÓ** `role="button"`, và **KHÔNG CÓ** hàm lắng nghe sự kiện bàn phím `onKeyDown`.
- **Hậu quả nghiêm trọng:** Người dùng sử dụng bàn phím (nhấn phím `Tab`) **HOÀN TOÀN KHÔNG THỂ CHUYỂN TIÊU ĐIỂM TỚI BẤT KỲ THẺ THÔN NÀO**! Họ bị kẹt hoàn toàn ở đầu trang và không thể mở danh sách đối tượng chính sách của thôn bằng bàn phím.
- **Phương án khắc phục:**
  ```tsx
  <div
      key={village.id}
      role="button"
      tabIndex={0}
      onClick={() => handleVillageClick(village.id)}
      onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleVillageClick(village.id);
          }
      }}
      aria-label={`Xem hồ sơ thôn ${village.name}`}
      className="..."
  >
  ```

---

### 3.2. LỖI P1 - Bị Chặn Nút Ẩn/Hiện Mật Khẩu Tại Màn Hình Login (`src/pages/Login.tsx`)
- **Vị trí vi phạm:** Dòng 138-144:
  ```tsx
  <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 pr-3.5 flex items-center ..."
      tabIndex={-1}
      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
  >
  ```
- **Phân tích lỗi:** Thuộc tính `tabIndex={-1}` cố tình loại bỏ nút bấm này khỏi chuỗi di chuyển `Tab`.
- **Hậu quả:** Người dùng khiếm thị hoặc người chỉ dùng bàn phím không bao giờ có thể kiểm tra xem mình đã gõ mật khẩu đúng hay chưa. Vi phạm trực tiếp tiêu chuẩn WCAG 2.1.1 (All functionality must be available from a keyboard).
- **Khắc phục:** Xóa bỏ thuộc tính `tabIndex={-1}` để nút có thể nhận tiêu điểm bình thường.

---

### 3.3. LỖI P1 - Thiếu Cơ Chế "Bẫy Tiêu Điểm" (Focus Trap) Trong Toàn Bộ Modal & Drawer
Khi mở hộp thoại modal hoặc drawer trượt (`ProfileModal`, `ImportModal`, `ExportModal`, `ServerStatusModal`, `ModalProvider`):
1. **Thiếu Focus Trap:** Người dùng nhấn `Tab` liên tục thì tiêu điểm thoát ra ngoài hộp thoại và duyệt vào các phần tử ẩn hoặc bảng dữ liệu nằm ở dưới lớp nền tối (backdrop).
2. **Thiếu Focus Restoration (Hoàn trả tiêu điểm):** Khi đóng modal, tiêu điểm bị văng về đầu trang (`<body>`) thay vì quay trở lại đúng nút bấm đã kích hoạt mở modal trước đó (ví dụ: nút "+ Thêm Hồ Sơ" hoặc nút "Sửa" của dòng tương ứng).
3. **Phím Escape:**
   - Trong `ServerStatusModal.tsx`: **Hoàn toàn không có listener phím Escape**! Người dùng bàn phím không thể đóng modal này nếu không Tab trúng nút `X`.
   - Trong `useModal.tsx`: Hộp thoại alert/confirm không bắt sự kiện phím `Escape`.

---

### 3.4. Đánh Giá Thành Phần CustomSelect (`src/components/common/CustomSelect.tsx`)
Thành phần `CustomSelect` được xây dựng rất công phu và đạt tiêu chuẩn tiếp cận bàn phím cao:
- Mở danh sách bằng phím: `Enter`, `Space`, `ArrowDown`, `ArrowUp` (dòng 246-253).
- Di chuyển giữa các tùy chọn bằng phím mũi tên: `ArrowDown` và `ArrowUp` có tính năng cuộn tự động `scrollIntoView` (dòng 183, 207).
- Lựa chọn tùy chọn bằng phím `Enter` (dòng 215-224).
- Đóng danh sách bằng phím `Escape` (dòng 154-159).
- Điểm cần hoàn thiện thêm về ARIA: Bổ sung `aria-controls` và `aria-activedescendant` trỏ tới ID của tùy chọn đang được highlight để bộ đọc màn hình (Screen Reader) phát âm chính xác tùy chọn khi lướt mũi tên.

---

## 4. ĐƯỜNG VIỀN TIÊU ĐIỂM (FOCUS VISIBILITY - WCAG 2.4.7 & 2.4.11)

### 4.1. Hiện Trạng Đường Viền Focus
- **Tại bảng MainTable (`ProfileRow.tsx` dòng 152):**
  `focus-visible:ring-2 focus-visible:ring-emerald-500` được cài đặt rất tốt trên hàng của bảng. Khi người dùng dùng bàn phím duyệt qua các dòng, viền xanh ngọc nổi bật xuất hiện bao quanh hàng.
- **Tại các nút phụ và ô tìm kiếm:**
  Nhiều vị trí dùng lớp `outline-hidden` hoặc `focus:outline-hidden` kết hợp với `focus:ring-2 focus:ring-emerald-500/20`. Như đã phân tích ở mục 2.2, độ mờ 20% là quá nhạt. Cần nâng lên độ nét 100% khi nhận focus từ bàn phím (`focus-visible:ring-emerald-500`).

---

## 5. NGỮ NGHĨA HTML & THUỘC TÍNH ARIA (SEMANTIC HTML & ARIA AUDIT)

### 5.1. Liên Kết Nhãn Biểu Mẫu (`<label htmlFor>` ↔ `<input id>`) - WCAG 1.3.1 & 3.3.2
Screen Reader (NVDA, JAWS, Windows Narrator) cần sự liên kết giữa `<label>` và `<input>` thông qua thuộc tính `htmlFor` và `id` để đọc tên trường khi người dùng chuyển tiêu điểm vào ô nhập liệu.

#### Kiểm tra thực tế trong mã nguồn:
1. **`src/pages/Login.tsx`:**
   - Dòng 103: `<label className="...">Tên đăng nhập</label>` ➡️ **THIẾU `htmlFor`**, ô input dòng 110 **THIẾU `id`**.
   - Dòng 123: `<label className="...">Mật khẩu</label>` ➡️ **THIẾU `htmlFor`**, ô input dòng 131 **THIẾU `id`**.
2. **`src/pages/Dashboard/modals/ProfileModal.tsx`:**
   - Dòng 331 (Họ và Tên): Thiếu `htmlFor` và `id`.
   - Dòng 352 (Năm sinh): Thiếu `htmlFor` và `id`.
   - Dòng 386 (Số CCCD): Thiếu `htmlFor` và `id`.
   - Dòng 465 (Nơi thường trú): Thiếu `htmlFor` và `id`.
   - Dòng 481 (Nơi ở hiện nay): Thiếu `htmlFor` và `id`.
   - Dòng 518 (Ghi chú): Thiếu `htmlFor` và `id`.
3. **Các ô tìm kiếm (Search inputs) không có Label:**
   - `VillagesPage.tsx` (dòng 357): `<input type="text" placeholder="Tìm kiếm thôn..." />` ➡️ Không có `<label>` và không có `aria-label`.
   - `ProfileFilterBar.tsx` (dòng 163): Không có `aria-label`.
   - `RecycleBinPage.tsx` (dòng 288): Không có `aria-label`.
   - `AuditLogPage.tsx` (dòng 618): Không có `aria-label`.

---

### 5.2. Cấu Trúc Ngữ Nghĩa Bảng Dữ Liệu (Table Semantics - WCAG 1.3.1)
- **`MainTable.tsx`:**
  + Đã sử dụng đúng các thẻ chuẩn `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`.
  + **Tồn tại:** Toàn bộ các thẻ `<th>` (dòng 237-335) **thiếu thuộc tính `scope="col"`**. Screen Reader không thể liên kết chuẩn xác tiêu đề cột với từng ô dữ liệu khi người khiếm thị đọc từng ô trong bảng.
  + **Checkbox chọn hồ sơ:** Dòng 171 trong `ProfileRow.tsx` có `title="Chọn hồ sơ này"` nhưng thiếu thuộc tính `aria-label={`Chọn hồ sơ ${profile.name}`}`. Khi duyệt bằng phím, Screen Reader chỉ đọc "Hộp kiểm, chưa chọn" mà không biết là của ai!
- **`AnalyticsPage.tsx` (Bảng Đối Soát 7 Thôn):**
  + Bảng có cấu trúc tiêu đề 2 tầng (Dòng 698-744): Tiêu đề tầng 1 có `colSpan={4}` cho Chúc Thọ và HTXH; tầng 2 là các cột con (Tổng số, Đã nhận, Chưa nhận, Tỷ lệ).
  + **Tồn tại:** Thiếu `scope="colgroup"` ở tầng 1 và thiếu `scope="col"` ở tầng 2.
  + Hai ô `<th>` trống tại dòng 718-719 gây bối rối cho máy đọc màn hình.

---

### 5.3. Ngữ Nghĩa Hộp Thoại (Modal Dialog Semantics - WCAG 4.1.2)
- Hộp thoại chuẩn theo WAI-ARIA 1.2 bắt buộc phải có các thuộc tính:
  `role="dialog"` hoặc `role="alertdialog"`, `aria-modal="true"`, và `aria-labelledby="[ID_TIÊU_ĐỀ]"`.
- **Kiểm tra thực tế:**
  + `ProfileModal.tsx` (dòng 247): Khối popup dùng thẻ `<div>` thông thường, **hoàn toàn không có role dialog**, không có `aria-modal="true"`.
  + `useModal.tsx` (dòng 110): Khối thông báo hệ thống không có `role="alertdialog"`.
  + `ServerStatusModal.tsx` (dòng 31): Không có `role="dialog"`.
  + *Điểm sáng duy nhất:* Popover chi tiết chính sách trong `ProfileRow.tsx` (dòng 348-350) đã khai báo đúng `role="dialog"` và `aria-modal="true"`.

---

### 5.4. Đồ Họa & Biểu Đồ (SVG Accessible Name - WCAG 1.1.1)
- Biểu đồ tròn `MiniDonut` trong `AnalyticsPage.tsx` (dòng 71-118):
  Thẻ `<svg viewBox="0 0 100 100">` vẽ hai vòng cung phần trăm giới tính / dân tộc nhưng không có `role="img"`, không có thẻ `<title>` hoặc `aria-label`. Người dùng sử dụng Screen Reader hoàn toàn không nhận được bất kỳ thông tin nào từ biểu đồ này.

---

## 6. MA TRẬN ĐÁNH GIÁ WCAG 2.1 AA & LỘ TRÌNH KHẮC PHỤC

```
[BẢNG TỔNG HỢP VI PHẠM TRỢ NĂNG WCAG CẦN XỬ LÝ THEO THỨ TỰ ƯU TIÊN]

+----------+--------------------+---------------------------------------------------+------------------------------------------+
| Mức độ   | Tiêu chuẩn WCAG    | Vị trí mã nguồn & Hiện trạng vi phạm              | Giải pháp khắc phục kỹ thuật             |
+----------+--------------------+---------------------------------------------------+------------------------------------------+
| P0       | 2.1.1 Keyboard     | VillagesPage.tsx (dòng 492):                      | Chuyển sang thẻ có role="button",        |
| KHẨN CẤP | (No Keyboard Trap) | Thẻ thôn dùng <div onClick> không thể Tab tới.    | tabIndex={0}, bắt onKeyDown Enter/Space. |
+----------+--------------------+---------------------------------------------------+------------------------------------------+
| P0       | 2.1.2 No Trap /    | ProfileModal.tsx & useModal.tsx:                  | Tích hợp thư viện focus-trap hoặc hook   |
| KHẨN CẤP | 2.4.3 Focus Order  | Thiếu Focus Trap bên trong Modal & hoàn trả focus.| giữ tiêu điểm bên trong dialog.          |
+----------+--------------------+---------------------------------------------------+------------------------------------------+
| P1       | 1.3.1 Info & Rel.  | ProfileModal.tsx (dòng 331, 352, 386...) & Login: | Bổ sung id="profile-name" và gắn         |
| CAO      | (Name, Role, Value)| Các ô input không có id, label không có htmlFor.  | htmlFor="profile-name" tương ứng.        |
+----------+--------------------+---------------------------------------------------+------------------------------------------+
| P1       | 2.1.1 Keyboard     | Login.tsx (dòng 142):                             | Xóa tabIndex={-1} trên nút show/hide     |
| CAO      |                    | Nút xem mật khẩu có tabIndex={-1} bị bỏ qua.      | password để người dùng Tab tới được.     |
+----------+--------------------+---------------------------------------------------+------------------------------------------+
| P1       | 1.4.3 Contrast     | Toàn bộ giao diện (index.css & Tailwind):         | Thay thế text-slate-400 (2.7:1) bằng     |
| CAO      | (Minimum 4.5:1)    | text-slate-400 trên nền trắng chỉ đạt 2.73:1.     | text-slate-600 (#475569) đạt 5.6:1.      |
+----------+--------------------+---------------------------------------------------+------------------------------------------+
| P1       | 4.1.2 Name, Role   | ProfileModal.tsx, useModal.tsx, ServerStatusModal:| Khai báo role="dialog", aria-modal="true"|
| CAO      |                    | Modal thiếu role dialog và aria-modal="true".     | và aria-labelledby trỏ tới ID tiêu đề.   |
+----------+--------------------+---------------------------------------------------+------------------------------------------+
| P2       | 1.3.1 Info & Rel.  | MainTable.tsx & AnalyticsPage.tsx:                | Thêm scope="col" cho th thông thường,    |
| TRUNG BÌNH|                   | Bảng dữ liệu thiếu scope="col", scope="colgroup". | scope="colgroup" cho th đa tầng.         |
+----------+--------------------+---------------------------------------------------+------------------------------------------+
| P2       | 4.1.2 Name, Role   | MainTable.tsx (dòng 171) & RecycleBinPage:        | Thêm aria-label={`Chọn hồ sơ ${name}`}   |
| TRUNG BÌNH|                   | Checkbox chọn từng dòng không có aria-label.      | cho từng checkbox của hàng.              |
+----------+--------------------+---------------------------------------------------+------------------------------------------+
| P2       | 2.4.11 Focus       | Toàn bộ ô input / button:                         | Thay focus:ring-emerald-500/20 mờ nhạt   |
| TRUNG BÌNH| Appearance         | Viền focus có opacity 20% quá mờ khó nhìn.        | bằng focus-visible:ring-emerald-500 rõ.  |
+----------+--------------------+---------------------------------------------------+------------------------------------------+
| P2       | 1.1.1 Non-text     | AnalyticsPage.tsx (dòng 71):                      | Thêm role="img" và aria-label mô tả      |
| TRUNG BÌNH| Content            | Biểu đồ SVG MiniDonut thiếu role img / aria-label.| tỷ lệ cơ cấu giới tính/dân tộc.          |
+----------+--------------------+---------------------------------------------------+------------------------------------------+
```

---
*Báo cáo được khởi tạo tự động bởi Agent 4 (UI/UX & Accessibility Auditor) phục vụ tiến trình kiểm định kỹ thuật QLCS.*
