import {
	AlertTriangle,
	Database,
	Download,
	RefreshCw,
	ShieldCheck,
	UploadCloud,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { backupApi } from "../../api/backupApi";
import { useModal } from "../../hooks/useModal";

export const BackupRestoreTab: React.FC = () => {
	const { showAlert, showConfirm } = useModal();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isExporting, setIsExporting] = useState(false);
	const [isRestoring, setIsRestoring] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			const snapshot = await backupApi.getSnapshot();
			const jsonStr = JSON.stringify(snapshot, null, 2);
			const blob = new Blob([jsonStr], { type: "application/json" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			const dateStr = new Date().toISOString().split("T")[0];
			a.download = `SaoLuu_QLCS_DakHa_${dateStr}.json`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			const totalProfiles =
				(snapshot.metadata?.counts?.profiles || 0) +
				(snapshot.metadata?.counts?.htxh_profiles || 0);
			showAlert(
				"Sao lưu thành công",
				`Đã tải về tệp sao lưu gồm ${totalProfiles} hồ sơ (Chúc thọ & HTXH) cùng danh mục cấu hình hệ thống.`,
				"success",
			);
		} catch (err: unknown) {
			console.error(err);
			showAlert(
				"Lỗi sao lưu",
				"Không thể xuất tệp sao lưu dữ liệu từ máy chủ.",
				"error",
			);
		} finally {
			setIsExporting(false);
		}
	};

	const handleRestoreClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			const parsed = JSON.parse(text);

			if (
				!parsed ||
				(!parsed.data && !parsed.profiles && !Array.isArray(parsed))
			) {
				showAlert(
					"Định dạng không hợp lệ",
					"Tệp tin không đúng cấu trúc bản sao lưu của hệ thống QLCS.",
					"error",
				);
				return;
			}

			const confirmed = await showConfirm(
				"Cảnh báo khôi phục dữ liệu",
				"Bạn có chắc chắn muốn khôi phục? Toàn bộ dữ liệu hồ sơ và cấu hình hiện tại sẽ được cập nhật từ tệp sao lưu.",
				"warning",
			);

			if (!confirmed) return;

			setIsRestoring(true);
			const res = await backupApi.restoreSnapshot(parsed);

			if (res?.success) {
				const ctCount =
					(res as any).restored?.profiles ?? res.counts?.profiles ?? 0;
				const htxhCount =
					(res as any).restored?.htxh_profiles ??
					res.counts?.htxh_profiles ??
					0;
				showAlert(
					"Khôi phục thành công",
					`Đã phục hồi thành công dữ liệu CSDL (${ctCount} hồ sơ Chúc thọ, ${htxhCount} hồ sơ HTXH). Vui lòng làm mới trang.`,
					"success",
				);
			} else {
				showAlert(
					"Khôi phục thất bại",
					res?.message ||
						"Máy chủ không thể khôi phục dữ liệu từ bản sao lưu này.",
					"error",
				);
			}
		} catch (err: unknown) {
			console.error(err);
			showAlert(
				"Lỗi khôi phục",
				"Không thể đọc hoặc xử lý tệp tin sao lưu.",
				"error",
			);
		} finally {
			setIsRestoring(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	return (
		<div className="space-y-6 animate-in fade-in">
			<div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-3xl space-y-6">
				{/* Header Title */}
				<div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
					<div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/60 dark:border-sky-800/60">
						<Database className="w-5 h-5" strokeWidth={1.5} />
					</div>
					<div>
						<h3 className="font-bold text-base text-slate-900 dark:text-white">
							Sao Lưu & Phục Hồi Dữ Liệu
						</h3>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Xuất tệp dự phòng và khôi phục cơ sở dữ liệu khi cần
						</p>
					</div>
				</div>

				{/* Action 1: Xuất sao lưu */}
				<div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
							Xuất Bản Sao Lưu (Export Backup)
						</h4>
						<p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
							Tạo tệp dự phòng định dạng JSON chứa toàn bộ dữ liệu hồ sơ Chúc
							Thọ, Hưu Trí Xã Hội và cấu hình hệ thống.
						</p>
					</div>
					<button
						type="button"
						onClick={handleExport}
						disabled={isExporting}
						className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
					>
						{isExporting ? (
							<RefreshCw className="w-4 h-4 animate-spin" />
						) : (
							<Download className="w-4 h-4" strokeWidth={1.5} />
						)}
						<span>{isExporting ? "Đang xuất..." : "Tải Bản Sao Lưu"}</span>
					</button>
				</div>

				{/* Action 2: Phục hồi sao lưu */}
				<div className="p-5 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
							<AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
							<span>Phục Hồi Dữ Liệu (Restore Database)</span>
						</div>
						<p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
							Chọn tệp sao lưu (.json) từ máy tính để ghi đè phục hồi lại hệ
							thống dữ liệu hồ sơ chính sách.
						</p>
					</div>
					<div>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleFileChange}
							accept=".json"
							className="hidden"
						/>
						<button
							type="button"
							onClick={handleRestoreClick}
							disabled={isRestoring}
							className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
						>
							{isRestoring ? (
								<RefreshCw className="w-4 h-4 animate-spin" />
							) : (
								<UploadCloud className="w-4 h-4" strokeWidth={1.5} />
							)}
							<span>
								{isRestoring ? "Đang khôi phục..." : "Chọn Tệp Khôi Phục"}
							</span>
						</button>
					</div>
				</div>

				<div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
					<ShieldCheck
						className="w-4 h-4 text-emerald-500 shrink-0"
						strokeWidth={1.5}
					/>
					<span>
						Tệp sao lưu được mã hóa và bảo mật an toàn theo tiêu chuẩn CSDL quốc
						gia.
					</span>
				</div>
			</div>
		</div>
	);
};
