"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChartTooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
  dataKey?: string;
  unit?: string;
  payload?: Record<string, unknown>;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string | number;
  unit?: string;
  valueFormatter?: (value: number) => string;
  hideLabel?: boolean;
  className?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  unit,
  valueFormatter = (val) => val.toLocaleString("en-TZ"),
  hideLabel = false,
  className,
}: ChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Determine display title
  const title = (() => {
    if (label !== undefined && label !== null && String(label).trim() !== "") {
      return String(label);
    }
    const firstPayload = payload[0]?.payload;
    if (firstPayload && typeof firstPayload.name === "string") {
      return firstPayload.name;
    }
    return "";
  })();

  return (
    <div
      className={cn(
        "min-w-40 rounded-xl border border-border/80 bg-card/95 p-2.5 text-xs shadow-xl backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10 select-none pointer-events-none z-50",
        className
      )}
    >
      {!hideLabel && title && (
        <p className="mb-2 border-b border-border/60 pb-1.5 font-semibold text-foreground tracking-tight">
          {title}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const color = entry.fill || entry.color || "var(--primary)";
          const rawValue = entry.value;
          const displayValue =
            typeof rawValue === "number"
              ? valueFormatter(rawValue)
              : rawValue ?? "—";
          const rawName = entry.name || entry.dataKey || "Count";
          const name = rawName === "value" ? "Total" : rawName;

          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="size-2 shrink-0 rounded-full shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate text-[11px] font-medium text-muted-foreground">
                  {name}
                </span>
              </div>
              <span className="font-semibold tabular-nums text-foreground">
                {displayValue}
                {entry.unit || unit ? ` ${entry.unit || unit}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
