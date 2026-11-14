import { reportDate } from "@/lib/report-print";

export { todayInEat } from "@/lib/report-print";

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 1 }).format(value);
}

export function humanize(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const moneyKey = /amount|price|cost|sales|revenue|gmv/i;
const dateKey = /(At|Date|date|Activity|occurred|assigned)$|^(createdAt|lastActivity|productionDate|eventDate|billDate|transactionDate)$/;
const isoLike = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
const enumLike = /^[a-z]+(?:[_-][a-z]+|[A-Z][a-z]+)*$/;

/** True for values the backend sends as dates (`2026-11-14`, `2026-11-14T07:00:00Z`, `2026-11-14 07:00:00`). */
export function isReportDate(key: string, value: unknown): boolean {
  return typeof value === "string" && isoLike.test(value) && (dateKey.test(key) || value.includes("T") || value.length === 10);
}

/**
 * One formatter for report tables, previews, print and CSV so a value reads the
 * same everywhere: dates in East Africa Time (never a raw `Z` timestamp),
 * money in TZS, enum codes as words. `forExport` keeps plain numbers so
 * spreadsheets can still sum them.
 */
export function formatReportValue(key: string, value: string | number | boolean | null | undefined, { forExport = false } = {}): string {
  if (value === null || value === undefined || value === "") return forExport ? "" : "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (forExport) return String(value);
    return moneyKey.test(key) ? `TZS ${formatNumber(value)}` : formatNumber(value);
  }
  if (isReportDate(key, value)) return reportDate(value, true);
  if (enumLike.test(value) && !value.includes("@")) return humanize(value);
  return value;
}

/** "14 Oct 2026 – 12 Nov 2026" for the selected report period. */
export function formatReportRange(from: string, to: string) {
  return from === to ? reportDate(from) : `${reportDate(from)} – ${reportDate(to)}`;
}
