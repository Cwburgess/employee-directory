"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  onlyMyCrew: boolean;
  myCrew: string | null;
  onChangeAction: (checked: boolean) => void;
};

export default function OnlyMyCrewSwitch({
  onlyMyCrew,
  myCrew,
  onChangeAction,
}: Props) {
  return (
    <section>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="only-my-crew"
          checked={onlyMyCrew}
          onCheckedChange={(v) => onChangeAction(Boolean(v))}
        />
        <label htmlFor="only-my-crew" className="text-sm font-medium">
          Only my crew{" "}
          {myCrew ? (
            <span className="text-muted-foreground">({myCrew})</span>
          ) : (
            ""
          )}
        </label>
      </div>
    </section>
  );
}
