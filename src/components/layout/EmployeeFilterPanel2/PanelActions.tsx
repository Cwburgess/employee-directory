"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";

type Props = {
  onClearAllAction: () => void;
  onSelectAllAction: () => void;
};

export default function PanelActions({
  onClearAllAction,
  onSelectAllAction,
}: Props) {
  return (
    <div className="mt-6 shrink-0 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAllAction}
        >
          Clear all
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSelectAllAction}
        >
          Select all
        </Button>
      </div>
      <SheetClose asChild>
        <Button type="button">Apply</Button>
      </SheetClose>
    </div>
  );
}
