"use client";

import * as React from "react";
import type { CrewGroup, EmployeeFilters } from "./types";

const LS_KEY_UNITS = "ed.selectedUnits";
const LS_KEY_CREWS = "ed.selectedCrews";
const LS_KEY_LOCS = "ed.selectedLocations";
const LS_KEY_ONLYM = "ed.onlyMyCrew";

type Args = {
  groups: CrewGroup[];
  onChangeAction?: (filters: EmployeeFilters) => void;
  hardDefaultToMyCrew?: boolean;
};

export function useEmployeeDirectoryFilters({
  groups,
  onChangeAction,
  hardDefaultToMyCrew = true,
}: Args) {
  const [selectedUnits, setSelectedUnits] = React.useState<string[]>([]);
  const [selectedCrews, setSelectedCrews] = React.useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>(
    []
  );
  const [onlyMyCrew, setOnlyMyCrew] = React.useState<boolean>(false);

  const [myCrew, setMyCrew] = React.useState<string | null>(null);
  const appliedDefaultRef = React.useRef(false);

  // init (LS) + my-crew fetch
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const su = JSON.parse(localStorage.getItem(LS_KEY_UNITS) || "[]");
      const sc = JSON.parse(localStorage.getItem(LS_KEY_CREWS) || "[]");
      const sl = JSON.parse(localStorage.getItem(LS_KEY_LOCS) || "[]");
      const om = localStorage.getItem(LS_KEY_ONLYM) === "true";
      if (Array.isArray(su)) setSelectedUnits(su);
      if (Array.isArray(sc)) setSelectedCrews(sc);
      if (Array.isArray(sl)) setSelectedLocations(sl);
      setOnlyMyCrew(om);
    } catch {}

    fetch("/api/my-crew", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((row) => setMyCrew((row?.crew as string) || null))
      .catch(() => setMyCrew(null));
  }, []);

  // one-time my-crew default
  React.useEffect(() => {
    if (!hardDefaultToMyCrew) return;
    if (appliedDefaultRef.current) return;
    if (!myCrew) return;

    if (
      selectedUnits.length === 0 &&
      selectedCrews.length === 0 &&
      selectedLocations.length === 0 &&
      !onlyMyCrew
    ) {
      appliedDefaultRef.current = true;
      setOnlyMyCrew(true);
      setSelectedCrews([myCrew]);
      const unit = groups.find((g) => g.crew === myCrew)?.unit;
      if (unit) setSelectedUnits([unit]);
    }
  }, [
    myCrew,
    hardDefaultToMyCrew,
    groups,
    selectedUnits.length,
    selectedCrews.length,
    selectedLocations.length,
    onlyMyCrew,
  ]);

  // persist
  React.useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(LS_KEY_UNITS, JSON.stringify(selectedUnits));
  }, [selectedUnits]);
  React.useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(LS_KEY_CREWS, JSON.stringify(selectedCrews));
  }, [selectedCrews]);
  React.useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(LS_KEY_LOCS, JSON.stringify(selectedLocations));
  }, [selectedLocations]);
  React.useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(LS_KEY_ONLYM, onlyMyCrew ? "true" : "false");
  }, [onlyMyCrew]);

  // emit
  React.useEffect(() => {
    onChangeAction?.({
      units: selectedUnits,
      crews: selectedCrews,
      locations: selectedLocations,
      onlyMyCrew,
    });
  }, [
    onChangeAction,
    selectedUnits,
    selectedCrews,
    selectedLocations,
    onlyMyCrew,
  ]);

  const selectedCrewSet = React.useMemo(
    () => new Set(selectedCrews),
    [selectedCrews]
  );

  function clearAll() {
    setSelectedUnits([]);
    setSelectedCrews([]);
    setSelectedLocations([]);
    setOnlyMyCrew(false);
  }

  const activeCount =
    (selectedUnits.length ? 1 : 0) +
    (selectedCrews.length ? 1 : 0) +
    (selectedLocations.length ? 1 : 0) +
    (onlyMyCrew ? 1 : 0);

  return {
    selectedUnits,
    setSelectedUnits,
    selectedCrews,
    setSelectedCrews,
    selectedLocations,
    setSelectedLocations,
    onlyMyCrew,
    setOnlyMyCrew,
    myCrew,

    selectedCrewSet,
    activeCount,

    clearAll,
  };
}
