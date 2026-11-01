import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status?: string | boolean | null;
  className?: string;
}) {
  if (typeof status === "boolean") {
    return (
      <Badge
        variant={status ? "default" : "outline"}
        className={cn(
          status
            ? ""
            : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
          className,
        )}
      >
        {status ? "Verified" : "Unverified"}
      </Badge>
    );
  }

  const normalized = String(status ?? "active").trim();
  const lower = normalized.toLowerCase();

  const isPositive =
    lower === "active" ||
    lower === "verified" ||
    lower === "recorded" ||
    lower === "healthy" ||
    lower === "completed";

  const label =
    lower === "active" || normalized === "ACTIVE"
      ? "Active"
      : lower === "notactive" || lower === "not-active" || normalized === "INACTIVE"
        ? "Inactive"
        : lower === "verified"
          ? "Verified"
          : lower === "unverified"
            ? "Unverified"
            : normalized.replace(/[-_]/g, " ");

  return (
    <Badge
      variant={isPositive ? "default" : "outline"}
      className={cn(
        isPositive
          ? ""
          : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
        "capitalize",
        className,
      )}
    >
      {label}
    </Badge>
  );
}

