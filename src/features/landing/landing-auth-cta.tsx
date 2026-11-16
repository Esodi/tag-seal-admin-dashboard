"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { cn } from "@/lib/utils";

type Variant = "nav" | "primary" | "text" | "hero";

type LandingAuthCtaProps = {
  variant?: Variant;
  tone?: "default" | "onDark";
  guestLabel?: string;
  memberLabel?: string;
  className?: string;
  showArrow?: boolean;
};

function displayName(user: {
  firstname?: string;
  surname?: string;
  username?: string;
  email?: string;
}) {
  const full = [user.firstname, user.surname].filter(Boolean).join(" ").trim();
  return full || user.username || user.email || "Admin";
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function LandingAuthCta({
  variant = "primary",
  tone = "default",
  guestLabel = "Admin login",
  memberLabel = "Open dashboard",
  className,
  showArrow = false,
}: LandingAuthCtaProps) {
  const { session, status } = useAuthSession();
  const onDark = tone === "onDark";

  if (status === "loading") {
    return (
      <span
        className={cn(
          variant === "text"
            ? "inline-block h-3 w-20 rounded"
            : variant === "nav"
              ? "inline-flex h-9 w-28 shrink-0 rounded-full"
              : "inline-flex h-11 w-44 rounded-full",
          onDark ? "bg-white/20" : "bg-foreground/5",
          className
        )}
        aria-hidden
      />
    );
  }

  if (status === "authenticated" && session?.user) {
    const name = displayName(session.user);
    if (variant === "nav") {
      return (
        <Link
          href="/dashboard"
          className={cn(
            "inline-flex h-9 max-w-[11rem] shrink-0 items-center gap-2 rounded-full px-2.5 text-xs font-semibold transition sm:max-w-[14rem]",
            onDark
              ? "bg-white/15 text-white hover:bg-white/25"
              : "bg-foreground/5 text-foreground hover:bg-foreground/10",
            className
          )}
          title={name}
        >
          <span
            className={cn(
              "grid size-6 place-items-center rounded-full text-[10px] font-bold",
              onDark
                ? "bg-white text-[#183629]"
                : "bg-primary text-primary-foreground"
            )}
          >
            {initials(name)}
          </span>
          <span className="truncate">{name}</span>
        </Link>
      );
    }

    return (
      <Link
        href="/dashboard"
        className={cn(
          variant === "text"
            ? onDark
              ? "text-xs font-medium text-white/80 transition hover:text-white"
              : "text-xs font-medium text-muted-foreground transition hover:text-foreground"
            : variant === "hero"
              ? "inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#183629] transition hover:bg-white/90"
              : "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90",
          className
        )}
      >
        {variant === "primary" || variant === "hero" ? (
          <LayoutDashboard className="size-4" />
        ) : null}
        {memberLabel}
        {showArrow ? <ArrowRight className="size-4" /> : null}
      </Link>
    );
  }

  if (variant === "nav") {
    return (
      <Link
        href="/login"
        className={cn(
          "inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-xs font-semibold transition sm:px-4",
          onDark
            ? "bg-white text-[#183629] hover:bg-white/90"
            : "bg-primary text-primary-foreground hover:opacity-90",
          className
        )}
      >
        {guestLabel}
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link
        href="/login"
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#183629] transition hover:bg-white/90",
          className
        )}
      >
        {guestLabel}
        {showArrow ? <ArrowRight className="size-4" /> : null}
      </Link>
    );
  }

  if (variant === "text") {
    return (
      <Link
        href="/login"
        className={cn(
          onDark
            ? "text-xs font-medium text-white/80 transition hover:text-white"
            : "text-xs font-medium text-muted-foreground transition hover:text-foreground",
          className
        )}
      >
        {guestLabel}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90",
        className
      )}
    >
      {guestLabel}
      {showArrow ? <ArrowRight className="size-4" /> : null}
    </Link>
  );
}
