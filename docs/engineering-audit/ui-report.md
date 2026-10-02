# BÁO CÁO THẨM TRA GIAO DIỆN NGƯỜI DÙNG (UI/UX AUDIT REPORT)
**Dự án:** Quản Lý Dữ Liệu Chính Sách Xã Hội Xã Đăk Hà (QLCS)  
**Tầng ứng dụng:** QLCS-Client (React 18 + Vite 5 + TailwindCSS v4 + Electron 42)  
**Phân vai kiểm định:** AGENT 4 - UI/UX & Accessibility Auditor  
**Tiêu chuẩn đối sánh:** 20 Core Engineering Rules, QLHK/QLNN Design Standard, Chromium Desktop Table Spec  

---

## 1. TỔNG QUAN ĐÁNH GIÁ (EXECUTIVE SUMMARY)

Báo cáo thẩm tra toàn diện 7 màn hình và hệ thống thành phần dùng chung của QLCS-Client nhằm đánh giá tính tiện dụng (Usability), tính nhất quán hệ thống (Design Tokens Consistency), các trạng thái tương tác phản hồi (Interactive States), và năng lực phòng chống lỗi người dùng (Error Prevention).

### 1.1. Bảng Điểm Đánh Giá UI/UX Toàn Hệ Thống

| Màn hình / Thành phần | Design Tokens | Trạng thái Tương tác | Phòng chống Lỗi | Điểm Đánh giá | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Login.tsx** | 9/10 | 8/10 | 8/10 | **8.3 / 10** | Đạt yêu cầu cơ bản |
| **2. VillagesPage.tsx** | 8/10 | 5/10 (Thiếu Skeleton & Empty) | 6/10 (Thiếu anti-double click) | **6.3 / 10** | Cần nâng cấp |
| **3. Dashboard/index.tsx** | 9/10 | 6/10 (Table thiếu Skeleton & Empty) | 5/10 (Bug đóng modal khi lỗi) | **6.7 / 10** | Cần nâng cấp gấp |
| **4. AnalyticsPage.tsx** | 8/10 (Dùng màu Teal/Amber) | 5/10 (Silent catch, thiếu Skeleton) | 7/10 | **6.7 / 10** | Cần nâng cấp |
| **5. RecycleBinPage.tsx** | 9/10 | 8/10 (Có Loading & Empty) | 7/10 (Thiếu disabled khi batch) | **8.0 / 10** | Khá tốt |
| **6. AuditLogPage.tsx** | 9/10 | 8/10 (Có Visual Diff tốt) | 7/10 (Silent catch API) | **8.0 / 10** | Khá tốt |
| **7. Settings/index.tsx** | 9/10 | 8/10 (Phân 5 tab chuẩn) | 8/10 (Bảo vệ tài khoản admin) | **8.3 / 10** | Khá tốt |
| **ĐÁNH GIÁ CHUNG TOÀN HỆ THỐNG** | **8.6 / 10** | **6.7 / 10** | **6.9 / 10** | **7.4 / 10** | **KHÁ - CẦN KHẮC PHỤC 3 BUG P0** |

---

## 2. THẨM TRA CHI TIẾT TOÀN BỘ 7 MÀN HÌNH

### 2.1. Màn hình 1: Đăng Nhập (`src/pages/Login.tsx`)
- **Vai trò:** Cổng xác thực cán bộ (Admin xã hoặc Trưởng thôn).
- **Phân tích Design Tokens:**
  - Nền chuẩn: `bg-slate-50 dark:bg-slate-950`.
  - Khối form: `rounded-2xl`, viền trên nhấn `border-t-4 border-t-emerald-600`.
  - Ô nhập liệu & nút bấm: `rounded-xl`, chiều cao chuẩn `h-12` dễ thao tác.
  - Icon: Đồng bộ `lucide-react` với `strokeWidth={1.5}`.
- **Trạng thái tương tác:**
  - *Loading:* Nút submit hiển thị spinner tròn (`w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin`) và chuyển sang `disabled={isLoading}`.
  - *Error:* Thông báo lỗi rõ ràng qua khối cảnh báo `AlertCircle`, nền `bg-rose-50 border-rose-200 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300`.
  - *Disabled:* Chặn thao tác khi đang gửi request.
  - *Hover/Active:* Nút bấm có `hover:bg-emerald-700 active:scale-[0.99]`.
- **Phòng ngừa lỗi (Error Prevention):**
  - Đã có cơ chế chặn double-click tại dòng 28: `if (isLoading) return;`.
  - Đã chuẩn hóa chuỗi đăng nhập tự động `username.trim().toLowerCase()`.
- **Tồn tại:**
  - Chưa có cơ chế hiển thị lỗi validation nội dòng (inline validation) khi người dùng vừa rời ô input (onBlur), chỉ báo lỗi tổng khi submit.

---

### 2.2. Màn hình 2: Quản Lý Thôn & Địa Bàn (`src/pages/VillagesPage.tsx`)
- **Vai trò:** Cán bộ Xã (`admin`) quản trị 7 thôn, điều hướng nhanh sang Thống kê / Danh sách hồ sơ của từng thôn.
- **Phân tích Design Tokens:**
  - Banner Tổng quan: Gradient `from-emerald-800 via-emerald-700 to-emerald-900 text-white rounded-3xl p-6 shadow-xl`.
  - 4 Thẻ KPI: `rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800`.
  - Lưới thẻ thôn: `rounded-3xl p-5 border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]`.
  - Màu phân loại: Sử dụng `text-blue-500` cho Chúc Thọ và `text-purple-500` cho Hưu Trí Xã Hội. Đây là sự phân định có chủ đích giữa 2 chế độ chính sách, nhưng cần kiểm soát độ bão hòa để không phá vỡ tông màu Emerald chủ đạo.
- **Trạng thái tương tác (Thiếu hụt nghiêm trọng):**
  - *Loading State:* **HOÀN TOÀN THIẾU**. Khi mở trang hoặc đổi bộ lọc, hàm `fetchVillageStats` chạy bất đồng bộ (dòng 52-99). Trong thời gian chờ, biến `overview` là `null`, toàn bộ 4 thẻ KPI hiển thị số 0 và tỷ lệ `0.0%`, sau đó bất ngờ giật nảy số liệu khi API hoàn tất. Không hề có Skeleton hay Spinner tải trang!
  - *Empty State:* **HOÀN TOÀN THIẾU**. Tại dòng 436: `filteredVillages.map(...)`. Nếu người dùng gõ từ khóa tìm kiếm thôn không khớp (ví dụ: "Thôn 99"), danh sách trả về mảng rỗng, giao diện để trống một khoảng trắng hoang vu mà không có thông điệp "Không tìm thấy thôn nào phù hợp".
  - *Error State:* Tại dòng 74-98, khi API lỗi, ứng dụng ghi log cảnh báo và ngầm nạp từ IndexedDB. Nhưng nếu cả IndexedDB cũng không có dữ liệu, không có bất kỳ thông báo cảnh báo ngoại tuyến hoặc nút "Thử lại" nào được hiển thị cho người dùng.
- **Phòng ngừa lỗi (Error Prevention):**
  - **LỖI P1 - Thiếu cờ chống submit lặp:**
    + Hàm `handleCreate` (dòng 180-200): Không có cờ `isSubmitting`. Nếu cán bộ bấm nút "Lưu Thôn Mới" liên tiếp 2 lần do mạng chậm, hệ thống sẽ gửi 2 request tạo thôn trùng lặp!
    + Tương tự với hàm `handleUpdate` (dòng 134-152): Không có trạng thái vô hiệu hóa nút "Lưu" khi đang gửi dữ liệu.

---

### 2.3. Màn hình 3: Quản Lý Hồ Sơ Chúc Thọ & Hưu Trí (`src/pages/Dashboard/index.tsx`)
Bao gồm các thành phần: `MainTable.tsx`, `ProfileRow.tsx`, `ProfileFilterBar.tsx`, `StatsCards.tsx`, `YearSelector.tsx`, `ProfileModal.tsx`, `ImportModal.tsx`, `ExportModal.tsx`.
- **Phân tích Design Tokens:**
  - Header Island: `rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800`.
  - Bộ lọc phẳng `ProfileFilterBar`: `rounded-2xl p-2.5 sm:p-3`, tích hợp ô tìm kiếm, chọn năm `YearSelector`, dropdown `CustomSelect`.
  - MainTable: `rounded-3xl border border-slate-200/90 overflow-hidden`, bảng phẳng đạt chuẩn `whitespace-nowrap`, ghim cứng cột Checkbox (`sticky left-0`), ghim cứng cột Thao tác (`sticky right-0`), header ghim đỉnh (`sticky top-0`).
- **Trạng thái tương tác:**
  - *Thao tác hàng loạt (Bulk Actions):* Thanh công cụ nổi đáy trang (`floating bottom action toolbar`, dòng 173-229 trong `MainTable.tsx`) có thiết kế xuất sắc: bo góc `rounded-2xl`, hiệu ứng kính mờ `backdrop-blur-md`, trượt lên mượt mà khi `selectedIds.size > 0` và tự ẩn khi không chọn.
  - *Loading State:* **THIẾU TRONG BẢNG CHÍNH**. Component `MainTable` hoàn toàn không nhận prop `isLoading`. Khi đang phân trang hoặc đổi bộ lọc, bảng hiển thị dữ liệu cũ hoặc trống rỗng mà không có shimmer skeleton để người dùng biết hệ thống đang truy vấn.
  - *Empty State:* **THIẾU**. Tại dòng 338-368 của `MainTable.tsx`: nếu `paginatedProfiles.length === 0`, thẻ `<tbody>` hoàn toàn rỗng! Không có dòng thông báo "Không có hồ sơ nào" hoặc "Không tìm thấy hồ sơ phù hợp với điều kiện lọc".
- **Phòng ngừa lỗi & Lỗ hổng nghiêm trọng (Critical Findings):**
  - **LỖI P0 - BUG ĐÓNG MODAL LÀM MẤT SẠCH DỮ LIỆU KHI LƯU THẤT BẠI:**
    + Bằng chứng tại `src/pages/Dashboard/index.tsx` (dòng 271-286):
      ```typescript
      const handleSaveProfileFromModal = async (formData: any) => {
          const success = await handleSave(formData, isNewProfile ? null : formData.id);
          if (success) {
              setIsProfileModalOpen(false);
              showAlert({ title: "Thành công", message: "...", type: "success" });
          }
      };
      ```
      Hàm `handleSaveProfileFromModal` **KHÔNG CÓ LỆNH `return success;`**, do đó nó luôn trả về `undefined`.
    + Bằng chứng tại `src/pages/Dashboard/modals/ProfileModal.tsx` (dòng 228-231):
      ```typescript
      const saveResult = await onSave(payload);
      if ((saveResult as any) !== false) {
          onClose(); // <-- LUÔN CHẠY VÌ undefined !== false LÀ TRUE!
      }
      ```
      **HẬU QUẢ:** Khi lưu hồ sơ gặp lỗi (mất mạng, server trả về lỗi 400 validation, hoặc 409 Conflict), thông báo lỗi hiện lên nhưng `ProfileModal` **VẪN BỊ ĐÓNG NGAY LẬP TỨC**! Toàn bộ thông tin họ tên, năm sinh, địa chỉ, số CCCD người dùng vừa nhập dở bị hủy sạch, người dùng phải nhập lại từ đầu!
  - **LỖI P1 - Thiếu cảnh báo Dirty State khi đóng Modal:**
    + Trong `ProfileModal.tsx` (dòng 133, 243, 310, 623), người dùng bấm phím `Escape`, click vào khoảng tối nền (backdrop), hoặc nút "Hủy Bỏ" / "X" thì modal đóng ngay lập tức mà không kiểm tra xem form đã có dữ liệu nhập dở hay chưa.
  - **LỖI P1 - Hiện tượng Stale UI khi chuyển tab nhanh giữa Chúc Thọ và Hưu Trí:**
    + Trong `useProfiles.ts` (dòng 77-124), hàm `loadPage` gọi `api.getProfiles` bất đồng bộ nhưng **không sử dụng `AbortController`**. Khi người dùng chuyển tab nhanh từ Chúc Thọ sang HTXH rồi quay lại, request cũ của HTXH có thể phản hồi sau cùng, dẫn tới ghi đè danh sách hồ sơ HTXH vào giao diện Chúc Thọ.

---

### 2.4. Màn hình 4: Thống Kê & Báo Cáo Đối Soát (`src/pages/AnalyticsPage.tsx`)
- **Vai trò:** Cung cấp biểu đồ cơ cấu dân số, đối tượng chính sách và bảng đối soát 7 thôn.
- **Phân tích Design Tokens:**
  - Card bao: `rounded-3xl p-5 border border-slate-200 dark:border-slate-800`.
  - Biểu đồ Donut SVG `MiniDonut`: Vẽ thuần bằng SVG stroke-dasharray, nhúng thông số trung tâm rõ ràng.
  - **Điểm lệch màu (Rogue Colors):**
    + Dòng 475: Dùng `text-teal-600 dark:text-teal-400` ("Đạt X% toàn địa bàn") thay vì màu chuẩn `text-emerald-600`.
    + Dòng 569: Dùng `bg-amber-500` và viền `#f59e0b` cho "Dân tộc khác", trong khi các danh mục khác dùng dải màu Emerald/Slate/Blue/Purple.
- **Trạng thái tương tác:**
  - *Loading State:* Cờ `loading` chỉ kích hoạt icon xoay nhỏ `RefreshCw` ở góc phải (dòng 429). Toàn bộ 4 thẻ KPI, 2 biểu đồ tròn, 2 thanh phân bổ độ tuổi và bảng đối soát vẫn giữ nguyên số liệu cũ hoặc nhấp nháy mà không có khung skeleton tải nội dung.
  - *Error State (Silent Failure):* Tại dòng 256-258:
    ```typescript
    } catch (err) {
        console.error("Analytics load error:", err);
    } finally {
        setLoading(false);
    }
    ```
    Khi backend sập hoặc mất kết nối, lỗi bị nuốt hoàn toàn vào `console.error`! Giao diện không hề hiển thị bất kỳ cảnh báo lỗi, banner thông báo, hay nút thử lại nào.
- **Bảng đối soát 7 thôn:**
  - Cấu trúc: Đạt chuẩn Chromium Table Rule với `border-separate border-spacing-0 whitespace-nowrap`.
  - Có dòng chân bảng tổng cộng `<tfoot>` nổi bật, phân định rõ ràng giữa Chúc Thọ và HTXH.

---

### 2.5. Màn hình 5: Thùng Rác & Phục Hồi Dữ Liệu (`src/pages/RecycleBinPage.tsx`)
- **Vai trò:** Quản lý và khôi phục các hồ sơ bị xóa mềm (`is_deleted = true`).
- **Phân tích Design Tokens:**
  - Màu sắc ngữ nghĩa rất chuẩn: Tông Rose chủ đạo (`bg-rose-50`, `text-rose-700`, `border-rose-200`) cho hành động xóa/nguy hiểm, kết hợp Emerald cho nút "Khôi Phục".
  - Bo góc chuẩn: Khối bao `rounded-3xl`, nút bấm `rounded-xl` và `rounded-2xl`.
- **Trạng thái tương tác:**
  - *Loading State:* Rất tốt! Tại dòng 340-350, có hiển thị dòng `<tr><td colSpan={8}>` kèm icon `RefreshCw` xoay tròn và thông điệp "Đang tải danh sách hồ sơ đã xóa...".
  - *Empty State:* Có xử lý hiển thị dòng "Thùng rác hiện đang trống" khi không có bản ghi (dòng 352-360).
  - *Tồn tại:* Khi người dùng gõ từ khóa tìm kiếm không khớp, bảng vẫn hiện "Thùng rác hiện đang trống" thay vì phân biệt rõ "Không tìm thấy hồ sơ phù hợp".
- **Phòng ngừa lỗi (Error Prevention):**
  - Đã tích hợp hộp thoại xác nhận `showConfirm` 2 tầng cho hành động "Xóa vĩnh viễn" (Hard Delete) với cảnh báo mức độ `error` màu đỏ.
  - *Thiếu cờ disabled trong thao tác hàng loạt:* Tại hàm `handleBatchRestore` (dòng 138-164) và `handleBatchHardDelete` (dòng 165-190), nút bấm trên thanh công cụ không bị vô hiệu hóa trong lúc đang thực thi `Promise.all`, người dùng có thể bấm nhiều lần liên tiếp.

---

### 2.6. Màn hình 6: Nhật Ký Biến Động / Kiểm Toán (`src/pages/AuditLogPage.tsx`)
- **Vai trò:** Cán bộ Xã (`admin`) giám sát lịch sử thay đổi thông tin hồ sơ theo dòng thời gian (Timeline).
- **Phân tích Design Tokens & Tính Năng Đột Phá:**
  - Dòng thời gian Timeline: Trục đứng `border-l-2 border-slate-200 dark:border-slate-800`, các node tròn phân màu theo từng loại hành động (`CREATE`, `UPDATE`, `DELETE`, `RESTORE`, `IMPORT`, `STATUS_CHANGE`).
  - **Visual Diff tiếng Việt xuất sắc:** Hàm `renderFriendlyDiff` (dòng 264-516) dịch các thay đổi JSON thành giao diện trực quan: `Giá trị cũ (gạch ngang đỏ) → Giá trị mới (đậm xanh emerald)`.
- **Trạng thái tương tác:**
  - *Loading State:* Đã có spinner "Đang tải nhật ký kiểm soát..." khi danh sách ban đầu rỗng. Nút "Tải Thêm Dữ Liệu" có trạng thái "Đang tải thêm..." và `disabled={loading}`.
  - *Empty State:* Có thông điệp "Không tìm thấy sự kiện biến động nào phù hợp với bộ lọc."
  - *Error State:* Lỗi truy vấn API tại dòng 166 bị nuốt vào `console.error` mà không hiển thị thông báo lỗi lên giao diện.

---

### 2.7. Màn hình 7: Cài Đặt Hệ Thống & Cán Bộ (`src/pages/Settings/index.tsx`)
- **Vai trò:** Cấu hình tài khoản, phân công cán bộ thôn, sao lưu CSDL, thông tin đơn vị và thiết lập năm tính tuổi.
- **Phân tích Bố cục & Design Tokens:**
  - Cấu trúc 5 Tab chuẩn hóa: `profile`, `users`, `backup`, `system`, `time`.
  - Nút chuyển Tab: `rounded-xl`, tab đang chọn có `bg-emerald-600 text-white shadow-xs`.
  - Các khối chức năng: `rounded-3xl p-6 border border-slate-200 dark:border-slate-800`.
- **Phòng ngừa lỗi (Error Prevention):**
  - Rất chặt chẽ:
    + Dòng 280-286: Chặn tuyệt đối hành vi xóa tài khoản Quản trị viên tối cao (`admin`).
    + Dòng 289-296: Chặn tự xóa tài khoản đang đăng nhập hiện tại.
    + Dòng 80-84 trong `BackupRestoreTab.tsx`: Bắt buộc xác nhận cảnh báo nguy hiểm trước khi ghi đè CSDL từ file JSON.
- **Điểm không nhất quán phiên bản (Inconsistency Finding):**
  - Trong `Settings/index.tsx` (dòng 1250): Hiển thị phiên bản là `v3.0.0 (Online-First)`.
  - Nhưng trong `src/components/network/ServerStatusModal.tsx` (dòng 144): Lại hiển thị cứng phiên bản là `v2.0.0`. Cần đồng bộ hóa để tránh gây nhầm lẫn cho cán bộ nghiệm thu.

---

## 3. TÍNH NHẤT QUÁN CỦA DESIGN SYSTEM (DESIGN TOKENS AUDIT)

### 3.1. Bảng Màu Hệ Thống (Color Palette)

| Vai trò màu | Token Tailwind | Sử dụng thực tế trong mã nguồn | Đánh giá tính nhất quán |
| :--- | :--- | :--- | :--- |
| **Màu chủ đạo (Primary)** | `emerald-600` / `emerald-500` | Header viền, nút submit, tab active, trạng thái thành công | **Chuẩn xác 100%** |
| **Màu nền (Background)** | `slate-50` / `dark:bg-slate-950` | Nền body, nền bảng, nền dropdown | **Chuẩn xác 100%** |
| **Màu thẻ (Surface/Card)** | `white` / `dark:bg-slate-900` | Card nội dung, Modal, Drawer, Table wrapper | **Chuẩn xác 100%** |
| **Màu viền (Border)** | `slate-200` / `dark:border-slate-800` | Toàn bộ đường bao, phân cách hàng bảng | **Chuẩn xác 100%** |
| **Màu Chúc Thọ (Tag)** | `blue-50` / `blue-600` | Huy hiệu mức tuổi, cột phân loại Chúc thọ | Chấp nhận được (mang tính phân loại nghiệp vụ) |
| **Màu Hưu Trí (Tag)** | `purple-50` / `purple-600` | Huy hiệu diện hưởng HTXH, cột phân loại HTXH | Chấp nhận được (mang tính phân loại nghiệp vụ) |
| **Màu lệch (Rogue Color 1)** | `teal-600` (`AnalyticsPage:475`) | Tỷ lệ hoàn thành đối soát | **Lệch token**: Nên chuyển thành `emerald-600` |
| **Màu lệch (Rogue Color 2)** | `amber-500` (`AnalyticsPage:569`) | Cơ cấu dân tộc thiểu số | Cần chuẩn hóa sắc độ đồng bộ |

### 3.2. Bo Góc Chuẩn Hóa (Border Radius Consistency)

| Cấp độ thành phần | Quy chuẩn Token | Hiện trạng kiểm tra mã nguồn | Đánh giá |
| :--- | :--- | :--- | :--- |
| **Modal / Drawer Dialog** | `rounded-3xl` | `ProfileModal`, `ImportModal`, `ExportModal`, `DeleteConfirm` đều dùng `rounded-3xl` | **ĐẠT CHUẨN** |
| **Card bao / Khung Table** | `rounded-3xl` / `rounded-2xl` | `MainTable` (`rounded-3xl`), StatsCards (`rounded-3xl`), FilterBar (`rounded-2xl`) | **ĐẠT CHUẨN** |
| **Button / Ô nhập liệu** | `rounded-xl` / `rounded-2xl` | Input (`rounded-xl`), Button chính (`rounded-xl` / `rounded-2xl`) | **ĐẠT CHUẨN** |
| **Huy hiệu (Badge) / Tag** | `rounded-lg` / `rounded-full` | Nhãn tuổi (`rounded-lg`), pill trạng thái (`rounded-full`) | **ĐẠT CHUẨN** |

### 3.3. Typography & Bảng Dữ Liệu
- **Font chữ:** Khai báo chuẩn tại `index.css` dòng 29: `"Be Vietnam Pro", system-ui, sans-serif` hỗ trợ tiếng Việt đầy đủ không bị lỗi dấu.
- **Font số liệu / Mã:** Khai báo chuẩn `font-mono`: `"JetBrains Mono", monospace` áp dụng cho STT, Ngày sinh, CCCD, Tỷ lệ %, tạo cảm giác chuyên nghiệp, căn thẳng cột số.
- **Chromium Desktop Table Rule:** Đã áp dụng `whitespace-nowrap` trên toàn bộ bảng `MainTable`, `AnalyticsPage`, `RecycleBinPage`, `AuditLogPage`, ngăn chặn hiện tượng nhảy dòng chữ vụn vặt gây méo bảng.

### 3.4. Tính Đồng Bộ Icon (Iconography)
- Toàn bộ ứng dụng sử dụng thư viện `lucide-react`.
- Quy tắc `strokeWidth={1.5}` được ghim toàn cục tại `index.css` (dòng 53-55):
  ```css
  svg.lucide {
    stroke-width: 1.5;
  }
  ```
  Nhờ đó, 100% icon trên tất cả màn hình đều có nét mảnh thanh lịch, đồng nhất, không bị icon nét đậm nét nhạt hoặc hộp vuông thô kệch.

---

## 4. MA TRẬN TRẠNG THÁI TƯƠNG TÁC (INTERACTION STATES MATRIX)

| Màn hình | Loading State | Empty State | Error State | Disabled State | Hover / Active |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Login** | Spinner trên nút | N/A | Khối Alert rõ ràng | Vô hiệu hóa nút khi gửi | Mượt mà (`scale-[0.99]`) |
| **VillagesPage** | **THIẾU** (Nhảy số) | **THIẾU** (Trắng trang) | Ghi console, không báo UI | **THIẾU** trên form thêm thôn | Có hover zoom nhẹ |
| **Dashboard** | **THIẾU** trên Table | **THIẾU** (Bảng trống) | Alert popup OCC | Nút xuất excel disabled | Rất tốt trên hàng bảng |
| **AnalyticsPage** | Spinner nhỏ góc | Có dòng bảng trống | **THIẾU** (Nuốt lỗi) | Có trên nút refresh | Có |
| **RecycleBin** | Dòng Spinner bảng | Có thông điệp rỗng | Alert popup | **THIẾU** khi xóa hàng loạt | Đầy đủ |
| **AuditLog** | Spinner ban đầu | Có thông điệp rỗng | Nuốt lỗi API | Có trên nút tải thêm | Đầy đủ |
| **Settings** | Có spinner các nút | Có dòng bảng rỗng | Alert popup | Vô hiệu hóa khi đang lưu | Đầy đủ |

---

## 5. BẢNG PHÂN TÍCH LỖI VÀ KẾ HOẠCH HÀNH ĐỘNG (ACTIONABLE REMEDIATION)

```
[BẢNG TỔNG HỢP VẤN ĐỀ UI/UX CẦN XỬ LÝ THEO THỨ TỰ ƯU TIÊN]

+------+------------+-------------------------------------------------------+------------------------------------------+
| Mức  | File       | Vấn đề phát hiện                                      | Giải pháp khắc phục đề xuất              |
+------+------------+-------------------------------------------------------+------------------------------------------+
| P0   | Dashboard/ | Hàm handleSaveProfileFromModal không return success,  | Thêm "return success;" vào dòng 276      |
|      | index.tsx  | khiến ProfileModal luôn đóng mất dữ liệu khi lỗi.     | Dashboard/index.tsx.                     |
+------+------------+-------------------------------------------------------+------------------------------------------+
| P1   | MainTable. | Khi paginatedProfiles rỗng, tbody rỗng hoàn toàn,     | Thêm component EmptyStateTableRow khi    |
|      | tsx        | không có thông điệp báo không tìm thấy hồ sơ.        | paginatedProfiles.length === 0.          |
+------+------------+-------------------------------------------------------+------------------------------------------+
| P1   | MainTable. | Bảng dữ liệu chính thiếu Skeleton Loading khi chuyển   | Bổ sung prop isLoading và render 5 dòng  |
|      | tsx        | trang hoặc đổi bộ lọc tìm kiếm.                       | SkeletonTableRow khi đang nạp dữ liệu.   |
+------+------------+-------------------------------------------------------+------------------------------------------+
| P1   | Villages-  | Thẻ thôn dùng <div onClick> không có tabIndex/role,  | Thêm tabIndex={0}, role="button", xử lý  |
|      | Page.tsx   | thiếu Skeleton KPI và thiếu EmptyState khi tìm kiếm.  | onKeyDown Enter/Space, thêm Skeleton.    |
+------+------------+-------------------------------------------------------+------------------------------------------+
| P1   | Profile-   | Bấm Escape hoặc click backdrop đóng modal ngay làm    | Bổ sung state isDirty và hộp thoại xác   |
|      | Modal.tsx  | mất trắng dữ liệu người dùng đang nhập dở.            | nhận trước khi đóng nếu form có dữ liệu. |
+------+------------+-------------------------------------------------------+------------------------------------------+
| P2   | Analytics- | Nuốt lỗi try-catch ở fetchData và dùng màu text-teal  | Thêm ErrorBanner thông báo và đổi màu    |
|      | Page.tsx   | thay vì emerald-600.                                  | về token chuẩn text-emerald-600.         |
+------+------------+-------------------------------------------------------+------------------------------------------+
| P2   | Settings & | ServerStatusModal ghi cứng v2.0.0 trong khi hệ thống  | Đồng bộ hiển thị v3.0.0 từ package.json. |
|      | StatusModal| là v3.0.0.                                            |                                          |
+------+------------+-------------------------------------------------------+------------------------------------------+
```

---
*Báo cáo được khởi tạo tự động bởi Agent 4 (UI/UX & Accessibility Auditor) phục vụ tiến trình kiểm định kỹ thuật QLCS.*
