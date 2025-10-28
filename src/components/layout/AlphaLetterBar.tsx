"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";

type AlphaLetterBarProps = {
  /** Map of letter -> count of employees whose last name starts with that letter */
  available: Record<string, number>;
  /** Selected letter ("A".."Z") or null for All */
  value: string | null;
  /** Called when the selection changes */
  onChange: (letter: string | null) => void;
  /** Optional: show an "All" button (default true) */
  showAll?: boolean;
  className?: string;
};

const LETTERS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

export default function AlphaLetterBar({
  available,
  value,
  onChange,
  showAll = true,
  className,
}: AlphaLetterBarProps) {
  return (
    <div className={className}>
      <div
        className="flex flex-wrap items-center justify-center gap-1"
        role="tablist"
        aria-label="Filter by last name initial"
      >
        {showAll && (
          <Button
            type="button"
            variant={value === null ? "default" : "outline"}
            onClick={() => onChange(null)}
            aria-pressed={value === null}
          >
            All
          </Button>
        )}

        {LETTERS.map((letter) => {
          const count = available[letter] || 0;
          const disabled = count === 0;
          const pressed = value === letter;

          return (
            <Button
              key={letter}
              type="button"
              variant={pressed ? "default" : "outline"}
              onClick={() => onChange(letter)}
              aria-pressed={pressed}
              aria-disabled={disabled}
              disabled={disabled}
              className={disabled ? "opacity-50 cursor-not-allowed" : ""}
            >
              {letter}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
