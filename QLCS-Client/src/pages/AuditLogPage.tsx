import {
	Activity,
	ArrowDownCircle,
	Award,
	Clock,
	Eye,
	FileSpreadsheet,
	Filter,
	History,
	MapPin,
	Plus,
	RefreshCw,
	RotateCcw,
	Search,
	Trash2,
	UserCheck,
	User as UserIcon,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "../AppContext";
import { type AuditLogItem, auditApi } from "../api/auditApi";
import { type UserItem, usersApi } from "../api/usersApi";
import { CustomSelect } from "../components/common/CustomSelect";

const FIELD_LABELS: Record<string, string> = {
	name: "Họ và tên",
	full_name: "Họ và tên",
	dob: "Năm sinh / Ngày sinh",
	dob_formatted: "Ngày tháng năm sinh",
	gender: "Giới tính",
	cccd: "Số CCCD",
	cccd_last4: "4 số cuối CCCD",
	ethnicity: "Dân tộc",
	religion: "Tôn giáo",
	residence: "Hộ khẩu thường trú",
	currentAddress: "Nơi ở hiện nay",
	current_address: "Nơi ở hiện nay",
	address: "Địa chỉ cư trú",
	received: "Trạng thái nhận quà",
	notes: "Ghi chú",
	note: "Ghi chú",
	village_id: "Mã thôn",
	village_name: "Thôn",
	calculation_year: "Năm tính toán",
	age_milestone: "Mốc tuổi chúc thọ",
	age60: "Tròn 60 tuổi",
	age65: "Tròn 65 tuổi",
	age70: "Tròn 70 tuổi",
	age75: "Tròn 75 tuổi",
	age80: "Tròn 80 tuổi",
	age85: "Tròn 85 tuổi",
	age90: "Tròn 90 tuổi",
	age95: "Tròn 95 tuổi",
	age100: "Tròn 100 tuổi",
	age_over_100: "Trên 100 tuổi",
	age75plus: "Đủ 75 tuổi trở lên",
	age70to74poor: "70-74 tuổi hộ nghèo",
	bao_tro: "Bảo trợ xã hội",
	huu_tri: "Hưu trí",
	huu_tuat_bao_hiem: "Hưu tuất / Bảo hiểm",
	nguoi_co_cong: "Người có công",
	file_name: "Tên tệp Excel",
	imported_count: "Số bản ghi nhập",
	added_count: "Số thêm mới",
	updated_count: "Số cập nhật",
};

const IGNORED_FIELDS = new Set([
	"id",
	"version",
	"created_at",
	"updated_at",
	"is_deleted",
	"deleted_at",
	"village_id",
	"name_unaccented",
	"cccd_hash",
	"user_id",
	"ip_address",
	"password_hash",
]);

function formatValue(val: unknown, fieldKey?: string): string {
	if (val === null || val === undefined || val === "") return "(Trống)";
	if (typeof val === "boolean") {
		if (fieldKey === "received") {
			return val ? "Đã nhận quà" : "Chưa nhận quà";
		}
		return val ? "Có" : "Không";
	}
	if (typeof val === "object") {
		if (Array.isArray(val)) return `${val.length} mục`;
		return JSON.stringify(val);
	}
	return String(val);
}

export const AuditLogPage: React.FC = () => {
	const { user, villages, selectedVillageId, setSelectedVillageId } = useApp();
	const isAdmin = user?.role === "admin";

	// Filters
	const [actionFilter, setActionFilter] = useState<string>("ALL");
	const [villageFilter, setVillageFilter] = useState<string>(
		selectedVillageId || "",
	);
	const [profileTypeFilter, setProfileTypeFilter] = useState<string>("");
	const [userFilter, setUserFilter] = useState<string>("");
	const [search, setSearch] = useState<string>("");

	// Đồng bộ bộ lọc Thôn khi chọn trên header/sidebar
	useEffect(() => {
		setVillageFilter(selectedVillageId || "");
	}, [selectedVillageId]);

	const activeFiltersCount = [
		Boolean(search.trim()),
		Boolean(villageFilter),
		Boolean(profileTypeFilter),
		Boolean(userFilter),
		Boolean(actionFilter !== "ALL"),
	].filter(Boolean).length;

	const handleClearAll = () => {
		setSearch("");
		setVillageFilter("");
		setSelectedVillageId("");
		setProfileTypeFilter("");
		setUserFilter("");
		setActionFilter("ALL");
	};

	// Data & Pagination
	const [logs, setLogs] = useState<AuditLogItem[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [page, setPage] = useState<number>(1);
	const [limit] = useState<number>(15);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [userList, setUserList] = useState<UserItem[]>([]);

	// Tải danh sách cán bộ để phục vụ bộ lọc
	useEffect(() => {
		usersApi
			.getUsers()
			.then((data) => setUserList(data || []))
			.catch((err) => console.warn("Lỗi tải danh sách người dùng:", err));
	}, []);

	// Truy vấn Audit Logs từ API
	const fetchLogs = useCallback(
		async (currentPage: number, append = false) => {
			setLoading(true);
			try {
				const selectedUserObj = userList.find((u) => u.username === userFilter);
				const res = await auditApi.getAuditLogs({
					page: currentPage,
					limit,
					villageId: villageFilter || undefined,
					userId: selectedUserObj?.id,
					username: userFilter || undefined,
					action: actionFilter !== "ALL" ? actionFilter : undefined,
					profileType: profileTypeFilter || undefined,
					search: search.trim() || undefined,
				});

				let data = res.data || [];
				if (userFilter) {
					data = data.filter(
						(item) =>
							item.user?.username === userFilter ||
							item.user_id === selectedUserObj?.id,
					);
				}

				if (append) {
					setLogs((prev) => [...prev, ...data]);
				} else {
					setLogs(data);
				}
				setTotal(userFilter ? data.length : res.pagination?.total || 0);
				setTotalPages(userFilter ? 1 : res.pagination?.totalPages || 1);
			} catch (err) {
				console.error("Lỗi khi tải nhật ký hoạt động:", err);
			} finally {
				setLoading(false);
			}
		},
		[
			actionFilter,
			villageFilter,
			profileTypeFilter,
			userFilter,
			userList,
			search,
			limit,
		],
	);

	useEffect(() => {
		setPage(1);
		fetchLogs(1, false);
	}, [fetchLogs]);

	// Nút Tải thêm dữ liệu
	const handleLoadMore = () => {
		if (page < totalPages && !loading) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchLogs(nextPage, true);
		}
	};

	// Cấu hình nhãn & màu sắc theo từng loại Action
	const getActionConfig = (action: string) => {
		switch (action?.toUpperCase()) {
			case "CREATE":
				return {
					label: "Thêm Mới",
					colorBadge:
						"bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
					dotBg: "bg-emerald-500 ring-emerald-100 dark:ring-emerald-950",
					icon: Plus,
				};
			case "UPDATE":
				return {
					label: "Cập Nhật",
					colorBadge:
						"bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800",
					dotBg: "bg-blue-500 ring-blue-100 dark:ring-blue-950",
					icon: RefreshCw,
				};
			case "STATUS_CHANGE":
				return {
					label: "Đổi Trạng Thái",
					colorBadge:
						"bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800",
					dotBg: "bg-teal-500 ring-teal-100 dark:ring-teal-950",
					icon: Activity,
				};
			case "DELETE":
			case "SOFT_DELETE":
			case "BULK_SOFT_DELETE":
				return {
					label: "Xóa Dữ Liệu",
					colorBadge:
						"bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800",
					dotBg: "bg-rose-500 ring-rose-100 dark:ring-rose-950",
					icon: Trash2,
				};
			case "RESTORE":
				return {
					label: "Khôi Phục",
					colorBadge:
						"bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800",
					dotBg: "bg-purple-500 ring-purple-100 dark:ring-purple-950",
					icon: RotateCcw,
				};
			case "IMPORT":
			case "IMPORT_CREATE":
			case "IMPORT_UPDATE":
				return {
					label: "Nhập Excel",
					colorBadge:
						"bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800",
					dotBg: "bg-amber-500 ring-amber-100 dark:ring-amber-950",
					icon: FileSpreadsheet,
				};
			case "REVEAL_CCCD":
				return {
					label: "Xem CCCD",
					colorBadge:
						"bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
					dotBg: "bg-indigo-500 ring-indigo-100 dark:ring-indigo-950",
					icon: Eye,
				};
			default:
				return {
					label: action,
					colorBadge:
						"bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
					dotBg: "bg-slate-500 ring-slate-100 dark:ring-slate-900",
					icon: History,
				};
		}
	};

	// Helper dịch JSON diff thân thiện
	const renderFriendlyDiff = (item: AuditLogItem) => {
		const itemObj = item as unknown as Record<string, unknown>;
		const oldVals = (
			typeof item.old_data === "object" && item.old_data
				? item.old_data
				: typeof itemObj.old_values === "object" && itemObj.old_values
					? itemObj.old_values
					: {}
		) as Record<string, string | number | boolean | null | undefined>;

		const newVals = (
			typeof item.new_data === "object" && item.new_data
				? item.new_data
				: typeof itemObj.new_values === "object" && itemObj.new_values
					? itemObj.new_values
					: {}
		) as Record<string, string | number | boolean | null | undefined>;

		// 1. Biến động cập nhật thông tin / đổi trạng thái
		if (item.action === "UPDATE" || item.action === "STATUS_CHANGE") {
			const basicKeys = Array.from(
				new Set([...Object.keys(oldVals), ...Object.keys(newVals)]),
			).filter(
				(k) =>
					!IGNORED_FIELDS.has(k) &&
					typeof oldVals[k] !== "object" &&
					typeof newVals[k] !== "object",
			);

			const basicChanges = basicKeys
				.filter((k) => {
					const v1 =
						oldVals[k] !== undefined && oldVals[k] !== null
							? String(oldVals[k]).trim()
							: "";
					const v2 =
						newVals[k] !== undefined && newVals[k] !== null
							? String(newVals[k]).trim()
							: "";
					return v1 !== v2;
				})
				.map((k) => ({
					field: k,
					label: FIELD_LABELS[k] || k,
					oldVal: formatValue(oldVals[k], k),
					newVal: formatValue(newVals[k], k),
				}));

			if (basicChanges.length === 0) {
				return (
					<div className="text-xs text-slate-500 dark:text-slate-400 italic">
						{item.note || "Thông tin hồ sơ đã được đồng bộ lại."}
					</div>
				);
			}

			return (
				<div className="space-y-1.5 mt-2">
					<div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
						Thay đổi thông tin:
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{basicChanges.map((c) => (
							<div
								key={c.field}
								className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs flex flex-col justify-between"
							>
								<span className="font-bold text-slate-700 dark:text-slate-300">
									{c.label}
								</span>
								<div className="flex items-center gap-2 mt-1 flex-wrap">
									<span className="line-through text-rose-500/90 dark:text-rose-400 font-medium">
										{c.oldVal}
									</span>
									<span className="text-slate-400 font-bold font-mono">→</span>
									<span className="font-black text-emerald-600 dark:text-emerald-400">
										{c.newVal}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			);
		}

		// 2. Thêm mới hồ sơ
		if (item.action === "CREATE" && Object.keys(newVals).length > 0) {
			return (
				<div className="space-y-2 mt-2">
					<div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
						Dữ liệu khởi tạo:
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
						{newVals.name && (
							<div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-xs flex flex-col">
								<span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
									Họ và tên
								</span>
								<span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
									{newVals.name}
								</span>
							</div>
						)}
						{newVals.dob && (
							<div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-xs flex flex-col">
								<span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
									Năm sinh
								</span>
								<span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
									{newVals.dob}
								</span>
							</div>
						)}
						{newVals.gender && (
							<div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-xs flex flex-col">
								<span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
									Giới tính
								</span>
								<span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
									{newVals.gender}
								</span>
							</div>
						)}
						{newVals.cccd && (
							<div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-xs flex flex-col">
								<span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
									Số CCCD
								</span>
								<span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
									{newVals.cccd_last4
										? `•••• ${newVals.cccd_last4}`
										: newVals.cccd}
								</span>
							</div>
						)}
						{newVals.village_name && (
							<div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-xs flex flex-col">
								<span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
									Thôn
								</span>
								<span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
									{newVals.village_name}
								</span>
							</div>
						)}
						{newVals.current_address && (
							<div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-xs flex flex-col">
								<span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
									Nơi ở hiện nay
								</span>
								<span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
									{newVals.current_address}
								</span>
							</div>
						)}
						{newVals.residence && (
							<div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-xs flex flex-col">
								<span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
									Hộ khẩu thường trú
								</span>
								<span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
									{newVals.residence}
								</span>
							</div>
						)}
						{newVals.ethnicity && (
							<div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-xs flex flex-col">
								<span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
									Dân tộc
								</span>
								<span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
									{newVals.ethnicity}
								</span>
							</div>
						)}
					</div>
				</div>
			);
		}

		// 3. Nhập Excel
		if (
			(item.action === "IMPORT" ||
				item.action === "IMPORT_CREATE" ||
				item.action === "IMPORT_UPDATE") &&
			Object.keys(newVals).length > 0
		) {
			return (
				<div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1 text-slate-800 dark:text-slate-200">
					<div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
						<FileSpreadsheet className="w-4 h-4" strokeWidth={1.5} />
						<span>Tệp Excel: {newVals.file_name || "NhapLieu.xlsx"}</span>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
						{newVals.imported_count !== undefined && (
							<div>
								Số bản ghi:{" "}
								<strong className="text-slate-900 dark:text-white">
									{newVals.imported_count}
								</strong>
							</div>
						)}
						{newVals.added_count !== undefined && (
							<div>
								Thêm mới:{" "}
								<strong className="text-emerald-600 dark:text-emerald-400">
									{newVals.added_count}
								</strong>
							</div>
						)}
						{newVals.updated_count !== undefined && (
							<div>
								Cập nhật:{" "}
								<strong className="text-blue-600 dark:text-blue-400">
									{newVals.updated_count}
								</strong>
							</div>
						)}
					</div>
				</div>
			);
		}

		// 4. Xóa hồ sơ
		if (
			item.action === "DELETE" ||
			item.action === "SOFT_DELETE" ||
			item.action === "BULK_SOFT_DELETE"
		) {
			const displayName =
				oldVals.name ||
				(typeof item.old_data === "object" && item.old_data?.name) ||
				item.profile_id;
			const displayDob =
				oldVals.dob ||
				(typeof item.old_data === "object" && item.old_data?.dob);
			const displayVillage =
				oldVals.village_name ||
				(typeof item.old_data === "object" && item.old_data?.village_name);
			const displayCccd =
				oldVals.cccd_last4 ||
				(typeof item.old_data === "object" && item.old_data?.cccd_last4);

			return (
				<div className="mt-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-800 dark:text-rose-200 space-y-1">
					<div className="font-bold">Đã chuyển vào Thùng rác:</div>
					<div>
						Đối tượng: <strong>{displayName}</strong>
						{displayDob && <span> ({displayDob})</span>}
						{displayVillage && <span> — {displayVillage}</span>}
						{displayCccd && <span> — CCCD: •••• {displayCccd}</span>}
					</div>
					{item.note && (
						<div className="text-[11px] text-rose-600 dark:text-rose-400 italic">
							Lý do / Ghi chú: {item.note}
						</div>
					)}
				</div>
			);
		}

		// 5. Khôi phục hồ sơ
		if (item.action === "RESTORE") {
			const displayName =
				newVals.name ||
				oldVals.name ||
				(typeof item.new_data === "object" && item.new_data?.name) ||
				(typeof item.old_data === "object" && item.old_data?.name) ||
				item.profile_id;
			return (
				<div className="mt-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-800 dark:text-purple-200">
					<span>
						Khôi phục bản ghi: <strong>{displayName}</strong>
					</span>
					{item.note && (
						<div className="text-[11px] mt-1 text-purple-600 dark:text-purple-400">
							{item.note}
						</div>
					)}
				</div>
			);
		}

		return null;
	};

	return (
		<div className="space-y-6 animate-in fade-in pb-12 select-none">
			{/* Banner Tiêu Đề Đồng Bộ QLHK */}
			<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
				<div>
					<div className="flex items-center gap-2.5 flex-wrap">
						<span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
							Hệ Thống Kiểm Soát
						</span>
						<h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
							<History
								className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
								strokeWidth={1.5}
							/>
							<span>Nhật Ký Hoạt Động & Biến Động Dữ Liệu</span>
						</h2>
					</div>
					<p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
						Ghi vết tự động toàn bộ biến động hồ sơ Chúc Thọ, Hưu Trí Xã Hội,
						nhập xuất dữ liệu và thao tác nghiệp vụ tại Xã Đăk Hà
					</p>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => fetchLogs(1, false)}
						className="h-10 flex items-center gap-1.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95"
					>
						<RefreshCw
							strokeWidth={1.5}
							className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`}
						/>
						<span>Làm Mới</span>
					</button>
				</div>
			</div>

			{/* Thanh Bộ Lọc Sự Kiện Nhanh */}
			<div className="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
				<span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 flex items-center gap-1.5">
					<Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
					<span>Sự kiện:</span>
				</span>

				{[
					{
						id: "ALL",
						label: "Tất Cả",
						icon: Activity,
						color: "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
					},
					{
						id: "CREATE",
						label: "Thêm Mới",
						icon: Plus,
						color: "bg-emerald-600 text-white",
					},
					{
						id: "UPDATE",
						label: "Cập Nhật",
						icon: RefreshCw,
						color: "bg-blue-600 text-white",
					},
					{
						id: "DELETE",
						label: "Xóa",
						icon: Trash2,
						color: "bg-rose-600 text-white",
					},
					{
						id: "RESTORE",
						label: "Khôi Phục",
						icon: RotateCcw,
						color: "bg-purple-600 text-white",
					},
					{
						id: "IMPORT",
						label: "Nhập Excel",
						icon: FileSpreadsheet,
						color: "bg-amber-600 text-white",
					},
				].map((item) => {
					const isActive = actionFilter === item.id;
					const Icon = item.icon;
					return (
						<button
							key={item.id}
							type="button"
							onClick={() => setActionFilter(item.id)}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
								isActive
									? `${item.color} shadow-xs`
									: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
							}`}
						>
							<Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
							<span>{item.label}</span>
						</button>
					);
				})}
			</div>

			{/* Thanh Tìm Kiếm & Lọc Chi Tiết (4 Cột Chuẩn Đồng Bộ) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
				{/* 1. Tìm kiếm từ khóa */}
				<div className="relative">
					<Search
						className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
							search.trim()
								? "text-emerald-600 dark:text-emerald-400"
								: "text-slate-400 dark:text-slate-500"
						}`}
						strokeWidth={1.5}
					/>
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Tìm theo nội dung, tên đối tượng, cán bộ..."
						className={`w-full pl-9 pr-9 py-2.5 rounded-2xl text-xs placeholder-slate-400 focus:outline-hidden min-h-[42px] transition-all ${
							search.trim()
								? "bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-500/80 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold focus:ring-2 focus:ring-emerald-500/20"
								: "bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium hover:border-slate-300 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
						}`}
					/>
					{search && (
						<button
							type="button"
							onClick={() => setSearch("")}
							aria-label="Xóa tìm kiếm"
							title="Xóa tìm kiếm"
							className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 rounded-full hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
						>
							<X className="w-3.5 h-3.5" strokeWidth={2} />
						</button>
					)}
				</div>

				{/* 2. Lọc theo Thôn */}
				{selectedVillageId ? (
					<div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs min-h-[42px]">
						<div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-200 truncate">
							<MapPin
								className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
								strokeWidth={1.5}
							/>
							<span className="truncate">
								Đang xem:{" "}
								<strong>
									{villages.find((v) => v.id === selectedVillageId)?.name ||
										"Thôn đã chọn"}
								</strong>
							</span>
						</div>
						<button
							type="button"
							onClick={() => {
								setSelectedVillageId("");
								setVillageFilter("");
							}}
							className="ml-2 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition-all shrink-0"
							title="Chuyển về xem toàn xã"
						>
							Xem Toàn Xã
						</button>
					</div>
				) : isAdmin ? (
					<CustomSelect
						variant="filter"
						defaultFilterValue=""
						value={villageFilter}
						onChange={(val) => setVillageFilter(String(val))}
						options={[
							{ value: "", label: "Toàn xã (Tất cả thôn)" },
							...villages.map((v) => ({ value: v.id, label: v.name })),
						]}
						placeholder="Địa bàn thôn"
						icon={
							<MapPin
								className="w-3.5 h-3.5 text-slate-400 shrink-0"
								strokeWidth={1.5}
							/>
						}
						clearable={Boolean(villageFilter)}
						onClear={() => setVillageFilter("")}
						className="rounded-2xl text-xs font-bold"
					/>
				) : (
					<div className="flex items-center px-3.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 min-h-[42px]">
						<span>
							Đơn vị:{" "}
							{villages.find((v) => v.id === user?.village_id)?.name ||
								"Thôn phụ trách"}
						</span>
					</div>
				)}

				{/* 3. Lọc theo Loại Chính Sách */}
				<CustomSelect
					variant="filter"
					defaultFilterValue=""
					value={profileTypeFilter}
					onChange={(val) => setProfileTypeFilter(String(val))}
					options={[
						{ value: "", label: "Cả 2 loại chính sách" },
						{ value: "chuctho", label: "Hồ sơ Chúc Thọ" },
						{ value: "htxh", label: "Hưu Trí Xã Hội" },
					]}
					placeholder="Loại chính sách"
					icon={
						<Award
							className="w-3.5 h-3.5 text-slate-400 shrink-0"
							strokeWidth={1.5}
						/>
					}
					clearable={Boolean(profileTypeFilter)}
					onClear={() => setProfileTypeFilter("")}
					className="rounded-2xl text-xs font-bold"
				/>

				{/* 4. Lọc theo Cán bộ thực hiện */}
				<CustomSelect
					variant="filter"
					defaultFilterValue=""
					value={userFilter}
					onChange={(val) => setUserFilter(String(val))}
					options={[
						{ value: "", label: "Tất cả cán bộ thực hiện" },
						...userList.map((u) => ({
							value: u.username,
							label: u.full_name
								? `${u.full_name} (${u.username})`
								: u.username,
						})),
					]}
					searchable
					placeholder="Cán bộ thực hiện"
					icon={
						<UserCheck
							className="w-3.5 h-3.5 text-slate-400 shrink-0"
							strokeWidth={1.5}
						/>
					}
					clearable={Boolean(userFilter)}
					onClear={() => setUserFilter("")}
					className="rounded-2xl text-xs font-bold"
				/>
			</div>

			{/* Nút Xóa tất cả bộ lọc khi có bộ lọc đang kích hoạt */}
			{activeFiltersCount > 0 && (
				<div className="flex items-center justify-end">
					<button
						type="button"
						onClick={handleClearAll}
						className="h-8 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 animate-in fade-in"
						title="Xóa toàn bộ các bộ lọc đang chọn"
					>
						<RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
						<span>
							{activeFiltersCount > 1
								? `Xóa tất cả bộ lọc (${activeFiltersCount})`
								: "Xóa lọc"}
						</span>
					</button>
				</div>
			)}

			{/* Dòng Thời Gian Timeline Chuẩn QLHK */}
			<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm">
				<div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
					<div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
						<Clock className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
						<span>Dòng thời gian biến động ({total} sự kiện)</span>
					</div>
					<span className="text-xs font-mono text-slate-400">
						Trang {page} / {totalPages}
					</span>
				</div>

				{loading && logs.length === 0 ? (
					<div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
						<RefreshCw
							className="w-6 h-6 animate-spin text-emerald-600 mb-2"
							strokeWidth={1.5}
						/>
						<span>Đang tải nhật ký kiểm soát...</span>
					</div>
				) : logs.length === 0 ? (
					<div className="py-12 text-center text-slate-400 text-xs italic">
						Không tìm thấy sự kiện biến động nào phù hợp với bộ lọc.
					</div>
				) : (
					<div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 pb-2">
						{logs.map((item) => {
							const cfg = getActionConfig(item.action);
							const ActionIcon = cfg.icon;
							const dateObj = new Date(item.created_at);
							const timeStr = !Number.isNaN(dateObj.getTime())
								? `${dateObj.toLocaleTimeString("vi-VN")} • ${dateObj.toLocaleDateString("vi-VN")}`
								: item.created_at;

							const villageName =
								item.village?.name ||
								villages.find((v) => v.id === item.village_id)?.name ||
								(typeof item.old_values === "object" &&
									item.old_values?.village_name) ||
								(typeof item.new_values === "object" &&
									item.new_values?.village_name) ||
								(typeof item.old_data === "object" &&
									item.old_data?.village_name) ||
								(typeof item.new_data === "object" &&
									item.new_data?.village_name);

							return (
								<div key={item.id} className="relative pl-6 group">
									{/* Node chấm tròn Timeline */}
									<div
										className={`absolute -left-2.25 top-1.5 w-4.5 h-4.5 rounded-full ${cfg.dotBg} ring-4 ring-white dark:ring-slate-900 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-110`}
									>
										<ActionIcon className="w-2.5 h-2.5 stroke-[3]" />
									</div>

									{/* Thẻ Nội Dung Sự Kiện */}
									<div
										className={`bg-slate-50/60 dark:bg-slate-950/60 p-4.5 rounded-2xl border shadow-xs transition-all space-y-2 ${
											item.action === "CREATE"
												? "border-emerald-500/80 dark:border-emerald-500/60"
												: "border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
										}`}
									>
										{/* Header Thẻ: Loại thao tác & Thời gian */}
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
											<div className="flex items-center gap-2 flex-wrap">
												<span
													className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider border ${cfg.colorBadge}`}
												>
													{cfg.label}
												</span>

												<span className="text-xs font-black text-slate-800 dark:text-slate-100">
													{item.note ||
														`${cfg.label} đối tượng ${
															item.profile_type === "htxh"
																? "hưu trí xã hội"
																: "chúc thọ"
														}`}
												</span>
											</div>

											<div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
												<Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
												<span>{timeStr}</span>
											</div>
										</div>

										{/* Dịch JSON Diff Thân Thiện */}
										{renderFriendlyDiff(item)}

										{/* Footer Thẻ: Người thực hiện, Đơn vị, IP */}
										<div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
											<div className="flex items-center gap-3">
												<span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
													<UserIcon
														className="w-3.5 h-3.5 text-emerald-500"
														strokeWidth={1.5}
													/>
													<span>
														{item.user?.full_name ||
															item.user?.username ||
															"Hệ thống"}
													</span>
												</span>

												{villageName && (
													<span className="flex items-center gap-1">
														<MapPin
															className="w-3.5 h-3.5 text-blue-500"
															strokeWidth={1.5}
														/>
														<span>{villageName}</span>
													</span>
												)}
											</div>

											<span className="font-mono text-slate-400">
												IP:{" "}
												{(item as any).ip_address ||
													(item as any).ip ||
													"::ffff:127.0.0.1"}
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Nút Tải thêm dữ liệu & Phân trang */}
				{page < totalPages && (
					<div className="pt-6 flex justify-center border-t border-slate-100 dark:border-slate-800 mt-4">
						<button
							type="button"
							onClick={handleLoadMore}
							disabled={loading}
							className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
						>
							<ArrowDownCircle className="w-4 h-4" strokeWidth={1.5} />
							<span>{loading ? "Đang tải thêm..." : "Tải Thêm Dữ Liệu"}</span>
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default AuditLogPage;
