"use client";

import * as React from "react";
import type { CrewGroup } from "./types";

export function useFilterOptions(groups: CrewGroup[], allowedCrews?: string[]) {
  const allowedKey = React.useMemo(
    () => (allowedCrews ? allowedCrews.join("\u0001") : ""),
    [allowedCrews]
  );

  const unitsList = React.useMemo(() => {
    const s = new Set<string>();
    for (const g of groups) s.add(g.unit);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [groups]);

  const crewsByUnit = React.useMemo(() => {
    const map = new Map<string, string[]>();
    for (const g of groups) {
      if (allowedCrews && !allowedCrews.includes(g.crew)) continue;
      if (!map.has(g.unit)) map.set(g.unit, []);
      map.get(g.unit)!.push(g.crew);
    }
    for (const [u, arr] of map) {
      map.set(
        u,
        Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b))
      );
    }
    return map;
  }, [groups, allowedKey]);

  const allCrewNames = React.useMemo(() => {
    const s = new Set<string>();
    for (const g of groups) {
      if (allowedCrews && !allowedCrews.includes(g.crew)) continue;
      s.add(g.crew);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [groups, allowedKey]);

  const locationsList = React.useMemo(() => {
    const s = new Set<string>();
    for (const g of groups)
      for (const m of g.members || []) if (m.location) s.add(m.location);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [groups]);

  return { unitsList, crewsByUnit, allCrewNames, locationsList };
}
