import clsx from "clsx";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { useAppContext } from "../AppContext";

type AlertType = "error" | "success" | "warning" | "info";

interface ModalOptions {
	title: string;
	message: string | ReactNode;
	type?: AlertType;
}

interface ModalContextType {
	showAlert: (
		titleOrOptions: string | ModalOptions,
		message?: string | ReactNode,
		type?: AlertType,
	) => void;
	showConfirm: (
		titleOrOptions: string | ModalOptions,
		message?: string | ReactNode,
		type?: AlertType,
	) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useModal() {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error("useModal must be used within a ModalProvider");
	}
	return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
	const { isDarkMode } = useAppContext();
	const [modalState, setModalState] = useState<{
		isOpen: boolean;
		isConfirm: boolean;
		options: ModalOptions;
		resolve?: (value: boolean) => void;
	} | null>(null);
	const previousActiveElement = useRef<HTMLElement | null>(null);
	const modalRef = useRef<HTMLDivElement | null>(null);

	const parseOptions = (
		titleOrOptions: string | ModalOptions,
		message?: string | ReactNode,
		type?: AlertType,
	): ModalOptions => {
		if (typeof titleOrOptions === "object") {
			return titleOrOptions;
		}
		return {
			title: titleOrOptions,
			message: message || "",
			type: type || "info",
		};
	};

	const showAlert = useCallback(
		(
			titleOrOptions: string | ModalOptions,
			message?: string | ReactNode,
			type?: AlertType,
		) => {
			previousActiveElement.current = document.activeElement as HTMLElement | null;
			const options = parseOptions(titleOrOptions, message, type);
			setModalState({ isOpen: true, isConfirm: false, options });
		},
		[],
	);

	const showConfirm = useCallback(
		(
			titleOrOptions: string | ModalOptions,
			message?: string | ReactNode,
			type?: AlertType,
		): Promise<boolean> => {
			previousActiveElement.current = document.activeElement as HTMLElement | null;
			const options = parseOptions(titleOrOptions, message, type);
			return new Promise((resolve) => {
				setModalState({ isOpen: true, isConfirm: true, options, resolve });
			});
		},
		[],
	);

	const handleClose = useCallback(
		(result: boolean) => {
			if (modalState?.resolve) {
				modalState.resolve(result);
			}
			setModalState(null);
			setTimeout(() => {
				previousActiveElement.current?.focus();
			}, 0);
		},
		[modalState],
	);

	useEffect(() => {
		if (!modalState?.isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				handleClose(false);
				return;
			}

			if (e.key === "Tab" && modalRef.current) {
				const focusableElements = Array.from(
					modalRef.current.querySelectorAll<HTMLElement>(
						'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
					),
				).filter(
					(el) =>
						el.offsetParent !== null ||
						el.offsetWidth > 0 ||
						el.offsetHeight > 0,
				);

				if (focusableElements.length === 0) return;

				const firstElement = focusableElements[0];
				const lastElement = focusableElements[focusableElements.length - 1];

				if (e.shiftKey) {
					if (
						document.activeElement === firstElement ||
						!modalRef.current.contains(document.activeElement)
					) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					if (
						document.activeElement === lastElement ||
						!modalRef.current.contains(document.activeElement)
					) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [modalState?.isOpen, handleClose]);

	return (
		<ModalContext.Provider value={{ showAlert, showConfirm }}>
			{children}
			{modalState &&
				modalState.isOpen &&
				createPortal(
					<div
						className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-950/50 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150"
						onClick={(e) => {
							if (e.target === e.currentTarget) handleClose(false);
						}}
					>
						<div
							ref={modalRef}
							role="alertdialog"
							aria-modal="true"
							aria-labelledby="modal-alert-title"
							aria-describedby="modal-alert-message"
							tabIndex={-1}
							className={clsx(
								"rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border zoom-in-95 duration-150 outline-hidden",
								isDarkMode
									? "bg-slate-900 border-slate-800 text-slate-100"
									: "bg-white border-slate-200 text-slate-900",
							)}
						>
							<div
								className={clsx(
									"px-6 py-5 border-b flex items-center space-x-3",
									isDarkMode ? "border-slate-800" : "border-slate-100",
								)}
							>
								<div
									className={clsx(
										"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
										modalState.options.type === "error"
											? "bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800/50"
											: modalState.options.type === "success"
												? "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50"
												: modalState.options.type === "warning"
													? "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50"
													: "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50",
									)}
								>
									{modalState.options.type === "error" && (
										<XCircle className="w-5 h-5" strokeWidth={1.5} />
									)}
									{modalState.options.type === "success" && (
										<CheckCircle className="w-5 h-5" strokeWidth={1.5} />
									)}
									{modalState.options.type === "warning" && (
										<AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
									)}
									{(!modalState.options.type ||
										modalState.options.type === "info") && (
										<Info className="w-5 h-5" strokeWidth={1.5} />
									)}
								</div>
								<h2
									id="modal-alert-title"
									className="text-lg font-black tracking-tight"
								>
									{modalState.options.title}
								</h2>
							</div>

							<div className="p-6">
								<p
									id="modal-alert-message"
									className={clsx(
										"text-sm font-medium leading-relaxed whitespace-pre-wrap",
										isDarkMode ? "text-slate-300" : "text-slate-600",
									)}
								>
									{modalState.options.message}
								</p>
							</div>

							<div
								className={clsx(
									"px-6 py-4 flex justify-end items-center space-x-3 border-t",
									isDarkMode
										? "bg-slate-800/30 border-slate-800"
										: "bg-slate-50 border-slate-100",
								)}
							>
								{modalState.isConfirm && (
									<button
										type="button"
										onClick={() => handleClose(false)}
										className="min-h-[44px] px-5 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
									>
										Hủy
									</button>
								)}
								<button
									type="button"
									onClick={() => handleClose(true)}
									autoFocus
									className={clsx(
										"min-h-[44px] px-5 rounded-2xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95",
										modalState.options.type === "error"
											? "bg-rose-600 hover:bg-rose-700"
											: modalState.options.type === "success"
												? "bg-emerald-600 hover:bg-emerald-700"
												: modalState.options.type === "warning"
													? "bg-amber-600 hover:bg-amber-700"
													: "bg-emerald-600 hover:bg-emerald-700",
									)}
								>
									{modalState.isConfirm ? "Xác nhận" : "Đóng"}
								</button>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</ModalContext.Provider>
	);
}
