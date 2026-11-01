"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalFatalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Fatal Root Error]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 min-h-screen bg-[#07170f] font-sans text-white antialiased">
        <main className="flex min-h-screen items-center justify-center p-6 text-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#062617]/90 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <AlertTriangle className="size-8" />
            </div>

            <span className="mt-4 inline-block rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
              500 · System Critical Exception
            </span>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
              Application Error
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-white/70">
              A fatal error prevented the application layout from rendering. Please click below to
              reload and recover the application.
            </p>

            {error.digest && (
              <p className="mt-3 font-mono text-xs text-white/50">
                Incident ID: <span className="text-[#facc15]">{error.digest}</span>
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#facc15] px-6 text-sm font-semibold text-[#123d28] transition hover:bg-[#fde047]"
              >
                <RefreshCw className="size-4" />
                Recover application
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Return to homepage
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

