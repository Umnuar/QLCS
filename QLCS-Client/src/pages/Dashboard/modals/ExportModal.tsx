import clsx from "clsx";
import { AlertCircle, Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { htxhApi } from "../../../api/htxh";
import { profilesApi } from "../../../api/profiles";

interface ExportModalProps {
	isExportModalOpen: boolean;
	setIsExportModalOpen: (b: boolean) => void;
	isDarkMode: boolean;
	panelClass: string;
	softTextClass: string;
	totalFiltered: number;
	isGlobal?: boolean;
	executeExport: (modalOptions?: any) => void;
	isExporting: boolean;
	villages?: { id: string | number; name: string }[];
	selectedIds: Set<any>;
	activeTab?: string;
	filters?: any;
}

export function ExportModal({
	isExportModalOpen,
	setIsExportModalOpen,
	isDarkMode,
	panelClass,
	softTextClass,
	totalFiltered,
	isGlobal,
	executeExport,
	isExporting,
	villages,
	selectedIds,
	activeTab,
	filters,
}: ExportModalProps) {
	const [selectedVillages, setSelectedVillages] = useState<any[]>([]);
	const [exportSelectedOnly, setExportSelectedOnly] = useState(false);
	const [accurateCount, setAccurateCount] = useState<number | null>(null);
	const [isCalculating, setIsCalculating] = useState(false);

	useEffect(() => {
		if (exportSelectedOnly || selectedVillages.length === 0 || !activeTab) {
			setAccurateCount(null);
			setIsCalculating(false);
			return;
		}

		let isMounted = true;
		setIsCalculating(true);
		const fetchCount = async () => {
			const baseParams: any = {
				limit: 1,
				search: filters?.search || undefined,
				status:
					filters?.statusFilter !== "all" ? filters?.statusFilter : undefined,
				ageGroup:
					filters?.ageFilters?.length > 0 ? filters.ageFilters[0] : undefined,
			};

			try {
				let totalCount = 0;
				if (selectedVillages.length === 1) {
					const params = { ...baseParams, villageId: selectedVillages[0] };
					const res =
						activeTab === "chuctho"
							? await profilesApi.getProfiles(params)
							: await htxhApi.getProfiles(params);
					totalCount = res.pagination?.total ?? (res as any).total ?? 0;
				} else {
					const counts = await Promise.all(
						selectedVillages.map(async (vId) => {
							const params = { ...baseParams, villageId: vId };
							const res =
								activeTab === "chuctho"
									? await profilesApi.getProfiles(params)
									: await htxhApi.getProfiles(params);
							return res.pagination?.total ?? (res as any).total ?? 0;
						}),
					);
					totalCount = counts.reduce((acc, c) => acc + c, 0);
				}
				if (isMounted) {
					setAccurateCount(totalCount);
				}
			} catch (e) {
				console.error("Failed to fetch exact count", e);
			} finally {
				if (isMounted) setIsCalculating(false);
			}
		};

		// Add a small delay to prevent rapid requests when clicking multiple buttons quickly
		const timer = setTimeout(fetchCount, 300);
		return () => {
			isMounted = false;
			clearTimeout(timer);
		};
	}, [selectedVillages, exportSelectedOnly, activeTab, filters]);

	if (!isExportModalOpen) return null;

	const handleConfirm = () => {
		executeExport({
			selectedVillages,
			exportSelectedOnly,
			selectedIds,
		});
	};

	const toggleVillage = (id: string | number) => {
		setSelectedVillages((prev) =>
			prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
		);
	};

	const finalCount = exportSelectedOnly
		? selectedIds.size
		: accurateCount !== null
			? accurateCount
			: totalFiltered;

	return createPortal(
		<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[rgba(15,23,42,0.45)] dark:bg-[rgba(0,0,0,0.6)] animate-in fade-in">
			<div
				className={clsx(
					"rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border zoom-in-95 duration-150",
					panelClass,
				)}
			>
				<div
					className={clsx(
						"px-6 py-5 border-b flex justify-between items-center",
						isDarkMode
							? "border-slate-800 bg-slate-800/30"
							: "border-slate-100 bg-slate-50",
					)}
				>
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center shrink-0">
							<Download className="h-5 w-5" strokeWidth={1.5} />
						</div>
						<div>
							<h2 className="text-lg font-black tracking-tight">
								Xuất báo cáo Excel
							</h2>
						</div>
					</div>
					<button
						type="button"
						onClick={() => setIsExportModalOpen(false)}
						aria-label="Đóng"
						className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
					>
						<X className="h-5 w-5" strokeWidth={1.5} />
					</button>
				</div>

				<div className="p-6 space-y-6">
					<div className="p-4 rounded-xl border bg-blue-50/50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50">
						<div className="flex items-start">
							<AlertCircle
								className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 shrink-0 mt-0.5"
								strokeWidth={1.5}
							/>
							<p className="text-sm font-medium text-blue-800 dark:text-blue-200">
								Hệ thống sẽ lấy dữ liệu hiện tại trên màn hình để xuất file. Bạn
								có thể thiết lập thêm giới hạn bên dưới nếu cần:
							</p>
						</div>
					</div>

					<div className="space-y-4">
						{selectedIds.size > 0 && (
							<label className="flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 border-emerald-200 dark:border-emerald-800">
								<input
									type="checkbox"
									checked={exportSelectedOnly}
									onChange={(e) => setExportSelectedOnly(e.target.checked)}
									className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
								/>
								<span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
									Chỉ xuất {selectedIds.size} hồ sơ đang được chọn (Bỏ qua lọc
									Thôn)
								</span>
							</label>
						)}

						<div
							className={clsx(
								"transition-opacity duration-300 space-y-4",
								exportSelectedOnly && "opacity-30 pointer-events-none",
							)}
						>
							{isGlobal && villages && (
								<div>
									<label className="block text-xs font-bold uppercase tracking-wide mb-2">
										Chỉ xuất các thôn/bảng (Bỏ trống = Xuất tất cả)
									</label>
									<div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/30 dark:border-slate-700 scrollbar-hide">
										{villages.map((v) => (
											<button
												key={v.id}
												type="button"
												onClick={() => toggleVillage(v.id)}
												className={clsx(
													"px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer",
													selectedVillages.includes(v.id)
														? "bg-emerald-600 text-white border-emerald-600"
														: isDarkMode
															? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
															: "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
												)}
											>
												{v.name}
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				<div
					className={clsx(
						"px-6 py-4 border-t flex justify-between items-center",
						isDarkMode
							? "border-slate-800 bg-slate-800/30"
							: "border-slate-100 bg-slate-50",
					)}
				>
					<p
						className={clsx(
							"text-xs font-bold uppercase tracking-widest flex items-center",
							softTextClass,
						)}
					>
						CHỌN:{" "}
						<span className="text-emerald-600 dark:text-emerald-400 font-black text-sm ml-1 mr-1">
							{finalCount}
						</span>{" "}
						HỒ SƠ
					</p>
					<div className="flex space-x-3">
						<button
							type="button"
							onClick={() => setIsExportModalOpen(false)}
							disabled={isExporting}
							className="min-h-[44px] px-5 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50"
						>
							Hủy
						</button>
						<button
							type="button"
							onClick={handleConfirm}
							disabled={isExporting || isCalculating}
							className="min-h-[44px] px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
						>
							<Download className="h-4 w-4" strokeWidth={1.5} />
							<span>{isExporting ? "Đang xuất..." : "Xuất file"}</span>
						</button>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}
