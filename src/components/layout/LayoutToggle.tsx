"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // shadcn/ui button
import { GiOrganigram } from "react-icons/gi";
import { TbAbc } from "react-icons/tb";

export type Layout = "grid" | "list";

export default function LayoutToggle({
  value,
  onChangeAction,
}: {
  value?: Layout; // optional controlled prop
  onChangeAction: (layout: Layout) => void; // ✅ renamed for Next.js client prop check
}) {
  const [internalValue, setInternalValue] = useState<Layout>(value ?? "grid");
  const current = value ?? internalValue;

  const set = (v: Layout) => {
    if (value === undefined) setInternalValue(v);
    onChangeAction(v); // ✅ use the renamed prop
  };

  return (
    <div className="flex items-center justify-center gap-2 ">
      <Button
        type="button"
        variant={current === "grid" ? "default" : "outline"}
        onClick={() => set("grid")}
        aria-pressed={current === "grid"}
      >
        <GiOrganigram className="mr-2 h-4 w-4" aria-hidden="true" />
        <span>Arrange by Department</span>
      </Button>

      <Button
        type="button"
        variant={current === "list" ? "default" : "outline"}
        onClick={() => set("list")}
        aria-pressed={current === "list"}
      >
        <TbAbc className="mr-2 h-4 w-4" aria-hidden="true" />
        <span>Arrange Alphabetically</span>
      </Button>
    </div>
  );
}
