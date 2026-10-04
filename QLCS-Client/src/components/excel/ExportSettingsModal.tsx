import { DownloadCloud, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface ExportSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onExport: (scope: "all" | "selected") => void;
	exporting: boolean;
	selectedCount?: number;
	villageName?: string;
	activeTab?: "chuctho" | "htxh" | string;
	isAdmin?: boolean;
}

export const ExportSettingsModal: React.FC<ExportSettingsModalProps> = ({
	isOpen,
	onClose,
	onExport,
	exporting,
	selectedCount = 0,
	villageName,
	activeTab = "chuctho",
	isAdmin = true,
}) => {
	const [exportScope, setExportScope] = useState<"all" | "selected">("all");
	const modalRef = useRef<HTMLDivElement>(null);

	// Reset to "all" when opened
	useEffect(() => {
		if (isOpen) {
			setExportScope("all");
		}
	}, [isOpen]);

	// Accessibility: Focus trap, Esc to close, outside click to close
	useEffect(() => {
		if (!isOpen) return;

		const timer = setTimeout(() => {
			if (modalRef.current) {
				const firstButton = modalRef.current.querySelector<HTMLElement>(
					"button:not([disabled])",
				);
				firstButton?.focus();
			}
		}, 50);

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}

			if (e.key === "Tab") {
				if (!modalRef.current) return;
				const focusableElements =
					modalRef.current.querySelectorAll<HTMLElement>(
						'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
					);
				if (focusableElements.length === 0) return;

				const firstElement = focusableElements[0];
				const lastElement = focusableElements[focusableElements.length - 1];

				if (e.shiftKey) {
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		};

		const handleMouseDown = (e: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousedown", handleMouseDown);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousedown", handleMouseDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen || typeof document === "undefined") return null;

	const subtitle =
		activeTab === "chuctho"
			? "Xuất biểu mẫu chúc thọ người cao tuổi chuẩn Xã Đăk Hà"
			: activeTab === "htxh"
				? "Xuất biểu mẫu hưu trí xã hội chuẩn Xã Đăk Hà"
				: "Xuất biểu mẫu chính sách chuẩn Xã Đăk Hà";

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
			<div
				ref={modalRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="export-settings-title"
				className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl w-full max-w-md flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
			>
				{/* Header */}
				<div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center shrink-0">
							<DownloadCloud
								className="w-5 h-5"
								strokeWidth={1.5}
								aria-hidden="true"
							/>
						</div>
						<div>
							<h2
								id="export-settings-title"
								className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
							>
								Cài đặt xuất file Excel
							</h2>
							<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
								{subtitle}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Đóng"
						className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
					>
						<X className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
					</button>
				</div>

				{/* Body */}
				<div className="p-5 space-y-4">
					<div className="space-y-2">
						<h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
							Phạm vi xuất
						</h3>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							{villageName
								? `Đang xuất dữ liệu của: ${villageName}`
								: isAdmin
									? "Đang xuất theo thôn đã chọn (hoặc toàn xã nếu chọn Tất cả)."
									: "Đang xuất dữ liệu của thôn hiện tại."}
						</p>
					</div>

					<div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
						<label
							htmlFor="export-scope-all"
							className="flex items-start gap-3 cursor-pointer group"
						>
							<div className="relative flex items-start">
								<input
									id="export-scope-all"
									type="radio"
									name="exportScope"
									checked={exportScope === "all"}
									onChange={() => setExportScope("all")}
									className="peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-emerald-500 checked:border-[6px] transition-all cursor-pointer"
								/>
							</div>
							<div>
								<p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
									Toàn bộ hồ sơ trong phạm vi
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Xuất toàn bộ các hồ sơ hiển thị theo phạm vi đang chọn.
								</p>
							</div>
						</label>

						<label
							htmlFor="export-scope-selected"
							className={`flex items-start gap-3 ${selectedCount === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer group"}`}
						>
							<div className="relative flex items-start">
								<input
									id="export-scope-selected"
									type="radio"
									name="exportScope"
									disabled={selectedCount === 0}
									checked={exportScope === "selected"}
									onChange={() => setExportScope("selected")}
									className="peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-emerald-500 checked:border-[6px] transition-all disabled:cursor-not-allowed cursor-pointer"
								/>
							</div>
							<div>
								<p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
									Chỉ xuất {selectedCount} hồ sơ đã chọn
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Chỉ xuất các hồ sơ đã được tích chọn trong bảng.
								</p>
							</div>
						</label>
					</div>
				</div>

				{/* Footer */}
				<div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						aria-label="Hủy"
						className="h-10 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
					>
						Hủy
					</button>
					<button
						type="button"
						onClick={() => onExport(exportScope)}
						disabled={exporting}
						aria-label="Bắt đầu xuất Excel"
						className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
					>
						{exporting ? "Đang tạo..." : "Bắt đầu xuất"}
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
};
