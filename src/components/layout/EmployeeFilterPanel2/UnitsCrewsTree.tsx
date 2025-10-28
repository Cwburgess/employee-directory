"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  unitsList: string[];
  crewsByUnit: Map<string, string[]>;
  selectedCrewSet: Set<string>;
  onToggleUnit: (unit: string, next: boolean) => void;
  onToggleCrew: (crew: string, next: boolean) => void;
  className?: string;
};

function calcIndeterminate(children: string[], selected: Set<string>) {
  const allOn = children.length > 0 && children.every((c) => selected.has(c));
  const anyOn = children.some((c) => selected.has(c));
  return { allOn, anyOn };
}

export default function UnitsCrewsTree({
  unitsList,
  crewsByUnit,
  selectedCrewSet,
  onToggleUnit,
  onToggleCrew,
  className,
}: Props) {
  return (
    <section className={className}>
      <h4 className="text-sm font-semibold mb-2">Units &amp; Crews</h4>
      <div className="space-y-3 pb-4">
        {unitsList.map((unit) => {
          const children = crewsByUnit.get(unit) ?? [];
          const { allOn, anyOn } = calcIndeterminate(children, selectedCrewSet);
          const unitChecked: boolean | "indeterminate" = allOn
            ? true
            : anyOn
            ? "indeterminate"
            : false;

          return (
            <div key={unit}>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`unit-${unit}`}
                  checked={unitChecked}
                  onCheckedChange={(v) => onToggleUnit(unit, Boolean(v))}
                />
                <label htmlFor={`unit-${unit}`} className="text-sm font-medium">
                  {unit}
                </label>
              </div>

              {children.length > 0 && (
                <div className="pl-6 mt-2 space-y-1">
                  {children.map((crew) => (
                    <div className="flex items-center space-x-2" key={crew}>
                      <Checkbox
                        id={`crew-${crew}`}
                        checked={selectedCrewSet.has(crew)}
                        onCheckedChange={(v) => onToggleCrew(crew, Boolean(v))}
                      />
                      <label htmlFor={`crew-${crew}`} className="text-sm">
                        {crew}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
