const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  );
  console.log('Tables:', tables);

  const count = await prisma.staff.count();
  console.log('Staff rows:', count);

  const sample = await prisma.staff.findMany({ take: 5 });
  console.log('Sample rows:', sample);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
