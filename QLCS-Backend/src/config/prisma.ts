import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// ============================================================
// CCCD Encryption: AES-256-GCM
// KHÔNG CÓ fallback key - throw Error nếu thiếu biến môi trường
// ============================================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
	throw new Error(
		"FATAL: ENCRYPTION_KEY is not set in environment variables. Server cannot start without it.",
	);
}

const KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, "hex");

function encrypt(text: string): string {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-256-gcm", KEY_BUFFER, iv);
	const encrypted = Buffer.concat([
		cipher.update(text, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();
	// Format: iv:authTag:encrypted (all hex)
	return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(encryptedText: string): string {
	try {
		const parts = encryptedText.split(":");
		if (parts.length !== 3) return encryptedText; // Not encrypted, return as-is
		const [ivHex, authTagHex, dataHex] = parts;
		const iv = Buffer.from(ivHex, "hex");
		const authTag = Buffer.from(authTagHex, "hex");
		const encrypted = Buffer.from(dataHex, "hex");
		const decipher = crypto.createDecipheriv("aes-256-gcm", KEY_BUFFER, iv);
		decipher.setAuthTag(authTag);
		const decrypted = Buffer.concat([
			decipher.update(encrypted),
			decipher.final(),
		]);
		return decrypted.toString("utf8");
	} catch {
		return encryptedText; // If decryption fails, return original
	}
}

function hashCccd(cccd: string): string {
	const pepper =
		process.env.CCCD_HASH_PEPPER || process.env.ENCRYPTION_KEY || "";
	return crypto
		.createHmac("sha256", pepper)
		.update(cccd.trim())
		.digest("hex");
}

// ============================================================
// Prisma Client Extension: Auto encrypt/decrypt CCCD
// ============================================================

function processInputData(data: any): any {
	if (!data || typeof data !== "object") return data;

	if (data.cccd && typeof data.cccd === "string" && data.cccd.trim() !== "") {
		const plainCccd = data.cccd.trim();
		data.cccd_hash = hashCccd(plainCccd);
		data.cccd_last4 = plainCccd.slice(-4);
		data.cccd = encrypt(plainCccd);
	} else if (
		data.cccd === null ||
		(typeof data.cccd === "string" && data.cccd.trim() === "")
	) {
		data.cccd = null;
		data.cccd_hash = null;
		data.cccd_last4 = null;
	}

	return data;
}

function processOutputData(data: any): any {
	if (!data || typeof data !== "object") return data;

	if (data.cccd && typeof data.cccd === "string" && data.cccd.includes(":")) {
		data.cccd = decrypt(data.cccd);
	}

	return data;
}

function processWhereClause(where: any): any {
	if (!where || typeof where !== "object") return where;

	// Remap where.cccd to where.cccd_hash for exact match search
	if (where.cccd && typeof where.cccd === "string") {
		where.cccd_hash = hashCccd(where.cccd.trim());
		delete where.cccd;
	}

	return where;
}

const basePrisma = new PrismaClient();

export const prisma = basePrisma.$extends({
	query: {
		$allOperations({ model, operation, args, query }) {
			const encryptedModels = ["profiles", "htxh_profiles"];

			if (!model || !encryptedModels.includes(model)) {
				return query(args);
			}

			// Encrypt on create/update
			if (operation === "create" && args.data) {
				args.data = processInputData(args.data);
			}
			if ((operation === "update" || operation === "updateMany") && args.data) {
				args.data = processInputData(args.data);
			}
			if (operation === "upsert") {
				if (args.create) args.create = processInputData(args.create);
				if (args.update) args.update = processInputData(args.update);
			}
			if (operation === "createMany" && args.data && Array.isArray(args.data)) {
				args.data = args.data.map((d: any) => processInputData(d));
			}

			// Remap where.cccd -> where.cccd_hash for find operations
			if (args.where) {
				args.where = processWhereClause(args.where);
			}

			return query(args).then((result: any) => {
				if (Array.isArray(result)) {
					return result.map((r: any) => processOutputData(r));
				}
				return processOutputData(result);
			});
		},
	},
});

export { decrypt, encrypt, hashCccd };
