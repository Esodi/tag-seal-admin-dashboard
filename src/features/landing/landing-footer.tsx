import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LandingAuthCta } from "@/features/landing/landing-auth-cta";

export function LandingFooter() {
  return (
    <footer className="bg-muted/40">
      <div className="h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Tag &amp; Seal
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-xs leading-5 text-muted-foreground">
            Livestock identity, farm operations, and accountable records for
            agricultural teams.
          </p>
          <a
            href="https://www.climbup.co.tz/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs font-medium text-primary transition hover:opacity-80"
          >
            climbup.co.tz
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-medium text-muted-foreground">
          <Link href="/" className="transition hover:text-foreground">
            Home
          </Link>
          <Link href="/solutions" className="transition hover:text-foreground">
            Solutions
          </Link>
          <Link href="/about" className="transition hover:text-foreground">
            About
          </Link>
          <LandingAuthCta
            variant="text"
            guestLabel="Admin login"
            memberLabel="Dashboard"
          />
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-foreground/6 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <a
          href="https://www.climbup.co.tz/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-foreground"
        >
          Powered by Climb Up Limited
        </a>
        <span>© 2026 Tag &amp; Seal</span>
      </div>
    </footer>
  );
}
