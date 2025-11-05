import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type LegendView = "teams" | "crews";

type LegendItem = {
  label: string;
  color: string;
};

type Props = {
  legendView: LegendView;
  setLegendView: (view: LegendView) => void;
  legendItems: LegendItem[];
};

export const LegendPanel: React.FC<Props> = ({
  legendView,
  setLegendView,
  legendItems,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Toggle Group */}
      <ToggleGroup
        type="single"
        value={legendView}
        onValueChange={(val) => {
          if (val === "teams" || val === "crews") {
            setLegendView(val);
          }
        }}
        className="self-start"
      >
        <ToggleGroupItem
          value="teams"
          className="data-[state=on]:bg-muted data-[state=on]:text-foreground"
        >
          Teams
        </ToggleGroupItem>
        <ToggleGroupItem
          value="crews"
          className="data-[state=on]:bg-muted data-[state=on]:text-foreground"
        >
          Crews
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Legend Items */}
      <div className="flex flex-wrap gap-2">
        {legendItems.map(({ label, color }) => (
          <div
            key={label}
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="truncate max-w-40" title={label}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
