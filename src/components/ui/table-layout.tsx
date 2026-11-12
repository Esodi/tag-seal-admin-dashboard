import type { ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Shared frame for resource lists, including their filters and pagination. */
export function TablePanel({ className, ...props }: ComponentProps<typeof Card>) {
  return <Card data-slot="table-panel" className={cn("min-w-0 gap-0 overflow-hidden rounded-2xl py-0 shadow-none", className)} {...props} />;
}

/** Optional first section: render only when the resource supports archived/deleted records. */
export function TableTabSection({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="table-tabs" className={cn("flex min-w-0 flex-wrap items-center gap-3 border-b px-5 py-3", className)} {...props} />;
}

export function TableToolbar({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="table-toolbar" className={cn("flex min-w-0 flex-col gap-3 border-b px-5 py-4 lg:flex-row lg:items-center [&>div]:min-w-0", className)} {...props} />;
}

export function TablePagination({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="table-pagination" className={cn("flex flex-col gap-3 border-t bg-muted/20 px-5 py-4 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between [&>div]:flex-wrap", className)} {...props} />;
}
