import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany({
    include: { village: true }
  });
  console.log('=== USERS IN QLCS DATABASE ===');
  for (const u of users) {
    console.log(`User: ${u.username} | Role: ${u.role} | Village: ${u.village?.name || 'None'} | ID: ${u.id}`);
  }
}

main().finally(() => prisma.$disconnect());
