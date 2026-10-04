import { apiClient } from "./apiClient";
import type {
	ProfileQueryParams,
	ProfilesPaginationResponse,
} from "./profiles";

export const htxhApi = {
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
		const res = await apiClient.get("/htxh", { params: cleanParams });
		return res.data;
	},

	async getHtxhProfiles(
		params: ProfileQueryParams,
	): Promise<ProfilesPaginationResponse> {
		return this.getProfiles(params);
	},

	async getProfileStats(villageId?: string) {
		const cleanVillageId =
			villageId &&
			typeof villageId === "string" &&
			villageId.trim() !== "" &&
			villageId.trim() !== "all"
				? villageId.trim()
				: undefined;
		const res = await apiClient.get("/htxh/stats", {
			params: cleanVillageId ? { villageId: cleanVillageId } : {},
		});
		return res.data.data;
	},

	async getDeletedProfiles() {
		const res = await apiClient.get("/htxh/deleted");
		return res.data.data;
	},

	async createProfile(data: any) {
		const res = await apiClient.post("/htxh", data);
		return res.data.data;
	},

	async updateProfile(id: string, data: any) {
		const res = await apiClient.put(`/htxh/${id}`, data);
		return res.data.data;
	},

	async updateProfileStatus(id: string, received: boolean) {
		const res = await apiClient.put(`/htxh/${id}/status`, { received });
		return res.data.data;
	},

	async deleteProfile(id: string) {
		const res = await apiClient.delete(`/htxh/${id}`);
		return res.data.data;
	},

	async restoreProfile(id: string) {
		const res = await apiClient.put(`/htxh/${id}/restore`);
		return res.data.data;
	},

	async hardDeleteProfile(id: string) {
		const res = await apiClient.delete(`/htxh/${id}/hard`);
		return res.data;
	},

	async bulkUpdateStatus(ids: string[], received: boolean) {
		const res = await apiClient.post("/htxh/bulk-status", { ids, received });
		return res.data;
	},

	async bulkDelete(ids: string[]) {
		const res = await apiClient.post("/htxh/bulk-delete", { ids });
		return res.data;
	},

	async bulkAddProfiles(profiles: any[]) {
		const res = await apiClient.post("/htxh/bulk-add", { profiles });
		return res.data.data;
	},

	async bulkAdd(profiles: any[]) {
		const res = await apiClient.post("/htxh/bulk-add", { profiles });
		return res.data.data;
	},

	async emptyTrash() {
		const res = await apiClient.delete("/htxh/trash");
		return res.data;
	},

	async recalculate(year: number) {
		const res = await apiClient.post("/htxh/recalculate", { year });
		return res.data;
	},

	async getAuditLog(id: string, options?: any) {
		const res = await apiClient.get(`/htxh/${id}/audit-log`, options);
		return res.data.data;
	},
};
