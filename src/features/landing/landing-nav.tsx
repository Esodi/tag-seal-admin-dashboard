"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { LandingAuthCta } from "@/features/landing/landing-auth-cta";
import { LandingThemeToggle } from "@/features/landing/landing-theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/solutions", label: "Solutions" },
  { href: "/about", label: "About" },
];

export function LandingNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [overHero, setOverHero] = useState(isHome);

  useEffect(() => {
    if (!isHome) {
      setOverHero(false);
      return;
    }

    /** Solid nav as soon as the header meets the hero badge / “Tag & Seal” copy. */
    const update = () => {
      const copy = document.getElementById("landing-hero-copy");
      const navHeight = 64; // matches h-16 header
      if (!copy) {
        setOverHero(window.scrollY < navHeight);
        return;
      }
      const copyTop = copy.getBoundingClientRect().top;
      // Keep transparent while there is clear space between nav bottom and copy top.
      setOverHero(copyTop > navHeight + 4);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  const transparent = isHome && overHero;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        transparent ? "bg-transparent" : "bg-background/90 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Logo size="sm" priority />
          <span
            className={cn(
              "text-sm font-semibold tracking-tight transition-colors",
              transparent ? "text-white" : "text-foreground"
            )}
          >
            Tag &amp; Seal
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className={cn(
            "hidden items-center rounded-full px-1.5 py-1 md:flex",
            transparent ? "bg-white/10" : "bg-foreground/[0.04]"
          )}
        >
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition",
                  transparent
                    ? active
                      ? "bg-white text-[#183629]"
                      : "text-white/80 hover:text-white"
                    : active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-3 md:hidden">
            {links
              .filter((l) => l.href !== "/")
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-xs font-medium transition",
                    transparent
                      ? pathname.startsWith(link.href)
                        ? "text-white"
                        : "text-white/75 hover:text-white"
                      : pathname.startsWith(link.href)
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
          </div>
          <LandingThemeToggle tone={transparent ? "onDark" : "default"} />
          <LandingAuthCta
            variant="nav"
            tone={transparent ? "onDark" : "default"}
            guestLabel="Admin login"
          />
        </div>
      </div>
      {!transparent ? (
        <div className="h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
      ) : null}
    </header>
  );
}
