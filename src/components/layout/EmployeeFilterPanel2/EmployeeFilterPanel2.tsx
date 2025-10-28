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
import { useFilterOptions } from "./useFilterOptions";
import { useEmployeeDirectoryFilters } from "./useEmployeeDirectoryFilters";

/** Minimal shapes aligned to your page types */
export type Employee = {
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
};

export type CrewGroup = {
  unit: string;
  crew: string;
  members: Employee[];
};

export type EmployeeFilters = {
  units: string[];
  crews: string[];
  locations: string[];
  onlyMyCrew: boolean;
};

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
    onChangeAction: onChangeAction,
    hardDefaultToMyCrew,
  });

  const { unitsList, crewsByUnit, allCrewNames, locationsList } =
    useFilterOptions(groups, allowedCrews);

  // Toggle helpers (same logic you had before)
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

    // ensure parent unit reflects any child selection
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
              onChange={(val) => {
                setOnlyMyCrew(val);
                if (val && myCrew) {
                  setSelectedCrews([myCrew]);
                  const unit = groups.find((g) => g.crew === myCrew)?.unit;
                  if (unit) setSelectedUnits([unit]);
                }
              }}
            />
            <Separator className="my-4 bg-gray-300 h-[2px]" />
            {/* Units & Crews */}
            <section className="flex-1 min-h-0">
              <h4 className="text-sm font-semibold mb-2">Units &amp; Crews</h4>
              {/* Scroll inside the tree */}
              <ScrollArea className="h-full pr-2">
                <UnitsCrewsTree
                  unitsList={unitsList}
                  crewsByUnit={crewsByUnit}
                  selectedCrewSet={selectedCrewSet}
                  onToggleUnit={toggleUnit}
                  onToggleCrew={toggleCrew}
                />
              </ScrollArea>
            </section>
            <Separator className="my-4 bg-gray-300 h-[2px]" />

            {/* Locations */}
            <LocationsFilter
              locationsList={locationsList}
              selectedLocations={selectedLocations}
              onToggleLocation={toggleLocation}
            />
          </div>

          <PanelActions onClearAll={clearAll} onSelectAll={selectAll} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
