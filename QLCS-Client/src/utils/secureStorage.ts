/**
 * Secure Storage wrapper for token and sensitive session data.
 * Hoạt động bền bỉ trên WebView2 và fallback an toàn localStorage.
 */

export const secureStorage = {
	async getItem(key: string): Promise<string | null> {
		try {
			if (typeof localStorage !== "undefined") {
				return localStorage.getItem(key);
			}
		} catch (err) {
			console.warn("[secureStorage] getItem error:", err);
		}
		return null;
	},

	async setItem(key: string, value: string): Promise<void> {
		try {
			if (typeof localStorage !== "undefined") {
				localStorage.setItem(key, value);
			}
		} catch (err) {
			console.warn("[secureStorage] setItem error:", err);
		}
	},

	async removeItem(key: string): Promise<void> {
		try {
			if (typeof localStorage !== "undefined") {
				localStorage.removeItem(key);
			}
		} catch (err) {
			console.warn("[secureStorage] removeItem error:", err);
		}
	},

	async clear(): Promise<void> {
		try {
			if (typeof localStorage !== "undefined") {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("user");
			}
		} catch (err) {
			console.warn("[secureStorage] clear error:", err);
		}
	},
};
