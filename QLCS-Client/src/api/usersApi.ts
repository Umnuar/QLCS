import { apiClient } from "./apiClient";
import type { User } from "./auth";

export interface UserItem extends User {
	full_name?: string;
	created_at?: string;
	updated_at?: string;
	village?: {
		id: string;
		name: string;
	} | null;
}

export interface CreateUserData {
	username: string;
	password?: string;
	role: "admin" | "user" | string;
	village_id?: string | null;
}

export interface UpdateUserData {
	role?: "admin" | "user" | string;
	village_id?: string | null;
	avatar_url?: string | null;
}

export const usersApi = {
	async getUsers(): Promise<UserItem[]> {
		const res = await apiClient.get("/users");
		return res.data?.data || [];
	},

	async createUser(data: CreateUserData): Promise<UserItem> {
		const res = await apiClient.post("/users", data);
		return res.data?.data;
	},

	async updateUser(id: string, data: UpdateUserData): Promise<UserItem> {
		const res = await apiClient.put(`/users/${id}`, data);
		return res.data?.data;
	},

	async resetPassword(
		id: string,
		password: string,
	): Promise<{ success: boolean; message: string }> {
		const res = await apiClient.post(`/users/${id}/reset-password`, {
			password,
		});
		return res.data;
	},

	async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
		const res = await apiClient.delete(`/users/${id}`);
		return res.data;
	},
};
