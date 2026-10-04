/**
 * Script xóa dữ liệu test cũ không hợp lệ
 * Chạy: npx tsx scripts/clean-test-data.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // SEC-03-01: Chốt chặn bảo vệ CSDL sản xuất
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force-clean')) {
    console.error('❌ TỪ CHỐI: Không thể chạy script xóa dữ liệu trong môi trường PRODUCTION khi thiếu cờ --force-clean.');
    process.exit(1);
  }

  const targetIds = [
    '4efbff5f-920e-46e7-bd0a-29a306ec70b4',
    'b67b2004-d05d-40e7-ad6c-4a5bbc765799',
  ];

  console.log(`Đang xóa ${targetIds.length} bản ghi test cũ...`);

  // Xóa audit log liên quan
  const deletedLogs = await prisma.profile_audit_log.deleteMany({
    where: { profile_id: { in: targetIds } },
  });
  console.log(`- Đã xóa ${deletedLogs.count} bản ghi profile_audit_log`);

  // Xóa profiles
  const deletedProfiles = await prisma.profiles.deleteMany({
    where: { id: { in: targetIds } },
  });
  console.log(`- Đã xóa ${deletedProfiles.count} bản ghi profiles`);

  console.log('✅ Hoàn tất xóa dữ liệu rác!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
