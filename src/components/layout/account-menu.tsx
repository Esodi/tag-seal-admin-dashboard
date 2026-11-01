"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Bell, ChevronDown, Languages, LogOut, Moon, Settings, ShieldCheck, Sun, UserRound } from "lucide-react";
import { useAuthSession } from "@/components/providers/auth-session-provider";

const accountLinks = [
  { href: "/dashboard/account/profile", label: "My profile", icon: UserRound },
  { href: "/dashboard/account/security", label: "Account & security", icon: ShieldCheck },
  { href: "/dashboard/account/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function AccountMenu({ compact = false, user }: { compact?: boolean; user?: { username?: string; email?: string; firstname?: string; surname?: string } }) {
  const [open, setOpen] = useState(false);
  const { session, signOut } = useAuthSession();
  const root = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const currentUser = session?.user ?? user;
  const displayName = [currentUser?.firstname, currentUser?.surname].filter(Boolean).join(" ") || currentUser?.username || "System administrator";
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "SA";

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return <div ref={root} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className={`${compact ? "size-10 justify-center" : "w-full p-2"} flex items-center gap-3 rounded-xl text-left transition hover:bg-muted`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initials}</span>
      {!compact && <><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{displayName}</span><span className="block truncate text-xs text-muted-foreground">System administrator</span></span><ChevronDown className={`size-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} /></>}
    </button>
    {open && <div className={`absolute z-50 w-64 rounded-2xl border bg-card p-2 shadow-2xl ring-1 ring-black/5 ${compact ? "right-0 top-[calc(100%+.6rem)]" : "bottom-[calc(100%+.65rem)] left-[calc(100%+.65rem)] max-lg:bottom-[calc(100%+.5rem)] max-lg:left-0"}`}>
      <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{displayName}</p><p className="truncate text-xs font-medium text-primary">System administrator</p><p className="truncate text-xs text-muted-foreground">{currentUser?.email || "Authenticated account"}</p></div></div>
      <div className="my-1 border-t" />
      <div className="space-y-1 rounded-xl bg-muted/35 p-1">
      {accountLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg bg-background/70 px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"><item.icon className="size-4" />{item.label}</Link>)}
      <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="flex w-full items-center gap-3 rounded-lg bg-background/70 px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground">{resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}Change theme<span className="ml-auto text-[10px] capitalize">{resolvedTheme}</span></button>
      <button className="flex w-full items-center gap-3 rounded-lg bg-background/70 px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"><Languages className="size-4" />Language<span className="ml-auto text-[10px]">EN</span></button>
      </div>
      <div className="my-1 border-t" />
      <button onClick={() => void signOut()} className="flex w-full items-center gap-3 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/15"><LogOut className="size-4" />Sign out</button>
    </div>}
  </div>;
}
