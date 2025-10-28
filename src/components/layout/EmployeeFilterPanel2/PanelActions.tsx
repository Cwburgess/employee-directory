"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";

type Props = {
  onClearAll: () => void;
  onSelectAll: () => void;
};

export default function PanelActions({ onClearAll, onSelectAll }: Props) {
  return (
    <div className="mt-6 shrink-0 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
          Clear all
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onSelectAll}>
          Select all
        </Button>
      </div>
      <SheetClose asChild>
        <Button type="button">Apply</Button>
      </SheetClose>
    </div>
  );
}
