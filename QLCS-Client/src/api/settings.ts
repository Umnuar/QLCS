import { apiClient } from "./apiClient";

export const settingsApi = {
	async getSettings(): Promise<Record<string, string>> {
		const res = await apiClient.get("/settings");
		return res.data.data;
	},

	async updateSettings(settings: Record<string, string>): Promise<void> {
		await apiClient.put("/settings", settings);
	},
};
