import 'dotenv/config';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || crypto.randomBytes(8).toString('hex');
  const password_hash = await bcrypt.hash(adminPassword, 12);

  const existingAdmin = await prisma.users.findUnique({ where: { username: 'admin' } });
  if (existingAdmin) {
    await prisma.users.update({
      where: { username: 'admin' },
      data: { password_hash, role: 'admin', village_id: null },
    });
    console.log(`Updated admin account with password: ${adminPassword}`);
  } else {
    await prisma.users.create({
      data: {
        username: 'admin',
        password_hash,
        role: 'admin',
        village_id: null,
      },
    });
    console.log(`Created admin account with password: ${adminPassword}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
