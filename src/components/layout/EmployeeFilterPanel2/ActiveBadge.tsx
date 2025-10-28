"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";

export default function ActiveBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <Badge variant="secondary" className="rounded-full">
      {count} active
    </Badge>
  );
}
