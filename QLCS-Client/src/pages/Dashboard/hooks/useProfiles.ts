import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { htxhApi } from "../../../api/htxh";
import { profilesApi } from "../../../api/profiles";
import { getCache, setCache } from "../../../db/indexedDB";
import { useModal } from "../../../hooks/useModal";
import type { AuditLog, TabType } from "../types";

interface FilterParams {
	debouncedSearch: string;
	statusFilter: string;
	ageFilters: string[];
	villageFilters: (number | string)[];
	sortKey: string | null;
	sortDirection: string | null;
	currentPage: number;
	itemsPerPage: number;
	genderFilter?: string;
	ethnicityFilter?: string;
	residenceFilter?: string;
	setCurrentPage?: (page: number) => void;
	setItemsPerPage?: (limit: number) => void;
	setPage?: (page: number) => void;
}

export function useProfiles(
	villageId: string | undefined,
	isGlobal: boolean | undefined,
	_user: any,
	activeTab: TabType,
	filters: FilterParams,
	_globalCalculationYear?: number,
) {
	const [page, setPage] = useState<number>(filters.currentPage || 1);
	const [pageData, setPageData] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [stats, setStats] = useState<any>({
		total: 0,
		received: 0,
		unreceived: 0,
		rate: "0.0",
	});
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState<string | number | null>(null);
	const [isStatusUpdating, setIsStatusUpdating] = useState<
		string | number | null
	>(null);
	const [isBulkUpdating, setIsBulkUpdating] = useState(false);
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
	const [isLoadingLogs, setIsLoadingLogs] = useState(false);
	const deleteDataRef = useRef<any>(null);
	const pageDataRef = useRef<any[]>([]);
	const abortControllerRef = useRef<AbortController | null>(null);
	const auditLogAbortControllerRef = useRef<AbortController | null>(null);
	const activeAuditLogIdRef = useRef<string | null>(null);
	const prevLimitRef = useRef(filters.itemsPerPage);

	useEffect(() => {
		return () => {
			if (auditLogAbortControllerRef.current) {
				auditLogAbortControllerRef.current.abort();
			}
		};
	}, []);

	useEffect(() => {
		if (filters.currentPage !== undefined) {
			setPage(filters.currentPage);
		}
	}, [filters.currentPage]);

	const handlePageSizeChange = useCallback(
		(newSize: number) => {
			setPage(1);
			if (filters.setCurrentPage) {
				filters.setCurrentPage(1);
			}
			if (filters.setPage) {
				filters.setPage(1);
			}
			if (filters.setItemsPerPage) {
				filters.setItemsPerPage(newSize);
			}
		},
		[filters],
	);

	useEffect(() => {
		if (prevLimitRef.current !== filters.itemsPerPage) {
			prevLimitRef.current = filters.itemsPerPage;
			setPage(1);
			if (filters.setCurrentPage) {
				filters.setCurrentPage(1);
			}
			if (filters.setPage) {
				filters.setPage(1);
			}
		}
	}, [filters.itemsPerPage]);

	useEffect(() => {
		pageDataRef.current = pageData;
	}, [pageData]);

	useEffect(() => {
		if (isDeleting !== null && isDeleting !== -1) {
			deleteDataRef.current = pageDataRef.current.find(
				(p: any) => p.id === isDeleting,
			);
		}
	}, [isDeleting]);

	const { showAlert } = useModal();
	const api = activeTab === "chuctho" ? profilesApi : htxhApi;

	const {
		debouncedSearch,
		statusFilter,
		ageFilters,
		genderFilter,
		ethnicityFilter,
		residenceFilter,
		sortKey,
		sortDirection,
		currentPage,
		itemsPerPage,
	} = filters;

	const ageGroup = ageFilters?.[0] || undefined;

	const loadPage = useCallback(async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		const vid =
			isGlobal || !villageId || villageId === "all"
				? undefined
				: villageId?.trim() || undefined;
		const cacheKey = `profiles_${activeTab}_${vid || "all"}_p${currentPage}_l${itemsPerPage}_${statusFilter}_${genderFilter || ""}_${ethnicityFilter || ""}_${residenceFilter || ""}_${ageGroup || ""}_${debouncedSearch || ""}`;

		// 1. Nạp tức thì từ Offline Cache
		try {
			const cached = await getCache<any>(cacheKey);
			if (abortController.signal.aborted) {
				return;
			}
			if (cached && cached.data) {
				setPageData(cached.data);
				if (cached.pagination?.total !== undefined) {
					setTotal(cached.pagination.total);
				}
			}
		} catch {
			// Ignore cache error
		}

		// 2. Fetch từ API Backend
		try {
			const queryParams = {
				villageId: vid,
				search: debouncedSearch || undefined,
				status: statusFilter !== "all" ? statusFilter : undefined,
				ageGroup,
				gender: genderFilter || undefined,
				ethnicity: ethnicityFilter || undefined,
				residence: residenceFilter || undefined,
				sortKey: sortKey || undefined,
				sortDirection: sortDirection || undefined,
				page: currentPage || 1,
				limit: itemsPerPage || 50,
			};

			const fetchFn =
				activeTab === "chuctho"
					? (params: any, options?: any) =>
							(profilesApi.getProfiles as any)(params, options)
					: (params: any, options?: any) =>
							(
								(htxhApi.getHtxhProfiles || htxhApi.getProfiles) as any
							).call(htxhApi, params, options);

			const res = await fetchFn(queryParams, {
				signal: abortController.signal,
			});

			if (abortController.signal.aborted) {
				return;
			}

			if (res && res.data) {
				setPageData(res.data);
				setTotal(res.pagination?.total ?? res.data.length);
				await setCache(cacheKey, res);
			}
		} catch (e: any) {
			if (
				abortController.signal.aborted ||
				axios.isCancel(e) ||
				e?.code === "ERR_CANCELED" ||
				e?.name === "CanceledError" ||
				e?.name === "AbortError"
			) {
				return;
			}
			console.warn(
				"Failed to load profiles from network, using cached state:",
				e,
			);
		}
	}, [
		isGlobal,
		villageId,
		activeTab,
		api,
		currentPage,
		itemsPerPage,
		statusFilter,
		ageGroup,
		genderFilter,
		ethnicityFilter,
		residenceFilter,
		debouncedSearch,
		sortKey,
		sortDirection,
	]);

	const loadStats = useCallback(async () => {
		try {
			const vid =
				isGlobal || !villageId || villageId === "all"
					? undefined
					: villageId?.trim() || undefined;
			const res = await api.getProfileStats(vid);
			if (res) {
				setStats((prev: any) => {
					if (
						prev &&
						prev.total === res.total &&
						prev.received === res.received &&
						prev.unreceived === res.unreceived &&
						prev.rate === res.rate
					) {
						return prev;
					}
					return res;
				});
			}
		} catch (e) {
			console.error("Failed to load stats:", e);
		}
	}, [isGlobal, villageId, api]);

	useEffect(() => {
		loadPage();
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [loadPage]);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	const handleSave = async (
		profileData: any,
		editId: string | number | null,
	) => {
		setIsSaving(true);
		try {
			if (editId) {
				await api.updateProfile(String(editId), profileData);
			} else {
				await api.createProfile(profileData);
			}
			await loadPage();
			await loadStats();
			return true;
		} catch (err: any) {
			const msg =
				err.response?.data?.message ||
				err.response?.data?.error ||
				"Lỗi khi lưu dữ liệu";
			if (err.response?.status === 409) {
				showAlert({
					title: "Xung Đột Dữ Liệu (409)",
					message:
						"Hồ sơ này đã được cập nhật bởi một thao tác khác. Danh sách dữ liệu đang được đồng bộ lại, vui lòng kiểm tra và thực hiện lại.",
					type: "warning",
				});
				await loadPage();
			} else {
				showAlert({ title: "Lỗi", message: msg, type: "error" });
			}
			return false;
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async (id: string | number) => {
		setIsDeleting(id);
		try {
			await api.deleteProfile(String(id));
			await loadPage();
			await loadStats();
			return true;
		} catch (err: any) {
			const msg = err.response?.data?.error || "Lỗi khi xóa";
			showAlert({ title: "Lỗi", message: msg, type: "error" });
			return false;
		} finally {
			setIsDeleting(null);
		}
	};

	const handleStatusToggle = async (
		profileOrId: any,
		maybeStatus?: boolean,
	): Promise<boolean> => {
		const targetId =
			typeof profileOrId === "object" && profileOrId !== null
				? profileOrId.id
				: profileOrId;
		setIsStatusUpdating(targetId);

		let newStatus: boolean;
		if (typeof maybeStatus === "boolean") {
			newStatus = maybeStatus;
		} else if (typeof profileOrId === "object" && profileOrId !== null) {
			newStatus = !profileOrId.received;
		} else {
			const current = pageDataRef.current.find(
				(p) => String(p.id) === String(targetId),
			);
			newStatus = current ? !current.received : true;
		}

		// 1. Cập nhật giao diện tức thì (optimistic UI update)
		const previousList = [...pageDataRef.current];
		setPageData((prev) =>
			prev.map((p) =>
				String(p.id) === String(targetId)
					? {
							...p,
							received: newStatus,
							received_at: newStatus ? new Date().toISOString() : null,
							receivedDate: newStatus
								? new Date().toLocaleDateString("vi-VN")
								: null,
						}
					: p,
			),
		);

		try {
			await api.updateProfileStatus(String(targetId), newStatus);
			await loadStats();
			return true;
		} catch (err: any) {
			// Lưu thất bại: trả về trạng thái cũ và báo lỗi rõ ràng
			setPageData(previousList);
			const msg =
				err.response?.data?.error ||
				err.response?.data?.message ||
				"Lỗi khi cập nhật trạng thái quà";
			showAlert({ title: "Lỗi", message: msg, type: "error" });
			return false;
		} finally {
			setIsStatusUpdating(null);
		}
	};

	const handleBulkStatus = async (
		status: boolean | number,
		selectedIds?: any,
		setSelectedIds?: any,
	): Promise<boolean> => {
		let ids: (string | number)[] = [];
		if (selectedIds instanceof Set) {
			ids = Array.from(selectedIds);
		} else if (Array.isArray(selectedIds)) {
			ids = selectedIds;
		}
		if (ids.length === 0) return false;
		setIsBulkUpdating(true);

		const isReceived = Boolean(status);
		const previousList = [...pageDataRef.current];
		const idSet = new Set(ids.map(String));

		// 1. Cập nhật tức thì (optimistic update)
		setPageData((prev) =>
			prev.map((p) =>
				idSet.has(String(p.id))
					? {
							...p,
							received: isReceived,
							received_at: isReceived ? new Date().toISOString() : null,
							receivedDate: isReceived
								? new Date().toLocaleDateString("vi-VN")
								: null,
						}
					: p,
			),
		);

		try {
			await api.bulkUpdateStatus(ids.map(String), isReceived);
			if (setSelectedIds) setSelectedIds(new Set());
			await loadStats();
			return true;
		} catch (err: any) {
			// Lưu thất bại: trả về trạng thái cũ và báo lỗi rõ ràng
			setPageData(previousList);
			const msg =
				err.response?.data?.error ||
				err.response?.data?.message ||
				"Lỗi khi cập nhật hàng loạt";
			showAlert({ title: "Lỗi", message: msg, type: "error" });
			return false;
		} finally {
			setIsBulkUpdating(false);
		}
	};

	const handleBulkDelete = async (selectedIds?: any, setSelectedIds?: any) => {
		let ids: (string | number)[] = [];
		if (selectedIds instanceof Set) {
			ids = Array.from(selectedIds);
		} else if (Array.isArray(selectedIds)) {
			ids = selectedIds;
		}
		if (ids.length === 0) return;
		setIsBulkUpdating(true);
		try {
			await api.bulkDelete(ids.map(String));
			if (setSelectedIds) setSelectedIds(new Set());
			await loadPage();
			await loadStats();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Lỗi khi xóa hàng loạt";
			showAlert({ title: "Lỗi", message: msg, type: "error" });
		} finally {
			setIsBulkUpdating(false);
		}
	};

	const fetchAuditLogs = useCallback(
		async (profileId: string | number) => {
			const idStr = String(profileId);
			if (!idStr) return;

			// Abort previous pending audit log request if still in flight
			if (auditLogAbortControllerRef.current) {
				auditLogAbortControllerRef.current.abort();
			}
			const controller = new AbortController();
			auditLogAbortControllerRef.current = controller;
			activeAuditLogIdRef.current = idStr;

			setIsLoadingLogs(true);
			try {
				const logs = await api.getAuditLog(idStr, {
					signal: controller.signal,
				});
				if (controller.signal.aborted) return;
				setAuditLogs(logs || []);
			} catch (err: any) {
				if (
					controller.signal.aborted ||
					axios.isCancel(err) ||
					err?.code === "ERR_CANCELED" ||
					err?.name === "CanceledError" ||
					err?.name === "AbortError"
				) {
					return;
				}
				console.error("Failed to load audit logs:", err);
				setAuditLogs([]);
			} finally {
				if (!controller.signal.aborted) {
					setIsLoadingLogs(false);
				}
			}
		},
		[api],
	);

	return {
		page,
		setPage,
		handlePageSizeChange,
		pageData,
		total,
		stats,
		isSaving,
		setIsSaving,
		isDeleting,
		setIsDeleting,
		isStatusUpdating,
		isBulkUpdating,
		auditLogs,
		setAuditLogs,
		isLoadingLogs,
		loadAuditLogs: fetchAuditLogs,
		undoCount: 0,
		undoLastAction: async () => {},
		handleUndo: async () => {},
		handleSave,
		handleDelete,
		executeDelete: handleDelete,
		handleStatusToggle,
		handleToggleReceived: handleStatusToggle,
		handleBulkStatus,
		handleBulkToggleReceived: handleBulkStatus,
		handleBulkDelete,
		fetchAuditLogs,
		loadProfiles: loadPage,
		fetchProfiles: loadPage,
		loadPage,
		loadStats,
	};
}
