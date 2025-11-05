// components/layout/EmployeeFilterPanel2/specialFilters.logic.ts
"use client";

export type SpecialFiltersState = {
  showBirthdays: boolean;
  showNewHires: boolean;
  showAnniversaries: boolean;
};

const MILESTONES = new Set([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);

function parseYmd(str?: string | null) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d); // local date (avoids timezone skew for month/day checks)
}

function isBirthdayThisMonth(birthDate?: string | null, now = new Date()) {
  const d = parseYmd(birthDate);
  return !!d && d.getMonth() === now.getMonth();
}

function isNewHireLast30(hireDate?: string | null, now = new Date()) {
  const d = parseYmd(hireDate);
  if (!d) return false;
  const diff = now.getTime() - d.getTime();
  return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000; // last 30 days
}

// Milestone anniversaries (5–55) that occur THIS MONTH
export function isMilestoneThisMonth(
  hireDate?: string | null,
  now = new Date()
) {
  const d = parseYmd(hireDate);
  if (!d) return false;
  const years = now.getFullYear() - d.getFullYear();
  return MILESTONES.has(years) && d.getMonth() === now.getMonth();
}

// If you prefer “this calendar year”, use this instead:
// export function isMilestoneThisYear(hireDate?: string | null, now = new Date()) {
//   const d = parseYmd(hireDate);
//   if (!d) return false;
//   const years = now.getFullYear() - d.getFullYear();
//   return MILESTONES.has(years);
// }

export function makeSpecialPredicate(
  state: SpecialFiltersState,
  now = new Date()
) {
  const { showBirthdays, showNewHires, showAnniversaries } = state;
  const anyEnabled = showBirthdays || showNewHires || showAnniversaries;

  return (emp: { birthDate?: string | null; hireDate?: string | null }) => {
    if (!anyEnabled) return true; // none selected ⇒ allow all

    const b = showBirthdays ? isBirthdayThisMonth(emp.birthDate, now) : false;
    const n = showNewHires ? isNewHireLast30(emp.hireDate, now) : false;
    const a = showAnniversaries
      ? isMilestoneThisMonth(emp.hireDate, now)
      : false;
    // If switching to “this year”, swap to isMilestoneThisYear above.

    // OR semantics (union)
    return b || n || a;
  };
}
