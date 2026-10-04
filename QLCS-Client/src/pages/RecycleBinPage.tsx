import {
	Award,
	RefreshCw,
	RotateCcw,
	Search,
	ShieldAlert,
	Trash2,
	Users,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "../AppContext";
import { htxhApi } from "../api/htxh";
import { profilesApi } from "../api/profiles";
import { TablePagination } from "../components/common/TablePagination";
import { useModal } from "../hooks/useModal";

export const RecycleBinPage: React.FC = () => {
	const { user } = useApp();
	const isAdmin = user?.role === "admin";
	const { showAlert, showConfirm } = useModal();
	const [activeTab, setActiveTab] = useState<"chuctho" | "htxh">("chuctho");
	const [loading, setLoading] = useState(false);
	const [deletedProfiles, setDeletedProfiles] = useState<any[]>([]);
	const [search, setSearch] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	// Pagination state
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(15);

	const api = activeTab === "chuctho" ? profilesApi : htxhApi;

	const fetchDeleted = useCallback(async () => {
		setLoading(true);
		try {
			const data = await api.getDeletedProfiles();
			setDeletedProfiles(Array.isArray(data) ? data : []);
			setSelectedIds([]);
			setPage(1);
		} catch (err) {
			console.error("[RecycleBin] Error fetching deleted profiles:", err);
			showAlert({
				title: "Lỗi tải dữ liệu",
				message: "Không thể nạp danh sách hồ sơ trong thùng rác.",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	}, [api, showAlert]);

	useEffect(() => {
		fetchDeleted();
	}, [fetchDeleted]);

	// Lọc tìm kiếm
	const filtered = deletedProfiles.filter((p) => {
		if (!search) return true;
		const s = search.toLowerCase();
		return (
			(p.name && p.name.toLowerCase().includes(s)) ||
			(p.cccd && p.cccd.toLowerCase().includes(s)) ||
			(p.village_name && p.village_name.toLowerCase().includes(s))
		);
	});

	const total = filtered.length;
	const totalPages = Math.ceil(total / limit) || 1;
	const paginated = filtered.slice((page - 1) * limit, page * limit);

	const handleToggleSelectAll = () => {
		if (selectedIds.length === paginated.length) {
			setSelectedIds([]);
		} else {
			setSelectedIds(paginated.map((p) => String(p.id)));
		}
	};

	const handleToggleSelect = (id: string) => {
		if (selectedIds.includes(id)) {
			setSelectedIds(selectedIds.filter((item) => item !== id));
		} else {
			setSelectedIds([...selectedIds, id]);
		}
	};

	const handleRestore = async (profile: any) => {
		const ok = await showConfirm({
			title: "Khôi phục hồ sơ",
			message: `Khôi phục hồ sơ của "${profile.name}" về danh sách quản lý?`,
			type: "warning",
		});
		if (!ok) return;

		try {
			await api.restoreProfile(String(profile.id));
			showAlert({
				title: "Thành công",
				message: "Hồ sơ đã được khôi phục.",
				type: "success",
			});
			fetchDeleted();
		} catch (err: any) {
			showAlert({
				title: "Lỗi",
				message: err.response?.data?.error || "Không thể khôi phục",
				type: "error",
			});
		}
	};

	const handleHardDelete = async (profile: any) => {
		const ok = await showConfirm({
			title: "Xóa vĩnh viễn hồ sơ",
			message: `CẢNH BÁO: Bạn sắp xóa vĩnh viễn hồ sơ "${profile.name}". Dữ liệu sẽ biến mất hoàn toàn khỏi CSDL và không thể hoàn tác!`,
			type: "error",
		});
		if (!ok) return;

		try {
			await api.hardDeleteProfile(String(profile.id));
			showAlert({
				title: "Đã xóa vĩnh viễn",
				message: "Hồ sơ đã được xóa vĩnh viễn.",
				type: "info",
			});
			fetchDeleted();
		} catch (err: any) {
			showAlert({
				title: "Lỗi",
				message: err.response?.data?.error || "Không thể xóa",
				type: "error",
			});
		}
	};

	const handleBatchRestore = async () => {
		if (selectedIds.length === 0) return;
		const ok = await showConfirm({
			title: "Khôi phục hàng loạt",
			message: `Bạn có chắc muốn khôi phục ${selectedIds.length} hồ sơ đã chọn?`,
			type: "warning",
		});
		if (!ok) return;

		try {
			await Promise.all(selectedIds.map((id) => api.restoreProfile(id)));
			showAlert({
				title: "Thành công",
				message: `Đã khôi phục ${selectedIds.length} hồ sơ.`,
				type: "success",
			});
			setSelectedIds([]);
			fetchDeleted();
		} catch (err: any) {
			showAlert({
				title: "Lỗi",
				message: err.response?.data?.error || "Lỗi khôi phục",
				type: "error",
			});
		}
	};

	const handleBatchHardDelete = async () => {
		if (selectedIds.length === 0) return;
		const ok = await showConfirm({
			title: "Xóa vĩnh viễn hàng loạt",
			message: `NGUY HIỂM: Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} hồ sơ đã chọn khỏi CSDL? Thao tác này KHÔNG THỂ hoàn tác!`,
			type: "error",
		});
		if (!ok) return;

		try {
			await Promise.all(selectedIds.map((id) => api.hardDeleteProfile(id)));
			showAlert({
				title: "Đã xóa vĩnh viễn",
				message: `Đã xóa ${selectedIds.length} hồ sơ.`,
				type: "info",
			});
			setSelectedIds([]);
			fetchDeleted();
		} catch (err: any) {
			showAlert({
				title: "Lỗi",
				message: err.response?.data?.error || "Lỗi xóa",
				type: "error",
			});
		}
	};

	return (
		<div className="space-y-6 animate-in fade-in pb-12 select-none">
			{/* Header Banner */}
			<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2.5">
						<span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 uppercase tracking-wider">
							Thùng Rác ({total})
						</span>
						<h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
							<Trash2
								className="w-6 h-6 text-rose-600 dark:text-rose-400"
								strokeWidth={1.5}
							/>
							<span>Quản Lý Hồ Sơ Đã Xóa Tạm</span>
						</h2>
					</div>
					<p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
						Khôi phục lại hồ sơ hoặc xóa vĩnh viễn khỏi cơ sở dữ liệu hệ thống
					</p>
				</div>

				<div className="flex items-center gap-2.5 flex-wrap">
					{selectedIds.length > 0 && (
						<>
							<button
								type="button"
								onClick={handleBatchRestore}
								className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
							>
								<RotateCcw className="w-4 h-4" strokeWidth={1.5} />
								<span>Khôi Phục ({selectedIds.length})</span>
							</button>

							{isAdmin && (
								<button
									type="button"
									onClick={handleBatchHardDelete}
									className="h-10 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
								>
									<ShieldAlert className="w-4 h-4" strokeWidth={1.5} />
									<span>Xóa Vĩnh Viễn ({selectedIds.length})</span>
								</button>
							)}
						</>
					)}

					<button
						type="button"
						onClick={fetchDeleted}
						className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer"
						title="Làm mới danh sách"
					>
						<RefreshCw
							className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`}
							strokeWidth={1.5}
						/>
					</button>
				</div>
			</div>

			{/* Tabs Chúc Thọ vs HTXH & Search Bar */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-3">
				<div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
					<button
						type="button"
						onClick={() => setActiveTab("chuctho")}
						className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
							activeTab === "chuctho"
								? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
								: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
						}`}
					>
						<Award className="w-4 h-4" strokeWidth={1.5} />
						<span>Thùng Rác Chúc Thọ</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("htxh")}
						className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
							activeTab === "htxh"
								? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs"
								: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
						}`}
					>
						<Users className="w-4 h-4" strokeWidth={1.5} />
						<span>Thùng Rác Hưu Trí Xã Hội</span>
					</button>
				</div>

				<div className="relative w-full sm:w-64">
					<Search
						className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
						strokeWidth={1.5}
					/>
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Tìm theo họ tên, CCCD..."
						className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:bg-slate-800 dark:focus:border-emerald-500 dark:focus:ring-2 dark:focus:ring-emerald-500/20 font-medium"
					/>
				</div>
			</div>

			{/* Table Data (Chromium Table Rule: border-separate border-spacing-0 whitespace-nowrap) */}
			<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[900px] text-xs text-left border-separate border-spacing-0 whitespace-nowrap">
						<thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold">
							<tr>
								<th className="px-4 py-3 w-10 text-center border-b border-slate-200 dark:border-slate-800">
									<input
										type="checkbox"
										checked={
											paginated.length > 0 &&
											selectedIds.length === paginated.length
										}
										onChange={handleToggleSelectAll}
										className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer"
									/>
								</th>
								<th className="px-4 py-3 w-12 text-center border-b border-slate-200 dark:border-slate-800">
									STT
								</th>
								<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
									Họ và Tên
								</th>
								<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
									Năm Sinh
								</th>
								<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
									CCCD
								</th>
								<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
									Hộ Khẩu / Nơi Ở
								</th>
								<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
									Thời Điểm Xóa
								</th>
								<th className="px-4 py-3 text-right border-b border-slate-200 dark:border-slate-800">
									Thao Tác
								</th>
							</tr>
						</thead>
						<tbody className="font-medium">
							{loading ? (
								<tr>
									<td
										colSpan={8}
										className="py-12 text-center text-slate-400 border-b border-slate-100 dark:border-slate-800"
									>
										<RefreshCw
											className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2"
											strokeWidth={1.5}
										/>
										<span>Đang tải danh sách hồ sơ đã xóa...</span>
									</td>
								</tr>
							) : paginated.length === 0 ? (
								<tr>
									<td
										colSpan={8}
										className="py-12 text-center text-slate-400 italic border-b border-slate-100 dark:border-slate-800"
									>
										Thùng rác hiện đang trống.
									</td>
								</tr>
							) : (
								paginated.map((profile, idx) => {
									const isSelected = selectedIds.includes(String(profile.id));
									return (
										<tr
											key={profile.id}
											className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
												isSelected
													? "bg-emerald-50/40 dark:bg-emerald-950/20"
													: ""
											}`}
										>
											<td className="px-4 py-3 text-center border-b border-slate-100 dark:border-slate-800">
												<input
													type="checkbox"
													checked={isSelected}
													onChange={() =>
														handleToggleSelect(String(profile.id))
													}
													className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer"
												/>
											</td>
											<td className="px-4 py-3 text-center font-mono text-slate-400 border-b border-slate-100 dark:border-slate-800">
												{(page - 1) * limit + idx + 1}
											</td>
											<td className="px-4 py-3 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800">
												{profile.name}
											</td>
											<td className="px-4 py-3 font-mono border-b border-slate-100 dark:border-slate-800">
												{profile.dob}
											</td>
											<td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
												{profile.cccd || "—"}
											</td>
											<td className="px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-xs border-b border-slate-100 dark:border-slate-800">
												{profile.residence || profile.current_address || "—"}
											</td>
											<td className="px-4 py-3 text-[11px] font-mono text-slate-400 border-b border-slate-100 dark:border-slate-800">
												{profile.deleted_at
													? new Date(profile.deleted_at).toLocaleString("vi-VN")
													: "—"}
											</td>
											<td className="px-4 py-3 text-right border-b border-slate-100 dark:border-slate-800">
												<div className="flex items-center justify-end gap-1.5">
													<button
														type="button"
														onClick={() => handleRestore(profile)}
														className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
														title="Khôi phục hồ sơ"
													>
														<RotateCcw
															className="w-3.5 h-3.5"
															strokeWidth={1.5}
														/>
														<span>Khôi Phục</span>
													</button>
													{isAdmin && (
														<button
															type="button"
															onClick={() => handleHardDelete(profile)}
															className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
															title="Xóa vĩnh viễn"
														>
															<Trash2
																className="w-3.5 h-3.5"
																strokeWidth={1.5}
															/>
															<span>Xóa</span>
														</button>
													)}
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>

				<TablePagination
					itemCount={paginated.length}
					total={total}
					page={page}
					limit={limit}
					totalPages={totalPages}
					onPageChange={setPage}
					onLimitChange={setLimit}
				/>
			</div>
		</div>
	);
};

export default RecycleBinPage;
