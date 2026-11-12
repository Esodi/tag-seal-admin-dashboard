import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPage({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("mx-auto max-w-7xl space-y-6", className)} {...props} />; }
export function DashboardStatsGrid({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)} {...props} />; }
export function DashboardSection({ title, description, action, children, className }: { title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) { return <section className={cn("card min-w-0 p-5 sm:p-6", className)}><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="font-semibold">{title}</h2>{description && <p className="mt-1 text-supporting text-muted-foreground">{description}</p>}</div>{action}</div>{children}</section>; }
export function DashboardStatCard({ label, value, note, icon: Icon, trend, loading = false, className }: {
  label?: ReactNode;
  value?: ReactNode;
  note?: ReactNode;
  icon?: LucideIcon;
  trend?: ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <article data-slot="dashboard-stat" aria-busy={loading} className={cn("min-w-0 rounded-xl border bg-card p-4 text-card-foreground", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-supporting font-medium leading-5 text-muted-foreground">{label ?? <Skeleton className="h-5 w-28" />}</div>
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        {trend}
      </div>
      <div className="mt-3 text-2xl font-bold leading-8 tracking-tight tabular-nums">{loading ? <Skeleton className="h-8 w-16" /> : value}</div>
      <div className="mt-1 min-h-5 text-supporting leading-5 text-muted-foreground">{note ?? (loading ? <Skeleton className="h-5 w-36" /> : null)}</div>
    </article>
  );
}
