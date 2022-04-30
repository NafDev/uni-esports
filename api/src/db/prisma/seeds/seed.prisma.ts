import { PrismaClient } from '@prisma/client';
import * as universitySeed from './university.seed';
import * as roleSeed from './roles.seed';

const prisma = new PrismaClient();

async function main() {
  await universitySeed.run(prisma);
  await roleSeed.run(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
