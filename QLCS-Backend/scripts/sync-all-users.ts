import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const villagesList = [
  { id: '0ad6217e-0999-47a0-acc2-e9378372b4b8', name: 'Thôn 1', usernames: ['thon1', 'truongthon-thon1'] },
  { id: '1be7328f-1aa0-58b1-bdd3-fa489483c5c9', name: 'Thôn 2', usernames: ['thon2', 'truongthon-thon2'] },
  { id: '2cf84390-2bb1-69c2-cee4-0b590594d6da', name: 'Thôn 3', usernames: ['thon3', 'truongthon-thon3'] },
  { id: '3da95401-3cc2-7ad3-dff5-1c601605e7eb', name: 'Thôn 4', usernames: ['thon4', 'truongthon-thon4'] },
  { id: '4eb06512-4dd3-8be4-eaa6-2d712716f8fc', name: 'Thôn Kon Trang Long Loi', usernames: ['thonkontranglongloi', 'longloi', 'thonglongloi'] },
  { id: '5fc17623-5ee4-9cf5-fbb7-3e823827a9ad', name: 'Thôn Kon Tu Dô 1', usernames: ['thonkontudo1', 'tudo1', 'thontudo1'] },
  { id: '6ad28734-6ff5-0da6-0cc8-4f934938b0be', name: 'Thôn Kon Tu Dô 2', usernames: ['thonkontudo2', 'tudo2', 'thontudo2'] },
];

async function main() {
  console.log('=== BẮT ĐẦU ĐỒNG BỘ CSDL SSO GATEWAY (QLCS) ===');

  // 1. Seed / Upsert Admin
  const adminPassword = 'admin123456';
  const adminHash = await bcrypt.hash(adminPassword, 12);
  await prisma.users.upsert({
    where: { username: 'admin' },
    update: { password_hash: adminHash, role: 'admin', village_id: null },
    create: { username: 'admin', password_hash: adminHash, role: 'admin', village_id: null },
  });
  console.log(`✅ Admin: admin / ${adminPassword}`);

  // 2. Seed Các Thôn & Tạo tài khoản cho từng thôn
  const defaultPassword = 'qlcs2025';
  const userHash = await bcrypt.hash(defaultPassword, 12);

  for (const v of villagesList) {
    // Upsert Village
    await prisma.villages.upsert({
      where: { id: v.id },
      update: { name: v.name },
      create: { id: v.id, name: v.name },
    });
    console.log(`📍 Thôn: ${v.name} (${v.id})`);

    // Tạo các username tiện lợi cho trưởng thôn
    for (const u of v.usernames) {
      await prisma.users.upsert({
        where: { username: u },
        update: { password_hash: userHash, role: 'user', village_id: v.id },
        create: { username: u, password_hash: userHash, role: 'user', village_id: v.id },
      });
      console.log(`   👤 User: ${u} (Pass: ${defaultPassword})`);
    }
  }

  console.log(`\n🎉 ĐỒNG BỘ HOÀN TẤT! TẤT CẢ ${villagesList.length} THÔN ĐỀU CÓ TÀI KHOẢN ĐĂNG NHẬP.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
