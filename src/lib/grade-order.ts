const gradeHierarchy = [
  "Jusa B (M)",
  "Jusa C",
  "Jusa C (M)",
  "C14",
  "C13",
  "C13 (M)",
  "C12",
  "F12",
  "U12",
  "C12 (M)",
  "C12 (KUP)",
  "C10",
  "C10 (M)",
  "C10 (Fleksi)",
  "C9 (Lantikan Kontrak Interim)",
  "S10",
  "F10",
  "U10",
  "U10 (M)",
  "U9",
  "C9",
  "U9 (Lantikan Kontrak Interim)",
  "S9",
  "F9",
  "C7",
  "U7",
  "U6",
  "C36",
  "N6",
  "FA6 (KUP)",
  "C6 (TBK)",
  "C5",
  "N5",
  "N6 (TBK)",
  "N1",
  "N2",
  "N2 (KUP)",
  "N2 (TBK)",
  "N1 (Lantikan Kontrak Interim)",
  "W2 (TBK)",
  "W1",
  "H1",
  "H2 (M)",
  "Mystep NONE",
] as const;

function normalizeGrade(grade: string): string {
  return grade.replace(/\s+/g, " ").trim().toUpperCase();
}

const gradeRankMap: Record<string, number> = gradeHierarchy.reduce((acc, grade, index) => {
  acc[normalizeGrade(grade)] = gradeHierarchy.length - index;
  return acc;
}, {} as Record<string, number>);

export function getGradeRank(grade: string): number {
  const key = normalizeGrade(grade || "");
  if (gradeRankMap[key] !== undefined) {
    return gradeRankMap[key];
  }
  const num = parseInt((grade || "").replace(/\D/g, ""), 10);
  return Number.isNaN(num) ? 0 : num;
}

export function sortStaffByGradeDesc<T extends { Gred: string }>(staffList: T[]): T[] {
  return [...staffList].sort((a, b) => getGradeRank(b.Gred) - getGradeRank(a.Gred));
}
