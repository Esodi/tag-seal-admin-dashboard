"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ChevronDown, LayoutDashboard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    console.error("[Dashboard Section Error]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-danger/10 text-danger ring-8 ring-danger/5">
        <AlertCircle className="size-8" />
      </div>

      <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-danger/20 bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
        Dashboard View Error
      </div>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Failed to load this dashboard section
      </h1>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        We encountered a problem loading or rendering this operational view. You can retry the
        request, refresh your data, or return to the overview page.
      </p>

      {error.digest && (
        <p className="mt-2 text-xs font-mono text-muted-foreground">
          Incident code: <span className="font-semibold text-foreground">{error.digest}</span>
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCw className="size-4" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard" className="gap-2">
            <LayoutDashboard className="size-4" />
            Return to Overview
          </Link>
        </Button>
      </div>

      <div className="mt-8 w-full max-w-md text-left">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex w-full items-center justify-between rounded-xl border bg-card px-4 py-2.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <span>Diagnostic error details</span>
          <ChevronDown
            className={`size-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
          />
        </button>
        {detailsOpen && (
          <div className="mt-2 overflow-x-auto rounded-xl border bg-muted/60 p-4 font-mono text-xs text-foreground">
            <p className="font-bold text-danger">{error.name || "Error"}:</p>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
              {error.message || "An unexpected error occurred."}
            </p>
            {error.digest && (
              <p className="mt-2 text-[11px] text-muted-foreground">Digest: {error.digest}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

