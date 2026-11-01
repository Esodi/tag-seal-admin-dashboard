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
  badge,
  actions,
}: {
  eyebrow?: string;
  parent?: string;
  parentHref?: string;
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  const resolvedParentHref =
    parentHref ??
    (parent === "People & Organization" ? "/dashboard/people" : undefined);

  return (
    <div>
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

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {badge}
          </div>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
