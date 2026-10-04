import { Check, ChevronDown, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface SelectOption<T = string | number> {
	value: T;
	label: string;
	subLabel?: string;
	badge?: string;
	disabled?: boolean;
}

export interface CustomSelectProps<T = string | number> {
	value: T;
	onChange: (value: T) => void;
	options: (SelectOption<T> | T)[];
	placeholder?: string;
	label?: string;
	error?: string;
	disabled?: boolean;
	required?: boolean;
	searchable?: boolean;
	size?: "sm" | "md" | "lg";
	icon?: React.ReactNode;
	clearable?: boolean;
	onClear?: () => void;
	isActive?: boolean;
	variant?: "filter" | "form";
	defaultFilterValue?: T;
	className?: string;
	containerClassName?: string;
	dropdownClassName?: string;
	id?: string;
	name?: string;
}

export function CustomSelect<T extends string | number = string | number>({
	value,
	onChange,
	options,
	placeholder = "Chọn...",
	label,
	error,
	disabled = false,
	required = false,
	searchable = false,
	size = "md",
	icon,
	clearable = false,
	onClear,
	isActive,
	variant,
	defaultFilterValue,
	className = "",
	containerClassName = "",
	dropdownClassName = "",
	id,
	name,
}: CustomSelectProps<T>) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [openUpward, setOpenUpward] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
	const containerRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const optionListRef = useRef<HTMLDivElement>(null);

	// Chuẩn hóa options
	const normalizedOptions = useMemo<SelectOption<T>[]>(() => {
		return options.map((opt) => {
			if (
				typeof opt === "object" &&
				opt !== null &&
				"value" in opt &&
				"label" in opt
			) {
				return opt as SelectOption<T>;
			}
			return {
				value: opt as T,
				label: String(opt),
			};
		});
	}, [options]);

	const selectedOption = useMemo(() => {
		return normalizedOptions.find((opt) => opt.value === value);
	}, [normalizedOptions, value]);

	const shouldShowSearch = searchable || normalizedOptions.length > 8;

	const filteredOptions = useMemo(() => {
		if (!shouldShowSearch || !searchQuery.trim()) {
			return normalizedOptions;
		}
		const q = searchQuery.trim().toLowerCase();
		return normalizedOptions.filter((opt) => {
			const labelMatch = opt.label.toLowerCase().includes(q);
			const subLabelMatch = opt.subLabel?.toLowerCase().includes(q);
			const badgeMatch = opt.badge?.toLowerCase().includes(q);
			return labelMatch || subLabelMatch || badgeMatch;
		});
	}, [normalizedOptions, searchQuery, shouldShowSearch]);

	// Reset or initialize highlighted index when opening or filtering
	useEffect(() => {
		if (isOpen) {
			const selIdx = filteredOptions.findIndex((opt) => opt.value === value);
			if (selIdx >= 0) {
				setHighlightedIndex(selIdx);
			} else {
				const firstValid = filteredOptions.findIndex((opt) => !opt.disabled);
				setHighlightedIndex(firstValid >= 0 ? firstValid : 0);
			}
		} else {
			setHighlightedIndex(-1);
		}
	}, [isOpen, filteredOptions, value]);

	// Tự động lật hướng nếu cách đáy màn hình < 240px
	useEffect(() => {
		if (isOpen && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			setOpenUpward(spaceBelow < 240);
		}
	}, [isOpen]);

	useEffect(() => {
		if (isOpen && shouldShowSearch) {
			const timer = setTimeout(() => {
				searchInputRef.current?.focus();
			}, 50);
			return () => clearTimeout(timer);
		}
	}, [isOpen, shouldShowSearch]);

	const handleSelect = useCallback(
		(opt: SelectOption<T>) => {
			if (opt.disabled) return;
			onChange(opt.value);
			setIsOpen(false);
			setSearchQuery("");
		},
		[onChange],
	);

	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
				setSearchQuery("");
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				setIsOpen(false);
				setSearchQuery("");
				return;
			}

			if (e.key === "ArrowDown") {
				e.preventDefault();
				setHighlightedIndex((prev) => {
					let next = prev + 1;
					while (
						next < filteredOptions.length &&
						filteredOptions[next].disabled
					) {
						next++;
					}
					if (next >= filteredOptions.length) {
						// Loop back to first non-disabled
						next = 0;
						while (
							next < filteredOptions.length &&
							filteredOptions[next].disabled
						) {
							next++;
						}
					}
					if (next < filteredOptions.length) {
						const el = optionListRef.current?.children[next] as HTMLElement;
						el?.scrollIntoView({ block: "nearest" });
						return next;
					}
					return prev;
				});
				return;
			}

			if (e.key === "ArrowUp") {
				e.preventDefault();
				setHighlightedIndex((prev) => {
					let next = prev - 1;
					while (next >= 0 && filteredOptions[next].disabled) {
						next--;
					}
					if (next < 0) {
						// Loop back to last non-disabled
						next = filteredOptions.length - 1;
						while (next >= 0 && filteredOptions[next].disabled) {
							next--;
						}
					}
					if (next >= 0) {
						const el = optionListRef.current?.children[next] as HTMLElement;
						el?.scrollIntoView({ block: "nearest" });
						return next;
					}
					return prev;
				});
				return;
			}

			if (e.key === "Enter") {
				if (
					highlightedIndex >= 0 &&
					highlightedIndex < filteredOptions.length
				) {
					e.preventDefault();
					handleSelect(filteredOptions[highlightedIndex]);
				}
				return;
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, filteredOptions, highlightedIndex, handleSelect]);

	const toggleDropdown = () => {
		if (disabled) return;
		setIsOpen((prev) => !prev);
		if (isOpen) {
			setSearchQuery("");
		}
	};

	const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
		if (disabled) return;
		if (
			e.key === "ArrowDown" ||
			e.key === "ArrowUp" ||
			e.key === "Enter" ||
			e.key === " "
		) {
			e.preventDefault();
			setIsOpen(true);
		}
	};

	// Rule 2: Dropdown trong form nhập liệu là trường dữ liệu cố định, không phải bộ lọc tạm thời -> luôn dùng kiểu trung tính.
	// Nếu variant="form" hoặc có `label` (không ép variant="filter") -> Coi là form field.
	const isFormVariant =
		variant === "form" || (variant === undefined && Boolean(label));

	// Giá trị mặc định đại diện cho trạng thái "chưa lọc" / "mặc định":
	const isDefaultVal =
		value === "" ||
		value === "all" ||
		value === "default" ||
		value === undefined ||
		value === null ||
		(defaultFilterValue !== undefined && value === defaultFilterValue);

	// Chỉ kích hoạt tô xanh khi là bộ lọc VÀ giá trị KHÁC mặc định (đang lọc thật) (Rule 1 & Rule 2):
	const isEffectiveActive =
		!isFormVariant && (isActive !== undefined ? isActive : !isDefaultVal);

	const sizeStyles = {
		sm: {
			trigger: "h-8 sm:h-9 px-2.5 text-xs font-semibold rounded-xl",
			icon: "w-3.5 h-3.5",
			option: "px-2.5 py-1.5 text-xs",
		},
		md: {
			trigger: "px-3.5 py-2.5 text-sm rounded-xl min-h-[42px]",
			icon: "w-4 h-4",
			option: "px-3 py-2 text-xs",
		},
		lg: {
			trigger: "px-4 py-3 text-base rounded-2xl min-h-[48px]",
			icon: "w-5 h-5",
			option: "px-3.5 py-2.5 text-sm",
		},
	}[size];

	return (
		<div className={`relative w-full ${containerClassName}`} ref={containerRef}>
			{label && (
				<label
					htmlFor={id}
					className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 cursor-pointer"
					onClick={() => !disabled && setIsOpen(true)}
				>
					{label}
					{required && <span className="text-rose-500 ml-1">*</span>}
				</label>
			)}

			<button
				id={id}
				name={name}
				type="button"
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				onClick={toggleDropdown}
				onKeyDown={handleTriggerKeyDown}
				className={`w-full flex items-center justify-between gap-2 font-medium transition-all outline-hidden cursor-pointer select-none text-left
          ${
						isEffectiveActive
							? "border-emerald-500/80 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-600 font-bold hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40"
							: "bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 font-medium"
					}
          focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
          ${isOpen ? "border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20" : ""}
          ${error ? "border-rose-500 dark:border-rose-500 focus:ring-rose-500/20" : ""}
          ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}
          ${sizeStyles.trigger}
          ${className}
        `}
			>
				<div className="flex items-center gap-1.5 min-w-0 flex-1">
					{/* Dấu hiệu nhận biết thứ hai cho người khiếm sắc (Rule 5): chấm tròn xanh khi đang lọc thật */}
					{isEffectiveActive && (
						<span
							className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0"
							aria-hidden="true"
						/>
					)}

					{icon && (
						<span
							className={`shrink-0 flex items-center ${
								isEffectiveActive
									? "text-emerald-600 dark:text-emerald-400"
									: "text-slate-400"
							}`}
						>
							{icon}
						</span>
					)}

					{selectedOption ? (
						<span
							className={`truncate block ${
								isEffectiveActive
									? "font-bold text-emerald-900 dark:text-emerald-200"
									: "font-medium text-slate-700 dark:text-slate-300"
							}`}
						>
							{selectedOption.label}
						</span>
					) : (
						<span className="truncate block font-medium text-slate-400 dark:text-slate-500">
							{placeholder}
						</span>
					)}

					{selectedOption &&
						isEffectiveActive &&
						selectedOption.badge && (
							<span className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
								{selectedOption.badge}
							</span>
						)}
				</div>

				<div className="flex items-center shrink-0 gap-1">
					{/* Nút 'x' nhỏ để xóa lọc đó (Rule 1 & Rule 5) */}
					{isEffectiveActive && !disabled && (
						<span
							role="button"
							tabIndex={0}
							aria-label="Xóa bộ lọc này"
							title="Xóa bộ lọc này"
							onClick={(e) => {
								e.stopPropagation();
								if (onClear) {
									onClear();
								} else {
									onChange(
										(defaultFilterValue !== undefined
											? defaultFilterValue
											: "") as any,
									);
								}
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.stopPropagation();
									if (onClear) onClear();
									else
										onChange(
											(defaultFilterValue !== undefined
												? defaultFilterValue
												: "") as any,
										);
								}
							}}
							className="p-0.5 rounded-full hover:bg-emerald-200/70 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
						>
							<X className="w-3.5 h-3.5" strokeWidth={2} />
						</span>
					)}

					{/* Nếu clearable được bật ở trường form và có giá trị khác mặc định */}
					{isFormVariant &&
						clearable &&
						selectedOption &&
						!isDefaultVal &&
						!disabled && (
							<span
								role="button"
								tabIndex={0}
								aria-label="Xóa lựa chọn"
								onClick={(e) => {
									e.stopPropagation();
									if (onClear) {
										onClear();
									} else {
										onChange("" as any);
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.stopPropagation();
										if (onClear) onClear();
										else onChange("" as any);
									}
								}}
								className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer mr-0.5"
							>
								<X className="w-3.5 h-3.5" />
							</span>
						)}

					<ChevronDown
						className={`shrink-0 transition-transform duration-200 ${
							isEffectiveActive
								? "text-emerald-600 dark:text-emerald-400"
								: "text-slate-400 dark:text-slate-400"
						} ${isOpen ? "rotate-180" : ""} ${sizeStyles.icon}`}
						strokeWidth={1.5}
					/>
				</div>
			</button>

			{error && (
				<p className="mt-1 text-xs text-rose-500 font-medium animate-in fade-in">
					{error}
				</p>
			)}

			{isOpen && (
				<div
					role="listbox"
					className={`absolute left-0 right-0 z-[120] ${
						openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"
					} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl shadow-slate-950/20 dark:shadow-slate-950/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}
				>
					{shouldShowSearch && (
						<div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
							<div className="relative flex items-center">
								<Search
									className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 dark:text-slate-500 pointer-events-none"
									strokeWidth={1.5}
								/>
								<input
									ref={searchInputRef}
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Tìm kiếm..."
									className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
									onClick={(e) => e.stopPropagation()}
								/>
								{searchQuery && (
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										aria-label="Xóa tìm kiếm"
										className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
									>
										<X className="w-3.5 h-3.5" strokeWidth={1.5} />
									</button>
								)}
							</div>
						</div>
					)}

					<div
						ref={optionListRef}
						className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar"
					>
						{filteredOptions.length === 0 ? (
							<div className="py-6 px-3 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
								Không tìm thấy kết quả
							</div>
						) : (
							filteredOptions.map((opt, idx) => {
								const isSelected = opt.value === value;
								const isHighlighted = highlightedIndex === idx;
								return (
									<button
										key={String(opt.value)}
										type="button"
										role="option"
										aria-selected={isSelected}
										disabled={opt.disabled}
										onClick={() => handleSelect(opt)}
										onMouseEnter={() => setHighlightedIndex(idx)}
										className={`w-full flex items-center justify-between gap-2 rounded-xl text-left transition-colors cursor-pointer select-none ${
											sizeStyles.option
										} ${
											isSelected
												? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold"
												: isHighlighted
													? "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-500/30"
													: "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/90"
										} ${opt.disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
									>
										<div className="flex flex-col min-w-0 flex-1">
											<div className="flex items-center gap-1.5">
												<span className="truncate">{opt.label}</span>
												{opt.badge && (
													<span
														className={`shrink-0 px-1.5 py-0.2 text-[10px] font-semibold rounded-md border ${
															isSelected
																? "bg-emerald-100/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border-emerald-300/80 dark:border-emerald-700/80"
																: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
														}`}
													>
														{opt.badge}
													</span>
												)}
											</div>
											{opt.subLabel && (
												<span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal truncate">
													{opt.subLabel}
												</span>
											)}
										</div>

										{isSelected && (
											<Check
												className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5"
												strokeWidth={2}
											/>
										)}
									</button>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default CustomSelect;
