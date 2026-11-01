import Link from "next/link";
import { ArrowLeft, Compass, LayoutDashboard, LogIn, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function GlobalNotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07170f] text-white">
      {/* Background imagery and gradients */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/images/tag-seal-farm.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#062617]/95 via-[#123d28]/90 to-[#07170f]/98" />
      <div className="absolute -right-32 -top-32 size-[30rem] rounded-full bg-[#facc15]/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-32 -bottom-32 size-[30rem] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-5 py-8 sm:px-8 lg:px-10">
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
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#facc15] px-4 text-xs font-semibold text-[#123d28] transition hover:bg-[#fde047]"
            >
              <LayoutDashboard className="size-3.5" />
              Dashboard
            </Link>
          </div>
        </header>

        {/* Central 404 card */}
        <div className="my-auto py-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300">
            <Compass className="size-4 animate-spin [animation-duration:8s]" />
            Error 404 · Uncharted territory
          </div>

          <h1 className="mt-6 text-7xl font-extrabold tracking-tight text-[#facc15] sm:text-8xl lg:text-9xl">
            404
          </h1>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Pasture or page not found
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            The link you clicked may be broken, or the page, animal record, or report you requested
            has been moved or no longer exists.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#facc15] px-6 text-sm font-semibold text-[#123d28] shadow-lg shadow-black/20 transition hover:bg-[#fde047]"
            >
              <LayoutDashboard className="size-4" />
              Return to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur transition hover:bg-white/15"
            >
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </div>

          {/* Quick directory links */}
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#fde047]">
              Popular destinations
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
              <Link
                href="/dashboard"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Dashboard Overview
              </Link>
              <Link
                href="/dashboard/animals/animals"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Animals & Livestock
              </Link>
              <Link
                href="/dashboard/people/farmers"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Farmers & Keepers
              </Link>
              <Link
                href="/dashboard/events/calving"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Events & Logs
              </Link>
              <Link
                href="/dashboard/locations/farms"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Farms & Holdings
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-3.5 text-[#facc15]" />
            <span>Tag & Seal Traceability and Agricultural Platform</span>
          </div>
          <span>Powered by Climb Up Limited</span>
        </footer>
      </div>
    </main>
  );
}

