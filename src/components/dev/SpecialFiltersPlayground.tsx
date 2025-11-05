"use client";
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

function parseYmd(str?: string | null) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
const milestones = new Set([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);

const mock = [
  {
    name: "BirthdayThisMonth",
    birthDate: (() => {
      const now = new Date();
      return `${now.getFullYear() - 30}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-15`;
    })(),
    hireDate: null,
  },
  {
    name: "NewHire10DaysAgo",
    birthDate: null,
    hireDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 10);
      return d.toISOString().slice(0, 10);
    })(),
  },
  {
    name: "Anniv10yrsThisMonth",
    birthDate: null,
    hireDate: (() => {
      const now = new Date();
      return `${now.getFullYear() - 10}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-01`;
    })(),
  },
];

export default function SpecialFiltersPlayground() {
  const [birthdays, setBirthdays] = React.useState(false);
  const [newHires, setNewHires] = React.useState(false);
  const [annivs, setAnnivs] = React.useState(false);

  const pred = React.useCallback(
    (e: { birthDate?: string | null; hireDate?: string | null }) => {
      if (!birthdays && !newHires && !annivs) return true;
      const now = new Date();
      const b = birthdays
        ? (() => {
            const d = parseYmd(e.birthDate);
            return !!d && d.getMonth() === now.getMonth();
          })()
        : false;
      const n = newHires
        ? (() => {
            const d = parseYmd(e.hireDate);
            if (!d) return false;
            const diff = now.getTime() - d.getTime();
            return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
          })()
        : false;
      const a = annivs
        ? (() => {
            const d = parseYmd(e.hireDate);
            if (!d) return false;
            const years = now.getFullYear() - d.getFullYear();
            return milestones.has(years) && d.getMonth() === now.getMonth();
          })()
        : false;
      return b || n || a;
    },
    [birthdays, newHires, annivs]
  );

  const matches = mock.filter(pred);

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={birthdays}
            onCheckedChange={(v) => {
              console.log("birthdays", v);
              setBirthdays(v === true);
            }}
          />
          <span>Birthdays this month</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={newHires}
            onCheckedChange={(v) => {
              console.log("newHires", v);
              setNewHires(v === true);
            }}
          />
          <span>New hires (last 30 days)</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={annivs}
            onCheckedChange={(v) => {
              console.log("annivs", v);
              setAnnivs(v === true);
            }}
          />
          <span>Anniversaries (5–55, this month)</span>
        </label>
      </div>
      <div className="text-sm">Matches: {matches.length}</div>
      <ul className="list-disc pl-6">
        {matches.map((m) => (
          <li key={m.name}>{m.name}</li>
        ))}
      </ul>
    </div>
  );
}
