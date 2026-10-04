import { secureStorage } from "./secureStorage";

/**
 * Web Crypto API AES-GCM encryption helper for client-side offline storage (IndexedDB)
 */

const MASTER_KEY_STORAGE_KEY = "qlcs_client_master_key";

// Derive or get Master CryptoKey
async function getMasterKey(): Promise<CryptoKey> {
	let rawKeyHex = await secureStorage.getItem(MASTER_KEY_STORAGE_KEY);
	if (!rawKeyHex) {
		// Generate 256-bit random key
		const rawKey = window.crypto.getRandomValues(new Uint8Array(32));
		rawKeyHex = Array.from(rawKey)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
		await secureStorage.setItem(MASTER_KEY_STORAGE_KEY, rawKeyHex);
	}

	const rawKeyBytes = new Uint8Array(
		rawKeyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
	);

	return window.crypto.subtle.importKey(
		"raw",
		rawKeyBytes,
		{ name: "AES-GCM" },
		false,
		["encrypt", "decrypt"],
	);
}

export async function encryptField(plaintext: string): Promise<string> {
	if (!plaintext || typeof plaintext !== "string") return plaintext;
	try {
		const key = await getMasterKey();
		const iv = window.crypto.getRandomValues(new Uint8Array(12));
		const encoded = new TextEncoder().encode(plaintext);

		const ciphertext = await window.crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			key,
			encoded,
		);

		const ivHex = Array.from(iv)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
		const cipherHex = Array.from(new Uint8Array(ciphertext))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

		return `enc:${ivHex}:${cipherHex}`;
	} catch (error) {
		console.error("Error encrypting field:", error);
		return plaintext;
	}
}

export async function decryptField(encryptedText: string): Promise<string> {
	if (
		!encryptedText ||
		typeof encryptedText !== "string" ||
		!encryptedText.startsWith("enc:")
	) {
		return encryptedText;
	}
	try {
		const parts = encryptedText.split(":");
		if (parts.length !== 3) return encryptedText;

		const [, ivHex, cipherHex] = parts;
		const iv = new Uint8Array(
			ivHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)),
		);
		const ciphertext = new Uint8Array(
			cipherHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)),
		);

		const key = await getMasterKey();
		const decrypted = await window.crypto.subtle.decrypt(
			{ name: "AES-GCM", iv },
			key,
			ciphertext,
		);

		return new TextDecoder().decode(decrypted);
	} catch (error) {
		console.error("Error decrypting field:", error);
		return encryptedText;
	}
}

// Helper to encrypt/decrypt sensitive fields of a record
const SENSITIVE_FIELDS = [
	"cccd",
	"dob",
	"phone_number",
	"current_address",
	"residence",
];

export async function encryptRecord<T extends Record<string, any>>(
	record: T,
): Promise<T> {
	if (!record || typeof record !== "object") return record;
	const result: any = { ...record };
	for (const field of SENSITIVE_FIELDS) {
		if (result[field] && typeof result[field] === "string") {
			result[field] = await encryptField(result[field]);
		}
	}
	return result;
}

export async function decryptRecord<T extends Record<string, any>>(
	record: T,
): Promise<T> {
	if (!record || typeof record !== "object") return record;
	const result: any = { ...record };
	for (const field of SENSITIVE_FIELDS) {
		if (result[field] && typeof result[field] === "string") {
			result[field] = await decryptField(result[field]);
		}
	}
	return result;
}
