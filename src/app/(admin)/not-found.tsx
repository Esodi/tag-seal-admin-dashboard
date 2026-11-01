"use client";

import Link from "next/link";
import { ArrowLeft, LayoutDashboard, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
      <div className="relative mx-auto flex size-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <SearchX className="size-10" />
      </div>

      <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
        404 · Section Not Found
      </div>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Dashboard resource not found
      </h1>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t locate this dashboard feature, table, or identifier in your workspace. It may
        have been renamed or you might have entered an invalid URL.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard" className="gap-2">
            <LayoutDashboard className="size-4" />
            Return to Overview
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Go back
        </Button>
      </div>

      <div className="mt-10 grid max-w-lg grid-cols-2 gap-3 text-left sm:grid-cols-3">
        <Link
          href="/dashboard/animals/animals"
          className="rounded-xl border bg-card p-3 transition hover:border-primary/50 hover:bg-muted/50"
        >
          <p className="text-xs font-semibold text-foreground">Livestock</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Manage animals & tags</p>
        </Link>
        <Link
          href="/dashboard/people/farmers"
          className="rounded-xl border bg-card p-3 transition hover:border-primary/50 hover:bg-muted/50"
        >
          <p className="text-xs font-semibold text-foreground">Farmers</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Registered keepers</p>
        </Link>
        <Link
          href="/dashboard/events/calving"
          className="rounded-xl border bg-card p-3 transition hover:border-primary/50 hover:bg-muted/50"
        >
          <p className="text-xs font-semibold text-foreground">Events & Logs</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Lifecycle activity</p>
        </Link>
      </div>
    </div>
  );
}

