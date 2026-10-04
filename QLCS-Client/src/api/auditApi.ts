import { apiClient } from "./apiClient";

export type AuditAction =
	| "CREATE"
	| "UPDATE"
	| "DELETE"
	| "RESTORE"
	| "STATUS_CHANGE"
	| "IMPORT"
	| string;

export interface AuditLogItem {
	id: number | string;
	profile_id?: string;
	profile_type?: "chuctho" | "htxh" | string;
	action: AuditAction;
	user_id?: string;
	village_id?: string;
	old_data?: any;
	new_data?: any;
	old_values?: any;
	new_values?: any;
	ip_address?: string;
	ip?: string;
	note?: string;
	created_at: string;
	user?: {
		id: string;
		username: string;
		role: string;
		full_name?: string;
	};
	village?: {
		id: string;
		name: string;
	};
}

export interface AuditQueryParams {
	page?: number;
	limit?: number;
	villageId?: string;
	userId?: string;
	username?: string;
	action?: string;
	profileType?: string;
	search?: string;
}

export interface AuditLogsResponse {
	data: AuditLogItem[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const auditApi = {
	async getAuditLogs(params?: AuditQueryParams): Promise<AuditLogsResponse> {
		const res = await apiClient.get("/audit-logs", { params });
		return res.data;
	},
};
