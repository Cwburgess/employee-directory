// useSpecialFilters.ts
"use client";

import * as React from "react";
import type { Employee } from "./EmployeeFilterPanel2"; // optional typing help

const MILESTONES = new Set([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);

function parseYmd(str?: string | null) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  // Create local date to avoid timezone skew
  return new Date(y, m - 1, d);
}

function isBirthdayThisMonth(birthDate?: string | null, now = new Date()) {
  const d = parseYmd(birthDate);
  return !!d && d.getMonth() === now.getMonth();
}

function isNewHireLast30(hireDate?: string | null, now = new Date()) {
  const d = parseYmd(hireDate);
  if (!d) return false;
  const diffMs = now.getTime() - d.getTime();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return diffMs >= 0 && diffMs <= THIRTY_DAYS;
}

// This-month milestone anniversaries (5,10,…,55)
function isMilestoneThisMonth(hireDate?: string | null, now = new Date()) {
  const d = parseYmd(hireDate);
  if (!d) return false;
  const years = now.getFullYear() - d.getFullYear();
  return MILESTONES.has(years) && d.getMonth() === now.getMonth();
}

// If you prefer “this calendar year” instead of “this month”:
// function isMilestoneThisYear(hireDate?: string | null, now = new Date()) {
//   const d = parseYmd(hireDate);
//   if (!d) return false;
//   const years = now.getFullYear() - d.getFullYear();
//   return MILESTONES.has(years);
// }

export type SpecialFiltersState = {
  showBirthdays: boolean;
  showNewHires: boolean;
  showAnniversaries: boolean;
};

export function useSpecialFilters() {
  const [showBirthdays, setShowBirthdays] = React.useState(false);
  const [showNewHires, setShowNewHires] = React.useState(false);
  const [showAnniversaries, setShowAnniversaries] = React.useState(false);

  // OR semantics across enabled filters; if none are enabled, pass everyone.
  const matchesSpecialFilters = React.useCallback(
    (employee: { birthDate?: string | null; hireDate?: string | null }) => {
      const anyEnabled = showBirthdays || showNewHires || showAnniversaries;
      if (!anyEnabled) return true;

      const now = new Date();

      const birthdayMatch = showBirthdays
        ? isBirthdayThisMonth(employee.birthDate, now)
        : false;

      const newHireMatch = showNewHires
        ? isNewHireLast30(employee.hireDate, now)
        : false;

      const anniversaryMatch = showAnniversaries
        ? isMilestoneThisMonth(employee.hireDate, now)
        : false;
      // If you prefer "this year", swap to: isMilestoneThisYear(...)

      // Union of enabled filters
      return birthdayMatch || newHireMatch || anniversaryMatch;
    },
    [showBirthdays, showNewHires, showAnniversaries]
  );

  return {
    showBirthdays,
    setShowBirthdays,
    showNewHires,
    setShowNewHires,
    showAnniversaries,
    setShowAnniversaries,
    matchesSpecialFilters,
  };
}
