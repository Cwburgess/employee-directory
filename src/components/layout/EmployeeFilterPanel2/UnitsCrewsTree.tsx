"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "lib/utils";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

type Props = {
  unitsList: string[];
  crewsByUnit: Map<string, string[]>;
  selectedCrewSet: Set<string>;

  /** ✅ keep Action suffix to satisfy Next.js rule */
  onToggleUnitAction: (unit: string, next: boolean) => void;
  onToggleCrewAction: (crew: string, next: boolean) => void;

  className?: string;

  /** Expansion control (controlled preferred) */
  expandedUnits?: string[];
  onExpandedChangeAction?: (next: string[]) => void;
  initiallyExpandedUnits?: string[];

  /** UI options */
  showExpandCollapseAll?: boolean;

  /**
   * Behavior for units that have exactly 1 crew:
   * - "hide": do not render the child crew row; unit checkbox controls it (default).
   * - "autoExpand": always render children, forced open; chevron hidden.
   */
  singleCrewMode?: "hide" | "autoExpand";

  /** Show the selected/total count on single-crew units (default false) */
  showCountsForSingleCrew?: boolean;
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
  onToggleUnitAction,
  onToggleCrewAction,
  className,
  expandedUnits: expandedUnitsProp,
  onExpandedChangeAction,
  initiallyExpandedUnits = [],
  showExpandCollapseAll = false,
  singleCrewMode = "hide",
  showCountsForSingleCrew = false,
}: Props) {
  const controlled = Array.isArray(expandedUnitsProp);
  const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(
    () => new Set(initiallyExpandedUnits)
  );

  const expandedSet = React.useMemo<Set<string>>(
    () => (controlled ? new Set(expandedUnitsProp) : internalExpanded),
    [controlled, expandedUnitsProp, internalExpanded]
  );

  function setExpanded(next: Set<string>) {
    if (controlled) onExpandedChangeAction?.(Array.from(next));
    else setInternalExpanded(next);
  }

  function toggleExpanded(unit: string) {
    const next = new Set(expandedSet);
    if (next.has(unit)) next.delete(unit);
    else next.add(unit);
    setExpanded(next);
  }

  function expandAll() {
    setExpanded(new Set(unitsList));
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {showExpandCollapseAll && (
        <div className="flex items-center justify-end gap-2 pr-2">
          <button
            type="button"
            className="h-7 px-2 text-sm rounded hover:bg-muted"
            onClick={expandAll}
          >
            Expand all
          </button>
          <button
            type="button"
            className="h-7 px-2 text-sm rounded hover:bg-muted"
            onClick={collapseAll}
          >
            Collapse all
          </button>
        </div>
      )}

      <ul role="tree" aria-label="Units and crews" className="space-y-2 pr-1">
        {unitsList.map((unit) => {
          const children = crewsByUnit.get(unit) ?? [];
          if (children.length === 0) return null;

          const isSingle = children.length === 1;
          const singleCrewName = isSingle ? children[0] : undefined;

          const { allOn, anyOn } = calcIndeterminate(children, selectedCrewSet);
          const unitChecked: boolean | "indeterminate" = allOn
            ? true
            : anyOn
            ? "indeterminate"
            : false;

          // Determine open state; force-open when singleCrewMode === "autoExpand"
          const forcedOpen = isSingle && singleCrewMode === "autoExpand";
          const isOpen = forcedOpen ? true : expandedSet.has(unit);

          const selectedCount = children.filter((c) =>
            selectedCrewSet.has(c)
          ).length;

          // Should the chevron be shown? Hide in single-crew modes to avoid extra clicks.
          const showChevron =
            !isSingle || (isSingle && singleCrewMode !== "hide");

          return (
            <li
              key={unit}
              role="treeitem"
              aria-expanded={showChevron ? isOpen : undefined}
              className="rounded-md"
            >
              <div className="flex items-center gap-2 py-1 pl-1 pr-2">
                {/* Chevron (hidden for single-crew when 'hide'; hidden/disabled when forced open) */}
                {showChevron ? (
                  <button
                    type="button"
                    aria-label={isOpen ? `Collapse ${unit}` : `Expand ${unit}`}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded transition",
                      forcedOpen
                        ? "opacity-50 cursor-default"
                        : "hover:bg-muted"
                    )}
                    onClick={() => {
                      if (!forcedOpen) toggleExpanded(unit);
                    }}
                    disabled={forcedOpen}
                  >
                    {isOpen ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <span className="inline-block h-6 w-6" aria-hidden />
                )}

                {/* Unit checkbox */}
                <Checkbox
                  id={`unit-${unit}`}
                  checked={unitChecked}
                  onCheckedChange={(v) => onToggleUnitAction(unit, Boolean(v))}
                />
                <label
                  htmlFor={`unit-${unit}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {unit}
                </label>

                {/* Count badge - hidden for single-crew unless explicitly enabled */}
                {(!isSingle || showCountsForSingleCrew) && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {selectedCount}/{children.length}
                  </span>
                )}
              </div>

              {/* Children:
                  - "hide" mode for single-crew: do not render the crew row.
                  - "autoExpand" for single-crew: always open & chevron disabled.
                  - normal units: render when open. */}
              {(!isSingle && isOpen) ||
              (isSingle && singleCrewMode === "autoExpand" && isOpen) ? (
                <ul role="group" className="ml-8 mt-1 space-y-1 border-l pl-3">
                  {children.map((crew) => {
                    // Skip rendering the only crew in "hide" mode
                    if (
                      isSingle &&
                      singleCrewMode === "hide" &&
                      crew === singleCrewName
                    ) {
                      return null;
                    }
                    const checked = selectedCrewSet.has(crew);
                    return (
                      <li key={crew} role="treeitem">
                        <div className="flex items-center gap-2 py-1 pr-2">
                          <Checkbox
                            id={`crew-${crew}`}
                            checked={checked}
                            onCheckedChange={(v) =>
                              onToggleCrewAction(crew, Boolean(v))
                            }
                          />
                          <label
                            htmlFor={`crew-${crew}`}
                            className="text-sm cursor-pointer"
                          >
                            {crew}
                          </label>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
