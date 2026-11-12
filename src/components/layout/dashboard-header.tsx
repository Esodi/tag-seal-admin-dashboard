import Link from "next/link";
import type { ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DashboardHeader({
  eyebrow,
  parent,
  parentHref,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  parent?: string;
  parentHref?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  const resolvedParentHref =
    parentHref ??
    (parent === "People & Organization" ? "/dashboard/people" : undefined);

  return (
    <header data-slot="dashboard-header">
      <Breadcrumb>
        <BreadcrumbList className="text-xs">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {parent ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {resolvedParentHref ? (
                  <BreadcrumbLink asChild>
                    <Link href={resolvedParentHref}>{parent}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span>{parent}</span>
                )}
              </BreadcrumbItem>
            </>
          ) : eyebrow ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span>{eyebrow}</span>
              </BreadcrumbItem>
            </>
          ) : null}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-4xl text-supporting leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div data-slot="dashboard-actions" className="flex shrink-0 flex-wrap items-center gap-2 [&>div]:flex-wrap [&_button]:min-h-10">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
