/**
 * normalize-cawangan.mts
 * 
 * Normalizes duplicate Cawangan values in the DB.
 * Run with --dry-run first to preview changes, then without flag to apply.
 * 
 * Usage:
 *   npx tsx scripts/normalize-cawangan.mts --dry-run
 *   npx tsx scripts/normalize-cawangan.mts
 */

import { PrismaClient } from '@prisma/client';

const isDryRun = process.argv.includes('--dry-run');
const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL MERGE MAP
// Format: "raw value in DB" → "canonical value to replace with"
// Only add entries you are SURE should be merged.
// ─────────────────────────────────────────────────────────────────────────────
const mergeMap: Record<string, string> = {
  // Pure case duplicates
  'EKSPORT':            'Eksport',
  'IMPORT':             'Import',
  'MAKMAL':             'Makmal',
  'STANDARD DAN CODEX': 'Standard Dan Codex',
  'SURVEILAN':          'Surveilan',

  // Same unit, different naming style
  'Surveillance':                       'Surveilan',
  'Standard Codex (S&C)':               'Standard Dan Codex',
  'INDUSTRI DOMESTIK':                  'Industri Domestik (CID)',
  'KOMUNIKASI & KEPENGGUNAAN':          'Komunikasi & Kepenggunaan (K&K)',
  'UNIT PENGURUSAN':                    'Pengurusan',

  // Merge all Polisi & Pembangunan variants into 1
  'POLISI & PEMBANGUNAN (IFSTC)':       'Polisi & Pembangunan',
  'POLISI & PEMBANGUNAN (IT)':          'Polisi & Pembangunan',
  'Polisi & Pembangunan (P&P)':         'Polisi & Pembangunan',

  // Remove "Pejabat" prefix
  'Pejabat DPSSC':                      'DPSSC',
  'Pejabat PDSC':                       'PDSC',
  'Pejabat PPI':                        'PPI',
  'Pejabat Timbalan Ketua Pengarah Kesihatan (Keselamatan Dan Kualiti Makanan)': 
    'Timbalan Ketua Pengarah Kesihatan (Keselamatan Dan Kualiti Makanan)',

  // Trailing space cleanup
  'Pejabat Timbalan Ketua Pengarah Kesihatan (Keselamatan Dan Kualiti Makanan) ': 
    'Timbalan Ketua Pengarah Kesihatan (Keselamatan Dan Kualiti Makanan)',
};
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(isDryRun ? '\n[DRY RUN] Tiada perubahan akan disimpan.\n' : '\n[LIVE] Perubahan akan disimpan ke DB.\n');

  let totalUpdated = 0;

  for (const [from, to] of Object.entries(mergeMap)) {
    const affected = await prisma.staff.findMany({
      where: { Cawangan: from },
      select: { id: true, Nama: true, Cawangan: true },
    });

    if (affected.length === 0) {
      console.log(`✓ "${from}" — tiada rekod (skip)`);
      continue;
    }

    console.log(`\n  "${from}" → "${to}"  (${affected.length} rekod)`);
    for (const s of affected) {
      console.log(`    - [${s.id}] ${s.Nama}`);
    }

    if (!isDryRun) {
      const result = await prisma.staff.updateMany({
        where: { Cawangan: from },
        data: { Cawangan: to },
      });
      console.log(`    ✅ Updated ${result.count} rekod`);
      totalUpdated += result.count;
    }
  }

  if (isDryRun) {
    console.log('\n──────────────────────────────────────────');
    console.log('Dry run selesai. Jalankan semula TANPA --dry-run untuk apply.');
  } else {
    console.log('\n──────────────────────────────────────────');
    console.log(`Selesai. Jumlah rekod dikemaskini: ${totalUpdated}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
