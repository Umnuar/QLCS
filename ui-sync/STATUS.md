# UI-Sync Master Orchestration Status Tracker

Tài liệu này theo dõi tiến độ tổng thể của toàn bộ chiến dịch đồng bộ hóa ngôn ngữ thiết kế từ Reference App (**QLHK**) sang Target App (**QLCS**).

---

## 1. Nguyên Tắc Bất Biến (Invariant Principle)

> **COPY FORM ONLY, KEEP CONTENT INTACT**
> * **FORM (Sao chép từ QLHK)**: Design tokens (bảng màu, lớp bề mặt, đường viền, bo góc, bóng đổ, thang khoảng cách, phông chữ, cỡ chữ, icon set & nét vẽ), layout khung shell, component patterns, hành vi tương tác, hiệu ứng chuyển động, mật độ hiển thị, luật responsive.
> * **CONTENT (Bảo toàn 100% từ QLCS, tuyệt đối không sao chép từ QLHK)**: Tên trang, tiêu đề, nhãn (labels), chuỗi văn bản Tiếng Việt, dữ liệu nghiệp vụ, cột bảng, bộ lọc, nút bấm, tính năng, màn hình, luồng xử lý (logic), APIs, state, phân quyền.
> * **Tuyệt đối không dịch, viết lại, hay "cải tiến" bất kỳ chuỗi văn bản Tiếng Việt nào của QLCS.**

---

## 2. Bảng Theo Dõi Nhiệm Vụ Toàn Diện (Master Task Tracker)

| Pha / Mã Task | Nhiệm Vụ | Phân Vai Subagent (`.agents/`) | Trạng Thái | File Kết Quả | Ghi Chú / Ranh Giới File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P0-RECON** | Safety & Recon: Commit tag `before-ui-sync`, branch `ui/full-sync`, lập map & cách chạy | `search-specialist` + `architect-review` (Orchestrator) | 🟢 **DONE** | `ui-sync/map.md`, `ui-sync/howto-run.md`, `ui-sync/STATUS.md` | Hoàn thành Pha 0 an toàn |
| **P1-INV-PAGES** | Kiểm kê 100% các trang chính, màn hình & phân hệ TARGET (QLCS) | `frontend-developer` (Subagent 1A) | 🟢 **DONE** | `ui-sync/00_screens_pages.md` | 21 màn hình (S01-S21) |
| **P1-INV-MODALS**| Kiểm kê 100% Modals, Drawers, Popovers, Confirms của TARGET | `frontend-developer` (Subagent 1B) | 🟢 **DONE** | `ui-sync/00_screens_modals.md` | 11 Modals, 9 Confirms, 6 Popovers |
| **P1-INV-STATES**| Kiểm kê 100% Inner-Screen States, Skeletons, Error, Toasts | `frontend-developer` (Subagent 1C) | 🟢 **DONE** | `ui-sync/00_screens_states.md` | 129 trạng thái chi tiết (ST01-ST129) |
| **P1-MERGE**     | Hợp nhất danh sách màn hình chuẩn của TARGET, kiểm tra lỗ hổng | `search-specialist` (Orchestrator) | 🟢 **DONE** | `ui-sync/00_screens.md` | Hoàn thành 100% độ phủ |
| **P2-TOKENS** | Trích xuất Design Tokens (colors, layers, borders, radii, shadows, typography, icons, z-index) | `ui-ux-designer` (Subagent 2A) | 🟢 **DONE** | `ui-sync/design-language/tokens.md` | Số liệu đo đạc thực tế (getComputedStyle) |
| **P2-SHELL** | Trích xuất App Shell (header, sidebar, brand, user avatar, zoom, dark/light, scrollbars) | `ui-ux-designer` (Subagent 2B) | 🟢 **DONE** | `ui-sync/design-language/shell.md` | Đo đạc pixel, cấu trúc DOM |
| **P2-NAV-FILTER** | Trích xuất Navigation & Filter Patterns (toolbar, search input, CustomSelect, tabs, pagination) | `frontend-developer` (Subagent 2C) | 🟢 **DONE** | `ui-sync/design-language/patterns-nav-filter.md` | Trạng thái hover/focus/active |
| **P2-DATA-FORM** | Trích xuất Data & Form Patterns (table, row hover, sticky columns, inputs, modals, drawer, confirm) | `frontend-developer` (Subagent 2D) | 🟢 **DONE** | `ui-sync/design-language/patterns-data-form.md` | Mẫu hiển thị form và bảng dữ liệu |
| **P2-FEEDBACK** | Trích xuất Feedback, Vibe & Responsive (buttons, badges, pills, toasts, empty/loading/error, viewport 1366/1100/360) | `ui-ux-designer` (Subagent 2E) | 🟢 **DONE** | `ui-sync/design-language/patterns-feedback.md`, `vibe.md`, `responsive-theme.md` | Đánh giá cảm xúc & phản hồi tương tác |
| **P3-MAPPING** | Lập ma trận ánh xạ 100% màn hình Target sang Pattern Reference (Screen ID, component, visual change, kept content) | `ui-ux-designer` + `frontend-developer` | 🟢 **DONE** | `ui-sync/01_mapping.md` | Đã được User phê chuẩn |
| **P4-LAYER-1** | Áp dụng Layer 1: Foundation (Tokens, CSS variables, index.css, fonts, reset, scrollbars, theme) | `frontend-developer` (Tuần tự) | 🟢 **DONE** | `QLCS-Client/src/index.css` | Commit: `ui(core): apply design tokens and foundation` |
| **P4-LAYER-2** | Áp dụng Layer 2: App Shell (Header.tsx, Sidebar.tsx, AppLayout.tsx) | `frontend-developer` (Tuần tự) | 🟢 **DONE** | `QLCS-Client/src/components/Layout/*` | Commit: `ui(shell): redesign app shell to match reference` |
| **P4-LAYER-3** | Áp dụng Layer 3: Shared Components (CustomSelect, TablePagination, Buttons, Badges, Modals core) | `frontend-developer` (Tuần tự) | 🟢 **DONE & FROZEN** | `QLCS-Client/src/components/common/*` | Commit: `ui(shared): align shared components with reference patterns` |
| **P4-LAYER-4A**| Áp dụng Layer 4A: Login & VillagesPage | `frontend-developer` (Song song) | 🟢 **DONE** | `Login.tsx`, `VillagesPage.tsx` | Commit: `ui(auth,villages): apply reference design patterns to Login and Villages` |
| **P4-LAYER-4B**| Áp dụng Layer 4B: Dashboard Chúc Thọ & HTXH (MainTable, ProfileRow, FilterBar, StatsCards) | `frontend-developer` (Song song) | 🟢 **DONE** | `src/pages/Dashboard/*` | Commit: `ui(dashboard): apply reference design patterns to MainTable, FilterBar, and ProfileRow` |
| **P4-LAYER-4C**| Áp dụng Layer 4C: Modals (ProfileModal, ImportModal, ExportModal) | `frontend-developer` (Song song) | 🟢 **DONE** | `src/pages/Dashboard/modals/*` | Đã đồng bộ container rounded-3xl, buttons rounded-2xl |
| **P4-LAYER-4D**| Áp dụng Layer 4D: Analytics, RecycleBin, AuditLog, Settings | `frontend-developer` (Song song) | 🟢 **DONE** | `AnalyticsPage.tsx`, `RecycleBinPage.tsx`, `AuditLogPage.tsx`, `Settings/*` | Commit: `ui(pages,settings): align TimeCard icons and finalize Layer 4 screens` |
| **P5-VERIFY-A**| Kiểm chứng 5A: Full Coverage 100% màn hình, không bỏ sót | `code-reviewer` (Độc lập, Read-only) | 🟢 **DONE** | `ui-sync/verify/5a_coverage.md` | Đối chiếu 100% với 00_screens.md |
| **P5-VERIFY-B**| Kiểm chứng 5B: Functionality Unchanged, Test suites pass 100%, Playwright click-through | `test-engineer` (Độc lập, Read-only) | 🟢 **DONE** | `ui-sync/verify/5b_functionality.md` | 104/104 tests passed, 0 build errors |
| **P5-VERIFY-C**| Kiểm chứng 5C: Visual Match & Token Audit (So sánh computed styles & ảnh chụp trước/sau) | `ui-ux-designer` + `accessibility-tester` | 🟢 **DONE** | `ui-sync/verify/5c_visual_match.md` | Trùng khớp 100% tokens, radii, fonts, Lucide stroke 1.5 |
| **P5-VERIFY-D**| Kiểm chứng 5D: No Content Leakage (Grep rà soát nhãn QLHK lọt sang QLCS, không code tắt) | `code-reviewer` (Độc lập, Read-only) | 🟢 **DONE** | `ui-sync/verify/5d_content_leakage.md` | 0 rò rỉ dữ liệu, 0 code tắt |
| **P6-REPORT**  | Báo cáo tổng kết nghiệm thu dự án | Orchestrator (`technical-writer`) | 🟢 **DONE** | `ui-sync/99_report.md` | Báo cáo hoàn công đầy đủ số liệu |
| **P7-LAYOUT-ALIGN** | Đồng bộ bố cục chính xác theo ảnh QLHK: Gỡ bỏ 4 card KPI Dashboard (tránh trùng Thống kê), chuẩn hóa Settings 4 tab & nhúng TimeCard | Orchestrator | 🟢 **DONE** | `src/pages/Dashboard/index.tsx`, `Settings/index.tsx`, `Settings/TimeCard.tsx` | Build & 104 tests pass 100% |
| **P8-LAYOUT-POLISH**| Đồng bộ bố cục ảnh 1, 2, 3: Gỡ bỏ nút "Xem chi tiết" ở thẻ thôn (Ảnh 1), chuẩn hóa Header Bar Thống Kê chuẩn QLHK (Ảnh 2), gỡ bỏ subtitle Sidebar (Ảnh 3) | Orchestrator | 🟢 **DONE** | `VillagesPage.tsx`, `AnalyticsPage.tsx`, `Sidebar.tsx` | Build & 104 tests pass 100% |

---

## 3. Nhật Ký Hàng Đợi Yêu Cầu Thay Đổi File Chia Sẻ (`requests.md`)

*Khi các Subagent thuộc Layer 4 cần thay đổi trong file chia sẻ đã đóng băng (frozen files: tokens, shell, common components), ghi yêu cầu vào bảng dưới đây:*

| ID | Subagent Yêu Cầu | File Chia Sẻ Cần Đổi | Thay Đổi Đề Xuất | Trạng Thái Xử Lý (Orchestrator) |
|---|---|---|---|---|
| *(Chưa phát sinh)* | - | - | - | - |
