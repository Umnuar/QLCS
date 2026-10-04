import axios from "axios";
import { secureStorage } from "../utils/secureStorage";

const DEFAULT_API_URL = "https://qlcs.dulieudakha.vn/api";
// Production domain: https://qlcs.dulieudakha.vn/api
export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: any) => void;
	reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

// Request interceptor: Attach token
apiClient.interceptors.request.use(
	async (config) => {
		const token = await secureStorage.getItem("accessToken");
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor: Auto refresh token on 401
apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (
				originalRequest.url?.includes("/auth/login") ||
				originalRequest.url?.includes("/auth/refresh")
			) {
				return Promise.reject(error);
			}

			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return apiClient(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = await secureStorage.getItem("refreshToken");
			if (!refreshToken) {
				isRefreshing = false;
				await secureStorage.removeItem("accessToken");
				await secureStorage.removeItem("refreshToken");
				window.dispatchEvent(new Event("auth:logout"));
				return Promise.reject(error);
			}

			try {
				const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
					refreshToken,
				});
				const { accessToken, refreshToken: newRefreshToken } =
					response.data.data;

				await secureStorage.setItem("accessToken", accessToken);
				await secureStorage.setItem("refreshToken", newRefreshToken);

				apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
				originalRequest.headers.Authorization = `Bearer ${accessToken}`;

				processQueue(null, accessToken);
				return apiClient(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				await secureStorage.removeItem("accessToken");
				await secureStorage.removeItem("refreshToken");
				window.dispatchEvent(new Event("auth:logout"));
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);
