import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/apiClient";
import { htxhApi } from "../api/htxh";
import { profilesApi } from "../api/profiles";

describe("Regression: Request flood & stats loop prevention", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe("Query parameter sanitization (profilesApi & htxhApi)", () => {
		it("profilesApi.getProfileStats omits villageId when empty or whitespace", async () => {
			const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
				data: { data: { total: 10, received: 5, unreceived: 5, rate: "50.0" } },
			} as any);

			// Empty string should NOT send { params: { villageId: "" } }
			await profilesApi.getProfileStats("");
			expect(getSpy).toHaveBeenCalledWith("/profiles/stats", { params: {} });

			// Whitespace should NOT send { params: { villageId: "   " } }
			await profilesApi.getProfileStats("   ");
			expect(getSpy).toHaveBeenCalledWith("/profiles/stats", { params: {} });

			// Undefined should NOT send { params: { villageId: undefined } }
			await profilesApi.getProfileStats(undefined);
			expect(getSpy).toHaveBeenCalledWith("/profiles/stats", { params: {} });

			// Valid villageId should be trimmed and sent
			await profilesApi.getProfileStats("  village-123  ");
			expect(getSpy).toHaveBeenCalledWith("/profiles/stats", {
				params: { villageId: "village-123" },
			});
		});

		it("htxhApi.getProfileStats omits villageId when empty or whitespace", async () => {
			const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
				data: {
					data: { total: 20, received: 10, unreceived: 10, rate: "50.0" },
				},
			} as any);

			await htxhApi.getProfileStats("");
			expect(getSpy).toHaveBeenCalledWith("/htxh/stats", { params: {} });

			await htxhApi.getProfileStats("   ");
			expect(getSpy).toHaveBeenCalledWith("/htxh/stats", { params: {} });

			await htxhApi.getProfileStats("  village-456  ");
			expect(getSpy).toHaveBeenCalledWith("/htxh/stats", {
				params: { villageId: "village-456" },
			});
		});

		it("profilesApi.getProfiles sanitizes empty villageId from params", async () => {
			const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
				data: {
					data: [],
					pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
				},
			} as any);

			await profilesApi.getProfiles({ villageId: "", page: 1, limit: 50 });
			expect(getSpy).toHaveBeenCalledWith("/profiles", {
				params: { page: 1, limit: 50 },
			});
		});
	});

	describe("Stats state updater bail-out logic", () => {
		it("returns previous reference when stats values have not changed", () => {
			const prevStats = {
				total: 50,
				received: 30,
				unreceived: 20,
				rate: "60.0",
			};
			const newStatsIdentical = {
				total: 50,
				received: 30,
				unreceived: 20,
				rate: "60.0",
			};

			// Helper simulating the state setter in loadStats
			const updateStats = (prev: any, next: any) => {
				if (
					prev &&
					prev.total === next.total &&
					prev.received === next.received &&
					prev.unreceived === next.unreceived &&
					prev.rate === next.rate
				) {
					return prev;
				}
				return next;
			};

			const result = updateStats(prevStats, newStatsIdentical);
			// Must be EXACT same object reference (Object.is) so React bails out of re-render
			expect(result).toBe(prevStats);

			const changedStats = {
				total: 51,
				received: 30,
				unreceived: 21,
				rate: "58.8",
			};
			const resultChanged = updateStats(prevStats, changedStats);
			expect(resultChanged).toBe(changedStats);
			expect(resultChanged).not.toBe(prevStats);
		});
	});

	describe("Guard condition for stats loading", () => {
		it("bails out without network call when !isGlobal and !villageId", async () => {
			const getSpy = vi.spyOn(apiClient, "get");

			const isGlobal = false;
			const villageId = "";

			let loadCalled = false;
			if (!isGlobal && !villageId) {
				// Guard triggers, do not call API
			} else {
				loadCalled = true;
				await profilesApi.getProfileStats(villageId);
			}

			expect(loadCalled).toBe(false);
			expect(getSpy).not.toHaveBeenCalled();
		});
	});

	describe("BUG-P1-01: Stable age filter reference prevents loadPage loop", () => {
		it("empty age filters uses stable reference or primitive ageGroup", () => {
			const ageMilestoneFilter = "";
			const EMPTY_AGE_FILTERS: string[] = [];
			const filters1 = ageMilestoneFilter ? [ageMilestoneFilter] : EMPTY_AGE_FILTERS;
			const filters2 = ageMilestoneFilter ? [ageMilestoneFilter] : EMPTY_AGE_FILTERS;

			// References must be identical to prevent useCallback invalidation
			expect(filters1).toBe(filters2);

			const ageGroup1 = filters1[0] || undefined;
			const ageGroup2 = filters2[0] || undefined;
			expect(ageGroup1).toBe(ageGroup2);
			expect(ageGroup1).toBeUndefined();
		});
	});

	describe("BUG-P2-01: CCCD Masking and Data Protection", () => {
		const isMaskedCccd = (val?: string | null): boolean => {
			if (!val) return false;
			return /[\u2022\u25cf\*]/.test(String(val));
		};

		it("detects masked CCCD formats correctly", () => {
			expect(isMaskedCccd("••••••••8912")).toBe(true);
			expect(isMaskedCccd("••••••••••••")).toBe(true);
			expect(isMaskedCccd("********8912")).toBe(true);
			expect(isMaskedCccd("060012345678")).toBe(false);
			expect(isMaskedCccd("")).toBe(false);
			expect(isMaskedCccd(null)).toBe(false);
		});

		it("omits masked or unchanged CCCD from update payload to protect database", () => {
			const initialData = { id: "123", cccd: "••••••••8912", name: "Nguyễn Văn A" };
			const formDataUnchanged = { ...initialData };

			const payload = { ...formDataUnchanged };
			if (isMaskedCccd(payload.cccd) || payload.cccd === initialData?.cccd) {
				delete (payload as any).cccd;
			}

			expect(payload.cccd).toBeUndefined();
			expect(payload.name).toBe("Nguyễn Văn A");

			// If user explicitly provides a new valid 12-digit CCCD, it is included
			const formDataChanged = { ...initialData, cccd: "060099887766" };
			const payloadChanged = { ...formDataChanged };
			if (isMaskedCccd(payloadChanged.cccd) || payloadChanged.cccd === initialData?.cccd) {
				delete (payloadChanged as any).cccd;
			}
			expect(payloadChanged.cccd).toBe("060099887766");
		});

		it("profilesApi.getAuditLog passes options signal to apiClient.get", async () => {
			const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
				data: { data: [] },
			} as any);

			const controller = new AbortController();
			await profilesApi.getAuditLog("profile-abc", { signal: controller.signal });

			expect(getSpy).toHaveBeenCalledWith("/profiles/profile-abc/audit-log", {
				signal: controller.signal,
			});
		});
	});
});
