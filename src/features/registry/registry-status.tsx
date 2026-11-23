import { Badge } from "@/components/ui/badge";
import { commerceLabel } from "@/features/commerce/commerce-config";
import { cn } from "@/lib/utils";

const good = ["active", "verified", "approved", "completed", "live", "ended", "paid", "won"];
const bad = ["rejected", "inactive", "notActive", "cancelled", "expired", "defaulted", "withdrawn"];
const waiting = ["pending", "scheduled", "accepted", "travelling", "arrived", "in_progress", "pending_payment", "return_requested"];

/** The Commerce status pill, with the auction and vet statuses. */
export function RegistryStatus({ status }: { status?: string | null }) {
  const value = status ?? "";
  const tone = good.includes(value)
    ? "border-success/20 bg-success/10 text-success"
    : bad.includes(value)
      ? "border-danger/20 bg-danger/5 text-danger"
      : waiting.includes(value)
        ? "border-warning/30 bg-warning/10 text-foreground"
        : "border-border bg-muted/50 text-muted-foreground";
  return <Badge variant="outline" className={cn("gap-1.5 px-2.5 py-1 text-[11px] font-medium", tone)}><span className="size-1.5 rounded-full bg-current" aria-hidden="true" />{value === "notActive" ? "Not Active" : commerceLabel(value)}</Badge>;
}
