import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, dialog, ipcMain, Menu, safeStorage, type IpcMainInvokeEvent } from "electron";
import Store from "electron-store";
import { autoUpdater } from "electron-updater";

const secureStore = new Store({
	name: "qlcs-secure-tokens",
	clearInvalidConfig: true,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
	? path.join(process.env.APP_ROOT, "public")
	: RENDERER_DIST;

let win: BrowserWindow | null = null;

function validateSender(event: IpcMainInvokeEvent): boolean {
	if (!win || win.isDestroyed()) return false;
	return event.senderFrame === win.webContents.mainFrame;
}

function createWindow() {
	win = new BrowserWindow({
		width: 1366,
		height: 850,
		minWidth: 1024,
		minHeight: 650,
		useContentSize: true,
		autoHideMenuBar: true,
		title: "Hệ Thống Quản Lý Chính Sách - Xã Đăk Hà",
		icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
		webPreferences: {
			preload: path.join(__dirname, "preload.mjs"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	win.removeMenu();
	win.setMenu(null);
	win.setMenuBarVisibility(false);

	// Protect navigation & new window creation
	win.webContents.setWindowOpenHandler(() => {
		return { action: "deny" };
	});

	win.webContents.on("will-navigate", (event, url) => {
		if (!url.startsWith("http://localhost") && !url.startsWith("file://")) {
			event.preventDefault();
		}
	});

	win.webContents.on("before-input-event", (event, input) => {
		if (input.type === "keyDown") {
			// F12 hoặc Ctrl+Shift+I để bật/tắt DevTools (chỉ trong dev hoặc unpacked)
			if (
				(!app.isPackaged || VITE_DEV_SERVER_URL) &&
				(input.key === "F12" ||
					(input.control && input.shift && input.key.toLowerCase() === "i"))
			) {
				win?.webContents.toggleDevTools();
				event.preventDefault();
			}
			// F5 hoặc Ctrl+R để tải lại trang
			if (
				input.key === "F5" ||
				(input.control && !input.shift && input.key.toLowerCase() === "r")
			) {
				win?.webContents.reload();
				event.preventDefault();
			}
		}
	});

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
	} else {
		win.loadFile(path.join(RENDERER_DIST, "index.html"));
	}

	win.webContents.on("console-message", (_e, level, msg) => {
		console.log(`[Renderer ${level}] ${msg}`);
	});

	// Content-Security-Policy for production
	if (!VITE_DEV_SERVER_URL) {
		win.webContents.session.webRequest.onHeadersReceived(
			(details, callback) => {
				callback({
					responseHeaders: {
						...details.responseHeaders,
						"Content-Security-Policy": [
							"default-src 'self'; connect-src 'self' http://localhost:5000 https://qlcs.dulieudakha.vn https://worldtimeapi.org https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data:; script-src 'self';",
						],
					},
				});
			},
		);
	}
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	app.on("second-instance", () => {
		if (win) {
			if (win.isMinimized()) win.restore();
			win.focus();
		}
	});

	app.whenReady().then(() => {
		Menu.setApplicationMenu(null);
		createWindow();
		setupAutoUpdater();
	});
}

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
		win = null;
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// IPC: Secure Token Store (OS Native safeStorage / DPAPI with electron-store fallback)
ipcMain.handle("secure-store:get", (event, key: string) => {
	if (!validateSender(event)) throw new Error("Unauthorized IPC sender");
	try {
		const rawValue = secureStore.get(key, null);
		if (rawValue === null || rawValue === undefined) {
			return null;
		}
		if (safeStorage.isEncryptionAvailable()) {
			if (typeof rawValue === "string") {
				try {
					return safeStorage.decryptString(Buffer.from(rawValue, "base64"));
				} catch (decryptErr) {
					console.warn(`[secure-store:get] Decryption fallback for key "${key}":`, decryptErr);
					return rawValue;
				}
			}
		}
		return rawValue;
	} catch (err) {
		console.error("secure-store:get error:", err);
		return null;
	}
});

ipcMain.handle(
	"secure-store:set",
	(event, { key, value }: { key: string; value: unknown }) => {
		if (!validateSender(event)) throw new Error("Unauthorized IPC sender");
		try {
			if (safeStorage.isEncryptionAvailable()) {
				const valStr = typeof value === "string" ? value : JSON.stringify(value ?? "");
				const encrypted = safeStorage.encryptString(valStr).toString("base64");
				secureStore.set(key, encrypted);
			} else {
				secureStore.set(key, value);
			}
			return true;
		} catch (err) {
			console.error("secure-store:set error:", err);
			return false;
		}
	},
);

ipcMain.handle("secure-store:delete", (event, key: string) => {
	if (!validateSender(event)) throw new Error("Unauthorized IPC sender");
	try {
		secureStore.delete(key as never);
		return true;
	} catch (err) {
		console.error("secure-store:delete error:", err);
		return false;
	}
});

ipcMain.handle("secure-store:clear", (event) => {
	if (!validateSender(event)) throw new Error("Unauthorized IPC sender");
	try {
		secureStore.clear();
		return true;
	} catch (err) {
		console.error("secure-store:clear error:", err);
		return false;
	}
});

// IPC: File Dialog
ipcMain.handle(
	"dialog:open-file",
	async (event, filters?: { name: string; extensions: string[] }[]) => {
		if (!validateSender(event)) throw new Error("Unauthorized IPC sender");
		if (!win) return null;
		const defaultFilters =
			filters && filters.length > 0
				? filters
				: [
						{ name: "File Excel (*.xlsx, *.xls)", extensions: ["xlsx", "xls"] },
						{ name: "Tất cả các file", extensions: ["*"] },
					];
		const result = await dialog.showOpenDialog(win, {
			properties: ["openFile"],
			filters: defaultFilters,
		});
		if (result.canceled || result.filePaths.length === 0) {
			return null;
		}
		const filePath = result.filePaths[0];
		try {
			const fileBuffer = fs.readFileSync(filePath);
			return {
				filePath,
				fileName: path.basename(filePath),
				data: fileBuffer.toString("base64"),
			};
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			return {
				filePath,
				fileName: path.basename(filePath),
				error: errorMsg,
			};
		}
	},
);

// IPC: Zoom & App Version
ipcMain.handle("get-app-version", (event) => {
	if (!validateSender(event)) throw new Error("Unauthorized IPC sender");
	try {
		const pkg = JSON.parse(
			fs.readFileSync(path.join(process.env.APP_ROOT, "package.json"), "utf-8"),
		);
		return {
			success: true,
			data: { version: pkg.version, name: pkg.productName || pkg.name },
		};
	} catch {
		return {
			success: true,
			data: { version: app.getVersion(), name: app.getName() },
		};
	}
});

ipcMain.handle("app:version", (event) => {
	if (!validateSender(event)) throw new Error("Unauthorized IPC sender");
	return app.getVersion();
});

ipcMain.handle("app:set-zoom", (event, level: number) => {
	if (!validateSender(event)) throw new Error("Unauthorized IPC sender");
	const zoomFactor = level > 2.0 ? level / 100 : level;
	if (typeof level !== "number" || Number.isNaN(level) || zoomFactor < 0.5 || zoomFactor > 2.0) {
		throw new Error("Invalid zoom level: zoom factor must be between 0.5 and 2.0");
	}
	if (win?.webContents) {
		win.webContents.setZoomFactor(zoomFactor);
	}
});

ipcMain.handle("get-zoom-level", (event) => {
	if (!validateSender(event)) throw new Error("Unauthorized IPC sender");
	if (win?.webContents) {
		return win.webContents.getZoomFactor() * 100;
	}
	return 100;
});

// Setup Auto Updater
function setupAutoUpdater() {
	const logFilePath = path.join(app.getPath("userData"), "updater.log");
	const logUpdater = (msg: string) => {
		try {
			fs.appendFileSync(
				logFilePath,
				`[${new Date().toLocaleString("vi-VN")}] ${msg}\n`,
			);
		} catch (e) {
			console.error("Failed to write to updater log:", e);
		}
	};

	autoUpdater.autoDownload = true;
	autoUpdater.autoInstallOnAppQuit = true;

	autoUpdater.on("checking-for-update", () => {
		logUpdater("Bắt đầu kiểm tra cập nhật...");
		win?.webContents.send("updater-event", { type: "checking" });
	});
	autoUpdater.on("update-available", (info) => {
		logUpdater(`Có bản cập nhật mới: ${JSON.stringify(info)}`);
		win?.webContents.send("updater-event", { type: "update-available", info });
	});
	autoUpdater.on("update-not-available", (info) => {
		logUpdater(`Không có bản cập nhật mới: ${JSON.stringify(info)}`);
		win?.webContents.send("updater-event", {
			type: "update-not-available",
			info,
		});
	});
	autoUpdater.on("error", (err) => {
		logUpdater(`Lỗi Auto Updater: ${err.message}`);
		win?.webContents.send("updater-event", {
			type: "error",
			error: err.message,
		});
	});
	autoUpdater.on("download-progress", (progressObj) => {
		win?.webContents.send("updater-event", {
			type: "download-progress",
			progress: progressObj,
		});
	});
	autoUpdater.on("update-downloaded", (info) => {
		logUpdater(`Đã tải xong bản cập nhật: ${JSON.stringify(info)}`);
		win?.webContents.send("updater-event", { type: "update-downloaded", info });
	});

	setTimeout(() => {
		if (app.isPackaged) {
			logUpdater("Tự động kiểm tra cập nhật khi khởi động...");
			autoUpdater.checkForUpdatesAndNotify().catch((err) => {
				logUpdater(`Tự động kiểm tra cập nhật thất bại: ${err.message}`);
			});
		}
	}, 5000);

	ipcMain.handle("install-update", (event) => {
		if (!validateSender(event)) throw new Error("Unauthorized IPC sender");
		logUpdater("Người dùng kích hoạt cài đặt bản cập nhật...");
		autoUpdater.quitAndInstall(false, true);
	});

	ipcMain.handle("check-for-updates", async (event) => {
		if (!validateSender(event)) throw new Error("Unauthorized IPC sender");
		logUpdater("Kiểm tra cập nhật thủ công...");
		if (!app.isPackaged) {
			return { success: false, error: "Chỉ hoạt động ở bản packaged." };
		}
		try {
			const result = await autoUpdater.checkForUpdates();
			return { success: true, data: result };
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			return { success: false, error: errorMsg };
		}
	});
}
