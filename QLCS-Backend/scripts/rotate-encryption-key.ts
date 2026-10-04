import "dotenv/config";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function decryptWithKey(encryptedText: string, keyHex: string): string {
	try {
		const parts = encryptedText.split(":");
		if (parts.length !== 3) return encryptedText;
		const [ivHex, authTagHex, dataHex] = parts;
		const key = Buffer.from(keyHex, "hex");
		const iv = Buffer.from(ivHex, "hex");
		const authTag = Buffer.from(authTagHex, "hex");
		const encrypted = Buffer.from(dataHex, "hex");

		const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
		decipher.setAuthTag(authTag);
		const decrypted = Buffer.concat([
			decipher.update(encrypted),
			decipher.final(),
		]);
		return decrypted.toString("utf8");
	} catch (error) {
		throw new Error(`Giải mã thất bại bằng khóa cũ: ${(error as any)?.message}`);
	}
}

function encryptWithKey(text: string, keyHex: string): string {
	const key = Buffer.from(keyHex, "hex");
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([
		cipher.update(text, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();
	return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

async function runKeyRotation() {
	console.log("=========================================================");
	console.log("  QLCS - CÔNG CỤ XOAY KHÓA MÃ HÓA CCCD (SEC-01-01)       ");
	console.log("=========================================================\n");

	const isDryRun = process.argv.includes("--dry-run");
	const oldKey =
		process.env.OLD_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
	let newKey = process.env.NEW_ENCRYPTION_KEY;

	if (!oldKey || oldKey.length !== 64) {
		console.error(
			"❌ LỖI: Khóa cũ không hợp lệ hoặc thiếu trong .env (phải đủ 64 ký tự hex = 32 bytes).",
		);
		process.exit(1);
	}

	if (!newKey) {
		newKey = crypto.randomBytes(32).toString("hex");
		console.log("🔑 Đã sinh khóa mới ngẫu nhiên đạt chuẩn an toàn cryptographic:");
		console.log(`   NEW_KEY: ${newKey}\n`);
	} else if (newKey.length !== 64) {
		console.error("❌ LỖI: NEW_ENCRYPTION_KEY phải đủ 64 ký tự hex (32 bytes).");
		process.exit(1);
	}

	if (oldKey === newKey) {
		console.warn("⚠️ CẢNH BÁO: Khóa mới trùng với khóa cũ! Không cần xoay.");
		process.exit(0);
	}

	console.log(`Chế độ: ${isDryRun ? "🧪 THỬ NGHIỆM (DRY-RUN - KHÔNG GHI CSDL)" : "⚡ THỰC THI THẬT (GHI CSDL)"}`);
	console.log(`Khóa cũ: ${oldKey.slice(0, 8)}...${oldKey.slice(-8)}`);
	console.log(`Khóa mới: ${newKey.slice(0, 8)}...${newKey.slice(-8)}\n`);

	try {
		// 1. Quét bảng profiles (Chúc thọ)
		const chucthoProfiles = await prisma.profiles.findMany({
			where: { cccd: { not: null } },
			select: { id: true, cccd: true, name: true },
		});
		console.log(`📁 Tìm thấy ${chucthoProfiles.length} hồ sơ Chúc thọ cần xoay khóa...`);

		let rotatedChuctho = 0;
		for (const p of chucthoProfiles) {
			if (!p.cccd || !p.cccd.includes(":")) continue;
			const plainCccd = decryptWithKey(p.cccd, oldKey);
			const newEncryptedCccd = encryptWithKey(plainCccd, newKey);

			if (!isDryRun) {
				await prisma.profiles.update({
					where: { id: p.id },
					data: { cccd: newEncryptedCccd },
				});
			}
			rotatedChuctho++;
		}
		console.log(`✅ Đã xoay thành công ${rotatedChuctho} hồ sơ Chúc thọ.\n`);

		// 2. Quét bảng htxh_profiles (Hưu trí xã hội)
		const htxhProfiles = await prisma.htxh_profiles.findMany({
			where: { cccd: { not: null } },
			select: { id: true, cccd: true, name: true },
		});
		console.log(`📁 Tìm thấy ${htxhProfiles.length} hồ sơ Hưu trí xã hội cần xoay khóa...`);

		let rotatedHtxh = 0;
		for (const p of htxhProfiles) {
			if (!p.cccd || !p.cccd.includes(":")) continue;
			const plainCccd = decryptWithKey(p.cccd, oldKey);
			const newEncryptedCccd = encryptWithKey(plainCccd, newKey);

			if (!isDryRun) {
				await prisma.htxh_profiles.update({
					where: { id: p.id },
					data: { cccd: newEncryptedCccd },
				});
			}
			rotatedHtxh++;
		}
		console.log(`✅ Đã xoay thành công ${rotatedHtxh} hồ sơ Hưu trí xã hội.\n`);

		console.log("=========================================================");
		console.log("  KẾT QUẢ XOAY KHÓA HOÀN TẤT                             ");
		console.log("=========================================================");
		console.log(`Tổng số hồ sơ đã xoay: ${rotatedChuctho + rotatedHtxh}`);
		if (!isDryRun) {
			console.log("\n⚠️ HÀNH ĐỘNG TIẾP THEO BẮT BUỘC:");
			console.log("1. Mở file `QLCS-Backend/.env` và cập nhật:");
			console.log(`   ENCRYPTION_KEY="${newKey}"`);
			console.log("2. Khởi động lại máy chủ backend.");
			console.log("3. Khóa cũ trong Git history đã chính thức trở thành khóa phế!\n");
		}
	} catch (error) {
		console.error("❌ LỖI TRONG QUÁ TRÌNH XOAY KHÓA:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

runKeyRotation();
