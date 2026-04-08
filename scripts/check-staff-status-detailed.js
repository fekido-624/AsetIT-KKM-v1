const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const NA_VALUES = new Set(['', 'N/A', 'NA', '-']);

function normalize(value) {
  return String(value || '').trim();
}

function isFilled(value) {
  const v = normalize(value).toUpperCase();
  return !NA_VALUES.has(v);
}

function parseCount(value) {
  const n = Number.parseInt(normalize(value), 10);
  return Number.isNaN(n) ? 0 : n;
}

function hasAnyCoreData(asset) {
  return (
    parseCount(asset.Bilangan) > 0 ||
    isFilled(asset.JenisPerolehan) ||
    isFilled(asset.NoSiri) ||
    isFilled(asset.NoPendaftaran) ||
    isFilled(asset.KodSewaan)
  );
}

function evaluateAsset(asset) {
  const exists = hasAnyCoreData(asset);
  if (!exists) {
    return { exists: false, complete: false, needsReview: false, reason: 'No asset data' };
  }

  const jenis = normalize(asset.JenisPerolehan).toUpperCase();
  const hasReg = isFilled(asset.NoPendaftaran);
  const hasRentCode = isFilled(asset.KodSewaan);

  if (!jenis) {
    return { exists: true, complete: false, needsReview: true, reason: 'Jenis Perolehan kosong' };
  }

  if (jenis.includes('ASSET KERAJAAN')) {
    return {
      exists: true,
      complete: hasReg,
      needsReview: !hasReg,
      reason: hasReg ? 'Lengkap (Asset Kerajaan + No Pendaftaran)' : 'Tak lengkap: Asset Kerajaan perlu No Pendaftaran',
    };
  }

  if (jenis.includes('SEWAAN')) {
    return {
      exists: true,
      complete: hasRentCode,
      needsReview: !hasRentCode,
      reason: hasRentCode ? 'Lengkap (Sewaan + Kod Sewaan)' : 'Tak lengkap: Sewaan perlu Kod Sewaan',
    };
  }

  return { exists: true, complete: false, needsReview: true, reason: 'Jenis Perolehan tidak dikenali' };
}

async function main() {
  const name = process.argv[2] || 'Muhammad Izwan bin Ahmad';
  const rows = await prisma.staff.findMany({ where: { Nama: { contains: name } } });

  if (!rows.length) {
    console.log('NOT_FOUND');
    return;
  }

  for (const r of rows) {
    const pc = evaluateAsset({
      Bilangan: r.PC_Bilangan,
      JenisPerolehan: r.PC_JenisPerolehan,
      NoSiri: r.PC_NoSiri,
      NoPendaftaran: r.PC_NoPendaftaran,
      KodSewaan: r.PC_KodSewaan,
    });

    const nb = evaluateAsset({
      Bilangan: r.NB_Bilangan,
      JenisPerolehan: r.NB_JenisPerolehan,
      NoSiri: r.NB_NoSiri,
      NoPendaftaran: r.NB_NoPendaftaran,
      KodSewaan: r.NB_KodSewaan,
    });

    const printer = evaluateAsset({
      Bilangan: r.Printer_Bilangan,
      JenisPerolehan: r.Printer_JenisPerolehan,
      NoSiri: r.Printer_NoSiri,
      NoPendaftaran: r.Printer_NoPendaftaran,
      KodSewaan: r.Printer_KodSewaan,
    });

    const assets = [pc, nb, printer];
    const totalExisting = assets.filter((a) => a.exists).length;
    const completeCount = assets.filter((a) => a.exists && a.complete).length;
    const completionPercent = totalExisting === 0 ? 100 : Math.round((completeCount / totalExisting) * 100);

    console.log(
      JSON.stringify(
        {
          Nama: r.Nama,
          Emel: r.Emel,
          Wing: r.Wing,
          completionPercent,
          totalExisting,
          completeCount,
          detail: {
            PC: { raw: { JenisPerolehan: r.PC_JenisPerolehan, NoPendaftaran: r.PC_NoPendaftaran, KodSewaan: r.PC_KodSewaan }, evaluation: pc },
            NB: { raw: { JenisPerolehan: r.NB_JenisPerolehan, NoPendaftaran: r.NB_NoPendaftaran, KodSewaan: r.NB_KodSewaan }, evaluation: nb },
            Printer: { raw: { JenisPerolehan: r.Printer_JenisPerolehan, NoPendaftaran: r.Printer_NoPendaftaran, KodSewaan: r.Printer_KodSewaan }, evaluation: printer },
          },
        },
        null,
        2
      )
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
