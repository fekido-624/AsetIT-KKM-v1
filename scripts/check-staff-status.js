const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function isFilled(v) {
  const s = String(v ?? '').trim().toUpperCase();
  return !['', 'N/A', 'NA', '-'].includes(s);
}

function parseCount(v) {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isNaN(n) ? 0 : n;
}

function evaluate(a) {
  const exists =
    parseCount(a.Bilangan) > 0 ||
    isFilled(a.JenisPerolehan) ||
    isFilled(a.NoSiri) ||
    isFilled(a.NoPendaftaran) ||
    isFilled(a.KodSewaan);

  if (!exists) return { exists: false, complete: false };

  const jenis = String(a.JenisPerolehan ?? '').trim().toUpperCase();
  if (!jenis) return { exists: true, complete: false };
  if (jenis.includes('ASSET KERAJAAN')) return { exists: true, complete: isFilled(a.NoPendaftaran) };
  if (jenis.includes('SEWAAN')) return { exists: true, complete: isFilled(a.KodSewaan) };
  return { exists: true, complete: false };
}

async function main() {
  const name = process.argv[2] || 'Muhammad Izwan bin Ahmad';
  const rows = await prisma.staff.findMany({ where: { Nama: { contains: name } } });

  if (!rows.length) {
    console.log('NOT_FOUND');
    return;
  }

  for (const r of rows) {
    const checks = [
      evaluate({
        Bilangan: r.PC_Bilangan,
        JenisPerolehan: r.PC_JenisPerolehan,
        NoSiri: r.PC_NoSiri,
        NoPendaftaran: r.PC_NoPendaftaran,
        KodSewaan: r.PC_KodSewaan,
      }),
      evaluate({
        Bilangan: r.NB_Bilangan,
        JenisPerolehan: r.NB_JenisPerolehan,
        NoSiri: r.NB_NoSiri,
        NoPendaftaran: r.NB_NoPendaftaran,
        KodSewaan: r.NB_KodSewaan,
      }),
      evaluate({
        Bilangan: r.Printer_Bilangan,
        JenisPerolehan: r.Printer_JenisPerolehan,
        NoSiri: r.Printer_NoSiri,
        NoPendaftaran: r.Printer_NoPendaftaran,
        KodSewaan: r.Printer_KodSewaan,
      }),
    ];

    const totalExisting = checks.filter((x) => x.exists).length;
    const completeCount = checks.filter((x) => x.exists && x.complete).length;
    const completionPercent = totalExisting === 0 ? 100 : Math.round((completeCount / totalExisting) * 100);

    console.log(
      JSON.stringify(
        {
          Nama: r.Nama,
          Wing: r.Wing,
          Emel: r.Emel,
          totalExisting,
          completeCount,
          completionPercent,
          PC: {
            JenisPerolehan: r.PC_JenisPerolehan,
            NoPendaftaran: r.PC_NoPendaftaran,
            KodSewaan: r.PC_KodSewaan,
          },
          NB: {
            JenisPerolehan: r.NB_JenisPerolehan,
            NoPendaftaran: r.NB_NoPendaftaran,
            KodSewaan: r.NB_KodSewaan,
          },
          Printer: {
            JenisPerolehan: r.Printer_JenisPerolehan,
            NoPendaftaran: r.Printer_NoPendaftaran,
            KodSewaan: r.Printer_KodSewaan,
          },
        },
        null,
        2
      )
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
