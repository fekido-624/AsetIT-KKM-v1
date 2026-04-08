import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const r = await prisma.staff.findMany({ select: { Cawangan: true }, distinct: ['Cawangan'], orderBy: { Cawangan: 'asc' } });
console.log('Jumlah unik:', r.length);
r.forEach((x, i) => console.log(i + 1 + '.', x.Cawangan));
await prisma.$disconnect();
