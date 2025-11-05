// EmployeeDirectoryHeader.tsx
"use client";

import * as React from "react";
import LayoutToggle from "@/components/layout/LayoutToggle";
import type { Layout as DirectoryLayout } from "@/components/layout/LayoutToggle";
import EmployeeFilterPanel, {
  type EmployeeFilters,
  type Employee,
  type CrewGroup,
} from "@/components/layout/EmployeeFilterPanel2";
import AlphaLetterBar from "@/components/layout/AlphaLetterBar";
// 🆕 For debug via querystring (?anniversary=1)
import { useSearchParams } from "next/navigation";

export interface EmployeeDirectoryHeaderProps {
  layout: DirectoryLayout; // "grid" | "list"
  onLayoutChangeAction: (value: DirectoryLayout) => void;
  groups: CrewGroup[];
  onFiltersChangeAction: (filters: EmployeeFilters) => void;
  showAlphaBar?: boolean;
  letterCounts?: Record<string, number>;
  selectedLetter?: string | null;
  onLetterChangeAction?: (value: string | null) => void;
  className?: string;
  sticky?: boolean;
  fullBleed?: boolean;
  onSearchChangeAction?: (value: string) => void;

  /** Pattern B: parent supplies a setter for the special-filters predicate.
   *  The Filter Panel will invoke this with (emp: Employee) => boolean.
   */
  onSpecialPredicateChangeAction?: (
    predicate: (emp: Employee) => boolean
  ) => void;

  // 🆕 Optional manual override for anniversary state (handy for testing)
  anniversaryOverride?: boolean;
}

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// 🆕 ACHD founding constants + helpers
const ACHD_FOUNDING_YEAR = 1971;
const ANNIV_MONTH = 7; // 0-based: August = 7
const ANNIV_DAY = 11; // 11th
function isAnniversaryDay(date: Date): boolean {
  return date.getMonth() === ANNIV_MONTH && date.getDate() === ANNIV_DAY;
}

function getAnniversaryNumber(date: Date): number {
  // Years since 1971. On 2025-08-11 -> 54
  return date.getFullYear() - ACHD_FOUNDING_YEAR;
}

function ordinalSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export default function EmployeeDirectoryHeader({
  layout,
  onLayoutChangeAction,
  groups,
  onFiltersChangeAction,
  showAlphaBar = false,
  letterCounts,
  selectedLetter,
  onLetterChangeAction,
  className,
  sticky = true,
  fullBleed = true,
  onSearchChangeAction,
  onSpecialPredicateChangeAction, // <-- will be passed-through to the panel
  // 🆕
  anniversaryOverride,
}: EmployeeDirectoryHeaderProps) {
  const [searchValue, setSearchValue] = React.useState("");

  // 🆕 Debug via query param (?anniversary=1)
  const params = useSearchParams();
  const debugAnniv = params.get("anniversary") === "1";

  // 🆕 Compute anniversary state (local time in browser)
  const today = React.useMemo(() => new Date(), []);
  const isAnniv =
    Boolean(anniversaryOverride) || debugAnniv || isAnniversaryDay(today);
  const years = getAnniversaryNumber(today);
  const annivMsg =
    isAnniv && years > 0
      ? `Happy ${years}${ordinalSuffix(years)} Anniversary ACHD!`
      : null;

  // 🔧 Search only updates the search state / callback, not special filters
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChangeAction?.(value);
  };

  const clearSearch = () => {
    setSearchValue("");
    onSearchChangeAction?.("");
  };

  // 🆕 Header color + contrast logic
  const anniversaryBg = "#27AAE1"; // Brand secondary
  const headerStyle: React.CSSProperties | undefined = isAnniv
    ? {
        backgroundColor: anniversaryBg,
        color: "#000", // ensure high contrast on orange
      }
    : undefined;

  return (
    <div
      className={cx(
        fullBleed && "-mx-2",
        sticky && "sticky top-0 z-50",
        // Base colors (overridden by inline style when isAnniv)
        "bg-white dark:bg-gray-900 text-black dark:text-white",
        "shadow-md border-b border-gray-200 dark:border-gray-700",
        "transition-colors duration-500", // 🆕 smooth bg change
        className
      )}
      style={headerStyle} // 🆕 take over colors on Aug 11
      aria-live="polite" // 🆕 announce the badge if it appears
    >
      <div className="mx-auto max-w-screen-2xl px-2">
        {/* 🆕 Anniversary badge */}
        {annivMsg && (
          <div className="pt-2 flex justify-center">
            <div
              className={cx(
                "inline-flex items-center gap-2 rounded-full",
                "bg-black/10 px-6 py-3 text-xl font-bold",
                "shadow-sm ring-1 ring-black/10",
                "motion-safe:animate-pulse"
              )}
              role="status"
              aria-label={annivMsg}
              title={annivMsg}
            >
              <span aria-hidden>🎉</span>
              <span>{annivMsg}</span>
              <span aria-hidden>🥳</span>
            </div>
          </div>
        )}

        <div className="py-3 flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            ACHD Employee Directory
          </h1>

          <div className="flex items-center justify-center gap-2 mb-6">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={cx(
                  "h-9 px-3 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary",
                  // 🆕 Subtle tweak so it looks OK on orange bg
                  isAnniv
                    ? "border-black/30 bg-white text-black"
                    : "border-gray-300"
                )}
                aria-label="Search employees"
              />
              {searchValue && (
                <button
                  onClick={clearSearch}
                  className={cx(
                    "absolute right-2 top-1/2 -translate-y-1/2 hover:text-gray-700",
                    isAnniv ? "text-gray-700" : "text-gray-500"
                  )}
                  aria-label="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95a1 1 0 011.414-1.414L10 8.586z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Layout toggle */}
            <LayoutToggle
              value={layout}
              onChangeAction={onLayoutChangeAction}
            />

            {/* Filters panel */}
            <EmployeeFilterPanel
              groups={groups}
              hardDefaultToMyCrew={false}
              onChangeAction={onFiltersChangeAction}
              triggerSize="default"
              triggerClassName="h-9 px-3 leading-none"
              /** 🔗 Pass the special-filters predicate setter through to the panel (Pattern B) */
              onSpecialPredicateChangeAction={onSpecialPredicateChangeAction}
            />
          </div>
        </div>

        {showAlphaBar && (
          <div className="pb-2">
            <AlphaLetterBar
              className="px-2 flex flex-nowrap items-center overflow-x-auto whitespace-nowrap gap-1 no-scrollbar md:justify-center"
              available={letterCounts ?? {}}
              value={selectedLetter ?? null}
              onChange={onLetterChangeAction ?? (() => {})}
            />
          </div>
        )}
      </div>
    </div>
  );
}
