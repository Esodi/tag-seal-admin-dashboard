"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    // Log client-side error for observability
    console.error("[Application Error Boundary caught error]:", error);
  }, [error]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07170f] text-white">
      {/* Background imagery and gradients */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/images/tag-seal-farm.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#062617]/95 via-[#123d28]/90 to-[#07170f]/98" />
      <div className="absolute -right-32 -top-32 size-[30rem] rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col justify-between px-5 py-8 sm:px-8 lg:px-10">
        {/* Navigation bar */}
        <header className="flex items-center justify-between rounded-full border border-white/15 bg-white/10 px-5 py-3 shadow-2xl backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="font-semibold tracking-tight text-white">Tag & Seal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-4 text-xs font-medium text-white transition hover:bg-white/20"
            >
              <LogIn className="size-3.5" />
              Sign in
            </Link>
          </div>
        </header>

        {/* Central Error Card */}
        <div className="my-auto py-12 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 ring-8 ring-rose-500/10 sm:size-20">
            <AlertTriangle className="size-8 sm:size-10" />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300">
            <ShieldAlert className="size-3.5" />
            System Runtime Exception
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Something unexpected occurred
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
            The platform encountered an unexpected error while processing this view. Your records and
            data are safe. You can retry the operation or return to the main dashboard.
          </p>

          {error.digest && (
            <p className="mt-3 text-xs text-white/50 font-mono">
              Incident reference ID: <span className="text-[#facc15]">{error.digest}</span>
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => reset()}
              className="h-11 rounded-full bg-[#facc15] px-6 text-sm font-semibold text-[#123d28] hover:bg-[#fde047]"
            >
              <RefreshCw className="mr-2 size-4" />
              Try again
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-white/20 bg-white/10 px-6 text-sm font-medium text-white hover:bg-white/20"
            >
              <Link href="/dashboard" className="gap-2">
                <LayoutDashboard className="size-4" />
                Return to Dashboard
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="h-11 rounded-full border-white/20 bg-white/5 px-5 text-sm font-medium text-white/80 hover:bg-white/15"
            >
              Reload application
            </Button>
          </div>

          {/* Technical Diagnostics (Collapsible) */}
          <div className="mx-auto mt-8 max-w-lg text-left">
            <button
              type="button"
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/70 transition hover:bg-white/10"
            >
              <span>Diagnostic Information</span>
              <ChevronDown
                className={`size-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
              />
            </button>
            {detailsOpen && (
              <div className="mt-2 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-rose-300">
                <p className="font-bold">{error.name || "Error"}:</p>
                <p className="mt-1 whitespace-pre-wrap text-white/80">
                  {error.message || "No error message was provided."}
                </p>
                {error.digest && <p className="mt-2 text-white/40">Digest: {error.digest}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-white/50">
          <span>Tag & Seal Administrative Operations</span>
          <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-white">
            <ArrowLeft className="size-3.5" />
            Home page
          </Link>
        </footer>
      </div>
    </main>
  );
}

