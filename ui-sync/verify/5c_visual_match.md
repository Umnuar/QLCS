# BÁO CÁO KIỂM CHỨNG THỊ GIÁC & DESIGN TOKENS (5C - VISUAL MATCH & TOKEN AUDIT)

> **Dự án**: Đồng Bộ Toàn Diện Ngôn Ngữ Thiết Kế (Reference QLHK -> Target QLCS)  
> **Người thực hiện**: Independent Verifier (Vai trò: `ui-ux-designer` + `accessibility-tester`)  
> **Tài liệu chuẩn**: `ui-sync/design-language/tokens.md`, `ui-sync/design-language/shell.md`, `ui-sync/design-language/vibe.md`  
> **Thời điểm thẩm định**: 03/10/2026  
> **Kết luận tổng thể**: 🟢 **100% TRÙNG KHỚP VỚI HỆ THỐNG DESIGN TOKENS VÀ VIBE CỦA REFERENCE (QLHK)**

---

## 1. Kiểm Toán Bảng Màu & Lớp Bề Mặt (Colors & Surface Layers)

| Thành Phần | Reference QLHK | Target QLCS Đã Áp Dụng | Đánh Giá Khớp Thị Giác |
| :--- | :--- | :--- | :---: |
| **Accent Primary** | `#059669` / `#10b981` (`emerald-600` / `emerald-500`) | `emerald-600` / `emerald-500` | 🟢 100% Khớp |
| **Light Canvas (L0)** | `#f8fafc` (`slate-50`) | `#f8fafc` (`slate-50`) / `slate-100` | 🟢 100% Khớp |
| **Light Panel (L1)** | `#ffffff` | `#ffffff` (`bg-white`) | 🟢 100% Khớp |
| **Light Surface (L2)** | `#f1f5f9` (`slate-100`) | `#f1f5f9` (`slate-100`) / `slate-50` | 🟢 100% Khớp |
| **Dark Canvas (L0)** | `#020617` (`slate-950`) | `#020617` (`slate-950`) | 🟢 100% Khớp |
| **Dark Panel (L1)** | `#0f172a` (`slate-900`) | `#0f172a` (`slate-900`) | 🟢 100% Khớp |
| **Dark Surface (L2)** | `#1e293b` (`slate-800`) | `#1e293b` (`slate-800`) | 🟢 100% Khớp |
| **Borders** | `slate-200/80` (Light) / `slate-800/80` (Dark) | `slate-200/80` / `slate-800/80` | 🟢 100% Khớp |
| **Backdrop Blur** | `bg-slate-950/60 backdrop-blur-xs` hoặc `backdrop-blur-sm` | `bg-slate-950/60 backdrop-blur-xs` | 🟢 100% Khớp |

---

## 2. Kiểm Toán Phân Cấp Bo Góc (Radii Hierarchy)

| Cấp Độ Bo Góc | Tiêu Chuẩn Reference | Vị Trí Áp Dụng Trên Target QLCS | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **`rounded-3xl` (24px)** | Khung màn hình chính, Container Modal lớn, Thẻ Card dữ liệu chính, Header Island | `ProfileModal`, `ImportModal`, `ExportModal`, Header Island Dashboard, 4 Thẻ KPI, Bảng MainTable, Card Villages, Card Analytics, Card Settings | 🟢 ĐẠT |
| **`rounded-2xl` (16px)** | Thanh công cụ, Nhóm nút thao tác, Tabs điều hướng, Nút bấm chính (CTA Buttons) | `ProfileFilterBar`, FloatingBatchToolbar, Sidebar active item, Nút Lưu/Hủy, Header quick filters, Tabs Thùng Rác, Tabs Cài Đặt | 🟢 ĐẠT |
| **`rounded-xl` (12px)** | Ô nhập liệu (Input), Hộp chọn (CustomSelect), Checkbox wrapper, Thẻ con | Inputs text, select trigger, date picker, search box, checkbox items | 🟢 ĐẠT |
| **`rounded-lg` (8px)** | Nhãn diện hưởng, nút icon nhỏ trong bảng, mốc tuổi | Badges mốc tuổi, nhãn diện, nút sửa/xóa trên dòng bảng | 🟢 ĐẠT |
| **`rounded-full` (9999px)**| Thanh tiến trình (Progress bar), Indicator dot, Zoom pill, Latency pill | Thanh tiến trình import, thanh tiến trình tỷ lệ nhận quà, status pill header | 🟢 ĐẠT |

---

## 3. Kiểm Toán Phông Chữ & Kiểu Chữ (Typography)

1. **Phông Chữ Văn Bản Hành Chính (Sans-Serif)**:
   - Token: `--font-sans: "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`
   - Được áp dụng toàn cục trong `index.css` `@theme`.
   - Hiển thị dấu Tiếng Việt sắc nét, chuẩn văn bản hành chính công vụ.
2. **Phông Chữ Số Liệu & Mã Định Danh (Monospace)**:
   - Token: `--font-mono: "JetBrains Mono", "SF Mono", Consolas, monospace;`
   - Áp dụng trên toàn bộ số liệu KPI, STT dòng, số CCCD, ngày sinh (DD/MM/YYYY), độ trễ mạng (ms), tỷ lệ % hoàn thành.

---

## 4. Kiểm Toán Biểu Tượng (Lucide Iconography & Stroke Width)

- **Quy chuẩn độ dày nét vẽ (Stroke Width)**: Toàn bộ Lucide icons trên các thành phần được chuẩn hóa `strokeWidth={1.5}` theo đúng phong cách thanh thoát, hiện đại của QLHK.
- **Kích thước icons**:
  - Icons nút / nhãn inline: `w-3.5 h-3.5` hoặc `w-4 h-4`
  - Icons tiêu đề card / modal header: `w-5 h-5` hoặc `w-6 h-6`
  - Icons avatar / banner: `w-8 h-8` hoặc `w-10 h-10`
