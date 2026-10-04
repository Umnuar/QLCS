import { apiClient } from "./apiClient";

export interface ProfileQueryParams {
	search?: string;
	villageId?: string;
	status?: string;
	ageGroup?: string;
	gender?: string;
	ethnicity?: string;
	residence?: string;
	sortKey?: string;
	sortDirection?: string;
	cursor?: string;
	page?: number;
	limit?: number;
}

export interface ProfilesPaginationResponse<T = any> {
	data: T[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const profilesApi = {
	async getProfiles(
		params: ProfileQueryParams,
	): Promise<ProfilesPaginationResponse> {
		const cleanParams: any = { ...params };
		if (
			cleanParams.villageId === undefined ||
			typeof cleanParams.villageId !== "string" ||
			cleanParams.villageId.trim() === "" ||
			cleanParams.villageId.trim() === "all"
		) {
			delete cleanParams.villageId;
		} else {
			cleanParams.villageId = cleanParams.villageId.trim();
		}
		const res = await apiClient.get("/profiles", { params: cleanParams });
		return res.data;
	},

	async getProfileStats(villageId?: string) {
		const cleanVillageId =
			villageId &&
			typeof villageId === "string" &&
			villageId.trim() !== "" &&
			villageId.trim() !== "all"
				? villageId.trim()
				: undefined;
		const res = await apiClient.get("/profiles/stats", {
			params: cleanVillageId ? { villageId: cleanVillageId } : {},
		});
		return res.data.data;
	},

	async getDeletedProfiles() {
		const res = await apiClient.get("/profiles/deleted");
		return res.data.data;
	},

	async createProfile(data: any) {
		const res = await apiClient.post("/profiles", data);
		return res.data.data;
	},

	async updateProfile(id: string, data: any) {
		const res = await apiClient.put(`/profiles/${id}`, data);
		return res.data.data;
	},

	async updateProfileStatus(id: string, received: boolean) {
		const res = await apiClient.put(`/profiles/${id}/status`, { received });
		return res.data.data;
	},

	async deleteProfile(id: string) {
		const res = await apiClient.delete(`/profiles/${id}`);
		return res.data.data;
	},

	async restoreProfile(id: string) {
		const res = await apiClient.put(`/profiles/${id}/restore`);
		return res.data.data;
	},

	async hardDeleteProfile(id: string) {
		const res = await apiClient.delete(`/profiles/${id}/hard`);
		return res.data;
	},

	async bulkUpdateStatus(ids: string[], received: boolean) {
		const res = await apiClient.post("/profiles/bulk-status", {
			ids,
			received,
		});
		return res.data;
	},

	async bulkDelete(ids: string[]) {
		const res = await apiClient.post("/profiles/bulk-delete", { ids });
		return res.data;
	},

	async bulkAddProfiles(profiles: any[]) {
		const res = await apiClient.post("/profiles/bulk-add", { profiles });
		return res.data.data;
	},

	async bulkAdd(profiles: any[]) {
		const res = await apiClient.post("/profiles/bulk-add", { profiles });
		return res.data.data;
	},

	async emptyTrash() {
		const res = await apiClient.delete("/profiles/trash");
		return res.data;
	},

	async recalculate(year: number) {
		const res = await apiClient.post("/profiles/recalculate", { year });
		return res.data;
	},

	async getAuditLog(id: string, options?: any) {
		const res = await apiClient.get(`/profiles/${id}/audit-log`, options);
		return res.data.data;
	},
};
