/**
 * Shared Table Styling and Formatting Conventions
 * Áp dụng thống nhất cho các bảng danh sách theo chuẩn thiết kế QLHK / QLCS
 */

// Định dạng số chuẩn Việt Nam: ngăn cách hàng nghìn bằng dấu chấm (.), dấu thập phân bằng dấu phẩy (,)
export function formatVietnameseNumber(
	value: number | string | null | undefined,
	decimals = 0,
): string {
	if (value === null || value === undefined || value === "") return "—";
	const num =
		typeof value === "string" ? parseFloat(value.replace(/,/g, ".")) : value;
	if (isNaN(num)) return String(value);

	const parts = num.toFixed(decimals).split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	return parts.join(",");
}

export const TABLE_STYLES = {
	// Khung thẻ bao ngoài bo góc lớn + bóng mềm
	card: "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors duration-150",

	// Thanh tiêu đề phía trên: Tên danh sách bên trái + Mẹo bên phải
	headerBar:
		"p-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs",
	cardHeader:
		"p-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs",
	headerTitle:
		"text-slate-800 dark:text-slate-200 font-bold text-sm",
	headerTip:
		"text-xs text-slate-500 dark:text-slate-400 font-medium px-2 flex items-center gap-1.5",

	// Vùng cuộn bảng dữ liệu
	scrollArea: "overflow-x-auto overflow-y-auto flex-1 max-h-[620px] relative custom-scrollbar",
	scrollContainer: "overflow-x-auto overflow-y-auto flex-1 max-h-[620px] relative custom-scrollbar",
	table: "w-full text-left border-collapse text-xs table-fixed min-w-[1200px]",

	// Header bảng: Chuẩn QLNN Kinh Tế - nền đặc tách rõ khỏi data rows, sticky top-0, bóng nhẹ khi cuộn
	thead: "sticky top-0 z-20 select-none shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.3)]",
	headerRow:
		"bg-slate-50 dark:bg-slate-800 border-b border-slate-200/90 dark:border-slate-700/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none",
	th: "py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-b border-slate-200/90 dark:border-slate-700/80 select-none whitespace-nowrap",
	thCenter:
		"py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-b border-slate-200/90 dark:border-slate-700/80 text-center select-none whitespace-nowrap",
	thRight:
		"py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-b border-slate-200/90 dark:border-slate-700/80 text-right select-none whitespace-nowrap",

	// Cột cố định sticky header (Checkbox, STT, Họ và Tên bên trái; Thao tác bên phải)
	thStickyLeft:
		"py-3.5 px-2 text-center w-12 min-w-[48px] max-w-[48px] sticky left-0 z-30 bg-slate-50 dark:bg-slate-800 border-b border-slate-200/90 dark:border-slate-700/80 select-none whitespace-nowrap",
	thStickyLeftStt:
		"py-3.5 px-2 text-center w-14 min-w-[56px] max-w-[56px] sticky left-12 z-30 bg-slate-50 dark:bg-slate-800 border-b border-slate-200/90 dark:border-slate-700/80 tabular-nums select-none whitespace-nowrap",
	thStickyLeftName:
		"py-3.5 px-3 text-left sticky left-[104px] z-30 bg-slate-50 dark:bg-slate-800 border-b border-slate-200/90 dark:border-slate-700/80 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)] dark:shadow-[3px_0_6px_-2px_rgba(0,0,0,0.3)] select-none whitespace-nowrap",
	thStickyRight:
		"py-3.5 px-2 text-center w-24 min-w-[96px] max-w-[96px] sticky right-0 z-30 bg-slate-50 dark:bg-slate-800 border-b border-slate-200/90 dark:border-slate-700/80 shadow-[-6px_0_12px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-6px_0_12px_-2px_rgba(0,0,0,0.3)] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none whitespace-nowrap",

	// Header có thể sắp xếp (hover đổi màu nhẹ)
	thSortable:
		"cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors group",

	// Dòng dữ liệu chuẩn: Chiều cao ~52px, nền trắng, hover xám rất nhạt, chỉ kẻ ngang mảnh
	rowBase:
		"min-h-[52px] bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800/80 text-[13px] outline-hidden",
	rowSelected:
		"min-h-[52px] bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100/80 dark:hover:bg-emerald-900 transition-colors border-b border-slate-100 dark:border-slate-800/80 text-[13px] outline-hidden",
	rowMissingCccd:
		"min-h-[52px] bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800/80 text-[13px] outline-hidden",

	// Ô dữ liệu: không có border dọc
	td: "py-3 px-3 border-b border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 align-middle",
	tdCenter:
		"py-3 px-2 text-center border-b border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 align-middle whitespace-nowrap",
	tdRight:
		"py-3 px-3 text-right tabular-nums text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 align-middle whitespace-nowrap",

	// Cột số (STT, Năm sinh, CCCD, Tiền): tabular-nums (không dùng font-mono)
	numberCell:
		"tabular-nums text-xs text-slate-700 dark:text-slate-300",

	// Cột cố định (Sticky) ở body với bóng đổ chống đè chữ
	stickyLeftCheckbox:
		"sticky left-0 z-10 w-12 min-w-[48px] max-w-[48px] py-3 px-2 text-center border-b border-slate-100 dark:border-slate-800/80 transition-colors",
	stickyLeftStt:
		"sticky left-12 z-10 w-14 min-w-[56px] max-w-[56px] py-3 px-2 text-center border-b border-slate-100 dark:border-slate-800/80 tabular-nums text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors whitespace-nowrap",
	stickyLeftName:
		"sticky left-[104px] z-10 py-3 px-3 text-left border-b border-slate-100 dark:border-slate-800/80 transition-colors shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)] dark:shadow-[3px_0_6px_-2px_rgba(0,0,0,0.25)]",
	stickyRightAction:
		"py-2.5 px-3 text-center w-24 min-w-[96px] max-w-[96px] sticky right-0 z-10 whitespace-nowrap border-b border-slate-100 dark:border-slate-800/80 transition-colors shadow-[-6px_0_12px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-6px_0_12px_-2px_rgba(0,0,0,0.3)]",

	// Nền ô sticky: ĐỒNG BỘ 100% CÙNG TÔNG VỚI DÒNG Ở MỌI TRẠNG THÁI (Bình thường, Hover, Đang chọn)
	stickyBgBase:
		"bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800",
	stickyBgSelected:
		"bg-emerald-50 dark:bg-emerald-950 group-hover:bg-emerald-100/80 dark:group-hover:bg-emerald-900",
	stickyBgMissingCccd:
		"bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800",

	// Badge thôn: Viền xanh lá, nền xanh lá rất nhạt (chuẩn duy nhất)
	villageBadge:
		"inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50/70 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/70 select-none whitespace-nowrap",

	// Badge mức tuổi trung tính: xám trung tính, chỉ tô màu khi các giá trị khác nhau
	neutralAgeBadge:
		"inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/90 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 select-none whitespace-nowrap",

	// Nút thao tác: Đúng 32px (w-8 h-8), icon stroke 1.75
	actionBtn:
		"w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer select-none",
	actionEdit:
		"text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 dark:text-slate-400 dark:hover:text-emerald-300",
	actionDelete:
		"text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 dark:text-slate-400 dark:hover:text-rose-300",
};

export const tableStyles = TABLE_STYLES;
