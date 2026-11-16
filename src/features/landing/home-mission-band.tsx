import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeMissionBand() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-10 h-px max-w-xs bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          Mission
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
          Built by Climb Up Limited for Tanzania&apos;s livestock ecosystem.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          Climb Up transforms agriculture and utilities through technology. Tag &amp; Seal
          is their livestock traceability platform—pairing practical farm work with
          accountable digital records.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:opacity-80"
          >
            Our story
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="https://www.climbup.co.tz/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            climbup.co.tz
            <ArrowRight className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
