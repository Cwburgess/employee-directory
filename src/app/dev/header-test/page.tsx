"use client";

import { useMemo, useState } from "react";
import EmployeeDirectoryHeader from "@/components/layout/EmployeeDirectoryHeader";

export default function HeaderTestPage() {
  const [layout, setLayout] = useState<"grid" | "list">("list");
  const [filters, setFilters] = useState({
    units: [] as string[],
    crews: [] as string[],
    locations: [] as string[],
    onlyMyCrew: false,
  });
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const groups = useMemo(
    () => [
      {
        unit: "Information Technology",
        crew: "GIS",
        members: [
          {
            ACHDEmpNo: "1001",
            name: "Smith, Jane",
            jobtitle: "Analyst",
            workphone: "208-111-2222",
            number: "x123",
            email: "jsmith@example.com",
            unit: "Information Technology",
            crew: "GIS",
            prdept: "IT",
            location: "HQ",
            reportsto: "Jones, Sarah",
          },
          {
            ACHDEmpNo: "1002",
            name: "Anderson, Bob",
            jobtitle: "Technician",
            workphone: "208-333-4444",
            number: "x234",
            email: "banderson@example.com",
            unit: "Information Technology",
            crew: "GIS",
            prdept: "IT",
            location: "HQ",
            reportsto: "Jones, Sarah",
          },
        ],
      },
      { unit: "Maintenance", crew: "Sign Shop", members: [] },
    ],
    []
  );

  const letterCounts = useMemo(
    () =>
      Object.fromEntries(
        Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(
          (ch) => [ch, ch === "A" ? 7 : ch === "S" ? 3 : 0]
        )
      ),
    []
  );

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">EmployeeDirectoryHeader — Test</h1>
      <EmployeeDirectoryHeader
        layout={layout}
        onLayoutChangeAction={setLayout}
        groups={groups}
        onFiltersChangeAction={setFilters}
        showAlphaBar={layout === "list"}
        letterCounts={letterCounts}
        selectedLetter={selectedLetter}
        onLetterChangeAction={setSelectedLetter}
        sticky
        fullBleed
      />
      <section>
        <h2 className="text-lg font-medium mb-2">Live State</h2>
        <pre className="text-xs bg-muted p-3 rounded">
          {JSON.stringify({ layout, filters, selectedLetter }, null, 2)}
        </pre>
      </section>
    </main>
  );
}
