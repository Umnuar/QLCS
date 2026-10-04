import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	loadRedoStack,
	loadStack,
	MAX_UNDO,
	saveRedoStack,
	saveStack,
	STORAGE_PREFIX,
	type UndoEntry,
} from "../hooks/useUndo";

function createLocalStorageMock() {
	const store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] ?? null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			for (const key of Object.keys(store)) delete store[key];
		}),
		_store: store,
	};
}

let localStorageMock: ReturnType<typeof createLocalStorageMock>;

describe("useUndo persistence engine", () => {
	beforeEach(() => {
		localStorageMock = createLocalStorageMock();
		Object.defineProperty(globalThis, "localStorage", {
			value: localStorageMock,
			writable: true,
			configurable: true,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("loadStack", () => {
		it("should return empty array when localStorage is empty", () => {
			const stack = loadStack("chuctho");
			expect(stack).toEqual([]);
			expect(localStorageMock.getItem).toHaveBeenCalledWith(
				`${STORAGE_PREFIX}chuctho`,
			);
		});

		it("should return parsed entries when valid JSON exists", () => {
			const entries: UndoEntry[] = [
				{
					action: "create",
					timestamp: 123456789,
					undoData: { id: "1", name: "Nguyễn Văn A" },
					redoData: null,
				},
			];
			localStorageMock.setItem(`${STORAGE_PREFIX}chuctho`, JSON.stringify(entries));

			const result = loadStack("chuctho");
			expect(result).toHaveLength(1);
			expect(result[0].action).toBe("create");
			expect(result[0].undoData.name).toBe("Nguyễn Văn A");
		});

		it("should handle corrupted JSON gracefully without crashing", () => {
			localStorageMock.setItem(`${STORAGE_PREFIX}chuctho`, "{invalid-json");

			const result = loadStack("chuctho");
			expect(result).toEqual([]);
		});
	});

	describe("saveStack", () => {
		it("should serialize and store entries in localStorage", () => {
			const entries: UndoEntry[] = [
				{
					action: "update",
					timestamp: Date.now(),
					undoData: { id: "2", status: "old" },
					redoData: { id: "2", status: "new" },
				},
			];

			saveStack("htxh", entries);

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				`${STORAGE_PREFIX}htxh`,
				JSON.stringify(entries),
			);
		});

		it("should cap entries at MAX_UNDO (50)", () => {
			const manyEntries: UndoEntry[] = Array.from({ length: 65 }, (_, i) => ({
				action: `action_${i}`,
				timestamp: Date.now() + i,
				undoData: { index: i },
				redoData: null,
			}));

			saveStack("chuctho", manyEntries);

			const savedJson = localStorageMock._store[`${STORAGE_PREFIX}chuctho`];
			expect(savedJson).toBeDefined();
			const parsed = JSON.parse(savedJson);
			expect(parsed).toHaveLength(MAX_UNDO);
			// Should keep the most recent 50 entries (index 15 to 64)
			expect(parsed[0].undoData.index).toBe(15);
			expect(parsed[49].undoData.index).toBe(64);
		});
	});

	describe("loadRedoStack and saveRedoStack", () => {
		it("should save and load redo stack separately from undo stack", () => {
			const redoEntries: UndoEntry[] = [
				{
					action: "redo_action",
					timestamp: Date.now(),
					undoData: null,
					redoData: { id: "99" },
				},
			];

			saveRedoStack("chuctho", redoEntries);

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				`${STORAGE_PREFIX}redo_chuctho`,
				JSON.stringify(redoEntries),
			);

			const loaded = loadRedoStack("chuctho");
			expect(loaded).toHaveLength(1);
			expect(loaded[0].action).toBe("redo_action");
		});

		it("should return empty array for corrupted redo stack", () => {
			localStorageMock.setItem(`${STORAGE_PREFIX}redo_htxh`, "not-json");
			const loaded = loadRedoStack("htxh");
			expect(loaded).toEqual([]);
		});
	});
});
