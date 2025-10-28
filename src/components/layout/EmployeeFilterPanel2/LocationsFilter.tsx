"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  locationsList: string[];
  selectedLocations: string[];
  onToggleLocation: (loc: string, next: boolean) => void;
};

export default function LocationsFilter({
  locationsList,
  selectedLocations,
  onToggleLocation,
}: Props) {
  return (
    <section>
      <h4 className="text-sm font-semibold mb-2">Locations</h4>
      <div className="grid grid-cols-1 gap-2">
        {locationsList.map((loc) => (
          <div className="flex items-center space-x-2" key={loc}>
            <Checkbox
              id={`loc-${loc}`}
              checked={selectedLocations.includes(loc)}
              onCheckedChange={(v) => onToggleLocation(loc, Boolean(v))}
            />
            <label htmlFor={`loc-${loc}`} className="text-sm">
              {loc}
            </label>
          </div>
        ))}
        {locationsList.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No location values found.
          </p>
        )}
      </div>
    </section>
  );
}
