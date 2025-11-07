"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { cn } from "lib/utils";

import ActiveBadge from "./ActiveBadge";
import OnlyMyCrewSwitch from "./OnlyMyCrewSwitch";
import UnitsCrewsTree from "./UnitsCrewsTree";
import LocationsFilter from "./LocationsFilter";
import PanelActions from "./PanelActions";
import SpecialFilters from "./SpecialFilters";
import { useFilterOptions } from "./useFilterOptions";
import { useEmployeeDirectoryFilters } from "./useEmployeeDirectoryFilters";
import { useSpecialFilters } from "./useSpecialFilters";
import type { Employee, CrewGroup, EmployeeFilters } from "./types";

type Props = {
  groups: CrewGroup[];
  onChangeAction?: (filters: EmployeeFilters) => void;
  allowedCrews?: string[];
  hardDefaultToMyCrew?: boolean;
  className?: string;
  defaultOpen?: boolean;

  triggerSize?: "sm" | "default" | "lg";
  triggerVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive";
  triggerClassName?: string;
  onSpecialPredicateChangeAction?: (
    predicate: (emp: Employee) => boolean
  ) => void; // <-- already added
};

export default function EmployeeFilterPanel({
  groups,
  onChangeAction,
  allowedCrews,
  hardDefaultToMyCrew = true,
  className,
  defaultOpen = false,
  triggerSize = "default",
  triggerVariant = "outline",
  triggerClassName,
  onSpecialPredicateChangeAction,
}: Props) {
  const [open, setOpen] = React.useState(defaultOpen);

  const {
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
  } = useEmployeeDirectoryFilters({
    groups,
    onChangeAction,
    hardDefaultToMyCrew,
  });

  // ✅ Special Filters Hook
  const {
    showBirthdays,
    setShowBirthdays,
    showNewHires,
    setShowNewHires,
    showAnniversaries,
    setShowAnniversaries,
    matchesSpecialFilters,
  } = useSpecialFilters();

  React.useEffect(() => {
    setShowBirthdays(false);
  }, [setShowBirthdays]);

  // For testing special filters. You should see the flags flip correctly. The results of the probe should change when toggling relevant filters.
  React.useEffect(() => {
    console.log("[SpecialFlags]", {
      showBirthdays,
      showNewHires,
      showAnniversaries,
    });
  }, [showBirthdays, showNewHires, showAnniversaries]);

  // Probe one employee (optional)
  React.useEffect(() => {
    const probe = groups?.[0]?.members?.[0];
    if (probe) {
      console.log(
        "[SpecialPredicate probe]",
        probe.name,
        matchesSpecialFilters(probe)
      );
    }
  }, [groups, matchesSpecialFilters]);

  React.useEffect(() => {
    console.log(
      "%c[Panel] calling onSpecialPredicateChangeAction",
      "color:#149386",
      { hasCallback: !!onSpecialPredicateChangeAction }
    );

    onSpecialPredicateChangeAction?.(matchesSpecialFilters);
  }, [matchesSpecialFilters, onSpecialPredicateChangeAction]);

  const { unitsList, crewsByUnit, allCrewNames, locationsList } =
    useFilterOptions(groups, allowedCrews);

  const [expandedUnits, setExpandedUnits] = React.useState<string[]>(
    () => selectedUnits
  );

  // ✅ Combine all filters for final employee filtering
  const filteredGroups = React.useMemo(() => {
    return groups.map((group) => ({
      ...group,
      members: group.members.filter((emp) => {
        // Unit/Crew/Location filters
        const unitMatch =
          selectedUnits.length === 0 || selectedUnits.includes(group.unit);
        const crewMatch =
          selectedCrews.length === 0 || selectedCrews.includes(group.crew);
        const locationMatch =
          selectedLocations.length === 0 ||
          selectedLocations.includes(emp.location);

        // Special filters
        const specialMatch = matchesSpecialFilters(emp);

        return unitMatch && crewMatch && locationMatch && specialMatch;
      }),
    }));
  }, [
    groups,
    selectedUnits,
    selectedCrews,
    selectedLocations,
    matchesSpecialFilters,
  ]);

  function toggleUnit(unitName: string, next: boolean) {
    const children = crewsByUnit.get(unitName) ?? [];
    setSelectedUnits((prev) => {
      const set = new Set(prev);
      if (next) set.add(unitName);
      else set.delete(unitName);
      return Array.from(set);
    });
    setSelectedCrews((prev) => {
      const set = new Set(prev);
      if (next) children.forEach((c) => set.add(c));
      else children.forEach((c) => set.delete(c));
      return Array.from(set);
    });
  }

  function toggleCrew(crewName: string, next: boolean) {
    setSelectedCrews((prev) => {
      const set = new Set(prev);
      if (next) set.add(crewName);
      else set.delete(crewName);
      return Array.from(set);
    });

    const parentUnit = groups.find((g) => g.crew === crewName)?.unit;
    if (parentUnit) {
      const siblings = crewsByUnit.get(parentUnit) ?? [];
      setSelectedUnits((prev) => {
        const set = new Set(prev);
        const futureAny = siblings.some((s) =>
          s === crewName ? next : selectedCrewSet.has(s)
        );
        if (futureAny) set.add(parentUnit);
        else set.delete(parentUnit);
        return Array.from(set);
      });
    }
  }

  function toggleLocation(loc: string, next: boolean) {
    setSelectedLocations((prev) => {
      const set = new Set(prev);
      if (next) set.add(loc);
      else set.delete(loc);
      return Array.from(set);
    });
  }

  function selectAll() {
    setSelectedUnits(unitsList);
    setSelectedCrews(allCrewNames);
    setSelectedLocations(locationsList);
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ActiveBadge count={activeCount} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className={cn("h-9 px-3 leading-none", triggerClassName)}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>

        <SheetContent className="w-[380px] sm:w-[420px] flex flex-col pl-4 sm:pl-6">
          <SheetHeader className="shrink-0">
            <SheetTitle>Filter Employees</SheetTitle>
          </SheetHeader>

          <div className="mt-4 flex-1 min-h-0 flex flex-col gap-8">
            {/* Only my crew */}
            <OnlyMyCrewSwitch
              onlyMyCrew={onlyMyCrew}
              myCrew={myCrew}
              onChangeAction={(val) => {
                setOnlyMyCrew(val);
                if (val && myCrew) {
                  setSelectedCrews([myCrew]);
                  const unit = groups.find((g) => g.crew === myCrew)?.unit;
                  if (unit) setSelectedUnits([unit]);
                }
              }}
            />
            <Separator className="my-4 bg-gray-300 h-0.5" />

            {/* Units & Crews */}
            <section className="flex-1 min-h-0">
              <h4 className="text-sm font-semibold mb-2">Depts &amp; Crews</h4>
              <ScrollArea className="h-full pr-2">
                <UnitsCrewsTree
                  unitsList={unitsList}
                  crewsByUnit={crewsByUnit}
                  selectedCrewSet={selectedCrewSet}
                  onToggleUnitAction={toggleUnit}
                  onToggleCrewAction={toggleCrew}
                  expandedUnits={expandedUnits}
                  onExpandedChangeAction={setExpandedUnits}
                />
              </ScrollArea>
            </section>
            <Separator className="my-4 bg-gray-300 h-0.5" />

            {/* Locations */}
            <LocationsFilter
              locationsList={locationsList}
              selectedLocations={selectedLocations}
              onToggleLocationAction={toggleLocation}
            />

            {/* Special Filters */}
            <Separator className="my-4 bg-gray-300 h-0.5" />

            <section>
              <div className="grid grid-cols-2  gap-3 items-start">
                <SpecialFilters
                  showBirthdays={showBirthdays}
                  showNewHires={showNewHires}
                  showAnniversaries={showAnniversaries}
                  onToggleBirthdaysAction={setShowBirthdays}
                  onToggleNewHiresAction={setShowNewHires}
                  onToggleAnniversariesAction={setShowAnniversaries}
                />
              </div>
            </section>
          </div>

          <PanelActions
            onClearAllAction={clearAll}
            onSelectAllAction={selectAll}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
