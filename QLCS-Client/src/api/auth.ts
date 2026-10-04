import { apiClient } from "./apiClient";

export interface User {
	id: string;
	username: string;
	role: string;
	village_id: string | null;
	avatar?: string | null;
	avatar_url?: string | null;
}

export const authApi = {
	async isFirstRun(): Promise<boolean> {
		try {
			const res = await apiClient.get("/auth/is-first-run");
			return res.data.data?.isFirstRun || false;
		} catch {
			return false;
		}
	},

	async login(
		username: string,
		password: string,
	): Promise<{ accessToken: string; refreshToken: string; user: User }> {
		const res = await apiClient.post("/auth/login", { username, password });
		return res.data.data;
	},

	async setupAdmin(username: string, password: string): Promise<any> {
		const res = await apiClient.post("/auth/setup", { username, password });
		return res.data;
	},

	async getMe(): Promise<User> {
		const res = await apiClient.get("/auth/me");
		return res.data.data;
	},

	async changePassword(
		currentPassword: string,
		newPassword: string,
	): Promise<any> {
		const res = await apiClient.put("/auth/password", {
			currentPassword,
			newPassword,
		});
		return res.data;
	},

	async changeUsername(newUsername: string): Promise<any> {
		const res = await apiClient.put("/auth/username", { newUsername });
		return res.data;
	},

	async updateAvatar(avatar: string): Promise<any> {
		const res = await apiClient.put("/auth/avatar", { avatar });
		return res.data;
	},

	async logout(refreshToken?: string): Promise<void> {
		try {
			await apiClient.post("/auth/logout", { refreshToken });
		} catch {
			// Ignore network errors during logout
		}
	},
};
