"use client";

import { useEffect, useMemo, useState } from "react";
import EmployeeDirectoryHeader from "@/components/layout/EmployeeDirectoryHeader";
import EmployeeCard from "@/components/layout/EmployeeCard";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SpecialFiltersPlayground from "@/components/dev/SpecialFiltersPlayground";

/* ---------------- Types aligned to your API ---------------- */

type Employee = {
  ACHDEmpNo: string;
  name: string;
  jobtitle: string;
  workphone: string;
  number: string;
  email: string;
  unit: string;
  crew: string;
  prdept: string;
  location: string;
  reportsto: string;
  birthDate?: string | null;
  hireDate?: string | null;
};

/* ---------- Name parsing helpers for robust last-name sort ---------- */

// Handles "Last, First Middle" or "First Middle Last", drops common suffixes
function splitNameParts(fullName: string) {
  const safe = (fullName || "").trim().replace(/\s+/g, " ");
  if (!safe) return { first: "", last: "" };

  if (safe.includes(",")) {
    // "Last, First ..."
    const [lastRaw, firstRaw] = safe.split(",", 2).map((s) => s.trim());
    return { first: firstRaw || "", last: lastRaw || "" };
  }

  const suffixes = new Set(["jr", "jr.", "sr", "sr.", "ii", "iii", "iv", "v"]);
  const parts = safe.split(" ");
  const tail = parts[parts.length - 1]?.toLowerCase();
  const cleaned = tail && suffixes.has(tail) ? parts.slice(0, -1) : parts;

  if (cleaned.length === 1) return { first: "", last: cleaned[0] };

  const last = cleaned[cleaned.length - 1] || "";
  const first = cleaned.slice(0, -1).join(" ");
  return { first, last };
}

function lastNameKey(name: string) {
  return splitNameParts(name).last.toLocaleLowerCase();
}
function firstNameKey(name: string) {
  return splitNameParts(name).first.toLocaleLowerCase();
}

export default function EmployeeDirectoryPage() {
  const [layout, setLayout] = useState<"grid" | "list">("list");
  const [data, setData] = useState<CrewGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  //const [specialPredicate, setSpecialPredicate] = useState(() => () => true);
  const [specialPredicate, setSpecialPredicate] = useState<
    (e: Employee) => boolean
  >(() => () => true);

  // Add a safe wrapper so you never crash even if someone sets a bad value
  const safePredicate = useMemo<(e: Employee) => boolean>(() => {
    return typeof specialPredicate === "function"
      ? specialPredicate
      : () => true;
  }, [specialPredicate]);

  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [filters, setFilters] = useState<EmployeeFilters>({
    units: [],
    crews: [],
    locations: [],
    onlyMyCrew: false,
  });

  /* ---------------- Fetch grouped employee data (once) ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/employee-directory?search=${encodeURIComponent(searchQuery)}`,
          {
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error("Fetch failed");
        const json = await res.json();
        setData(json as CrewGroup[]);
      } catch (err) {
        console.error("Failed to fetch employee data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]); // ✅ now responds to search input

  /* ---------------- Apply Unit/Crew/Location filters client-side ---------------- */
  // Use the safePredicate in your memo
  const filteredGroups = useMemo(() => {
    const uSet = new Set(filters.units);
    const cSet = new Set(filters.crews);
    const lSet = new Set(filters.locations);

    return (data as CrewGroup[])
      .map((g) => {
        const unitOk = uSet.size ? uSet.has(g.unit) : true;
        const crewOk = cSet.size ? cSet.has(g.crew) : true;
        if (!unitOk || !crewOk) return null;

        const members = (g.members || []).filter((m) => {
          const locOk = lSet.size ? lSet.has(m.location || "") : true;
          const specialOk = safePredicate(m); // 👈 safe
          return locOk && specialOk;
        });

        return members.length ? { ...g, members } : null;
      })
      .filter(Boolean) as CrewGroup[];
  }, [data, filters, safePredicate]);

  /* ---------------- LIST view derivations (use filteredGroups) ---------------- */
  const sortedEmployees = useMemo(() => {
    const all = filteredGroups.flatMap((g) => g.members || []);
    return [...all].sort((a, b) => {
      const aLast = lastNameKey(a.name);
      const bLast = lastNameKey(b.name);
      if (aLast !== bLast) {
        return aLast.localeCompare(bLast, undefined, { sensitivity: "base" });
      }
      const aFirst = firstNameKey(a.name);
      const bFirst = firstNameKey(b.name);
      return aFirst.localeCompare(bFirst, undefined, { sensitivity: "base" });
    });
  }, [filteredGroups]);

  // Build counts for A..Z (based on last name initial) — drives which letter buttons are enabled/disabled
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < 26; i++) counts[String.fromCharCode(65 + i)] = 0;

    for (const emp of sortedEmployees) {
      const ln = splitNameParts(emp.name).last;
      const initial = (ln[0] || "").toUpperCase();
      if (initial >= "A" && initial <= "Z") {
        counts[initial] = (counts[initial] || 0) + 1;
      }
    }
    return counts;
  }, [sortedEmployees]);

  // Apply the letter filter (only for the "list" layout)
  const visibleEmployees = useMemo(() => {
    if (!selectedLetter) return sortedEmployees;
    const prefix = selectedLetter.toLowerCase();
    return sortedEmployees.filter((e) =>
      lastNameKey(e.name).startsWith(prefix)
    );
  }, [sortedEmployees, selectedLetter]);

  // Reset letter filter when user switches to Department (grid) layout
  useEffect(() => {
    if (layout === "grid" && selectedLetter !== null) {
      setSelectedLetter(null);
    }
  }, [layout, selectedLetter]);

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <main className="p-6">
      <EmployeeDirectoryHeader
        layout={layout}
        onLayoutChangeAction={setLayout}
        groups={data}
        onFiltersChangeAction={setFilters}
        onSearchChangeAction={setSearchQuery} // ✅ this must match the prop name
        showAlphaBar={layout === "list"}
        letterCounts={letterCounts}
        selectedLetter={selectedLetter}
        onLetterChangeAction={setSelectedLetter}
        sticky
        fullBleed
        onSpecialPredicateChangeAction={setSpecialPredicate}
      />

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="animate-spin h-6 w-6 mb-4" />
          <p>Loading employee data...</p>

          {/* Skeletons that wrap to mimic card layout, with larger avatar */}
          <div className="flex flex-wrap gap-4 mt-6 w-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border p-4 space-y-4 min-w-[320px] flex-1 sm:flex-[1_1_360px] lg:flex-[1_1_400px] max-w-[480px]"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <Skeleton key={j} className="h-3 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">
          <p>⚠️ Failed to load employee data. Please try again later.</p>
        </div>
      ) : layout === "grid" ? (
        /* ------------------------- GRID LAYOUT (filtered) ------------------------- */
        <div className="space-y-10">
          {filteredGroups.map((group) => {
            const groupKey = `${group.unit}-${group.crew}`;
            return (
              <section key={groupKey}>
                <header className="mb-4">
                  <h2 className="text-xl font-semibold">
                    {group.unit} — {group.crew} ({group.members.length})
                  </h2>
                </header>

                {/* Fixed: constrain card width with inline gridTemplateColumns */}
                <div
                  className="grid gap-4 justify-center"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(320px, 400px))",
                  }}
                >
                  {(group.members || []).map((employee) => {
                    const empKey =
                      employee.ACHDEmpNo ||
                      `${group.unit}-${group.crew}-${
                        employee.email || employee.name
                      }`;
                    return (
                      <div key={empKey}>
                        <EmployeeCard employee={employee} avatarSize="lg" />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {filteredGroups.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No employees match these filters.
            </p>
          )}
        </div>
      ) : (
        /* ------------------------- LIST LAYOUT (filtered) ------------------------- */

        //<div className="grid gap-4 justify-center [grid-template-columns:repeat(auto-fill,minmax(320px,400px))]">
        // This doesn't work: <div className="mt-6 md:mt-8 grid gap-4 justify-center [grid-cols:repeat(auto-fill,minmax(320px,400px))]">
        <div className="mt-6 md:mt-8 grid gap-4 justify-center grid-cols-[repeat(auto-fill,minmax(320px,400px))]">
          {visibleEmployees.map((e) => {
            const empKey =
              e.ACHDEmpNo || `${e.unit}-${e.crew}-${e.email || e.name}`;
            return (
              <div key={empKey}>
                <EmployeeCard employee={e} />
              </div>
            );
          })}
          {visibleEmployees.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No employees match these filters.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
