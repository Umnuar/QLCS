import {
	Activity,
	AlertCircle,
	CheckCircle2,
	Globe,
	Server,
	ShieldCheck,
	X,
} from "lucide-react";
import type React from "react";
import { createPortal } from "react-dom";
import { API_BASE_URL } from "../../api/apiClient";

interface ServerStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	latency: number | null;
	isBackendHealthy: boolean;
}

export const ServerStatusModal: React.FC<ServerStatusModalProps> = ({
	isOpen,
	onClose,
	latency,
	isBackendHealthy,
}) => {
	if (!isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
					<div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
						<Server className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
						<span>Trạng thái máy chủ backend</span>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Đóng"
						className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
					>
						<X className="w-5 h-5" strokeWidth={1.5} />
					</button>
				</div>

				<div className="p-5 space-y-3.5">
					{/* Status */}
					<div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
						<div className="flex items-center gap-3">
							<div
								className={`w-9 h-9 rounded-xl flex items-center justify-center ${
									isBackendHealthy
										? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
										: "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400"
								}`}
							>
								{isBackendHealthy ? (
									<CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
								) : (
									<AlertCircle className="w-5 h-5" strokeWidth={1.5} />
								)}
							</div>
							<div>
								<div className="font-bold text-xs text-slate-900 dark:text-slate-100">
									Kết Nối API
								</div>
								<div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
									{isBackendHealthy
										? "Hoạt động ổn định"
										: "Mất kết nối máy chủ"}
								</div>
							</div>
						</div>
						<span
							className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
								isBackendHealthy
									? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
									: "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300"
							}`}
						>
							{isBackendHealthy ? "ONLINE" : "OFFLINE"}
						</span>
					</div>

					{/* Latency */}
					<div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
								<Activity className="w-5 h-5" strokeWidth={1.5} />
							</div>
							<div>
								<div className="font-bold text-xs text-slate-900 dark:text-slate-100">
									Độ Trễ Phản Hồi
								</div>
								<div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
									Thời gian gửi & nhận gói tin
								</div>
							</div>
						</div>
						<span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
							{latency !== null ? `${latency} ms` : "Đang đo..."}
						</span>
					</div>

					{/* Backend URL */}
					<div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
						<div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
							<div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 shrink-0">
								<Globe className="w-5 h-5" strokeWidth={1.5} />
							</div>
							<div className="min-w-0 flex-1">
								<div className="font-bold text-xs text-slate-900 dark:text-slate-100">
									Địa Chỉ Máy Chủ
								</div>
								<div
									className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5"
									title={API_BASE_URL}
								>
									{API_BASE_URL}
								</div>
							</div>
						</div>
					</div>

					{/* Version */}
					<div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
								<ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
							</div>
							<div>
								<div className="font-bold text-xs text-slate-900 dark:text-slate-100">
									Phiên Bản Hệ Thống
								</div>
								<div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
									Xã Đăk Hà - Kon Tum
								</div>
							</div>
						</div>
						<span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
							v2.0.0
						</span>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
};

export default ServerStatusModal;
