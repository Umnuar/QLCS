import { API_BASE_URL, apiClient } from "./apiClient";

export interface BackupSnapshotResponse {
	metadata: {
		app: string;
		version: string;
		timestamp: string;
		counts: {
			villages: number;
			users: number;
			profiles: number;
			htxh_profiles: number;
			settings: number;
			profile_audit_log: number;
		};
	};
	data: {
		villages: any[];
		users: any[];
		profiles: any[];
		htxh_profiles: any[];
		settings: any[];
		profile_audit_log: any[];
	};
}

export interface RestoreResponse {
	success: boolean;
	message?: string;
	counts?: {
		villages: number;
		profiles: number;
		htxh_profiles: number;
	};
}

export const backupApi = {
	async getSnapshot(
		download: boolean = false,
	): Promise<BackupSnapshotResponse> {
		const res = await apiClient.get("/backups/snapshot", {
			params: { download },
		});
		return res.data;
	},

	getSnapshotDownloadUrl(): string {
		return `${API_BASE_URL}/backups/snapshot?download=true`;
	},

	async restoreSnapshot(data: any): Promise<RestoreResponse> {
		const res = await apiClient.post("/backups/restore", data);
		return res.data;
	},
};
