import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { decryptRecord, encryptRecord } from "../utils/cryptoHelper";

interface QLCSDB extends DBSchema {
	cache: {
		key: string;
		value: {
			key: string;
			data: any;
			updatedAt: number;
		};
	};
	drafts: {
		key: string;
		value: {
			formId: string;
			data: any;
			updatedAt: number;
		};
	};
	syncQueue: {
		key: number;
		value: {
			id?: number;
			action: "CREATE" | "UPDATE" | "DELETE" | "BULK_STATUS";
			entity: "profile" | "htxh_profile" | "village";
			data: any;
			timestamp: number;
			retryCount: number;
		};
		indexes: { "by-timestamp": number };
	};
}

const DB_NAME = "qlcs_client_db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<QLCSDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<QLCSDB>> {
	if (!dbPromise) {
		dbPromise = openDB<QLCSDB>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains("cache")) {
					db.createObjectStore("cache", { keyPath: "key" });
				}
				if (!db.objectStoreNames.contains("drafts")) {
					db.createObjectStore("drafts", { keyPath: "formId" });
				}
				if (!db.objectStoreNames.contains("syncQueue")) {
					const syncStore = db.createObjectStore("syncQueue", {
						keyPath: "id",
						autoIncrement: true,
					});
					syncStore.createIndex("by-timestamp", "timestamp");
				}
			},
		});
	}
	return dbPromise;
}

// ---------------- Cache Operations ----------------
export async function setCache(key: string, data: any): Promise<void> {
	const db = await getDB();
	let encryptedData: any;
	if (Array.isArray(data)) {
		encryptedData = await Promise.all(data.map((item) => encryptRecord(item)));
	} else if (data && Array.isArray(data.data)) {
		encryptedData = {
			...data,
			data: await Promise.all(
				data.data.map((item: any) => encryptRecord(item)),
			),
		};
	} else {
		encryptedData = await encryptRecord(data);
	}

	await db.put("cache", {
		key,
		data: encryptedData,
		updatedAt: Date.now(),
	});
}

export async function getCache<T = any>(key: string): Promise<T | null> {
	const db = await getDB();
	const item = await db.get("cache", key);
	if (!item) return null;

	let decryptedData: any;
	if (Array.isArray(item.data)) {
		decryptedData = await Promise.all(
			item.data.map((r: any) => decryptRecord(r)),
		);
	} else if (item.data && Array.isArray(item.data.data)) {
		decryptedData = {
			...item.data,
			data: await Promise.all(item.data.data.map((r: any) => decryptRecord(r))),
		};
	} else {
		decryptedData = await decryptRecord(item.data);
	}

	return decryptedData as T;
}

export async function removeCache(key: string): Promise<void> {
	const db = await getDB();
	await db.delete("cache", key);
}

export async function clearCache(): Promise<void> {
	const db = await getDB();
	await db.clear("cache");
}

// ---------------- Draft Operations (Auto-save) ----------------
export async function saveDraft(formId: string, data: any): Promise<void> {
	const db = await getDB();
	const encryptedData = await encryptRecord(data);
	await db.put("drafts", {
		formId,
		data: encryptedData,
		updatedAt: Date.now(),
	});
}

export async function getDraft<T = any>(formId: string): Promise<T | null> {
	const db = await getDB();
	const draft = await db.get("drafts", formId);
	if (!draft) return null;
	return (await decryptRecord(draft.data)) as T;
}

export async function clearDraft(formId: string): Promise<void> {
	const db = await getDB();
	await db.delete("drafts", formId);
}

// ---------------- Sync Queue Operations (Offline-first) ----------------
export async function enqueueSync(
	action: "CREATE" | "UPDATE" | "DELETE" | "BULK_STATUS",
	entity: "profile" | "htxh_profile" | "village",
	data: any,
): Promise<number> {
	const db = await getDB();
	const encryptedData = await encryptRecord(data);
	const id = await db.add("syncQueue", {
		action,
		entity,
		data: encryptedData,
		timestamp: Date.now(),
		retryCount: 0,
	});
	window.dispatchEvent(new Event("sync:queued"));
	return id as number;
}

export async function getSyncQueue(): Promise<any[]> {
	const db = await getDB();
	const items = await db.getAll("syncQueue");
	return Promise.all(
		items.map(async (item) => ({
			...item,
			data: await decryptRecord(item.data),
		})),
	);
}

export async function removeSyncQueueItem(id: number): Promise<void> {
	const db = await getDB();
	await db.delete("syncQueue", id);
	window.dispatchEvent(new Event("sync:updated"));
}

export async function getSyncQueueCount(): Promise<number> {
	const db = await getDB();
	return db.count("syncQueue");
}
