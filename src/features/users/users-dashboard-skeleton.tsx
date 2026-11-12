import { DashboardStatCard } from "@/components/ui/dashboard";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";

import { Skeleton } from "@/components/ui/skeleton";

export function UsersDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="space-y-3">
        <Skeleton className="h-3.5 w-48" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <DashboardStatCard key={index} loading />
        ))}
      </div>

      <TablePanel className="mt-4">
        <TableToolbar>
          <Skeleton className="h-9 w-full lg:max-w-sm" />
          <div className="flex flex-wrap gap-2 lg:ml-auto">
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </TableToolbar>
        <div className="divide-y">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="grid grid-cols-6 gap-4 px-4 py-3.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </TablePanel>
    </div>
  );
}
