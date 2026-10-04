import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const villages = await prisma.villages.findMany({
    orderBy: { name: 'asc' }
  });
  console.log('=== VILLAGES IN QLCS DATABASE ===');
  for (const v of villages) {
    console.log(`Village: ${v.name} | ID: ${v.id}`);
  }
}

main().finally(() => prisma.$disconnect());
