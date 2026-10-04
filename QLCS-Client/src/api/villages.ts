import { apiClient } from "./apiClient";

export interface Village {
	id: string;
	name: string;
	total?: number;
	received?: number;
	htxh_total?: number;
	htxh_received?: number;
}

export const villagesApi = {
	async getVillages(): Promise<Village[]> {
		const res = await apiClient.get("/villages");
		return res.data.data;
	},

	async getVillageStats(): Promise<Village[]> {
		const res = await apiClient.get("/villages/stats");
		return res.data.data;
	},

	async createVillage(name: string): Promise<Village> {
		const res = await apiClient.post("/villages", { name });
		return res.data.data;
	},

	async updateVillage(id: string, name: string): Promise<Village> {
		const res = await apiClient.put(`/villages/${id}`, { name });
		return res.data.data;
	},

	async deleteVillage(id: string): Promise<void> {
		await apiClient.delete(`/villages/${id}`);
	},
};
