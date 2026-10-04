import axios from "axios";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { API_BASE_URL } from "./api/apiClient";
import { authApi, type User } from "./api/auth";
import { type Village, villagesApi } from "./api/villages";
import { getCache, getSyncQueueCount, setCache } from "./db/indexedDB";
import { useInactivityTimeout } from "./hooks/useInactivityTimeout";
import { secureStorage } from "./utils/secureStorage";

export type ActiveTab =
	| "villages"
	| "chuctho"
	| "htxh"
	| "analytics"
	| "recycle-bin"
	| "audit"
	| "settings";

export const DEFAULT_VILLAGES: Village[] = [
	{ id: "5769de47-c24c-476e-9620-cd741c40fcee", name: "Thôn 1" },
	{ id: "391ad3d8-f3c2-49ab-9849-3b6f1601a967", name: "Thôn 2" },
	{ id: "a1d39732-8e5f-4a07-83fd-ba0005639676", name: "Thôn 3" },
	{ id: "1b160cfb-90e9-4980-9926-a89f6c20ac38", name: "Thôn 4" },
	{ id: "132d38d1-5132-4641-a348-7d7641ce3528", name: "Thôn 5" },
	{ id: "66619f9d-e65e-4d42-9da7-e44299a0ba97", name: "Thôn Kon Đao Yôp" },
	{ id: "bd4bc94c-4566-429b-a360-ad67107a6a91", name: "Làng Kon Hnông Bách" },
];

export interface AppContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	activeTab: ActiveTab;
	setActiveTab: (tab: ActiveTab) => void;
	selectedVillageId: string;
	setSelectedVillageId: (id: string) => void;
	selectedVillageName: string;
	villages: Village[];
	setVillages: React.Dispatch<React.SetStateAction<Village[]>>;
	refreshVillages: () => Promise<void>;

	// Theme state
	theme: "light" | "dark";
	toggleTheme: () => void;
	isDarkMode: boolean;
	setIsDarkMode: (isDark: boolean) => void;

	// Sidebar state
	isSidebarCollapsed: boolean;
	toggleSidebar: () => void;
	setSidebarCollapsed: (collapsed: boolean) => void;

	// Zoom state
	zoomLevel: number;
	zoomIn: () => void;
	zoomOut: () => void;
	resetZoom: () => void;

	// Network & Heartbeat
	isOnline: boolean;
	setIsOnline: (online: boolean) => void;
	isBackendHealthy: boolean;
	latency: number | null;
	checkServerHealth: () => Promise<boolean>;
	isInitializing: boolean;
	logout: () => Promise<void>;

	// Sync queue
	syncQueueCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [activeTab, setActiveTab] = useState<ActiveTab>("villages");
	const [selectedVillageId, setSelectedVillageIdState] = useState<string>("");
	const [villages, setVillages] = useState<Village[]>(DEFAULT_VILLAGES);
	const [isInitializing, setIsInitializing] = useState<boolean>(true);

	// Network & Heartbeat
	const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
	const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
	const [latency, setLatency] = useState<number | null>(null);
	const [syncQueueCount, setSyncQueueCount] = useState<number>(0);

	// 1. Sidebar Collapsed State
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
		try {
			return (
				localStorage.getItem("qlcs_sidebar_collapsed") === "true" ||
				localStorage.getItem("qlhk_sidebar_collapsed") === "true"
			);
		} catch {
			return false;
		}
	});

	const toggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => {
			const next = !prev;
			try {
				localStorage.setItem("qlcs_sidebar_collapsed", String(next));
				localStorage.setItem("qlhk_sidebar_collapsed", String(next));
			} catch {
				// Ignore
			}
			return next;
		});
	}, []);

	const setSidebarCollapsed = useCallback((collapsed: boolean) => {
		setIsSidebarCollapsed(collapsed);
		try {
			localStorage.setItem("qlcs_sidebar_collapsed", String(collapsed));
			localStorage.setItem("qlhk_sidebar_collapsed", String(collapsed));
		} catch {
			// Ignore
		}
	}, []);

	// 2. Theme State (Dark / Light)
	const [theme, setTheme] = useState<"light" | "dark">(() => {
		try {
			const saved =
				localStorage.getItem("theme") ||
				localStorage.getItem("qlcs_theme") ||
				localStorage.getItem("darkMode");
			if (saved === "dark" || saved === "true") return "dark";
			if (saved === "light" || saved === "false") return "light";
			return window.matchMedia?.("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		} catch {
			return "light";
		}
	});

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
		try {
			localStorage.setItem("theme", theme);
			localStorage.setItem("qlcs_theme", theme);
			localStorage.setItem("darkMode", String(theme === "dark"));
		} catch {
			// Ignore
		}
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => (prev === "light" ? "dark" : "light"));
	}, []);

	const setIsDarkMode = useCallback((isDark: boolean) => {
		setTheme(isDark ? "dark" : "light");
	}, []);

	// 3. Zoom State (80% to 140%, step 10%)
	const [zoomLevel, setZoomLevel] = useState<number>(() => {
		try {
			const saved = localStorage.getItem("qlcs_zoom");
			const parsed = saved ? parseInt(saved, 10) : 100;
			return parsed >= 80 && parsed <= 140 ? parsed : 100;
		} catch {
			return 100;
		}
	});

	useEffect(() => {
		const electronApi = (window as any).electronAPI || (window as any).api?.app;
		if (electronApi?.setZoom) {
			electronApi.setZoom(zoomLevel);
		} else {
			// Fallback CSS zoom on body
			(document.body.style as any).zoom = `${zoomLevel}%`;
		}
		try {
			localStorage.setItem("qlcs_zoom", String(zoomLevel));
		} catch {
			// Ignore
		}
	}, [zoomLevel]);

	const zoomIn = useCallback(() => {
		setZoomLevel((prev) => Math.min(140, prev + 10));
	}, []);

	const zoomOut = useCallback(() => {
		setZoomLevel((prev) => Math.max(80, prev - 10));
	}, []);

	const resetZoom = useCallback(() => {
		setZoomLevel(100);
	}, []);

	// Zoom keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) {
				if (e.key === "=" || e.key === "+") {
					e.preventDefault();
					zoomIn();
				} else if (e.key === "-" || e.key === "_") {
					e.preventDefault();
					zoomOut();
				} else if (e.key === "0") {
					e.preventDefault();
					resetZoom();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [zoomIn, zoomOut, resetZoom]);

	// Village Selection Logic
	const setSelectedVillageId = useCallback(
		(id: string) => {
			if (user?.role === "user" && user.village_id) {
				setSelectedVillageIdState(user.village_id);
			} else {
				setSelectedVillageIdState(id);
			}
		},
		[user],
	);

	useEffect(() => {
		if (user?.role === "user" && user.village_id) {
			setSelectedVillageIdState(user.village_id);
		}
	}, [user]);

	// Refresh villages from API or Offline cache
	const refreshVillages = useCallback(async () => {
		try {
			const res = await villagesApi.getVillages();
			if (Array.isArray(res) && res.length > 0) {
				setVillages(res);
				await setCache("villages", res);
				return;
			}
			const cached = await getCache<Village[]>("villages");
			if (cached && cached.length > 0) {
				setVillages(cached);
			} else {
				setVillages(DEFAULT_VILLAGES);
			}
		} catch (err) {
			console.warn(
				"[AppContext] Lỗi tải danh mục thôn từ Backend, nạp từ Offline Cache:",
				err,
			);
			try {
				const cached = await getCache<Village[]>("villages");
				if (cached && cached.length > 0) {
					setVillages(cached);
				} else {
					setVillages(DEFAULT_VILLAGES);
				}
			} catch {
				setVillages(DEFAULT_VILLAGES);
			}
		}
	}, []);

	useEffect(() => {
		if (user) {
			refreshVillages();
		}
	}, [user, refreshVillages]);

	// Refresh sync queue count
	const refreshSyncCount = async () => {
		try {
			const count = await getSyncQueueCount();
			setSyncQueueCount(count);
		} catch {
			// Ignore
		}
	};

	// Logout
	const logout = useCallback(async () => {
		try {
			const refreshToken = await secureStorage.getItem("refreshToken");
			if (refreshToken) {
				await authApi.logout(refreshToken);
			}
		} catch {
			// Ignore
		} finally {
			await secureStorage.removeItem("accessToken");
			await secureStorage.removeItem("refreshToken");
			await secureStorage.removeItem("user");
			setUser(null);
			setSelectedVillageIdState("");
			setActiveTab("villages");
		}
	}, []);

	// 30-minute inactivity auto-logout
	useInactivityTimeout(logout, !!user, 30);

	// Heartbeat monitor: Ping GET /api/health every 6s (Smoothed with EMA alpha = 0.3)
	const checkServerHealth = useCallback(async (): Promise<boolean> => {
		const t0 = performance.now();
		try {
			const res = await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 });
			const currentLat = Math.round(performance.now() - t0);
			setLatency((prev) =>
				prev !== null ? Math.round(0.3 * currentLat + 0.7 * prev) : currentLat,
			);
			if (res.status === 200) {
				setIsBackendHealthy((prev) => {
					if (!prev) {
						window.dispatchEvent(new CustomEvent("server:reconnected"));
					}
					return true;
				});
				setIsOnline(true);
				return true;
			}
			setIsBackendHealthy(false);
			setLatency(null);
			return false;
		} catch {
			setIsBackendHealthy(false);
			setLatency(null);
			return false;
		}
	}, []);

	// Auth Initialization & Auto Session Check
	useEffect(() => {
		const checkSession = async () => {
			const token = await secureStorage.getItem("accessToken");
			if (token) {
				try {
					const userData = await authApi.getMe();
					setUser(userData);
					if (userData.role === "admin") {
						setActiveTab("villages");
						setSelectedVillageIdState("");
					} else {
						setActiveTab("analytics");
						if (userData.village_id) {
							setSelectedVillageIdState(userData.village_id);
						}
					}
				} catch {
					await secureStorage.removeItem("accessToken");
					await secureStorage.removeItem("refreshToken");
					setUser(null);
				}
			}
			setIsInitializing(false);
			refreshSyncCount();
		};

		checkSession();
		checkServerHealth();

		// Event listeners
		const handleOnline = () => {
			setIsOnline(true);
			window.dispatchEvent(new CustomEvent("server:reconnected"));
			checkServerHealth();
		};
		const handleOffline = () => {
			setIsOnline(false);
			setIsBackendHealthy(false);
		};

		const handleReconnected = () => {
			if (user) {
				refreshVillages();
			}
			refreshSyncCount();
		};

		const handleAuthLogout = () => {
			logout();
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		window.addEventListener("server:reconnected", handleReconnected);
		window.addEventListener("auth:logout", handleAuthLogout);
		window.addEventListener("sync:queued", refreshSyncCount);
		window.addEventListener("sync:updated", refreshSyncCount);

		// Heartbeat Interval: every 6s
		const heartbeatTimer = setInterval(() => {
			if (navigator.onLine) {
				checkServerHealth();
			}
		}, 6000);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
			window.removeEventListener("server:reconnected", handleReconnected);
			window.removeEventListener("auth:logout", handleAuthLogout);
			window.removeEventListener("sync:queued", refreshSyncCount);
			window.removeEventListener("sync:updated", refreshSyncCount);
			clearInterval(heartbeatTimer);
		};
	}, [checkServerHealth, logout, refreshVillages]);

	const selectedVillage = useMemo(() => {
		return villages.find((v) => v.id === selectedVillageId);
	}, [villages, selectedVillageId]);

	const selectedVillageName = useMemo(() => {
		if (selectedVillage) return selectedVillage.name;
		return user?.role === "admin" ? "Toàn xã Đăk Hà" : "";
	}, [selectedVillage, user]);

	const isDarkMode = theme === "dark";

	const contextValue = useMemo(
		() => ({
			user,
			setUser,
			activeTab,
			setActiveTab,
			selectedVillageId,
			setSelectedVillageId,
			selectedVillageName,
			villages,
			setVillages,
			refreshVillages,

			theme,
			toggleTheme,
			isDarkMode,
			setIsDarkMode,

			isSidebarCollapsed,
			toggleSidebar,
			setSidebarCollapsed,

			zoomLevel,
			zoomIn,
			zoomOut,
			resetZoom,

			isOnline,
			setIsOnline,
			isBackendHealthy,
			latency,
			checkServerHealth,
			isInitializing,
			logout,

			syncQueueCount,
		}),
		[
			user,
			setUser,
			activeTab,
			setActiveTab,
			selectedVillageId,
			setSelectedVillageId,
			selectedVillageName,
			villages,
			setVillages,
			refreshVillages,
			theme,
			toggleTheme,
			isDarkMode,
			setIsDarkMode,
			isSidebarCollapsed,
			toggleSidebar,
			setSidebarCollapsed,
			zoomLevel,
			zoomIn,
			zoomOut,
			resetZoom,
			isOnline,
			setIsOnline,
			isBackendHealthy,
			latency,
			checkServerHealth,
			isInitializing,
			logout,
			syncQueueCount,
		],
	);

	return (
		<AppContext.Provider value={contextValue}>
			{children}
		</AppContext.Provider>
	);
};

export const useApp = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useApp must be used within an AppProvider");
	}
	return context;
};

// Backward-compatible alias
export const useAppContext = useApp;
export const AppContextProvider = AppProvider;
