/**
 * Secure Storage wrapper for token and sensitive session data.
 * Ưu tiên sử dụng Electron Store (được mã hóa AES) qua IPC.
 * Fallback sang localStorage nếu chạy trong môi trường trình duyệt web đơn thuần.
 */

export const secureStorage = {
	async getItem(key: string): Promise<string | null> {
		try {
			if (typeof window !== "undefined" && window.api?.store?.get) {
				const val = await window.api.store.get(key);
				return val !== undefined && val !== null ? String(val) : null;
			}
		} catch (err) {
			console.warn("Error reading from secure store:", err);
		}
		return typeof localStorage !== "undefined"
			? localStorage.getItem(key)
			: null;
	},

	async setItem(key: string, value: string): Promise<void> {
		try {
			if (typeof window !== "undefined" && window.api?.store?.set) {
				await window.api.store.set(key, value);
				// Đảm bảo xóa khỏi localStorage nếu trước đó có sót lại
				if (typeof localStorage !== "undefined") {
					localStorage.removeItem(key);
				}
				return;
			}
		} catch (err) {
			console.warn("Error writing to secure store:", err);
		}
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(key, value);
		}
	},

	async removeItem(key: string): Promise<void> {
		try {
			if (typeof window !== "undefined" && window.api?.store?.delete) {
				await window.api.store.delete(key);
			}
		} catch (err) {
			console.warn("Error deleting from secure store:", err);
		}
		if (typeof localStorage !== "undefined") {
			localStorage.removeItem(key);
		}
	},

	async clear(): Promise<void> {
		try {
			if (typeof window !== "undefined" && window.api?.store?.clear) {
				await window.api.store.clear();
			}
		} catch (err) {
			console.warn("Error clearing secure store:", err);
		}
		if (typeof localStorage !== "undefined") {
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			localStorage.removeItem("user");
		}
	},
};
