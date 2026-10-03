# Ghi Chú Giao Diện & Quy Ước Thiết Kế (UI Notes)

## 1. Chính Sách Hiển Thị CCCD (Căn cước công dân)

### 1.1 Trạng thái hiện tại: KHÔNG BẮT BUỘC
- CCCD hiện không bắt buộc trong cơ sở dữ liệu và quy trình nghiệp vụ chính sách.
- **Quy tắc hiển thị**:
  - Không tô nền đỏ cho dòng khi thiếu CCCD.
  - Không có vạch đỏ `border-l-[3px] border-l-rose-500` ở mép trái dòng.
  - Không hiển thị dòng chữ phụ "Thiếu CCCD" dưới họ tên.
  - Ô CCCD khi không có dữ liệu hiển thị trung tính dạng dấu gạch ngang `"—"` bằng chữ xám nhạt (`text-slate-400 dark:text-slate-500 font-normal tabular-nums`), giống như các trường dữ liệu tùy chọn khác.
  - Màu đỏ (`rose-500`, `rose-600`) trong giao diện chỉ dành riêng cho các hành động nguy hiểm (xóa hồ sơ, lỗi hệ thống thực sự).

### 1.2 Lịch sử và thông tin phục hồi (Git Revert / Restore)
- **Commit đã gỡ bỏ logic cảnh báo thiếu CCCD**:
  - Commit trước đó chứa styling cảnh báo thiếu CCCD: `4e21f2d` (`feat(ui): standardize table header, seamless sticky cells, instant gift toggle with undo toast`).
  - Gỡ bỏ hoàn toàn ở commit kế tiếp: Gỡ bỏ `isMissingCccd`, các class đỏ và nhãn cảnh báo.
- **Các selector / class và vị trí mã nguồn đã gỡ bỏ**:
  1. `src/pages/Dashboard/components/ProfileRow.tsx`:
     - Biến cờ:
       ```ts
       const isMissingCccd = activeTab === "chuctho" && (!profile.cccd || !String(profile.cccd).trim() || String(profile.cccd).trim() === "—" || String(profile.cccd).trim() === "0");
       ```
     - Class gán nền dòng: `rowMissingCccd` (`bg-rose-50 dark:bg-rose-950/60`).
     - Class gán nền ô sticky: `stickyBgMissingCccd` (`bg-rose-50 dark:bg-rose-950/60`).
     - Vạch đỏ bên trái checkbox:
       ```tsx
       isMissingCccd ? "border-l-[3px] border-l-rose-500" : "border-l-[3px] border-l-transparent"
       ```
     - Dòng phụ dưới họ và tên:
       ```tsx
       {isMissingCccd && (
           <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
               Thiếu CCCD
           </span>
       )}
       ```
     - Chữ đỏ trong ô CCCD:
       ```tsx
       <span className="tabular-nums text-xs font-bold text-rose-600 dark:text-rose-400">
           Chưa có
       </span>
       ```
  2. `src/components/common/tableStyles.ts`:
     - `TABLE_STYLES.rowMissingCccd` và `TABLE_STYLES.stickyBgMissingCccd` đã được quy về style nền trung tính chuẩn (`bg-white dark:bg-slate-900`).
- **Cách khôi phục khi CCCD trở thành bắt buộc trong tương lai**:
  - Dùng `git revert` hoặc tham chiếu lại các đoạn mã trên trong `ProfileRow.tsx` và `tableStyles.ts`.

---

## 2. Hệ Thống Thông Báo Dùng Chung (Shared Toast System)

- **Vị trí component**: `src/components/common/Toast.tsx`
- **Tích hợp Context**: Được bọc toàn cục qua `<ToastProvider>` tại `src/App.tsx`.
- **Hook sử dụng**: `useToast()`
  - `showToast({ message, type, duration, actionKey, onUndo, undoLabel })`
  - `success(message, options)`
  - `error(message, options)`
  - `info(message, options)`
- **Đặc tính kỹ thuật**:
  - `position: fixed; bottom: 24px (bottom-6)` căn giữa theo khung nhìn, không phụ thuộc cấu trúc bảng, `z-index: 50`.
  - Trên mobile: Chiều rộng co giãn gần hết màn hình (`w-full px-4 max-w-[480px]`).
  - Thanh đếm ngược tiến trình (countdown bar) mảnh ở mép dưới toast (~5s), tự động tạm dừng khi rê chuột (`hover`) hoặc người dùng focus phím (`focus-within`). Tôn trọng `prefers-reduced-motion` (ẩn bar khi kích hoạt).
  - Ngăn xếp (Stacking): Tối đa 3 toast theo cơ chế FIFO (cũ nhất bị đẩy ra).
  - Tự động thay thế (`actionKey`): Khi cùng một hành động lặp lại (vd bấm toggle quà trên cùng một người), cập nhật trực tiếp toast hiện tại thay vì tạo thêm toast mới.
  - Phím tắt `Escape`: Đóng ngay thông báo gần nhất.
  - Hỗ trợ trợ năng: `role="status"` / `role="alert"`, `aria-live="polite"` / `aria-live="assertive"`, không cướp focus của người dùng trên bảng.
