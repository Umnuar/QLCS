/**
 * Script kiểm tra trạng thái Database & Mã hóa CCCD
 * Chạy: npx tsx scripts/audit-db.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  console.error('❌ LỖI: Chưa cấu hình biến ENCRYPTION_KEY trong .env');
  process.exit(1);
}

const KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, 'hex');

function decryptRaw(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return `[Không đúng format iv:tag:data - raw: ${encryptedText}]`;
    const [ivHex, authTagHex, dataHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(dataHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY_BUFFER, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err: any) {
    return `[LỖI GIẢI MÃ: ${err.message}]`;
  }
}

const prisma = new PrismaClient();

async function main() {
  console.log('====================================================');
  console.log('🔍 BẮT ĐẦU KIỂM TOÁN DATABASE (AUDIT-DB)');
  console.log('====================================================\n');

  try {
    // 1. Đếm số bản ghi profiles
    const profilesCount = await prisma.profiles.count();
    const profilesDeletedCount = await prisma.profiles.count({ where: { is_deleted: true } });
    const profilesActiveCount = profilesCount - profilesDeletedCount;

    // 2. Đếm số bản ghi htxh_profiles
    const htxhCount = await prisma.htxh_profiles.count();
    const htxhDeletedCount = await prisma.htxh_profiles.count({ where: { is_deleted: true } });
    const htxhActiveCount = htxhCount - htxhDeletedCount;

    console.log('📊 THỐNG KÊ BẢN GHI:');
    console.log(`- Profiles (Chúc thọ): ${profilesCount} (Hoạt động: ${profilesActiveCount}, Đã xóa: ${profilesDeletedCount})`);
    console.log(`- HTXH Profiles: ${htxhCount} (Hoạt động: ${htxhActiveCount}, Đã xóa: ${htxhDeletedCount})`);

    // 3. Đếm số record cccd_hash null / rỗng
    const profilesMissingHash = await prisma.profiles.count({
      where: {
        AND: [
          { cccd: { not: null } },
          { cccd: { not: '' } },
          { OR: [{ cccd_hash: null }, { cccd_hash: '' }] },
        ],
      },
    });

    const htxhMissingHash = await prisma.htxh_profiles.count({
      where: {
        AND: [
          { cccd: { not: null } },
          { cccd: { not: '' } },
          { OR: [{ cccd_hash: null }, { cccd_hash: '' }] },
        ],
      },
    });

    console.log('\n🔒 KIỂM TRA HASH CCCD:');
    console.log(`- Profiles có CCCD nhưng thiếu cccd_hash: ${profilesMissingHash}`);
    console.log(`- HTXH có CCCD nhưng thiếu cccd_hash: ${htxhMissingHash}`);

    // 4. Lấy mẫu 3 profiles để test giải mã CCCD
    console.log('\n🔑 THỬ NGHIỆM GIẢI MÃ 3 HỒ SƠ MẪU (CCCD):');
    const samples = await prisma.profiles.findMany({
      where: {
        cccd: { not: null },
        cccd_hash: { not: null },
      },
      take: 3,
      select: {
        id: true,
        name: true,
        cccd: true,
        cccd_hash: true,
        cccd_last4: true,
      },
    });

    if (samples.length === 0) {
      console.log('  ⚠️ Không tìm thấy hồ sơ có CCCD để giải mã.');
    } else {
      samples.forEach((sample, idx) => {
        const decrypted = sample.cccd ? decryptRaw(sample.cccd) : 'N/A';
        const is12Digits = /^\d{12}$/.test(decrypted);
        const matchesLast4 = decrypted.endsWith(sample.cccd_last4 || '');
        console.log(`  [Mẫu ${idx + 1}] ID: ${sample.id} | Tên: ${sample.name}`);
        console.log(`    - CCCD Đã mã hóa: ${sample.cccd?.substring(0, 30)}...`);
        console.log(`    - Giải mã: ${decrypted}`);
        console.log(`    - Đúng định dạng 12 số: ${is12Digits ? '✅ ĐÚNG' : '❌ KHÔNG ĐÚNG'}`);
        console.log(`    - Khớp cccd_last4 (${sample.cccd_last4}): ${matchesLast4 ? '✅ KHỚP' : '❌ KHÔNG KHỚP'}`);
      });
    }

    // 5. Kiểm tra dữ liệu rác / test
    console.log('\n🧹 KIỂM TRA DỮ LIỆU TEST / RÁC:');
    const testProfiles = await prisma.profiles.findMany({
      where: {
        OR: [
          { name: { contains: 'test', mode: 'insensitive' } },
          { name: { contains: 'thử', mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, village_id: true },
    });

    const testVillages = await prisma.villages.findMany({
      where: {
        OR: [
          { name: { contains: 'test', mode: 'insensitive' } },
          { name: { contains: 'thử', mode: 'insensitive' } },
        ],
      },
    });

    console.log(`- Profiles nghi ngờ dữ liệu test: ${testProfiles.length}`);
    if (testProfiles.length > 0) {
      testProfiles.forEach(p => console.log(`    * [Profile] ${p.name} (ID: ${p.id})`));
    }
    console.log(`- Thôn/Xóm nghi ngờ dữ liệu test: ${testVillages.length}`);
    if (testVillages.length > 0) {
      testVillages.forEach(v => console.log(`    * [Village] ${v.name} (ID: ${v.id})`));
    }

    console.log('\n====================================================');
    console.log('✅ HOÀN TẤT KIỂM TOÁN DATABASE!');
    console.log('====================================================');
  } catch (error: any) {
    console.error('❌ Lỗi khi thực thi audit-db:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
