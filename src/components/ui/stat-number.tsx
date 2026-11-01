import { cn } from "@/lib/utils";

const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 2,
});

export interface StatNumberProps {
  value: number | string | null | undefined;
  prefix?: string;
  suffix?: string;
  compactThreshold?: number;
  className?: string;
}

export function StatNumber({
  value,
  prefix = "",
  suffix = "",
  compactThreshold = 10_000,
  className,
}: StatNumberProps) {
  if (typeof value === "string") {
    return (
      <span title={value} className={cn("tabular-nums", className)}>
        {prefix}
        {value}
        {suffix}
      </span>
    );
  }

  const numeric = typeof value === "number" && Number.isFinite(value) ? value : 0;
  const full = `${prefix}${fullFormatter.format(numeric)}${suffix}`;
  const display =
    Math.abs(numeric) >= compactThreshold
      ? `${prefix}${compactFormatter.format(numeric)}${suffix}`
      : full;

  return (
    <span title={full} className={cn("tabular-nums", className)}>
      {display}
    </span>
  );
}

