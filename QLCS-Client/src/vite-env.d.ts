/// <reference types="vite/client" />

interface ElectronAPI {
	store: {
		get: (key: string) => Promise<any>;
		set: (key: string, value: any) => Promise<boolean>;
		delete: (key: string) => Promise<boolean>;
		clear: () => Promise<boolean>;
	};
	dialog: {
		openFile: (
			filters?: { name: string; extensions: string[] }[],
		) => Promise<any>;
	};
	app: {
		getVersion: () => Promise<any>;
		setZoom: (level: number) => Promise<void>;
		getZoomLevel?: () => Promise<number>;
	};
	updater: {
		install: () => Promise<any>;
		checkForUpdates: () => Promise<any>;
	};
	on: (channel: string, callback: (...args: any[]) => void) => () => void;
	// Optional legacy fallbacks
	settings?: {
		getTimeConfig?: () => { offset: number; syncType: string };
	};
}

interface Window {
	api: ElectronAPI;
	electronAPI: ElectronAPI;
}
