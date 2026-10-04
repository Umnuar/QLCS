import clsx from "clsx";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../AppContext";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
	id: string;
	message: string;
	type?: ToastType;
	duration?: number; // ms, mặc định 5000
	actionKey?: string; // Dùng để thay thế toast cũ thay vì chồng thêm nếu cùng hành động
	onUndo?: () => Promise<void> | void;
	undoLabel?: string;
	createdAt: number;
}

export type ToastOptions = Omit<ToastItem, "id" | "createdAt"> & {
	id?: string;
};

interface ToastContextType {
	showToast: (options: ToastOptions) => string;
	success: (message: string, options?: Partial<ToastOptions>) => string;
	error: (message: string, options?: Partial<ToastOptions>) => string;
	info: (message: string, options?: Partial<ToastOptions>) => string;
	removeToast: (id: string) => void;
	removeAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

interface ToastItemProps {
	toast: ToastItem;
	onClose: (id: string) => void;
	onUndo: (toast: ToastItem) => void;
}

const ToastItemView: React.FC<ToastItemProps> = ({
	toast,
	onClose,
	onUndo,
}) => {
	const totalDuration = toast.duration ?? 5000;
	const remainingTimeRef = useRef(totalDuration);
	const [progress, setProgress] = useState(100);
	const [isPaused, setIsPaused] = useState(false);

	useEffect(() => {
		if (isPaused) return;

		const interval = 25; // 25ms tick for smooth progress
		const timer = setInterval(() => {
			remainingTimeRef.current -= interval;
			const pct = Math.max(0, (remainingTimeRef.current / totalDuration) * 100);
			setProgress(pct);

			if (remainingTimeRef.current <= 0) {
				clearInterval(timer);
				onClose(toast.id);
			}
		}, interval);

		return () => clearInterval(timer);
	}, [isPaused, toast.id, onClose, totalDuration]);

	return (
		<div
			role={toast.type === "error" ? "alert" : "status"}
			aria-live={toast.type === "error" ? "assertive" : "polite"}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			onFocus={() => setIsPaused(true)}
			onBlur={() => setIsPaused(false)}
			className={clsx(
				"pointer-events-auto relative w-full sm:w-[460px] max-w-[480px] min-w-0 sm:min-w-[320px] rounded-2xl border px-4 py-3 shadow-xl transition-all duration-200 select-none overflow-hidden animate-in fade-in slide-in-from-bottom-2",
				toast.type === "error"
					? "bg-white text-slate-800 border-rose-200 dark:bg-slate-900 dark:text-slate-100 dark:border-rose-900/60 shadow-rose-950/10"
					: "bg-white text-slate-800 border-slate-200/90 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 shadow-slate-950/10 dark:shadow-black/40",
			)}
		>
			<div className="flex items-center gap-3 w-full">
				{/* 1. Icon trạng thái */}
				{toast.type === "error" ? (
					<AlertCircle
						className="w-5 h-5 text-rose-500 shrink-0"
						strokeWidth={2}
					/>
				) : toast.type === "info" ? (
					<Info
						className="w-5 h-5 text-blue-500 shrink-0"
						strokeWidth={2}
					/>
				) : (
					<CheckCircle2
						className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0"
						strokeWidth={2}
					/>
				)}

				{/* 2. Nội dung tối đa 2 dòng, cắt bằng dấu ... */}
				<span className="flex-1 text-xs sm:text-[13px] font-medium leading-snug line-clamp-2 break-words text-slate-800 dark:text-slate-200">
					{toast.message}
				</span>

				{/* 3. Nút Hoàn tác (nếu có, không gạch chân, >=36px desktop / >=44px mobile) */}
				{toast.onUndo && (
					<button
						type="button"
						onClick={() => onUndo(toast)}
						className="shrink-0 min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-xl font-bold text-xs sm:text-[13px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/70 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none transition-colors cursor-pointer select-none"
					>
						{toast.undoLabel || "Hoàn tác"}
					</button>
				)}

				{/* 4. Nút đóng X */}
				<button
					type="button"
					aria-label="Đóng thông báo"
					onClick={() => onClose(toast.id)}
					className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none transition-colors cursor-pointer select-none"
				>
					<X className="w-4 h-4" strokeWidth={2} />
				</button>
			</div>

			{/* Thanh đếm ngược mảnh ở mép dưới toast (tạm dừng khi hover/focus, tôn trọng motion-reduce) */}
			<div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden motion-reduce:hidden rounded-b-2xl">
				<div
					className={clsx(
						"h-full transition-[width] duration-75 ease-linear",
						toast.type === "error"
							? "bg-rose-500"
							: "bg-emerald-500 dark:bg-emerald-400",
					)}
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	);
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const removeAll = useCallback(() => {
		setToasts([]);
	}, []);

	const showToast = useCallback((options: ToastOptions): string => {
		const id =
			options.id ||
			`toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

		const newToast: ToastItem = {
			id,
			message: options.message,
			type: options.type || "success",
			duration: options.duration ?? 5000,
			actionKey: options.actionKey,
			onUndo: options.onUndo,
			undoLabel: options.undoLabel || "Hoàn tác",
			createdAt: Date.now(),
		};

		setToasts((prev) => {
			// Nếu cùng hành động lặp lại (cùng actionKey): thay thế toast cũ thay vì chồng thêm
			if (options.actionKey) {
				const existingIndex = prev.findIndex(
					(t) => t.actionKey === options.actionKey,
				);
				if (existingIndex !== -1) {
					const updated = [...prev];
					updated[existingIndex] = newToast;
					return updated;
				}
			}

			// Tối đa 3 toast: cái cũ nhất bị đẩy ra (FIFO)
			if (prev.length >= 3) {
				return [...prev.slice(prev.length - 2), newToast];
			}
			return [...prev, newToast];
		});

		return id;
	}, []);

	const handleUndo = useCallback(
		async (toast: ToastItem) => {
			removeToast(toast.id);
			if (toast.onUndo) {
				await toast.onUndo();
			}
			// Sau khi hoàn tác, hiện thông báo "Đã hoàn tác"
			showToast({
				message: "Đã hoàn tác",
				type: "success",
				duration: 3000,
			});
		},
		[removeToast, showToast],
	);

	const success = useCallback(
		(message: string, options?: Partial<ToastOptions>) => {
			return showToast({ ...options, message, type: "success" });
		},
		[showToast],
	);

	const error = useCallback(
		(message: string, options?: Partial<ToastOptions>) => {
			return showToast({ ...options, message, type: "error" });
		},
		[showToast],
	);

	const info = useCallback(
		(message: string, options?: Partial<ToastOptions>) => {
			return showToast({ ...options, message, type: "info" });
		},
		[showToast],
	);

	useEffect(() => {
		if (typeof window !== "undefined") {
			(window as any).__toast = {
				showToast,
				success,
				error,
				info,
				removeToast,
				removeAll,
			};
		}
	}, [showToast, success, error, info, removeToast, removeAll]);

	// Phím Esc đóng toast gần nhất
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && toasts.length > 0) {
				e.preventDefault();
				removeToast(toasts[toasts.length - 1].id);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toasts, removeToast]);

	if (typeof window !== "undefined") {
		(window as any).__toast = { showToast, success, error, info, removeToast, removeAll };
	}

	return (
		<ToastContext.Provider
			value={{ showToast, success, error, info, removeToast, removeAll }}
		>
			{children}
			{typeof document !== "undefined" &&
				toasts.length > 0 &&
				createPortal(
					<ToastPortal
						toasts={toasts}
						removeToast={removeToast}
						handleUndo={handleUndo}
					/>,
					document.body,
				)}
		</ToastContext.Provider>
	);
};

const ToastPortal: React.FC<{
	toasts: ToastItem[];
	removeToast: (id: string) => void;
	handleUndo: (toast: ToastItem) => void;
}> = ({ toasts, removeToast, handleUndo }) => {
	let isSidebarCollapsed = false;
	try {
		const app = useApp();
		isSidebarCollapsed = app.isSidebarCollapsed;
	} catch {
		// Fallback
	}

	return (
		<div
			className={clsx(
				"fixed bottom-6 right-0 pointer-events-none z-50 flex flex-col items-center gap-2 px-4 transition-all duration-200",
				isSidebarCollapsed
					? "left-0 sm:left-20"
					: "left-0 sm:left-60 lg:left-64",
			)}
			style={{
				paddingBottom: "max(0px, env(safe-area-inset-bottom))",
			}}
		>
			{toasts.map((toast) => (
				<ToastItemView
					key={toast.id}
					toast={toast}
					onClose={removeToast}
					onUndo={handleUndo}
				/>
			))}
		</div>
	);
};

export default ToastProvider;
