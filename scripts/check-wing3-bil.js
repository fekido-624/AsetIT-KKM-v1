const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.staff.findMany({
    where: { Wing: { in: ['Wing 3', 'Wing 3(test)'] } },
    orderBy: { Bil: 'asc' },
    select: { Bil: true, Nama: true, Wing: true, Emel: true },
  });
  console.log(rows);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
