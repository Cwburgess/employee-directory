// src/components/DebugModalSegment.tsx
"use client";
import { useSelectedLayoutSegment } from "next/navigation";

export default function DebugModalSegment() {
  const seg = useSelectedLayoutSegment("modal"); // key = slot name
  console.log("Active @modal segment:", seg);
  return null;
}
