// EmployeeDirectoryHeader.tsx
"use client";

import * as React from "react";
import LayoutToggle from "@/components/layout/LayoutToggle";
import type { Layout as DirectoryLayout } from "@/components/layout/LayoutToggle"; // 👈 non-optional
import EmployeeFilterPanel, {
  type EmployeeFilters,
  type CrewGroup,
} from "@/components/layout/EmployeeFilterPanel2";
import AlphaLetterBar from "@/components/layout/AlphaLetterBar";

export interface EmployeeDirectoryHeaderProps {
  layout: DirectoryLayout; // "grid" | "list"
  onLayoutChangeAction: (value: DirectoryLayout) => void; // 👈 no undefined
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
}

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
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
}: EmployeeDirectoryHeaderProps) {
  const [searchValue, setSearchValue] = React.useState("");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChangeAction?.(value);
  };

  const clearSearch = () => {
    setSearchValue("");
    onSearchChangeAction?.("");
  };

  return (
    <div
      className={cx(
        fullBleed && "-mx-2",
        sticky && "sticky top-0 z-50",
        "bg-white dark:bg-gray-900 text-black dark:text-white",
        "shadow-md border-b border-gray-200 dark:border-gray-700",
        className
      )}
    >
      <div className="mx-auto max-w-screen-2xl px-2">
        <div className="py-3 flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            ACHD Employee Directory
          </h1>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9 px-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

            <LayoutToggle
              value={layout}
              onChangeAction={onLayoutChangeAction}
            />
            <EmployeeFilterPanel
              groups={groups}
              hardDefaultToMyCrew={false}
              onChangeAction={onFiltersChangeAction}
              triggerSize="default"
              triggerClassName="h-9 px-3 leading-none"
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
