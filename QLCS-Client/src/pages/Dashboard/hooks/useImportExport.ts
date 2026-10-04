import { useCallback, useEffect, useRef, useState } from "react";
import { htxhApi } from "../../../api/htxh";
import { profilesApi } from "../../../api/profiles";
import { useModal } from "../../../hooks/useModal";
import { exportExcelClient } from "../../../utils/excelExporter";
import ImportChucthoWorker from "../../../workers/importChucthoWorker.ts?worker";
import ImportCutriWorker from "../../../workers/importCutriWorker.ts?worker";
import ImportHtxhWorker from "../../../workers/importHtxhWorker.ts?worker";
import { findHeaderAndDataStart } from "../../../workers/workerUtils";
import type { TabType } from "../types";

interface SheetTask {
	fileName: string;
	sheetName: string;
	rows: any[][];
	headers: string[];
	templateType: "HTXH" | "CTH" | "CUTRI";
	suggestedMapping: Record<string, string>;
}

export function useImportExport(
	villageId: string | undefined,
	activeTab: TabType,
	_user: any,
	loadProfiles: () => Promise<void>,
	isGlobal?: boolean,
	villages?: { id: number; name: string }[],
	filters?: {
		search?: string;
		statusFilter?: string;
		ageFilters?: string[];
		villageFilters?: number[];
		genderFilter?: string;
		ethnicityFilter?: string;
		residenceFilter?: string;
		sortKey?: string | null;
		sortDirection?: string | null;
	},
	globalCalculationYear?: number,
) {
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [importProgress, setImportProgress] = useState(0);
	const [previewData, setPreviewData] = useState<{
		profiles: any[];
		errors: string[];
		activeTab: TabType;
	} | null>(null);
	const [importResult, setImportResult] = useState<{
		created: number;
		updated: number;
		errors: string[];
		total: number;
	} | null>(null);
	const [isExportModalOpen, setIsExportModalOpen] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	const [mappingData, setMappingData] = useState<{
		headers: string[];
		targetRows: any[][];
		activeTab: TabType;
		fileName: string;
		suggestedMapping: Record<string, string>;
		templateType: "HTXH" | "CTH" | "CUTRI";
	} | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const { showAlert } = useModal();

	const isMounted = useRef(true);
	const workersRef = useRef<Worker[]>([]);

	// Queue references for batch/multi-import
	const taskQueueRef = useRef<SheetTask[]>([]);
	const currentTaskIdxRef = useRef<number>(0);
	const accumulatedProfilesRef = useRef<any[]>([]);
	const accumulatedErrorsRef = useRef<string[]>([]);
	const autoConfirmRemainingRef = useRef<boolean>(false);
	const lastConfirmedMappingRef = useRef<Record<string, string> | null>(null);
	const [queueInfo, setQueueInfo] = useState<{
		current: number;
		total: number;
	} | null>(null);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
			workersRef.current.forEach((worker) => worker.terminate());
			workersRef.current = [];
		};
	}, []);

	const CTH_UI_MAP: Record<string, string[]> = {
		stt: ["tt", "stt", "so tt", "so thutu", "thutu"],
		name: ["ho va ten", "hoten", "ten", "hovaten", "ho ten"],
		dob: [
			"nam sinh",
			"ngay thang nam sinh",
			"ngay sinh",
			"ngaysinh",
			"namsinh",
			"ns",
		],
		genderNam: ["nam", "gioi tinh nam"],
		genderNu: ["nu", "gioi tinh nu"],
		cccd: [
			"so cccd",
			"cccd",
			"cmnd",
			"so cmnd",
			"can cuoc",
			"cmnd/cccd",
			"cancuoc",
		],
		ethnicity: ["dan toc", "dantoc"],
		residence: [
			"cu tru",
			"cutru",
			"noi dang ky ho khau",
			"hktt",
			"ho khau thuong tru",
			"hokhau",
			"thuong tru",
		],
		currentAddress: [
			"noi o hien nay",
			"noiohiennay",
			"noi cu tru hien nay",
			"dia chi hien nay",
			"cho o hien nay",
		],
		age60: ["tron 60", "tron60", "tron 60 tuoi", "60 tuoi"],
		age65: ["tron 65", "tron65", "tron 65 tuoi", "65 tuoi"],
		age70: ["tron 70", "tron70", "tron 70 tuoi", "70 tuoi"],
		age75: ["tron 75", "tron75", "tron 75 tuoi", "75 tuoi"],
		age80: ["tron 80", "tron80", "tron 80 tuoi", "80 tuoi"],
		age85: ["tron 85", "tron85", "tron 85 tuoi", "85 tuoi"],
		age90: ["tron 90", "tron90", "tron 90 tuoi", "90 tuoi"],
		age95: ["tron 95", "tron95", "tron 95 tuoi", "95 tuoi"],
		age100: ["tron 100", "tron100", "tron 100 tuoi", "100 tuoi"],
		ageOver100: ["tren 100", "tren100", "tren 100 tuoi", "qua 100", "over100"],
		notes: ["ghi chu", "ghichu", "ghi chu them", "note", "notes"],
		received: [
			"da nhan qua",
			"danhanqua",
			"da nhan",
			"danhan",
			"nhan qua",
			"nhanqua",
		],
	};

	const HTXH_UI_MAP: Record<string, string[]> = {
		...CTH_UI_MAP,
		age75plus: [
			"doi tuong du 75",
			"doi tuong du 75 tuoi",
			"du 75",
			"75 tuoi tro len",
			"tren 75",
			"du75",
		],
		age70to74poor: [
			"doi tuong tu 70",
			"70-74",
			"ho ngheo",
			"ho ngheo can ngheo",
			"70 den 74",
		],
		baoTro: ["bao tro", "bao tro xa hoi", "tro cap xa hoi", "baotro"],
		huuTri: ["huu tri", "huu tri xa hoi", "luong huu", "huutri"],
		huuTuatBaoHiem: ["huu, tuat", "huu tuat", "huu tuat bao hiem", "huutuat"],
		nguoiCoCong: [
			"nguoi co cong",
			"co cong",
			"co cong voi cach mang",
			"nguoicocong",
		],
	};

	const CUTRI_UI_MAP: Record<string, string[]> = {
		stt: ["tt", "stt", "so tt", "so thutu"],
		name: ["ho va ten", "hoten", "ten", "hovaten", "ho ten"],
		dob: [
			"nam sinh",
			"ngay thang nam sinh",
			"ngay sinh",
			"ngaysinh",
			"namsinh",
			"ns",
		],
		genderNam: ["nam", "gioi tinh nam"],
		genderNu: ["nu", "gioi tinh nu"],
		cccd: [
			"so cccd",
			"cccd",
			"cmnd",
			"so cmnd",
			"can cuoc",
			"cmnd/cccd",
			"cancuoc",
		],
		residence: [
			"cu tru",
			"cutru",
			"noi dang ky ho khau",
			"hktt",
			"ho khau thuong tru",
			"hokhau",
			"thuong tru",
		],
	};

	const getLevenshteinDistance = (s1: string, s2: string): number => {
		const m = s1.length;
		const n = s2.length;
		const dp: number[][] = Array.from({ length: m + 1 }, () =>
			Array(n + 1).fill(0),
		);

		for (let i = 0; i <= m; i++) dp[i][0] = i;
		for (let j = 0; j <= n; j++) dp[0][j] = j;

		for (let i = 1; i <= m; i++) {
			for (let j = 1; j <= n; j++) {
				if (s1[i - 1] === s2[j - 1]) {
					dp[i][j] = dp[i - 1][j - 1];
				} else {
					dp[i][j] = Math.min(
						dp[i - 1][j] + 1,
						dp[i][j - 1] + 1,
						dp[i - 1][j - 1] + 1,
					);
				}
			}
		}
		return dp[m][n];
	};

	const getSuggestedMapping = (
		headers: string[],
		templateType: "HTXH" | "CTH" | "CUTRI",
	): Record<string, string> => {
		const mapping: Record<string, string> = {};
		const mapRules =
			templateType === "HTXH"
				? HTXH_UI_MAP
				: templateType === "CUTRI"
					? CUTRI_UI_MAP
					: CTH_UI_MAP;

		const normalize = (s: string) =>
			s
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "")
				.replace(/[^a-z0-9]/gi, "")
				.toLowerCase();

		// Khớp an toàn: tránh substring ngắn khớp nhầm (vd 'tt' trong 'cutru')
		const isSafeMatch = (normH: string, normK: string): boolean => {
			if (normH === normK) return true;
			// Chỉ cho phép substring nếu keyword đủ dài (>= 4 ký tự)
			if (normK.length >= 4 && normH.includes(normK)) return true;
			if (normK.length >= 4 && normK.includes(normH) && normH.length >= 3)
				return true;

			// Khớp mờ Levenshtein
			const dist = getLevenshteinDistance(normH, normK);
			const maxAllowedDist = normK.length > 8 ? 2 : 1;
			if (
				dist <= maxAllowedDist &&
				dist < normK.length &&
				dist < normH.length
			) {
				return true;
			}
			return false;
		};

		for (const [fieldName, keywords] of Object.entries(mapRules)) {
			const matchedHeader = headers.find((h) => {
				const normH = normalize(h);
				return keywords.some((k) => {
					const normK = normalize(k);
					return isSafeMatch(normH, normK);
				});
			});
			if (matchedHeader) {
				mapping[fieldName] = matchedHeader;
			}
		}
		return mapping;
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		if (isImporting) return;
		setIsImporting(true);
		setImportProgress(0);
		setImportResult(null);
		setPreviewData(null);
		setMappingData(null);

		// Reset queue refs
		taskQueueRef.current = [];
		currentTaskIdxRef.current = 0;
		accumulatedProfilesRef.current = [];
		accumulatedErrorsRef.current = [];
		autoConfirmRemainingRef.current = false;
		lastConfirmedMappingRef.current = null;
		setQueueInfo(null);

		const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					if (reader.result instanceof ArrayBuffer) {
						resolve(reader.result);
					} else {
						reject(new Error("Chỉ đọc ArrayBuffer"));
					}
				};
				reader.onerror = () =>
					reject(reader.error || new Error("FileReader thất bại"));
				reader.readAsArrayBuffer(file);
			});
		};

		const getSheetTaskInfo = (
			sheetName: string,
			targetRows: any[][],
			fileName: string,
		): SheetTask => {
			const { headerRowIdx, dataStart } = findHeaderAndDataStart(targetRows);
			let headersList: string[] = [];

			if (headerRowIdx !== -1) {
				const maxCols = Math.max(
					...targetRows
						.slice(headerRowIdx, dataStart)
						.map((r: any[]) => (r ? r.length : 0)),
				);
				let lastActiveCol = -1;
				for (let c = 0; c < maxCols; c++) {
					let colText = "";
					for (let r = headerRowIdx; r < dataStart; r++) {
						if (
							targetRows[r] &&
							targetRows[r][c] !== undefined &&
							targetRows[r][c] !== null
						) {
							colText += " " + String(targetRows[r][c]);
						}
					}
					if (colText.trim() !== "") {
						lastActiveCol = c;
					}
				}
				if (lastActiveCol === -1) {
					lastActiveCol = maxCols - 1;
				}
				for (let c = 0; c <= lastActiveCol; c++) {
					let colText = "";
					for (let r = headerRowIdx; r < dataStart; r++) {
						if (
							targetRows[r] &&
							targetRows[r][c] !== undefined &&
							targetRows[r][c] !== null
						) {
							colText += " " + String(targetRows[r][c]);
						}
					}
					colText = colText.trim();
					headersList.push(colText || `Cột ${c + 1}`);
				}
			} else {
				if (targetRows.length > 0) {
					const firstRow = targetRows[0] || [];
					let lastActiveCol = -1;
					for (let idx = 0; idx < firstRow.length; idx++) {
						if (
							firstRow[idx] !== undefined &&
							firstRow[idx] !== null &&
							String(firstRow[idx]).trim() !== ""
						) {
							lastActiveCol = idx;
						}
					}
					if (lastActiveCol === -1) {
						lastActiveCol = firstRow.length - 1;
					}
					headersList = firstRow
						.slice(0, lastActiveCol + 1)
						.map((cell, idx) =>
							cell ? String(cell).trim() : `Cột ${idx + 1}`,
						);
				}
			}

			let templateType: "HTXH" | "CTH" | "CUTRI" =
				activeTab === "htxh" ? "HTXH" : "CTH";
			let score = 0;
			let hasNameCol = false;
			let hasHtxhCol = false;
			let hasCthCol = false;
			let hasCutriCol = false;

			for (let i = 0; i < Math.min(50, targetRows.length); i++) {
				const row = targetRows[i] as any[];
				if (!row) continue;

				const normalizeCell = (c: any) =>
					String(c)
						.normalize("NFD")
						.replace(/[\u0300-\u036f]/g, "")
						.replace(/[^a-z0-9]/gi, "")
						.toLowerCase();

				if (
					row.some((cell) => {
						const norm = normalizeCell(cell);
						return norm.includes("hovaten") || norm.includes("hoten");
					})
				) {
					const headerTextRaw = targetRows
						.slice(i, i + 2)
						.map((r) => (r as any[]).join(" "))
						.join(" ");
					const headerText = normalizeCell(headerTextRaw);
					hasNameCol = true;
					score += 10;

					if (
						headerText.includes("tron60") ||
						headerText.includes("tron65") ||
						headerText.includes("chuctho") ||
						headerText.includes("mungho")
					) {
						hasCthCol = true;
						score += 20;
					}
					if (
						headerText.includes("baotro") ||
						headerText.includes("huutri") ||
						headerText.includes("du75") ||
						headerText.includes("7075") ||
						headerText.includes("7074")
					) {
						hasHtxhCol = true;
						score += 20;
					}
					if (
						headerText.includes("captw") ||
						headerText.includes("captinh") ||
						headerText.includes("capxa")
					) {
						hasCutriCol = true;
						score += 20;
					}

					if (
						headerText.includes("ngaythangnamsinh") ||
						headerText.includes("namsinh") ||
						headerText.includes("ns")
					)
						score += 2;
					if (headerText.includes("nam") || headerText.includes("nu"))
						score += 2;
					if (headerText.includes("cccd")) score += 2;
				}

				const sheetNorm = normalizeCell(sheetName);
				if (
					sheetNorm.includes("cutri") ||
					sheetNorm.includes("danh sach cu tri")
				) {
					hasCutriCol = true;
					score += 10;
				}
			}

			if (hasHtxhCol) templateType = "HTXH";
			else if (hasCthCol) templateType = "CTH";
			else if (hasCutriCol) templateType = "CUTRI";
			else if (hasNameCol && activeTab === "chuctho") templateType = "CTH";
			else if (hasNameCol && activeTab === "htxh") templateType = "HTXH";

			const suggestedMapping = getSuggestedMapping(headersList, templateType);

			return {
				fileName,
				sheetName,
				rows: targetRows,
				headers: headersList,
				templateType,
				suggestedMapping,
			};
		};

		try {
			const XLSX = await import("xlsx-js-style");
			const allTasks: SheetTask[] = [];

			for (const file of files) {
				try {
					const buffer = await readFileAsArrayBuffer(file);
					const wb = XLSX.read(buffer, { type: "array" });

					const fileTasks: SheetTask[] = [];
					for (const sheetName of wb.SheetNames) {
						const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
							header: 1,
						}) as unknown[][];

						let hasNameCol = false;
						let score = 0;
						let hasHtxhCol = false;
						let hasCthCol = false;
						let hasCutriCol = false;

						for (let i = 0; i < Math.min(50, rows.length); i++) {
							const row = rows[i] as any[];
							if (!row) continue;

							const normalizeCell = (c: any) =>
								String(c)
									.normalize("NFD")
									.replace(/[\u0300-\u036f]/g, "")
									.replace(/[^a-z0-9]/gi, "")
									.toLowerCase();

							if (
								row.some((cell) => {
									const norm = normalizeCell(cell);
									return norm.includes("hovaten") || norm.includes("hoten");
								})
							) {
								const headerTextRaw = rows
									.slice(i, i + 2)
									.map((r) => (r as any[]).join(" "))
									.join(" ");
								const headerText = normalizeCell(headerTextRaw);
								hasNameCol = true;
								score += 10;

								if (
									headerText.includes("tron60") ||
									headerText.includes("tron65") ||
									headerText.includes("chuctho") ||
									headerText.includes("mungho")
								) {
									hasCthCol = true;
									score += 20;
								}
								if (
									headerText.includes("baotro") ||
									headerText.includes("huutri") ||
									headerText.includes("du75") ||
									headerText.includes("7075") ||
									headerText.includes("7074")
								) {
									hasHtxhCol = true;
									score += 20;
								}
								if (
									headerText.includes("captw") ||
									headerText.includes("captinh") ||
									headerText.includes("capxa")
								) {
									hasCutriCol = true;
									score += 20;
								}
							}
						}

						let currentType: "HTXH" | "CTH" | "CUTRI" = "CUTRI";
						if (hasHtxhCol) currentType = "HTXH";
						else if (hasCthCol) currentType = "CTH";
						else if (hasCutriCol) currentType = "CUTRI";
						else if (hasNameCol && activeTab === "chuctho") currentType = "CTH";
						else if (hasNameCol && activeTab === "htxh") currentType = "HTXH";

						// Lọc theo active tab
						if (activeTab === "htxh" && currentType !== "HTXH") {
							continue;
						}
						if (activeTab === "chuctho" && currentType !== "CTH") {
							continue;
						}

						if (hasNameCol) {
							const taskInfo = getSheetTaskInfo(sheetName, rows, file.name);
							fileTasks.push(taskInfo);
						}
					}

					// Fallback nếu không có sheet nào chứa name
					if (fileTasks.length === 0 && wb.SheetNames.length > 0) {
						const firstSheetName = wb.SheetNames[0];
						const rows = XLSX.utils.sheet_to_json(wb.Sheets[firstSheetName], {
							header: 1,
						}) as unknown[][];
						const taskInfo = getSheetTaskInfo(firstSheetName, rows, file.name);
						fileTasks.push(taskInfo);
					}

					allTasks.push(...fileTasks);
				} catch (fileErr) {
					const errMsg = `[${file.name}] Lỗi đọc file: ${fileErr instanceof Error ? fileErr.message : "File bị hỏng hoặc không đúng định dạng"}`;
					accumulatedErrorsRef.current.push(errMsg);
				}
			}

			if (allTasks.length === 0) {
				if (isMounted.current) {
					setIsImporting(false);
					setImportResult({
						created: 0,
						updated: 0,
						errors:
							accumulatedErrorsRef.current.length > 0
								? accumulatedErrorsRef.current
								: ["Không tìm thấy bảng dữ liệu hợp lệ nào."],
						total: 0,
					});
				}
				return;
			}

			taskQueueRef.current = allTasks;
			currentTaskIdxRef.current = 0;
			setQueueInfo({ current: 1, total: allTasks.length });
			processTaskAtIndex(0);
		} catch (err) {
			if (isMounted.current) {
				setIsImporting(false);
				setImportResult({
					created: 0,
					updated: 0,
					errors: [
						`Lỗi hệ thống khi import: ${err instanceof Error ? err.message : "Không rõ lỗi"}`,
					],
					total: 0,
				});
			}
		}
	};

	function runWorkerForTask(
		task: SheetTask,
		mapping: Record<string, string>,
		index: number,
	) {
		setIsImporting(true);
		setImportProgress(0);

		const { rows, headers, templateType, fileName, sheetName } = task;

		const colIndex: Record<string, number> = {};
		for (const [targetField, headerName] of Object.entries(mapping)) {
			const idx = headers.indexOf(headerName);
			if (idx !== -1) {
				colIndex[targetField] = idx;
			}
		}

		let worker: Worker;
		if (templateType === "HTXH") {
			worker = new ImportHtxhWorker();
		} else if (templateType === "CTH") {
			worker = new ImportChucthoWorker();
		} else {
			worker = new ImportCutriWorker();
		}

		workersRef.current.push(worker);

		worker.postMessage({
			wbData: rows,
			activeTab,
			villageId: villageId || null,
			currentYear: globalCalculationYear || new Date().getFullYear(),
			colIndex,
		});

		worker.onerror = (err) => {
			console.error("Worker error:", err);
			const sheetLabel = `${fileName} - ${sheetName}`;
			if (isMounted.current) {
				accumulatedErrorsRef.current.push(
					`[${sheetLabel}] Lỗi xử lý dữ liệu: ${err.message || "Worker error"}`,
				);
			}
			worker.terminate();
			workersRef.current = workersRef.current.filter((w) => w !== worker);
			processTaskAtIndex(index + 1);
		};

		worker.onmessage = async (msgEvent) => {
			const msg = msgEvent.data;
			if (msg.type === "progress") {
				if (isMounted.current) {
					setImportProgress(Math.round((msg.current / msg.total) * 100));
				}
			} else if (msg.type === "done") {
				const sheetLabel = `${fileName} - ${sheetName}`;
				if (msg.profiles && msg.profiles.length > 0) {
					const profilesWithOwner = msg.profiles.map((p: any) => ({
						...p,
						_sourceFile: sheetLabel,
					}));
					accumulatedProfilesRef.current.push(...profilesWithOwner);
				}

				if (msg.errors && msg.errors.length > 0) {
					const mappedErrors = msg.errors.map(
						(err: string) => `[${sheetLabel}] ${err}`,
					);
					accumulatedErrorsRef.current.push(...mappedErrors);
				}

				worker.terminate();
				workersRef.current = workersRef.current.filter((w) => w !== worker);
				processTaskAtIndex(index + 1);
			}
		};
	}

	function processTaskAtIndex(index: number) {
		const queue = taskQueueRef.current;
		if (index >= queue.length) {
			if (isMounted.current) {
				setPreviewData({
					profiles: accumulatedProfilesRef.current,
					errors: accumulatedErrorsRef.current,
					activeTab,
				});
				setMappingData(null);
				setIsImporting(false);
			}
			return;
		}

		currentTaskIdxRef.current = index;
		setQueueInfo({ current: index + 1, total: queue.length });

		const task = queue[index];

		if (autoConfirmRemainingRef.current && lastConfirmedMappingRef.current) {
			const currentMapping: Record<string, string> = {};
			const fields =
				task.templateType === "HTXH"
					? [
							"stt",
							"name",
							"dob",
							"genderNam",
							"genderNu",
							"cccd",
							"ethnicity",
							"residence",
							"currentAddress",
							"notes",
							"received",
							"age75plus",
							"age70to74poor",
							"baoTro",
							"huuTri",
							"huuTuatBaoHiem",
							"nguoiCoCong",
						]
					: task.templateType === "CTH"
						? [
								"stt",
								"name",
								"dob",
								"genderNam",
								"genderNu",
								"cccd",
								"ethnicity",
								"residence",
								"currentAddress",
								"notes",
								"received",
								"age60",
								"age65",
								"age70",
								"age75",
								"age80",
								"age85",
								"age90",
								"age95",
								"age100",
								"ageOver100",
							]
						: [
								"stt",
								"name",
								"dob",
								"genderNam",
								"genderNu",
								"cccd",
								"residence",
							];

			fields.forEach((field) => {
				const lastVal = lastConfirmedMappingRef.current?.[field];
				if (lastVal && task.headers.includes(lastVal)) {
					currentMapping[field] = lastVal;
				} else {
					currentMapping[field] = task.suggestedMapping[field] || "";
				}
			});

			runWorkerForTask(task, currentMapping, index);
		} else {
			if (isMounted.current) {
				setMappingData({
					headers: task.headers,
					targetRows: task.rows,
					activeTab,
					fileName: `${task.fileName} (${task.sheetName})`,
					suggestedMapping: task.suggestedMapping,
					templateType: task.templateType,
				});
				setIsImporting(false);
			}
		}
	}

	const confirmImport = async () => {
		if (!previewData || previewData.profiles.length === 0) {
			setIsImporting(false);
			setPreviewData(null);
			return;
		}

		setImportProgress(0);
		let created = 0;
		let updated = 0;
		let allErrors = [...previewData.errors];

		try {
			const profilesWithYear = previewData.profiles.map((p) => ({
				...p,
				calculationYear: globalCalculationYear,
			}));
			const res =
				previewData.activeTab === "chuctho"
					? ((await profilesApi.bulkAdd(profilesWithYear)) as any)
					: ((await htxhApi.bulkAdd(profilesWithYear)) as any);

			const resData = res?.data || res;
			const hasSuccessIndicator = Boolean(
				res?.success ||
					resData?.success ||
					typeof res?.inserted === "number" ||
					typeof resData?.inserted === "number" ||
					typeof resData?.created === "number",
			);

			if (hasSuccessIndicator) {
				created =
					resData?.created ??
					resData?.inserted ??
					res?.created ??
					res?.inserted ??
					0;
				updated = resData?.updated ?? res?.updated ?? 0;

				if (
					Array.isArray(resData?.errorDetails) &&
					resData.errorDetails.length > 0
				) {
					const detailMsgs = resData.errorDetails.map((item: any) =>
						typeof item === "string"
							? item
							: `Dòng "${item.data?.name || "Không rõ"}": ${item.error || "Lỗi không xác định"}`,
					);
					allErrors = [...allErrors, ...detailMsgs];
				} else if (
					Array.isArray(resData?.errors) &&
					resData.errors.length > 0
				) {
					allErrors = [...allErrors, ...resData.errors];
				}
			} else {
				const errorMsg =
					res?.error || resData?.error || "Thất bại khi lưu vào cơ sở dữ liệu";
				allErrors.push(`[Hệ thống] Lỗi lưu dữ liệu: ${errorMsg}`);
			}
		} catch (err: any) {
			allErrors.push(`[Hệ thống] Lỗi hệ thống: ${err.message}`);
		}

		if (isMounted.current) {
			setPreviewData(null);
			setImportResult({
				created,
				updated,
				errors: allErrors,
				total: previewData.profiles.length,
			});
			loadProfiles();
			setIsImporting(false);
		}
	};

	const cancelImport = () => {
		setPreviewData(null);
		setMappingData(null);
		setIsImporting(false);

		// Clear queue refs
		taskQueueRef.current = [];
		currentTaskIdxRef.current = 0;
		accumulatedProfilesRef.current = [];
		accumulatedErrorsRef.current = [];
		autoConfirmRemainingRef.current = false;
		lastConfirmedMappingRef.current = null;
		setQueueInfo(null);
	};

	const confirmMapping = async (
		mapping: Record<string, string>,
		templateName?: string,
		autoApplyRemaining?: boolean,
	) => {
		if (!mappingData) return;

		if (templateName) {
			try {
				const key = "import_templates";
				const savedRaw = localStorage.getItem(key) || "[]";
				const templates = JSON.parse(savedRaw);
				const updated = templates.filter((t: any) => t.name !== templateName);
				updated.push({ name: templateName, mapping });
				localStorage.setItem(key, JSON.stringify(updated));
			} catch (err) {
				console.error("Error saving template:", err);
			}
		}

		autoConfirmRemainingRef.current = !!autoApplyRemaining;
		lastConfirmedMappingRef.current = mapping;

		const currentTask = taskQueueRef.current[currentTaskIdxRef.current];
		if (currentTask) {
			runWorkerForTask(currentTask, mapping, currentTaskIdxRef.current);
		}
	};

	const executeExport = useCallback(
		async (modalOptions?: {
			selectedVillages: number[];
			exportSelectedOnly: boolean;
			selectedIds: Set<number>;
		}) => {
			if (isExporting) return;

			setIsExporting(true);

			try {
				const params: any = {
					limit: 10000,
					sortKey: filters?.sortKey || "name",
					sortDirection: filters?.sortDirection || "asc",
				};
				if (!isGlobal && villageId) params.villageId = villageId;
				if (filters?.search) params.search = filters.search;
				if (filters?.statusFilter && filters.statusFilter !== "all")
					params.status = filters.statusFilter;
				if (filters?.ageFilters && filters.ageFilters.length > 0)
					params.ageGroup = filters.ageFilters[0];

				let targetProfiles: any[] = [];

				if (activeTab === "chuctho") {
					const apiRes = await profilesApi.getProfiles(params);
					targetProfiles = apiRes.data || [];
				} else {
					const apiRes = await htxhApi.getProfiles(params);
					targetProfiles = apiRes.data || [];
				}

				if (
					isGlobal &&
					modalOptions?.selectedVillages &&
					modalOptions.selectedVillages.length > 0
				) {
					const villageSet = new Set(modalOptions.selectedVillages.map(String));
					targetProfiles = targetProfiles.filter((p: any) =>
						villageSet.has(String(p.village_id || p.villageId)),
					);
				}

				if (
					modalOptions?.exportSelectedOnly &&
					modalOptions.selectedIds.size > 0
				) {
					const idSet = new Set(
						Array.from(modalOptions.selectedIds).map(String),
					);
					targetProfiles = targetProfiles.filter((p: any) =>
						idSet.has(String(p.id)),
					);
				}

				const exportRes = await exportExcelClient({
					filteredProfiles: targetProfiles,
					activeTab,
					isGlobal,
					villages,
				});

				if (exportRes.success) {
					setIsExportModalOpen(false);
					showAlert({
						title: "Xuất file thành công",
						message: `File đã được tải xuống:\n${exportRes.fileName}`,
						type: "success",
					});
				} else {
					showAlert({
						title: "Lỗi xuất file",
						message: exportRes.error || "Không thể xuất file",
						type: "error",
					});
				}
			} catch (err: any) {
				console.error("Export error:", err);
				showAlert({
					title: "Lỗi hệ thống",
					message: `Lỗi hệ thống khi xuất file: ${err.message}`,
					type: "error",
				});
			} finally {
				setIsExporting(false);
			}
		},
		[activeTab, isExporting, isGlobal, villages, villageId, filters, showAlert],
	);

	return {
		isImportModalOpen,
		setIsImportModalOpen,
		isImporting,
		setIsImporting,
		importProgress,
		setImportProgress,
		importResult,
		setImportResult,
		previewData,
		confirmImport,
		cancelImport,
		isExportModalOpen,
		setIsExportModalOpen,
		isExporting,
		setIsExporting,
		fileInputRef,
		handleFileUpload,
		executeExport,
		mappingData,
		setMappingData,
		confirmMapping,
		queueInfo,
	};
}
