// SpecialFilters.tsx
"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  showBirthdays: boolean;
  showNewHires: boolean;
  showAnniversaries: boolean;
  onToggleBirthdaysAction: (next: boolean) => void;
  onToggleNewHiresAction: (next: boolean) => void;
  onToggleAnniversariesAction: (next: boolean) => void;
};

export default function SpecialFilters({
  showBirthdays,
  showNewHires,
  showAnniversaries,
  onToggleBirthdaysAction,
  onToggleNewHiresAction,
  onToggleAnniversariesAction,
}: Props) {
  return (
    <section>
      <h4 className="text-sm font-semibold mb-2">Special Filters</h4>
      <div className="space-y-2">
        <label htmlFor="filter-birthdays" className="flex items-start gap-2">
          <Checkbox
            id="filter-birthdays"
            checked={showBirthdays}
            onCheckedChange={(v) => onToggleBirthdaysAction(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm leading-5">Birthdays This Month</span>
        </label>

        <label htmlFor="filter-newhires" className="flex items-start gap-2">
          <Checkbox
            id="filter-newhires"
            checked={showNewHires}
            onCheckedChange={(v) => onToggleNewHiresAction(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm leading-5">
            {/* If you keep “This Month” here, change the logic below to month-based.
               If you want “last 30 days”, I recommend updating this label too. */}
            New Hires (Last 30 Days)
          </span>
        </label>

        <label
          htmlFor="filter-anniversaries"
          className="flex items-start gap-2"
        >
          <Checkbox
            id="filter-anniversaries"
            checked={showAnniversaries}
            onCheckedChange={(v) => onToggleAnniversariesAction(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm leading-5">
            ACHD Anniversaries This Month (5–55 yrs)
          </span>
        </label>
      </div>
    </section>
  );
}
