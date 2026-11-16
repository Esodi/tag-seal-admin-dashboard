"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function LandingThemeToggle({
  tone = "default",
  className,
}: {
  tone?: "default" | "onDark";
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      disabled={!mounted}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full transition disabled:opacity-50",
        tone === "onDark"
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-foreground/5 text-foreground hover:bg-foreground/10",
        className
      )}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
