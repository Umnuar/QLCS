import clsx from "clsx";
import {
	AlertCircle,
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	RefreshCw,
	Save,
	Search,
	UploadCloud,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CustomSelect as AppCustomSelect } from "../../../components/common/CustomSelect";
import { ExcelDropzone } from "../../../components/common/ExcelDropzone";
import { formatVietnameseNumber } from "../../../components/common/tableStyles";
import type { TabType } from "../types";

export interface ImportModalProps {
	isImportModalOpen: boolean;
	setIsImportModalOpen: (b: boolean) => void;
	isImporting: boolean;
	importProgress: number;
	importResult: {
		created: number;
		updated: number;
		errors: string[];
		total: number;
	} | null;
	setImportResult: (res: any) => void;
	previewData: { profiles: any[]; errors: string[]; activeTab: TabType } | null;
	confirmImport: () => void;
	cancelImport: () => void;
	fileInputRef: React.RefObject<HTMLInputElement>;
	handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleDownloadTemplate: () => void;
	activeTab: TabType;
	isDarkMode: boolean;
	panelClass: string;
	softTextClass: string;
	mappingData: {
		headers: string[];
		targetRows: any[][];
		activeTab: TabType;
		fileName: string;
		suggestedMapping: Record<string, string>;
		templateType: "HTXH" | "CTH" | "CUTRI";
	} | null;
	confirmMapping: (
		mapping: Record<string, string>,
		templateName?: string,
		autoApplyRemaining?: boolean,
	) => void;
	queueInfo?: { current: number; total: number } | null;
}

interface MappingSelectProps {
	value: string;
	onChange: (val: string) => void;
	options: string[];
	placeholder: string;
	isDarkMode: boolean;
	required: boolean;
}

function MappingSelect({
	value,
	onChange,
	options,
	placeholder,
	isDarkMode,
	required,
}: MappingSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [openUpward, setOpenUpward] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const portalRef = useRef<HTMLDivElement>(null);
	const [coords, setCoords] = useState({
		top: 0,
		bottom: 0,
		left: 0,
		width: 0,
	});

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			const target = event.target as Node;
			const clickedInsideTrigger =
				dropdownRef.current && dropdownRef.current.contains(target);
			const clickedInsidePortal =
				portalRef.current && portalRef.current.contains(target);

			if (!clickedInsideTrigger && !clickedInsidePortal) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		if (!isOpen || !dropdownRef.current) return;

		const updateCoords = () => {
			if (dropdownRef.current) {
				const rect = dropdownRef.current.getBoundingClientRect();
				setCoords({
					top: rect.top,
					bottom: rect.bottom,
					left: rect.left,
					width: rect.width,
				});
				const spaceBelow = window.innerHeight - rect.bottom;
				setOpenUpward(spaceBelow < 260);
			}
		};

		updateCoords();

		const handleScrollOrResize = () => {
			setIsOpen(false);
		};

		window.addEventListener("resize", handleScrollOrResize);

		const scrollableParent = dropdownRef.current?.closest(".overflow-y-auto");
		if (scrollableParent) {
			scrollableParent.addEventListener("scroll", handleScrollOrResize, {
				passive: true,
			});
		}

		return () => {
			window.removeEventListener("resize", handleScrollOrResize);
			if (scrollableParent) {
				scrollableParent.removeEventListener("scroll", handleScrollOrResize);
			}
		};
	}, [isOpen]);

	const filteredOptions = options.filter((opt) =>
		opt.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div ref={dropdownRef} className="relative w-full">
			<button
				type="button"
				onClick={() => {
					if (!isOpen && dropdownRef.current) {
						const rect = dropdownRef.current.getBoundingClientRect();
						setCoords({
							top: rect.top,
							bottom: rect.bottom,
							left: rect.left,
							width: rect.width,
						});
						const spaceBelow = window.innerHeight - rect.bottom;
						setOpenUpward(spaceBelow < 260);
					}
					setIsOpen(!isOpen);
				}}
				className={clsx(
					"w-full px-4 py-3 rounded-xl text-xs font-semibold border transition-all duration-200 outline-none flex items-center justify-between shadow-xs cursor-pointer",
					isDarkMode
						? "bg-slate-900 border-slate-700 text-white hover:border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
						: "bg-white border-slate-300 text-slate-800 hover:border-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
				)}
			>
				<span
					className={clsx(
						"truncate",
						!value && "text-slate-400 dark:text-slate-500 font-normal",
					)}
				>
					{value || placeholder}
				</span>
				<ChevronDown
					className={clsx(
						"h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			{isOpen &&
				coords.width > 0 &&
				createPortal(
					<div
						ref={portalRef}
						style={{
							position: "fixed",
							top: openUpward ? undefined : coords.bottom + 6,
							bottom: openUpward
								? window.innerHeight - coords.top + 6
								: undefined,
							left: coords.left,
							width: coords.width,
						}}
						className={clsx(
							"rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-60 z-[100000]",
							isDarkMode
								? "bg-slate-900 border-slate-700/80 text-white"
								: "bg-white border-slate-200 text-slate-800",
						)}
					>
						{options.length > 5 && (
							<div
								className={clsx(
									"p-2 border-b flex items-center space-x-2 shrink-0",
									isDarkMode
										? "border-slate-800 bg-slate-950/40"
										: "border-slate-100 bg-slate-50/50",
								)}
							>
								<Search className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1.5" />
								<input
									type="text"
									placeholder="Tìm cột..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className={clsx(
										"w-full bg-transparent text-xs font-semibold outline-none py-1",
										isDarkMode
											? "text-white placeholder-slate-500"
											: "text-slate-800 placeholder-slate-400",
									)}
								/>
								{search && (
									<button
										type="button"
										onClick={() => setSearch("")}
										className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors cursor-pointer"
									>
										<X className="h-3 w-3" />
									</button>
								)}
							</div>
						)}

						<div className="overflow-y-auto flex-1 py-1 max-h-48 scrollbar-hide">
							<button
								type="button"
								onClick={() => {
									onChange("");
									setIsOpen(false);
									setSearch("");
								}}
								className={clsx(
									"w-full text-left px-4 py-2.5 text-xs font-bold transition-colors duration-150 cursor-pointer border-b border-dashed",
									isDarkMode
										? "border-slate-800 hover:bg-slate-800 text-slate-400"
										: "border-slate-100 hover:bg-slate-50 text-slate-400",
									!value &&
										"text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20",
								)}
							>
								{required
									? "-- Chọn cột Excel (Bắt buộc) --"
									: "-- Bỏ qua / Không có --"}
							</button>

							{filteredOptions.length > 0
								? filteredOptions.map((opt, idx) => {
										const isSelected = value === opt;
										return (
											<button
												key={idx}
												type="button"
												onClick={() => {
													onChange(opt);
													setIsOpen(false);
													setSearch("");
												}}
												className={clsx(
													"w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors duration-150 truncate cursor-pointer",
													isSelected
														? "bg-emerald-600 text-white font-black"
														: isDarkMode
															? "hover:bg-slate-800 text-slate-200"
															: "hover:bg-emerald-50/40 text-slate-700",
												)}
											>
												{opt}
											</button>
										);
									})
								: options.length > 0 && (
										<div className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 font-medium text-center">
											Không tìm thấy cột phù hợp
										</div>
									)}
						</div>
					</div>,
					document.body,
				)}
		</div>
	);
}

export function ImportModal({
	isImportModalOpen,
	setIsImportModalOpen,
	isImporting,
	importProgress,
	importResult,
	setImportResult,
	previewData,
	confirmImport,
	cancelImport,
	fileInputRef,
	handleFileUpload,
	handleDownloadTemplate,
	activeTab,
	isDarkMode,
	panelClass,
	softTextClass,
	mappingData,
	confirmMapping,
	queueInfo,
}: ImportModalProps) {
	const [importPage, setImportPage] = useState(1);
	const [importLimit, setImportLimit] = useState(20);
	const [showErrorDetails, setShowErrorDetails] = useState(false);
	const [showAllErrors, setShowAllErrors] = useState(false);
	const [filterOnlyIssues, setFilterOnlyIssues] = useState(false);
	const [fileDropError, setFileDropError] = useState<string | null>(null);

	// Mapping state
	const [customMapping, setCustomMapping] = useState<Record<string, string>>(
		{},
	);
	const [templateName, setTemplateName] = useState("");
	const [savedTemplates, setSavedTemplates] = useState<
		{ name: string; mapping: Record<string, string> }[]
	>([]);
	const [selectedTemplateName, setSelectedTemplateName] = useState("");
	const [autoApplyRemaining, setAutoApplyRemaining] = useState(false);

	// Reset pagination on new preview
	useEffect(() => {
		setImportPage(1);
		setShowErrorDetails(false);
		setFilterOnlyIssues(false);
		setFileDropError(null);
	}, [previewData]);

	// Sync state when mappingData changes
	useEffect(() => {
		if (mappingData) {
			setCustomMapping(mappingData.suggestedMapping || {});
			setTemplateName("");
			setSelectedTemplateName("");
			setAutoApplyRemaining(false);

			const key = "import_templates";
			const savedRaw = localStorage.getItem(key);
			if (savedRaw) {
				try {
					const parsedTemplates = JSON.parse(savedRaw) as {
						name: string;
						mapping: Record<string, string>;
					}[];
					setSavedTemplates(parsedTemplates);

					let bestMatch: (typeof parsedTemplates)[0] | null = null;
					let bestScore = 0;

					for (const t of parsedTemplates) {
						const mappedCols = Object.values(t.mapping).filter(
							(v) => typeof v === "string" && v.trim() !== "",
						);
						if (mappedCols.length === 0) continue;

						const matchCount = mappedCols.filter((col) =>
							mappingData.headers.includes(col),
						).length;
						const ratio = matchCount / mappedCols.length;

						if (ratio >= 0.8 && matchCount >= 2) {
							if (ratio > bestScore) {
								bestScore = ratio;
								bestMatch = t;
							} else if (
								ratio === bestScore &&
								matchCount >
									(bestMatch
										? Object.values(bestMatch.mapping).filter(Boolean).length
										: 0)
							) {
								bestMatch = t;
							}
						}
					}

					if (bestMatch) {
						const cleanedMapping: Record<string, string> = {};
						for (const [k, v] of Object.entries(bestMatch.mapping)) {
							if (typeof v === "string" && mappingData.headers.includes(v)) {
								cleanedMapping[k] = v;
							} else {
								cleanedMapping[k] = "";
							}
						}
						setCustomMapping(cleanedMapping);
						setSelectedTemplateName(bestMatch.name);
					} else {
						setCustomMapping(mappingData.suggestedMapping || {});
						setSelectedTemplateName("");
					}
				} catch (err) {
					console.error("Lỗi phân tích cú pháp template lưu trữ:", err);
					setSavedTemplates([]);
					setCustomMapping(mappingData.suggestedMapping || {});
					setSelectedTemplateName("");
				}
			} else {
				setSavedTemplates([]);
				setCustomMapping(mappingData.suggestedMapping || {});
				setSelectedTemplateName("");
			}
		}
	}, [mappingData, activeTab]);

	const getFieldsList = () => {
		const detectedType = mappingData?.templateType;

		const commonFields = [
			{ key: "stt", label: "Số thứ tự (STT)", required: false },
			{ key: "name", label: "Họ và tên", required: true },
			{ key: "dob", label: "Năm sinh / Ngày sinh", required: true },
			{ key: "genderNam", label: "Giới tính: Nam", required: true },
			{ key: "genderNu", label: "Giới tính: Nữ", required: true },
			{ key: "cccd", label: "Số CCCD / CMND (nếu có)", required: false },
			{ key: "ethnicity", label: "Dân tộc", required: false },
			{ key: "residence", label: "Cư trú (nếu có)", required: false },
			{ key: "currentAddress", label: "Nơi ở hiện nay", required: false },
			{ key: "notes", label: "Ghi chú", required: false },
			{ key: "received", label: "Đã nhận quà", required: false },
		];

		if (detectedType === "HTXH" || activeTab === "htxh") {
			return [
				...commonFields,
				{
					key: "age75plus",
					label: "Đối tượng đủ 75 tuổi trở lên",
					required: false,
				},
				{
					key: "age70to74poor",
					label: "Từ 70-74 tuổi thuộc hộ nghèo, cận nghèo",
					required: false,
				},
				{ key: "baoTro", label: "Đang hưởng Bảo trợ xã hội", required: false },
				{ key: "huuTri", label: "Đang hưởng Hưu trí", required: false },
				{
					key: "huuTuatBaoHiem",
					label: "Đang hưởng Hưu, Tuất BH",
					required: false,
				},
				{
					key: "nguoiCoCong",
					label: "Đang hưởng Người có công",
					required: false,
				},
			];
		}

		if (detectedType === "CTH" || activeTab === "chuctho") {
			return [
				...commonFields,
				{ key: "age60", label: "Tròn 60 tuổi", required: false },
				{ key: "age65", label: "Tròn 65 tuổi", required: false },
				{ key: "age70", label: "Tròn 70 tuổi", required: false },
				{ key: "age75", label: "Tròn 75 tuổi", required: false },
				{ key: "age80", label: "Tròn 80 tuổi", required: false },
				{ key: "age85", label: "Tròn 85 tuổi", required: false },
				{ key: "age90", label: "Tròn 90 tuổi", required: false },
				{ key: "age95", label: "Tròn 95 tuổi", required: false },
				{ key: "age100", label: "Tròn 100 tuổi", required: false },
				{ key: "ageOver100", label: "Trên 100 tuổi", required: false },
			];
		}

		return commonFields;
	};

	const isMappingValid = () => {
		const nameMapped = !!customMapping["name"];
		const dobMapped = !!customMapping["dob"];
		const genderNamMapped = !!customMapping["genderNam"];
		const genderNuMapped = !!customMapping["genderNu"];
		return nameMapped && dobMapped && (genderNamMapped || genderNuMapped);
	};

	const handleSaveErrorLog = () => {
		if (!importResult || importResult.errors.length === 0) return;
		const content = importResult.errors
			.map((e: string) => `[${new Date().toLocaleString("vi-VN")}] ${e}`)
			.join("\n");
		const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `import_errors_${new Date().toISOString().slice(0, 10)}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	// DOB format validation check
	const isDobError = (dob: any) => {
		if (!dob) return true;
		const s = String(dob).trim();
		if (s.includes("/") && s.split("/").length === 3) {
			const parts = s.split("/");
			const d = parseInt(parts[0], 10);
			const m = parseInt(parts[1], 10);
			const y = parseInt(parts[2], 10);
			if (
				isNaN(d) ||
				isNaN(m) ||
				isNaN(y) ||
				m < 1 ||
				m > 12 ||
				d < 1 ||
				d > 31 ||
				y < 1900 ||
				y > 2100
			) {
				return true;
			}
			return false;
		} else if (/^\d{4}$/.test(s)) {
			const y = parseInt(s, 10);
			return isNaN(y) || y < 1900 || y > 2100;
		}
		return true;
	};

	const getRowIssueInfo = (row: any) => {
		if (!row.name || String(row.name).trim() === "") {
			return { isError: true, isWarning: false, reason: "Thiếu họ và tên" };
		}
		if (isDobError(row.dob)) {
			return {
				isError: true,
				isWarning: false,
				reason: "Ngày sinh không đúng định dạng (DD/MM/YYYY hoặc YYYY)",
			};
		}
		if (row.hasError) {
			return {
				isError: true,
				isWarning: false,
				reason: row.errorMessage || "Dữ liệu dòng có lỗi",
			};
		}
		if (row._displayStatus === "orange") {
			return {
				isError: false,
				isWarning: true,
				reason: "Chưa tới ngày sinh nhật trong năm tính toán",
			};
		}
		return { isError: false, isWarning: false, reason: "" };
	};

	const getMilestoneOrCategory = (p: any, tab: TabType) => {
		if (tab === "chuctho") {
			if (p.age60) return "Tròn 60 tuổi";
			if (p.age65) return "Tròn 65 tuổi";
			if (p.age70) return "Tròn 70 tuổi";
			if (p.age75) return "Tròn 75 tuổi";
			if (p.age80) return "Tròn 80 tuổi";
			if (p.age85) return "Tròn 85 tuổi";
			if (p.age90) return "Tròn 90 tuổi";
			if (p.age95) return "Tròn 95 tuổi";
			if (p.age100) return "Tròn 100 tuổi";
			if (p.ageOver100) return "Trên 100 tuổi";
			if (p.age) return `${p.age} tuổi`;
			return "Người cao tuổi";
		} else {
			const list: string[] = [];
			if (p.age75plus) list.push("Đủ 75+");
			if (p.age70to74poor) list.push("70-74 Nghèo");
			if (p.baoTro) list.push("Bảo trợ");
			if (p.huuTri) list.push("Hưu trí");
			if (p.huuTuatBaoHiem) list.push("Hưu/Tuất");
			if (p.nguoiCoCong) list.push("Có công");
			return list.length > 0 ? list.join(", ") : "HTXH";
		}
	};

	const handleSwitchFile = () => {
		cancelImport();
	};

	const modalRef = useRef<HTMLDivElement>(null);
	const previousActiveElementRef = useRef<HTMLElement | null>(null);

	const handleCloseModal = useCallback(() => {
		cancelImport();
		setIsImportModalOpen(false);
	}, [cancelImport, setIsImportModalOpen]);

	useEffect(() => {
		if (isImportModalOpen) {
			previousActiveElementRef.current = document.activeElement as HTMLElement | null;

			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === "Escape" && !isImporting) {
					if (importResult) {
						setImportResult(null);
					} else if (isImportModalOpen) {
						handleCloseModal();
					}
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
				if (
					previousActiveElementRef.current &&
					typeof previousActiveElementRef.current.focus === "function"
				) {
					previousActiveElementRef.current.focus();
				}
			};
		}
	}, [isImportModalOpen, importResult, isImporting, handleCloseModal, setImportResult]);

	// Calculations for Preview Table
	const allProfiles = previewData?.profiles || [];
	const errorRowsCount = allProfiles.filter((p) => getRowIssueInfo(p).isError).length;
	const warningRowsCount = allProfiles.filter((p) => getRowIssueInfo(p).isWarning).length;
	const validRowsCount = allProfiles.filter(
		(p) => !getRowIssueInfo(p).isError && !getRowIssueInfo(p).isWarning,
	).length;

	const filteredProfiles = filterOnlyIssues
		? allProfiles.filter(
				(p) => getRowIssueInfo(p).isError || getRowIssueInfo(p).isWarning,
			)
		: allProfiles;

	const maxPage = Math.ceil(filteredProfiles.length / importLimit) || 1;
	const displayData = filteredProfiles.slice(
		(importPage - 1) * importLimit,
		importPage * importLimit,
	);

	const activeFileName =
		previewData?.profiles?.[0]?._sourceFile ||
		mappingData?.fileName ||
		(activeTab === "chuctho"
			? "Danh Sách Chúc Thọ.xlsx"
			: "Danh Sách HTXH.xlsx");

	return (
		<>
			{isImportModalOpen &&
				createPortal(
					<div
						className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150"
						onClick={(e) => {
							if (
								e.target === e.currentTarget &&
								!mappingData &&
								!previewData &&
								!isImporting
							) {
								handleCloseModal();
							}
						}}
					>
						<div
							ref={modalRef}
							role="dialog"
							aria-modal="true"
							aria-labelledby="import-modal-title"
							onClick={(e) => e.stopPropagation()}
							className={clsx(
								"bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-[max-width,width] duration-150 motion-reduce:transition-none select-text",
								previewData
									? "max-w-[1240px] w-[92vw]"
									: mappingData
										? "max-w-4xl w-full"
										: "max-w-[670px] w-full",
							)}
						>
							{/* Header */}
							<div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
										<UploadCloud className="w-5 h-5" strokeWidth={1.5} />
									</div>
									<div className="min-w-0">
										<h2
											id="import-modal-title"
											className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate"
										>
											{previewData
												? "Xem trước dữ liệu"
												: mappingData
													? "Khớp cột dữ liệu"
													: `Nhập dữ liệu Excel — ${activeTab === "chuctho" ? "Hồ sơ chúc thọ" : activeTab === "htxh" ? "Hưu trí xã hội" : "Cử tri"}`}
										</h2>
										<p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
											{previewData ? (
												<>
													Tệp:{" "}
													<strong className="text-slate-700 dark:text-slate-300">
														{activeFileName}
													</strong>{" "}
													• {formatVietnameseNumber(previewData.profiles.length)} dòng
												</>
											) : mappingData ? (
												<>
													Tệp:{" "}
													<strong className="text-slate-700 dark:text-slate-300">
														{mappingData.fileName}
													</strong>
												</>
											) : (
												"Chọn tệp Excel để bắt đầu đối soát dữ liệu"
											)}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2 shrink-0 ml-3">
									{(previewData || mappingData) && (
										<button
											type="button"
											onClick={handleSwitchFile}
											className="min-h-[44px] px-3.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
										>
											<RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
											<span>Đổi tệp khác</span>
										</button>
									)}
									<button
										type="button"
										onClick={handleCloseModal}
										aria-label="Đóng modal"
										title="Đóng (Escape)"
										className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
									>
										<X className="w-5 h-5" strokeWidth={1.5} />
									</button>
								</div>
							</div>

							{/* Thanh bước chuẩn hóa ở đầu modal */}
							<div className="px-6 py-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 sm:gap-6 text-xs shrink-0 select-none">
								{[
									{ num: 1, label: "Chọn tệp" },
									{ num: 2, label: "Khớp cột" },
									{ num: 3, label: "Xem trước" },
								].map((st, idx, arr) => {
									const currentStepNum = previewData ? 3 : mappingData ? 2 : 1;
									const isCompleted = currentStepNum > st.num;
									const isActive = currentStepNum === st.num;
									return (
										<div key={st.num} className="flex items-center gap-2 sm:gap-4">
											<div
												className={clsx(
													"flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all",
													isActive
														? "bg-emerald-600 text-white shadow-xs"
														: isCompleted
															? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
															: "text-slate-700 dark:text-slate-200 bg-slate-200/90 dark:bg-slate-800 font-semibold",
												)}
											>
												{isCompleted ? (
													<Check className="w-3.5 h-3.5" strokeWidth={2.5} />
												) : (
													<span className="w-4 text-center">{st.num}</span>
												)}
												<span>{st.label}</span>
											</div>
											{idx < arr.length - 1 && (
												<ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
											)}
										</div>
									);
								})}
							</div>

							{/* Body Content */}
							{isImporting && (previewData || mappingData) ? (
								<div className="flex flex-col items-center justify-center py-20 px-4">
									<div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
									<h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">
										Đang xử lý dữ liệu...
									</h3>
									<p
										className={clsx("text-xs font-medium mb-6", softTextClass)}
									>
										Vui lòng không đóng cửa sổ này
									</p>
									<div className="w-full max-w-md bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
										<div
											className="bg-emerald-600 h-3 rounded-full transition-all duration-300 ease-out"
											style={{ width: `${importProgress}%` }}
										></div>
									</div>
									<p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
										{importProgress}%
									</p>
								</div>
							) : previewData ? (
								<div className="flex flex-col flex-1 min-h-0 overflow-hidden">
									{/* Status Alerts */}
									<div className="px-6 pt-4 flex items-center gap-3 flex-wrap shrink-0">
										{/* Chip Hợp lệ */}
										<div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
											<CheckCircle2
												className="w-4 h-4 text-emerald-600"
												strokeWidth={1.5}
											/>
											<span>Hợp lệ: {formatVietnameseNumber(validRowsCount)}</span>
										</div>

										{/* Chip Cảnh báo (chỉ hiện khi > 0) */}
										{warningRowsCount > 0 && (
											<div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
												<AlertCircle
													className="w-4 h-4 text-amber-600"
													strokeWidth={1.5}
												/>
												<span>Cảnh báo: {formatVietnameseNumber(warningRowsCount)}</span>
											</div>
										)}

										{/* Chip Lỗi (chỉ hiện khi > 0) */}
										{errorRowsCount > 0 && (
											<button
												type="button"
												onClick={() => setShowErrorDetails(!showErrorDetails)}
												className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-rose-100/80 transition-colors shadow-2xs"
											>
												<AlertTriangle
													className="w-4 h-4 text-rose-600"
													strokeWidth={1.5}
												/>
												<span>
													Lỗi: {formatVietnameseNumber(errorRowsCount)}
												</span>
											</button>
										)}

										{/* Nút lọc: Chỉ hiện dòng lỗi/cảnh báo */}
										{(errorRowsCount > 0 || warningRowsCount > 0) && (
											<button
												type="button"
												onClick={() => {
													setFilterOnlyIssues(!filterOnlyIssues);
													setImportPage(1);
												}}
												className={clsx(
													"px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
													filterOnlyIssues
														? "bg-amber-100 dark:bg-amber-900/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200"
														: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700",
												)}
											>
												<span>
													{filterOnlyIssues
														? "Hiện tất cả dòng"
														: "Chỉ hiện dòng lỗi/cảnh báo"}
												</span>
											</button>
										)}
									</div>

									{/* Expandable Error Details */}
									{showErrorDetails && previewData.errors.length > 0 && (
										<div className="mx-6 mt-3 p-3.5 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl max-h-32 overflow-y-auto text-xs text-rose-700 dark:text-rose-300 space-y-1 shrink-0">
											{previewData.errors.slice(0, 50).map((err, i) => (
												<div key={i} className="flex items-start gap-1.5">
													<span className="text-rose-500">•</span>
													<span>{err}</span>
												</div>
											))}
											{previewData.errors.length > 50 && (
												<div className="font-bold text-rose-600 pt-1">
													...và {previewData.errors.length - 50} lỗi khác
												</div>
											)}
										</div>
									)}

									{/* Table Container: 10 Cột với Thanh Cuộn Ngang & Ghim 3 Cột Đầu */}
									<div className="p-4 sm:p-5 flex-1 min-h-0 flex flex-col overflow-hidden">
										<div className="overflow-x-auto overflow-y-auto flex-1 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
											<table className="w-full min-w-[1100px] text-left border-separate border-spacing-0 text-xs whitespace-nowrap">
												<thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold sticky top-0 z-30 shadow-xs">
													<tr>
														{/* 1. STT */}
														<th className="py-2.5 px-2.5 border-b border-r border-slate-200 dark:border-slate-800 text-center sticky left-0 z-40 bg-slate-100 dark:bg-slate-950 w-[52px] min-w-[52px] max-w-[52px]">
															<span className="text-slate-400 dark:text-slate-500 font-normal mr-0.5">1.</span> STT
														</th>
														{/* 2. Thôn / Diện */}
														<th className="py-2.5 px-2.5 border-b border-r border-slate-200 dark:border-slate-800 sticky left-[52px] z-40 bg-slate-100 dark:bg-slate-950 w-[112px] min-w-[112px] max-w-[112px]">
															<span className="text-slate-400 dark:text-slate-500 font-normal mr-0.5">2.</span> Thôn / Diện
														</th>
														{/* 3. Họ và Tên */}
														<th className="py-2.5 px-2.5 border-b border-r border-slate-200 dark:border-slate-800 sticky left-[164px] z-40 bg-slate-100 dark:bg-slate-950 w-[180px] min-w-[180px] max-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
															<span className="text-slate-400 dark:text-slate-500 font-normal mr-0.5">3.</span> Họ và tên
														</th>
														{/* 4. Ngày Sinh */}
														<th className="py-2.5 px-2.5 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-center min-w-[140px]">
															<span className="text-slate-400 dark:text-slate-500 font-normal mr-0.5">4.</span> Ngày sinh
														</th>
														{/* 5. Giới Tính */}
														<th className="py-2.5 px-2.5 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-center min-w-[80px]">
															<span className="text-slate-400 dark:text-slate-500 font-normal mr-0.5">5.</span> Giới tính
														</th>
														{/* 6. Dân Tộc */}
														<th className="py-2.5 px-2.5 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 min-w-[90px]">
															<span className="text-slate-400 dark:text-slate-500 font-normal mr-0.5">6.</span> Dân tộc
														</th>
														{/* 7. CCCD */}
														<th className="py-2.5 px-2.5 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 min-w-[120px]">
															<span className="text-slate-400 dark:text-slate-500 font-normal mr-0.5">7.</span> CCCD
														</th>
														{/* 8. Địa Chỉ */}
														<th className="py-2.5 px-2.5 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 min-w-[160px]">
															<span className="text-slate-400 dark:text-slate-500 font-normal mr-0.5">8.</span> Địa chỉ
														</th>
														{/* 9. Mốc Tuổi / Diện Hưởng */}
														<th className="py-2.5 px-2.5 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 min-w-[140px]">
															<span className="text-slate-400 dark:text-slate-500 font-normal mr-0.5">9.</span> Mốc tuổi / Diện hưởng
														</th>
														{/* 10. Ghi Chú */}
														<th className="py-2.5 px-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 min-w-[120px]">
															<span className="text-slate-400 dark:text-slate-500 font-normal mr-0.5">10.</span> Ghi chú
														</th>
													</tr>
												</thead>
												<tbody>
													{displayData.map((row, idx) => {
														const issue = getRowIssueInfo(row);
														const isErr = issue.isError;
														const isWarn = issue.isWarning;
														const stickyBg = isErr
															? "bg-rose-50 dark:bg-rose-950/90 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/90"
															: isWarn
																? "bg-amber-50 dark:bg-amber-950/90 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/90"
																: "bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/70";
														const milestoneLabel = getMilestoneOrCategory(
															row,
															activeTab,
														);
														const rowSTT =
															(importPage - 1) * importLimit + idx + 1;

														return (
															<tr
																key={idx}
																title={issue.reason || undefined}
																className={clsx(
																	"group transition-colors",
																	isErr
																		? "bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-medium"
																		: isWarn
																			? "bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-medium"
																			: "hover:bg-slate-50 dark:hover:bg-slate-800/60",
																)}
															>
																{/* 1. STT (Sticky 1) */}
																<td
																	className={`py-1.5 px-2.5 text-center font-sans tabular-nums border-b border-r border-slate-100 dark:border-slate-800 sticky left-0 z-10 w-[52px] min-w-[52px] max-w-[52px] ${stickyBg}`}
																>
																	<div className="flex items-center justify-center gap-1">
																		{isErr && (
																			<span title={issue.reason} className="inline-flex items-center">
																				<AlertTriangle
																					className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0"
																					strokeWidth={2}
																				/>
																			</span>
																		)}
																		{isWarn && (
																			<span title={issue.reason} className="inline-flex items-center">
																				<AlertCircle
																					className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0"
																					strokeWidth={2}
																				/>
																			</span>
																		)}
																		<span>{formatVietnameseNumber(row.stt || rowSTT)}</span>
																	</div>
																</td>

																{/* 2. Thôn / Diện (Sticky 2) */}
																<td
																	className={`py-1.5 px-2.5 border-b border-r border-slate-100 dark:border-slate-800 sticky left-[52px] z-10 w-[112px] min-w-[112px] max-w-[112px] truncate ${stickyBg}`}
																>
																	<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
																		{row.residence ||
																			(row.villageId
																				? `Thôn ${row.villageId}`
																				: "Thôn 1")}
																	</span>
																</td>

																{/* 3. Họ và Tên (Sticky 3) */}
																<td
																	className={`py-1.5 px-2.5 font-bold uppercase border-b border-r border-slate-100 dark:border-slate-800 sticky left-[164px] z-10 w-[180px] min-w-[180px] max-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] truncate ${stickyBg}`}
																>
																	{row.name || row.fullName || (
																		<span className="text-slate-400 dark:text-slate-500">—</span>
																	)}
																</td>

																{/* 4. Ngày Sinh */}
																<td
																	className={clsx(
																		"py-1.5 px-2.5 text-center font-sans tabular-nums border-b border-r border-slate-100 dark:border-slate-800",
																		isDobError(row.dob)
																			? "bg-rose-100/90 text-rose-950 dark:bg-rose-900/60 dark:text-rose-100 font-bold"
																			: "",
																	)}
																	title={
																		isDobError(row.dob)
																			? "Ngày sinh không đúng định dạng (DD/MM/YYYY hoặc YYYY)"
																			: undefined
																	}
																>
																	<span>
																		{row.dob || (
																			<span className="text-slate-400 dark:text-slate-500">—</span>
																		)}
																	</span>
																</td>

																{/* 5. Giới Tính */}
																<td className="py-1.5 px-2.5 text-center border-b border-r border-slate-100 dark:border-slate-800">
																	<span
																		className={clsx(
																			"px-2 py-0.5 rounded-full text-[11px] font-bold",
																			String(row.gender)
																				.toLowerCase()
																				.includes("nam")
																				? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
																				: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300",
																		)}
																	>
																		{row.gender || (
																			<span className="text-slate-400 dark:text-slate-500">—</span>
																		)}
																	</span>
																</td>

																{/* 6. Dân Tộc */}
																<td className="py-1.5 px-2.5 border-b border-r border-slate-100 dark:border-slate-800">
																	{row.ethnicity || "Kinh"}
																</td>

																{/* 7. CCCD (Không bắt buộc, ô trống hiển thị — xám trung tính) */}
																<td className="py-1.5 px-2.5 font-sans tabular-nums border-b border-r border-slate-100 dark:border-slate-800">
																	{row.cccd ? (
																		`••••••••${String(row.cccd).slice(-4)}`
																	) : (
																		<span className="text-slate-400 dark:text-slate-500">—</span>
																	)}
																</td>

																{/* 8. Địa Chỉ */}
																<td
																	className="py-1.5 px-2.5 border-b border-r border-slate-100 dark:border-slate-800 truncate max-w-[200px]"
																	title={row.currentAddress || row.residence}
																>
																	{row.currentAddress || row.residence || (
																		<span className="text-slate-400 dark:text-slate-500">—</span>
																	)}
																</td>

																{/* 9. Mốc Tuổi / Diện Hưởng */}
																<td className="py-1.5 px-2.5 border-b border-r border-slate-100 dark:border-slate-800">
																	<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
																		{milestoneLabel}
																	</span>
																</td>

																{/* 10. Ghi Chú */}
																<td
																	className="py-1.5 px-2.5 text-slate-500 truncate max-w-[140px] border-b border-slate-100 dark:border-slate-800"
																	title={row.notes}
																>
																	{row.notes || (
																		<span className="text-slate-400 dark:text-slate-500">—</span>
																	)}
																</td>
															</tr>
														);
													})}
												</tbody>
											</table>
										</div>
									</div>

									{/* Footer controls & Pagination: 1 dòng duy nhất (white-space: nowrap) */}
									<div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between whitespace-nowrap gap-4 shrink-0 overflow-x-auto">
										{/* Trái: Số bản ghi */}
										<div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
											<span>Hiển thị</span>
											<AppCustomSelect<number>
												value={importLimit}
												onChange={(val) => {
													setImportLimit(Number(val));
													setImportPage(1);
												}}
												options={[
													{ value: 10, label: "10" },
													{ value: 20, label: "20" },
													{ value: 50, label: "50" },
													{ value: 100, label: "100" },
												]}
												size="sm"
												variant="form"
												containerClassName="w-20"
											/>
											<span>/ {formatVietnameseNumber(filteredProfiles.length)} bản ghi</span>
										</div>

										{/* Giữa: Phân trang */}
										<div className="flex items-center gap-2 shrink-0">
											<button
												type="button"
												disabled={importPage === 1}
												onClick={() =>
													setImportPage((p) => Math.max(1, p - 1))
												}
												className="min-h-[40px] px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
											>
												‹ Trước
											</button>
											<span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2 tabular-nums">
												{importPage} / {maxPage}
											</span>
											<button
												type="button"
												disabled={importPage >= maxPage}
												onClick={() => setImportPage((p) => p + 1)}
												className="min-h-[40px] px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
											>
												Sau ›
											</button>
										</div>

										{/* Phải: Hủy & Xác nhận nhập */}
										<div className="flex items-center gap-2.5 shrink-0">
											<button
												type="button"
												onClick={handleCloseModal}
												className="min-h-[44px] px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs transition-colors cursor-pointer active:scale-95"
											>
												Hủy
											</button>
											<div className="relative group/btn">
												<button
													type="button"
													onClick={confirmImport}
													disabled={isImporting || validRowsCount === 0}
													className={clsx(
														"min-h-[44px] px-5 font-bold rounded-2xl text-xs shadow-xs transition-all flex items-center gap-2 active:scale-95",
														validRowsCount > 0
															? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
															: "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none",
													)}
												>
													{isImporting
														? "Đang nhập..."
														: `Xác nhận nhập (${formatVietnameseNumber(validRowsCount)} hợp lệ)`}
												</button>
												{validRowsCount === 0 && (
													<div className="hidden group-hover/btn:block absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl shadow-lg whitespace-nowrap z-50">
														Không có dòng dữ liệu hợp lệ nào để nhập
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							) : mappingData ? (
								<div className="flex flex-col flex-1 min-h-0 overflow-hidden">
									<div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-hide">
										{/* Dòng tóm tắt khớp cột */}
										{(() => {
											const fields = getFieldsList();
											const totalFields = fields.length;
											const mappedCount = fields.filter((f) => !!customMapping[f.key]).length;
											const isGenderMissing =
												!customMapping["genderNam"] && !customMapping["genderNu"];
											const neededCount =
												(!customMapping["name"] ? 1 : 0) +
												(!customMapping["dob"] ? 1 : 0) +
												(isGenderMissing ? 1 : 0);

											return (
												<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
													<div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
														<span>
															{mappedCount}/{totalFields} cột đã khớp
														</span>
														<span className="text-slate-400 dark:text-slate-500">•</span>
														<span
															className={clsx(
																neededCount > 0
																	? "text-amber-600 dark:text-amber-400"
																	: "text-emerald-600 dark:text-emerald-400",
															)}
														>
															{neededCount} cần chọn
														</span>
													</div>
													{neededCount > 0 ? (
														<span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
															Cần khớp đủ các trường bắt buộc (*) để tiếp tục
														</span>
													) : (
														<span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px] flex items-center gap-1">
															<Check className="w-3.5 h-3.5 stroke-[2.5]" /> Đã đủ trường bắt buộc
														</span>
													)}
												</div>
											);
										})()}

										{/* Header bar within mapping */}
										<div
											className={clsx(
												"p-5 rounded-2xl border",
												isDarkMode
													? "bg-slate-800/40 border-slate-700/60"
													: "bg-slate-50 border-slate-200",
											)}
										>
											<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
												<div>
													<div className="flex items-center space-x-3">
														<h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
															Khớp cột dữ liệu Excel
														</h3>
														{queueInfo && queueInfo.total > 1 && (
															<span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
																Bảng {queueInfo.current}/{queueInfo.total}
															</span>
														)}
													</div>
													<p
														className={`text-xs mt-1.5 font-medium ${softTextClass}`}
													>
														Tệp tin:{" "}
														<span className="text-emerald-600 dark:text-emerald-400 font-bold">
															{mappingData.fileName}
														</span>{" "}
														(Nhận diện:{" "}
														<span className="font-bold text-indigo-600 dark:text-indigo-400">
															{mappingData.templateType === "CTH"
																? "Chúc thọ / mừng thọ"
																: mappingData.templateType === "HTXH"
																	? "Hưu trí xã hội (HTXH)"
																	: "Danh sách cử tri"}
														</span>
														)
													</p>
												</div>

												{savedTemplates.length > 0 && (
													<div className="flex items-center space-x-3">
														<label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap uppercase tracking-wider">
															Mẫu đã lưu:
														</label>
														<div className="w-60">
															<MappingSelect
																value={selectedTemplateName}
																onChange={(val) => {
																	setSelectedTemplateName(val);
																	const match = savedTemplates.find(
																		(t) => t.name === val,
																	);
																	if (match) {
																		const cleanedMapping: Record<
																			string,
																			string
																		> = {};
																		for (const [k, v] of Object.entries(
																			match.mapping,
																		)) {
																			if (
																				typeof v === "string" &&
																				mappingData.headers.includes(v)
																			) {
																				cleanedMapping[k] = v;
																			} else {
																				cleanedMapping[k] = "";
																			}
																		}
																		setCustomMapping(cleanedMapping);
																	} else {
																		setCustomMapping(
																			mappingData.suggestedMapping || {},
																		);
																	}
																}}
																options={savedTemplates.map((t) => t.name)}
																placeholder="-- Chọn mẫu đã lưu --"
																isDarkMode={isDarkMode}
																required={false}
															/>
														</div>
													</div>
												)}
											</div>
										</div>

										{/* Mapping Fields Grid */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{getFieldsList().map((field) => {
												const value = customMapping[field.key] || "";
												const isFieldMapped = !!value;
												const isRequiredMissing =
													field.required &&
													(field.key === "genderNam" || field.key === "genderNu"
														? !customMapping["genderNam"] && !customMapping["genderNu"]
														: !value);

												return (
													<div
														key={field.key}
														className={clsx(
															"p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3",
															isFieldMapped
																? "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
																: isRequiredMissing
																	? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-600/70"
																	: "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80",
														)}
													>
														<div className="flex justify-between items-start gap-2">
															<span className="text-xs font-bold tracking-tight text-slate-700 dark:text-slate-300">
																{field.label}{" "}
																{field.required && (
																	<span className="text-rose-500 font-bold" title="Bắt buộc">
																		*
																	</span>
																)}
															</span>
															{isFieldMapped ? (
																<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
																	<Check className="w-3.5 h-3.5 stroke-[2.5]" />
																	Đã khớp
																</span>
															) : isRequiredMissing ? (
																<span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
																	<AlertCircle className="w-3 h-3" />
																	Cần chọn
																</span>
															) : (
																<span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
																	Bỏ qua
																</span>
															)}
														</div>
														<MappingSelect
															value={value}
															onChange={(val) => {
																setCustomMapping((prev) => ({
																	...prev,
																	[field.key]: val,
																}));
															}}
															options={mappingData.headers}
															placeholder={
																field.required
																	? "-- Chọn cột Excel (bắt buộc) --"
																	: "-- Bỏ qua / không có --"
															}
															isDarkMode={isDarkMode}
															required={field.required}
														/>
													</div>
												);
											})}
										</div>

										{/* Auto-apply option */}
										{queueInfo && queueInfo.total > 1 && (
											<div
												className={clsx(
													"p-4 rounded-2xl border flex items-center space-x-3 transition-all",
													isDarkMode
														? "bg-emerald-950/10 border-emerald-900/40 text-emerald-300"
														: "bg-emerald-50/40 border-emerald-100 text-emerald-900",
												)}
											>
												<input
													type="checkbox"
													id="autoApplyRemaining"
													checked={autoApplyRemaining}
													onChange={(e) =>
														setAutoApplyRemaining(e.target.checked)
													}
													className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
												/>
												<label
													htmlFor="autoApplyRemaining"
													className="text-xs font-bold uppercase tracking-wide cursor-pointer text-slate-800 dark:text-slate-200"
												>
													Áp dụng thiết lập này cho tất cả bảng/tệp còn lại (
													{queueInfo.total - queueInfo.current} bảng)
												</label>
											</div>
										)}

										{/* Save template option */}
										<div
											className={clsx(
												"p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-3",
												isDarkMode
													? "bg-slate-800/20 border-slate-700"
													: "bg-slate-50/50 border-slate-200",
											)}
										>
											<div className="flex items-center space-x-2 shrink-0">
												<Save className="h-4 w-4 text-slate-400" />
												<label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
													Lưu mẫu khớp cột:
												</label>
											</div>
											<input
												type="text"
												placeholder="Nhập tên mẫu (ví dụ: Mẫu huyện A)..."
												value={templateName}
												onChange={(e) => setTemplateName(e.target.value)}
												className={clsx(
													"flex-1 px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition-all",
													isDarkMode
														? "bg-slate-900 border-slate-700 text-white focus:border-emerald-500"
														: "bg-white border-slate-300 text-slate-800 focus:border-emerald-500",
												)}
											/>
										</div>
									</div>

									{/* Mapping Footer */}
									<div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
										<button
											type="button"
											onClick={cancelImport}
											className="min-h-[44px] px-5 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
										>
											<ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
											<span>Quay lại</span>
										</button>
										<button
											type="button"
											onClick={() =>
												confirmMapping?.(
													customMapping,
													templateName,
													autoApplyRemaining,
												)
											}
											disabled={!isMappingValid()}
											className={clsx(
												"min-h-[44px] px-6 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs",
												isMappingValid()
													? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95"
													: "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none",
											)}
										>
											<span>Tiếp tục</span>
											<ArrowRight className="h-4 w-4" strokeWidth={1.5} />
										</button>
									</div>
								</div>
							) : (
								/* Bước 1: Chọn tệp với khung kéo thả chuẩn dùng chung */
								<div className="p-6 sm:p-8 flex flex-col items-center justify-center">
									<ExcelDropzone
										onFileSelect={(file) => {
											setFileDropError(null);
											const fakeTarget = {
												files: [file],
												value: "",
											} as unknown as HTMLInputElement;
											if (fileInputRef?.current) {
												try {
													const dt = new DataTransfer();
													dt.items.add(file);
													fileInputRef.current.files = dt.files;
												} catch {
													// ignore DataTransfer failure
												}
											}
											handleFileUpload({
												target:
													fileInputRef?.current?.files &&
													fileInputRef.current.files.length > 0
														? fileInputRef.current
														: fakeTarget,
											} as React.ChangeEvent<HTMLInputElement>);
										}}
										onDownloadTemplate={handleDownloadTemplate}
										errorMessage={fileDropError}
										onClearError={() => setFileDropError(null)}
										isReading={isImporting}
										primaryButtonLabel="Chọn tệp Excel"
										templateButtonLabel="Tải biểu mẫu chuẩn (.xlsx)"
										className="max-w-[590px]"
									/>
								</div>
							)}
						</div>
					</div>,
					document.body,
				)}

			{/* Kết Quả Import Thành Công Hoặc Cảnh Báo */}
			{importResult &&
				createPortal(
					<div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/50 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
						<div
							className={clsx(
								"rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh] border zoom-in-95 duration-150",
								panelClass,
							)}
						>
							<div
								className={clsx(
									"px-8 py-6 border-b flex justify-between items-center",
									isDarkMode
										? "border-slate-800 bg-slate-800/30"
										: "border-slate-100 bg-slate-50",
								)}
							>
								<div className="flex items-center space-x-4">
									<div
										className={clsx(
											"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
											importResult.errors.length > 0
												? "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50"
												: "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50",
										)}
									>
										{importResult.errors.length > 0 ? (
											<AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
										) : (
											<CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />
										)}
									</div>
									<div>
										<h2 className="text-xl font-black tracking-tight uppercase">
											KẾT QUẢ NHẬP DỮ LIỆU
										</h2>
										<p
											className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${softTextClass}`}
										>
											Tổng: {importResult.total} hồ sơ
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={() => setImportResult(null)}
									className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
								>
									<X className="h-5 w-5" strokeWidth={1.5} />
								</button>
							</div>

							<div className="p-8 overflow-y-auto flex-1 scrollbar-hide">
								{importResult.errors.length === 0 ? (
									<div className="text-center py-10">
										<div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
											<CheckCircle2 className="h-10 w-10" strokeWidth={1.5} />
										</div>
										<h3 className="text-2xl font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400 mb-2">
											NHẬP THÀNH CÔNG TOÀN BỘ!
										</h3>
										<p className={clsx("text-sm font-medium", softTextClass)}>
											Thêm mới:{" "}
											<strong className="text-emerald-500">
												{importResult.created}
											</strong>{" "}
											| Cập nhật:{" "}
											<strong className="text-blue-500">
												{importResult.updated}
											</strong>
										</p>
									</div>
								) : (
									<div>
										<div className="flex items-center space-x-6 mb-6">
											<div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
												<span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
													Thêm mới
												</span>
												<span className="font-black text-emerald-600 dark:text-emerald-400">
													{importResult.created}
												</span>
											</div>
											<div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
												<span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
													Cập nhật
												</span>
												<span className="font-black text-blue-600 dark:text-blue-400">
													{importResult.updated}
												</span>
											</div>
											<div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
												<span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
													Lỗi/Cảnh báo
												</span>
												<span className="font-black text-amber-600 dark:text-amber-400">
													{importResult.errors.length}
												</span>
											</div>
										</div>
										<h3 className="text-sm font-extrabold uppercase tracking-widest mb-4 text-amber-500">
											DANH SÁCH CẢNH BÁO LỖI / TRÙNG LẶP DỮ LIỆU:
										</h3>
										<div className="space-y-3 mb-4">
											{(showAllErrors
												? importResult.errors
												: importResult.errors.slice(0, 100)
											).map((err, idx) => (
												<div
													key={idx}
													className={clsx(
														"p-4 rounded-xl text-sm font-medium border border-l-4 border-l-amber-500 shadow-xs",
														isDarkMode
															? "bg-slate-800/50 border-slate-700"
															: "bg-slate-50 border-slate-200",
													)}
												>
													{err}
												</div>
											))}
											{importResult.errors.length > 100 && (
												<div className="text-center">
													{showAllErrors ? (
														<span className="text-sm font-medium text-slate-500">
															Hiển thị toàn bộ {importResult.errors.length} lỗi
														</span>
													) : (
														<button
															type="button"
															onClick={() => setShowAllErrors(true)}
															className="inline-flex items-center px-5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
														>
															Xem tất cả ({importResult.errors.length} lỗi)
														</button>
													)}
												</div>
											)}
										</div>
										{importResult.errors.length > 0 && (
											<button
												type="button"
												onClick={handleSaveErrorLog}
												className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:scale-95"
											>
												<Save className="mr-2 h-4 w-4" strokeWidth={1.5} /> Lưu
												log lỗi ra file
											</button>
										)}
									</div>
								)}
							</div>

							<div
								className={clsx(
									"px-8 py-4 border-t flex",
									isDarkMode
										? "border-slate-800 bg-slate-800/30"
										: "border-slate-100 bg-slate-50",
								)}
							>
								<button
									type="button"
									onClick={() => setImportResult(null)}
									className="h-11 w-full inline-flex justify-center items-center px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-xs"
								>
									ĐÓNG
								</button>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}

export default ImportModal;
