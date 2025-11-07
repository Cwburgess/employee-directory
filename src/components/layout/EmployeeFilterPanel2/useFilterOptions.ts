"use client";

import * as React from "react";
import type { CrewGroup } from "./types";

// Helpers
const isNonEmpty = (s?: string | null): s is string =>
  !!s && s.trim().length > 0;

// Treat as phone-like if it has 7+ digits after stripping non-digits
const isPhoneLike = (s: string) => s.replace(/\D+/g, "").length >= 7;

// Case-insensitive sort
const ciSort = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: "base" });

export function useFilterOptions(groups: CrewGroup[], allowedCrews?: string[]) {
  // Stable dependency for allowedCrews
  const allowedKey = React.useMemo(
    () => (allowedCrews ? allowedCrews.join("\u0001") : ""),
    [allowedCrews]
  );

  // Build everything in one pass so "unitsList" can be derived from *allowed* crews only
  const { unitsList, crewsByUnit, allCrewNames, locationsList } =
    React.useMemo(() => {
      const allowed =
        allowedCrews && allowedCrews.length ? new Set(allowedCrews) : null;

      const unitsSet = new Set<string>();
      const crewsByUnitSet = new Map<string, Set<string>>();
      const allCrewsSet = new Set<string>();
      const locationsSet = new Set<string>();

      for (const g of groups || []) {
        const unit = (g.unit || "Unassigned").trim();
        const crew = (g.crew || "Unassigned").trim();

        // Respect allowedCrews for unit/crew population
        const crewAllowed = !allowed || allowed.has(crew);
        if (crewAllowed) {
          unitsSet.add(unit);

          if (!crewsByUnitSet.has(unit)) crewsByUnitSet.set(unit, new Set());
          crewsByUnitSet.get(unit)!.add(crew);

          allCrewsSet.add(crew);
        }

        // Collect locations from members; exclude phone-like / junk values
        for (const m of g.members || []) {
          const loc = (m.location || "").trim();
          if (
            isNonEmpty(loc) &&
            !isPhoneLike(loc) &&
            !/^\d+$/.test(loc) && // purely numeric
            loc.toLowerCase() !== "null"
          ) {
            locationsSet.add(loc);
          }
        }
      }

      // Finalize crewsByUnit and prune units with zero crews
      const crewsByUnit = new Map<string, string[]>();
      for (const [unit, crewSet] of crewsByUnitSet) {
        crewsByUnit.set(unit, Array.from(crewSet).sort(ciSort));
      }

      const unitsList = Array.from(unitsSet)
        .filter((u) => (crewsByUnit.get(u)?.length ?? 0) > 0)
        .sort(ciSort);

      const allCrewNames = Array.from(allCrewsSet).sort(ciSort);
      const locationsList = Array.from(locationsSet).sort(ciSort);

      return {
        unitsList,
        crewsByUnit,
        allCrewNames,
        locationsList,
      };
    }, [groups, allowedKey, allowedCrews]);

  return { unitsList, crewsByUnit, allCrewNames, locationsList };
}
