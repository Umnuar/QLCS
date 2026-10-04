import {
	ArrowRight,
	Award,
	BarChart3,
	Check,
	CheckCircle,
	Edit3,
	MapPin,
	Plus,
	Search,
	Trash2,
	Users,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "../AppContext";
import {
	type AnalyticsOverviewData,
	analyticsApi,
	type VillageAnalyticsRow,
} from "../api/analyticsApi";
import { type UserItem, usersApi } from "../api/usersApi";
import { villagesApi } from "../api/villages";
import { getCache, setCache } from "../db/indexedDB";
import { useModal } from "../hooks/useModal";

export const VillagesPage: React.FC = () => {
	const {
		villages,
		setSelectedVillageId,
		setActiveTab,
		user,
		refreshVillages,
	} = useApp();
	const { showAlert, showConfirm } = useModal();
	const isAdmin = user?.role === "admin";

	const [searchTerm, setSearchTerm] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [newName, setNewName] = useState("");
	const [userList, setUserList] = useState<UserItem[]>([]);

	// Thống kê động từ API / Offline cache
	const [overview, setOverview] = useState<AnalyticsOverviewData | null>(null);
	const [villageStats, setVillageStats] = useState<
		Record<string, VillageAnalyticsRow>
	>({});

	const fetchVillageStats = useCallback(async () => {
		try {
			const [overviewData, byVillageData] = await Promise.all([
				analyticsApi.getOverview(),
				analyticsApi.getByVillage(),
			]);

			if (overviewData) {
				setOverview(overviewData);
				await setCache("qlcs_overview", overviewData);
			}

			if (byVillageData && Array.isArray(byVillageData.data)) {
				const statsMap: Record<string, VillageAnalyticsRow> = {};
				byVillageData.data.forEach((row) => {
					if (row.village_id) statsMap[row.village_id] = row;
					if (row.village_name)
						statsMap[row.village_name.toLowerCase().trim()] = row;
				});
				setVillageStats(statsMap);
				await setCache("qlcs_breakdown", byVillageData.data);
			}
		} catch (err) {
			console.warn(
				"[VillagesPage] Lỗi tải số liệu thời gian thực, chuyển sang nạp từ Offline Cache:",
				err,
			);
			try {
				const cachedOverview =
					await getCache<AnalyticsOverviewData>("qlcs_overview");
				const cachedBreakdown =
					await getCache<VillageAnalyticsRow[]>("qlcs_breakdown");

				if (cachedOverview) setOverview(cachedOverview);
				if (Array.isArray(cachedBreakdown)) {
					const statsMap: Record<string, VillageAnalyticsRow> = {};
					cachedBreakdown.forEach((row) => {
						if (row.village_id) statsMap[row.village_id] = row;
						if (row.village_name)
							statsMap[row.village_name.toLowerCase().trim()] = row;
					});
					setVillageStats(statsMap);
				}
			} catch (cacheErr) {
				console.error("[VillagesPage] Lỗi đọc Offline Cache:", cacheErr);
			}
		}
	}, []);

	const fetchUsers = useCallback(async () => {
		try {
			const users = await usersApi.getUsers();
			setUserList(users);
		} catch (err) {
			console.warn("[VillagesPage] Lỗi tải danh sách cán bộ:", err);
		}
	}, []);

	useEffect(() => {
		fetchVillageStats();
		fetchUsers();
	}, [fetchVillageStats, fetchUsers]);

	useEffect(() => {
		const handleReconnected = () => {
			fetchVillageStats();
			fetchUsers();
		};
		window.addEventListener("server:reconnected", handleReconnected);
		return () =>
			window.removeEventListener("server:reconnected", handleReconnected);
	}, [fetchVillageStats, fetchUsers]);

	const filteredVillages = villages.filter((v) =>
		v.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const handleVillageClick = (id: string) => {
		setSelectedVillageId(id);
		setActiveTab("analytics"); // Đặt Thống Kê là mục chính đầu tiên khi chọn thôn
	};

	const handleUpdate = async (id: string) => {
		if (!editName.trim()) return;
		try {
			await villagesApi.updateVillage(id, editName.trim());
			await refreshVillages();
			setEditingId(null);
			showAlert({
				title: "Thành công",
				message: "Cập nhật tên thôn thành công",
				type: "success",
			});
		} catch (err: any) {
			showAlert({
				title: "Lỗi",
				message: err.response?.data?.error || "Không thể cập nhật tên thôn",
				type: "error",
			});
		}
	};

	const handleDelete = async (id: string, name: string) => {
		const ok = await showConfirm({
			title: "Xác nhận xóa thôn",
			message: `Bạn có chắc muốn xóa "${name}" không? Thao tác này sẽ ảnh hưởng đến các hồ sơ chính sách thuộc thôn này.`,
			type: "warning",
		});
		if (!ok) return;

		try {
			await villagesApi.deleteVillage(id);
			await refreshVillages();
			await fetchVillageStats();
			showAlert({
				title: "Thành công",
				message: "Đã xóa thôn thành công",
				type: "success",
			});
		} catch (err: any) {
			showAlert({
				title: "Lỗi",
				message: err.response?.data?.error || "Không thể xóa thôn",
				type: "error",
			});
		}
	};

	const handleCreate = async () => {
		if (!newName.trim()) return;
		try {
			await villagesApi.createVillage(newName.trim());
			await refreshVillages();
			await fetchVillageStats();
			setIsAdding(false);
			setNewName("");
			showAlert({
				title: "Thành công",
				message: "Thêm thôn mới thành công",
				type: "success",
			});
		} catch (err: any) {
			showAlert({
				title: "Lỗi",
				message: err.response?.data?.error || "Không thể tạo thôn mới",
				type: "error",
			});
		}
	};

	const totalCt = overview?.chuctho?.total ?? 0;
	const totalHtxh = overview?.htxh?.total ?? 0;
	const totalReceived =
		(overview?.chuctho?.received ?? 0) + (overview?.htxh?.received ?? 0);
	const totalAll = totalCt + totalHtxh;
	const overallRate =
		totalAll > 0 ? ((totalReceived / totalAll) * 100).toFixed(1) : "0.0";

	return (
		<div className="space-y-6 animate-in fade-in pb-12 select-none">
			{/* Banner Tổng Quan Toàn Xã (Gradient Emerald Đậm) */}
			<div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white shadow-xl shadow-emerald-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
				<div className="flex items-center gap-4 relative z-10">
					<div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs">
						<BarChart3 className="w-7 h-7 text-white" strokeWidth={1.5} />
					</div>
					<div>
						<div className="flex items-center gap-2 flex-wrap">
							<span className="px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 text-[11px] font-bold uppercase tracking-wider">
								UBND Xã Đăk Hà
							</span>
							<span className="text-xs text-emerald-200">
								Địa Bàn{" "}
								{villages.length
									? `${villages.length} Thôn & Làng Bản`
									: "Các Thôn & Làng Bản"}
							</span>
						</div>
						<h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
							Tổng Quan Đối Tượng Chính Sách Toàn Xã
						</h2>
						<p className="text-xs text-emerald-100/90 font-medium mt-0.5">
							Tổng số:{" "}
							<strong className="font-bold text-white">{totalAll}</strong> đối
							tượng chính sách • Đã nhận quà:{" "}
							<strong className="font-bold text-white">{totalReceived}</strong>{" "}
							({overallRate}%)
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-end">
					<button
						type="button"
						onClick={() => {
							setSelectedVillageId("");
							setActiveTab("analytics");
						}}
						className="h-10 px-4 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
					>
						<span>Xem Báo Cáo Đối Soát</span>
						<ArrowRight className="w-4 h-4" strokeWidth={1.5} />
					</button>
				</div>
			</div>

			{/* 4 Thẻ KPI Phụ */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* KPI 1: Số Thôn */}
				<div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
					<div>
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							Địa Bàn Quản Lý
						</span>
						<div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
							{villages.length} Thôn
						</div>
						<span className="text-[11px] text-slate-400 font-medium mt-0.5">
							Toàn địa bàn Xã Đăk Hà
						</span>
					</div>
					<MapPin
						className="w-6 h-6 text-slate-400 dark:text-slate-500 shrink-0"
						strokeWidth={1.5}
					/>
				</div>

				{/* KPI 2: Chúc Thọ */}
				<div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
					<div>
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							Hồ Sơ Chúc Thọ
						</span>
						<div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
							{totalCt} Cụ
						</div>
						<span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
							Đã nhận: {overview?.chuctho?.received ?? 0} (
							{overview?.chuctho?.completionRate ?? 0}%)
						</span>
					</div>
					<Award
						className="w-6 h-6 text-slate-400 dark:text-slate-500 shrink-0"
						strokeWidth={1.5}
					/>
				</div>

				{/* KPI 3: Hưu Trí Xã Hội */}
				<div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
					<div>
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							Hưu Trí Xã Hội
						</span>
						<div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
							{totalHtxh} Đối tượng
						</div>
						<span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
							Đã nhận: {overview?.htxh?.received ?? 0} (
							{overview?.htxh?.completionRate ?? 0}%)
						</span>
					</div>
					<Users
						className="w-6 h-6 text-slate-400 dark:text-slate-500 shrink-0"
						strokeWidth={1.5}
					/>
				</div>

				{/* KPI 4: Tỷ Lệ Hoàn Thành */}
				<div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
					<div>
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							Tiến Độ Phát Quà
						</span>
						<div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
							{overallRate}%
						</div>
						<span className="text-[11px] text-slate-400 font-medium mt-0.5">
							{totalReceived} / {totalAll} đối tượng
						</span>
					</div>
					<CheckCircle
						className="w-6 h-6 text-slate-400 dark:text-slate-500 shrink-0"
						strokeWidth={1.5}
					/>
				</div>
			</div>

			{/* Header Panel & Search */}
			<div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
						<MapPin className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
						<span>Danh Sách {villages.length} Thôn Xã Đăk Hà</span>
					</h2>
					<p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
						Bấm vào thẻ thôn để chuyển nhanh đến màn hình làm việc của thôn đó
					</p>
				</div>

				<div className="flex items-center gap-3 w-full sm:w-auto">
					<div className="w-full sm:w-auto flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
						<Search
							className="w-4 h-4 text-slate-400 ml-2 shrink-0"
							strokeWidth={1.5}
						/>
						<input
							type="text"
							placeholder="Tìm kiếm thôn..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full sm:w-52 px-2 py-1 bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden"
						/>
						{searchTerm && (
							<button
								type="button"
								onClick={() => setSearchTerm("")}
								className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
							>
								<X className="w-3.5 h-3.5" strokeWidth={1.5} />
							</button>
						)}
					</div>

					{isAdmin && (
						<button
							type="button"
							onClick={() => setIsAdding(true)}
							className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
						>
							<Plus className="w-4 h-4" strokeWidth={1.5} />
							<span>Thêm Thôn</span>
						</button>
					)}
				</div>
			</div>

			{/* Form thêm thôn mới nếu mở */}
			{isAdding && (
				<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-emerald-500 shadow-lg space-y-3 animate-in fade-in">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-bold text-slate-900 dark:text-white">
							Thêm Thôn Mới
						</h3>
						<button
							onClick={() => setIsAdding(false)}
							className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
						>
							<X className="w-4 h-4" strokeWidth={1.5} />
						</button>
					</div>
					<div>
						<label className="block text-xs font-bold text-slate-500 mb-1">
							Tên Thôn *
						</label>
						<input
							type="text"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							placeholder="Vd: Thôn 6"
							className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
						/>
					</div>
					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={() => setIsAdding(false)}
							className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer active:scale-95"
						>
							Hủy
						</button>
						<button
							type="button"
							onClick={handleCreate}
							className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
						>
							<Check className="w-4 h-4" strokeWidth={1.5} />
							<span>Lưu Thôn Mới</span>
						</button>
					</div>
				</div>
			)}

			{/* Lưới 7 Thẻ Thôn */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{filteredVillages.map((village) => {
					const isEditing = editingId === village.id;
					const vStat =
						villageStats[village.id] ||
						villageStats[village.name.toLowerCase().trim()];

					const ctCount = vStat?.chuctho?.total ?? 0;
					const ctReceived = vStat?.chuctho?.received ?? 0;
					const htxhCount = vStat?.htxh?.total ?? 0;
					const htxhReceived = vStat?.htxh?.received ?? 0;

					if (isEditing) {
						return (
							<div
								key={village.id}
								className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-emerald-500 shadow-lg flex flex-col justify-between min-h-[180px]"
							>
								<div>
									<span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
										Đổi tên thôn
									</span>
									<input
										autoFocus
										type="text"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleUpdate(village.id);
											if (e.key === "Escape") setEditingId(null);
										}}
										className="w-full mt-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
									/>
								</div>
								<div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
									<button
										onClick={() => setEditingId(null)}
										className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
									>
										Hủy
									</button>
									<button
										onClick={() => handleUpdate(village.id)}
										className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs"
									>
										Lưu
									</button>
								</div>
							</div>
						);
					}

					const assignedOfficer = userList.find(
						(u) => u.village_id === village.id,
					);

					return (
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
							className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 transition-all cursor-pointer select-none group hover:scale-[1.02] active:scale-[0.98] border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 min-h-[180px] flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
						>
							<div>
								<div className="flex items-center justify-between gap-2 mb-2">
									<div className="flex items-center gap-2 min-w-0">
										<MapPin
											className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0"
											strokeWidth={1.5}
										/>
										<h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight truncate">
											{village.name}
										</h4>
									</div>

									{isAdmin && (
										<div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shrink-0">
											<button
												type="button"
												title="Đổi tên thôn"
												onClick={(e) => {
													e.stopPropagation();
													setEditingId(village.id);
													setEditName(village.name);
												}}
												className="p-1 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors cursor-pointer"
											>
												<Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
											</button>
											<button
												type="button"
												title="Xóa thôn"
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(village.id, village.name);
												}}
												className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
											>
												<Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
											</button>
										</div>
									)}
								</div>

								{/* Cán bộ phụ trách */}
								<div className="text-xs text-slate-500 dark:text-slate-400">
									<span>Trưởng thôn: </span>
									<span
										className={
											assignedOfficer
												? "font-bold text-slate-800 dark:text-slate-200"
												: "italic text-slate-400"
										}
									>
										{assignedOfficer?.username || "Chưa phân công"}
									</span>
								</div>
							</div>

							{/* Chi tiết số liệu */}
							<div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 mt-3 text-xs">
								<div className="flex items-center justify-between">
									<span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
										<Award
											className="w-3.5 h-3.5 text-blue-500"
											strokeWidth={1.5}
										/>
										<span>Chúc Thọ:</span>
									</span>
									<span className="font-bold text-slate-900 dark:text-white">
										{ctCount} cụ{" "}
										<span className="text-emerald-600 font-mono text-[11px]">
											({ctReceived} đã nhận)
										</span>
									</span>
								</div>

								<div className="flex items-center justify-between">
									<span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
										<Users
											className="w-3.5 h-3.5 text-purple-500"
											strokeWidth={1.5}
										/>
										<span>Hưu Trí XH:</span>
									</span>
									<span className="font-bold text-slate-900 dark:text-white">
										{htxhCount} người{" "}
										<span className="text-emerald-600 font-mono text-[11px]">
											({htxhReceived} đã nhận)
										</span>
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default VillagesPage;
