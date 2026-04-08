/**
 * undo-normalize-cawangan.mts
 * Revert perubahan dari normalize script
 */

import { PrismaClient } from '@prisma/client';

const isDryRun = process.argv.includes('--dry-run');
const prisma = new PrismaClient();

const undoMap: Record<string, string> = {
  // Revert Polisi merge - most were (P&P), so revert all to that
  'Polisi & Pembangunan': 'Polisi & Pembangunan (P&P)',

  // Revert Pejabat removals
  'DPSSC':  'Pejabat DPSSC',
  'PDSC':   'Pejabat PDSC',
  'PPI':    'Pejabat PPI',
  'Timbalan Ketua Pengarah Kesihatan (Keselamatan Dan Kualiti Makanan)': 
    'Pejabat Timbalan Ketua Pengarah Kesihatan (Keselamatan Dan Kualiti Makanan)',
};

async function main() {
  console.log(isDryRun ? '\n[DRY RUN] Tiada perubahan akan disimpan.\n' : '\n[LIVE] Perubahan UNDO akan disimpan ke DB.\n');

  let totalUpdated = 0;

  for (const [from, to] of Object.entries(undoMap)) {
    const affected = await prisma.staff.findMany({
      where: { Cawangan: from },
      select: { id: true, Nama: true, Cawangan: true },
    });

    if (affected.length === 0) {
      console.log(`✓ "${from}" — tiada rekod (skip)`);
      continue;
    }

    console.log(`\n  "${from}" → "${to}"  (${affected.length} rekod)`);
    for (const s of affected.slice(0, 5)) {
      console.log(`    - [${s.id}] ${s.Nama}`);
    }
    if (affected.length > 5) {
      console.log(`    ... dan ${affected.length - 5} lagi`);
    }

    if (!isDryRun) {
      const result = await prisma.staff.updateMany({
        where: { Cawangan: from },
        data: { Cawangan: to },
      });
      console.log(`    ✅ Reverted ${result.count} rekod`);
      totalUpdated += result.count;
    }
  }

  if (isDryRun) {
    console.log('\n──────────────────────────────────────────');
    console.log('Dry run selesai. Jalankan semula TANPA --dry-run untuk apply.');
  } else {
    console.log('\n──────────────────────────────────────────');
    console.log(`Selesai UNDO. Jumlah rekod dikemaskini: ${totalUpdated}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
