/**
 * Script tạo tài khoản trưởng thôn cho từng village.
 * Chạy: npx tsx scripts/seed-village-users.ts
 * 
 * Yêu cầu: Đã có ít nhất 1 village trong DB.
 * Script sẽ tạo 1 user cho mỗi village, username = tên thôn (lowercase, no space).
 */
import 'dotenv/config';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const villages = await prisma.villages.findMany({ orderBy: { name: 'asc' } });

  if (villages.length === 0) {
    console.log('Chưa có thôn nào trong DB. Hãy tạo thôn trước.');
    return;
  }

  console.log(`Tìm thấy ${villages.length} thôn. Bắt đầu tạo tài khoản...`);

  const defaultPassword = process.env.INITIAL_VILLAGE_PASSWORD || crypto.randomBytes(8).toString('hex');
  const password_hash = await bcrypt.hash(defaultPassword, 12);

  for (const village of villages) {
    const username = village.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');

    // Check if user already exists
    const existing = await prisma.users.findUnique({ where: { username } });
    if (existing) {
      console.log(`  ⏩ Bỏ qua: ${username} (đã tồn tại)`);
      continue;
    }

    await prisma.users.create({
      data: {
        username,
        password_hash,
        role: 'user',
        village_id: village.id,
      },
    });

    console.log(`  ✅ Tạo: ${username} → thôn "${village.name}" (mật khẩu: ${defaultPassword})`);
  }

  console.log('\nHoàn tất! Hãy yêu cầu trưởng thôn đổi mật khẩu sau khi đăng nhập lần đầu.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
