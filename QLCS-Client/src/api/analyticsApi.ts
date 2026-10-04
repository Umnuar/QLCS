import { apiClient } from "./apiClient";

export interface AnalyticsOverviewData {
	success: boolean;
	chuctho: {
		total: number;
		received: number;
		unreceived: number;
		completionRate: number;
		ageStructure: {
			age60: number;
			age65: number;
			age70: number;
			age75: number;
			age80: number;
			age85: number;
			age90: number;
			age95: number;
			age100: number;
			age_over_100: number;
		};
	};
	htxh: {
		total: number;
		received: number;
		unreceived: number;
		completionRate: number;
		categories: {
			age75plus: number;
			age70to74poor: number;
			bao_tro: number;
			huu_tri: number;
			huu_tuat_bao_hiem: number;
			nguoi_co_cong: number;
		};
	};
}

export interface VillageAnalyticsRow {
	village_id: string;
	village_name: string;
	chuctho: {
		total: number;
		received: number;
		unreceived: number;
		completionRate: number;
	};
	htxh: {
		total: number;
		received: number;
		unreceived: number;
		completionRate: number;
	};
}

export interface AnalyticsByVillageResponse {
	success: boolean;
	data: VillageAnalyticsRow[];
	summary: {
		chucthoTotal: number;
		chucthoReceived: number;
		chucthoUnreceived: number;
		chucthoCompletionRate: number;
		htxhTotal: number;
		htxhReceived: number;
		htxhUnreceived: number;
		htxhCompletionRate: number;
	};
}

export const analyticsApi = {
	async getOverview(params?: {
		villageId?: string;
		calculationYear?: number;
	}): Promise<AnalyticsOverviewData> {
		const res = await apiClient.get("/analytics/overview", { params });
		return res.data;
	},

	async getByVillage(params?: {
		calculationYear?: number;
	}): Promise<AnalyticsByVillageResponse> {
		const res = await apiClient.get("/analytics/by-village", { params });
		return res.data;
	},
};
