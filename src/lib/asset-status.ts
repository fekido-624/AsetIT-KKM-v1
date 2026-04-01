import type { AssetNB, AssetPC, AssetPrinter, Staff } from "@/lib/types";

type AssetLike = AssetPC | AssetNB | AssetPrinter;

const NA_VALUES = new Set(["", "N/A", "NA", "-"]);

function normalize(value: string | undefined): string {
  return (value || "").trim();
}

function isFilled(value: string | undefined): boolean {
  const v = normalize(value).toUpperCase();
  return !NA_VALUES.has(v);
}

function parseCount(value: string | undefined): number {
  const n = Number.parseInt(normalize(value), 10);
  return Number.isNaN(n) ? 0 : n;
}

function hasAnyCoreData(asset: AssetLike): boolean {
  return (
    parseCount(asset.Bilangan) > 0 ||
    isFilled(asset.JenisPerolehan) ||
    isFilled(asset.NoSiri) ||
    isFilled(asset.NoPendaftaran) ||
    isFilled(asset.KodSewaan)
  );
}

function evaluateAsset(asset: AssetLike): { exists: boolean; complete: boolean; needsReview: boolean } {
  const exists = hasAnyCoreData(asset);
  if (!exists) {
    return { exists: false, complete: false, needsReview: false };
  }

  const jenis = normalize(asset.JenisPerolehan).toUpperCase();
  const hasReg = isFilled(asset.NoPendaftaran);
  const hasRentCode = isFilled(asset.KodSewaan);

  if (!jenis) {
    return { exists: true, complete: false, needsReview: true };
  }

  if (jenis.includes("ASSET KERAJAAN")) {
    return { exists: true, complete: hasReg, needsReview: !hasReg };
  }

  if (jenis.includes("SEWAAN")) {
    return { exists: true, complete: hasRentCode, needsReview: !hasRentCode };
  }

  // Unknown procurement type requires manual review.
  return { exists: true, complete: false, needsReview: true };
}

export function getStaffAssetSummary(staff: Staff) {
  const assets = [evaluateAsset(staff.PC), evaluateAsset(staff.NB), evaluateAsset(staff.Printer)];
  const totalExisting = assets.filter((a) => a.exists).length;
  const completeCount = assets.filter((a) => a.exists && a.complete).length;
  const incompleteCount = totalExisting - completeCount;
  const needsReviewCount = assets.filter((a) => a.needsReview).length;
  const completionPercent = totalExisting === 0 ? 100 : Math.round((completeCount / totalExisting) * 100);

  return {
    totalExisting,
    completeCount,
    incompleteCount,
    needsReviewCount,
    completionPercent,
  };
}
