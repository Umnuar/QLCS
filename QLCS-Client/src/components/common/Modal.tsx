import clsx from "clsx";
import { X } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: React.ReactNode;
	description?: React.ReactNode;
	icon?: React.ReactNode;
	headerActions?: React.ReactNode;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: ModalSize;
	showCloseButton?: boolean;
	className?: string;
	bodyClassName?: string;
	zIndex?: number;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
	sm: "max-w-[420px] w-full",
	md: "max-w-[640px] w-full",
	lg: "max-w-[880px] w-full",
	xl: "max-w-[1200px] w-[92vw]",
};

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	description,
	icon,
	headerActions,
	children,
	footer,
	size = "md",
	showCloseButton = true,
	className,
	bodyClassName,
	zIndex = 50,
}) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const previousActiveElement = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (isOpen) {
			previousActiveElement.current = document.activeElement as HTMLElement | null;

			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === "Escape") {
					e.stopPropagation();
					onClose();
					return;
				}

				if (e.key === "Tab" && modalRef.current) {
					const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
						'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
					);
					const validElements = Array.from(focusableElements).filter(
						(el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
					);

					if (validElements.length === 0) return;

					const firstElement = validElements[0];
					const lastElement = validElements[validElements.length - 1];

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
			return () => {
				window.removeEventListener("keydown", handleKeyDown);
				if (previousActiveElement.current && typeof previousActiveElement.current.focus === "function") {
					previousActiveElement.current.focus();
				}
			};
		}
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return createPortal(
		<div
			className={clsx(
				"fixed inset-0 flex items-center justify-center p-4",
				"bg-[rgba(15,23,42,0.45)] dark:bg-[rgba(0,0,0,0.6)]",
				"animate-in fade-in duration-150 select-none",
			)}
			style={{ zIndex }}
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div
				ref={modalRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="app-modal-title"
				aria-describedby={description ? "app-modal-desc" : undefined}
				tabIndex={-1}
				className={clsx(
					"bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100",
					"border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl",
					"flex flex-col max-h-[85vh] overflow-hidden",
					"animate-in zoom-in-95 duration-150 outline-hidden select-text",
					SIZE_CLASSES[size],
					className,
				)}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950/70">
					<div className="flex items-center gap-3 min-w-0">
						{icon && (
							<div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
								{icon}
							</div>
						)}
						<div className="min-w-0">
							<h2
								id="app-modal-title"
								className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate"
							>
								{title}
							</h2>
							{description && (
								<p
									id="app-modal-desc"
									className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate"
								>
									{description}
								</p>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2 shrink-0 ml-3">
						{headerActions}
						{showCloseButton && (
							<button
								type="button"
								onClick={onClose}
								aria-label="Đóng hộp thoại"
								title="Đóng (Escape)"
								className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
							>
								<X className="w-5 h-5" strokeWidth={1.5} />
							</button>
						)}
					</div>
				</div>

				{/* Modal Body */}
				<div
					className={clsx(
						"flex-1 overflow-y-auto min-h-0",
						bodyClassName || "p-6",
					)}
				>
					{children}
				</div>

				{/* Modal Footer (Cố định ở chân) */}
				{footer && (
					<div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex items-center justify-end gap-3 shrink-0">
						{footer}
					</div>
				)}
			</div>
		</div>,
		document.body,
	);
};
