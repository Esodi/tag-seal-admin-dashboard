"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Globe, Monitor, Moon, Palette, Sun, UserRound } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProfileDashboard } from "@/features/account/profile-dashboard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { reportDate } from "@/lib/report-print";

const sections = [{ id: "profile", label: "My profile", icon: UserRound }, { id: "appearance", label: "Appearance", icon: Palette }, { id: "region", label: "Language & region", icon: Globe }] as const;
export function SettingsDashboard() {
  const [active, setActive] = useState<string>("profile");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    setMounted(true);
    const read = () => { const tab = new URLSearchParams(window.location.search).get("tab"); setActive(sections.some(section => section.id === tab) ? tab! : "profile"); };
    read(); window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  function select(id: string) { setActive(id); const url = new URL(window.location.href); url.searchParams.set("tab", id); window.history.replaceState(null, "", url); }
  return <div className="mx-auto max-w-7xl"><DashboardHeader title="Settings" description="Your profile and preferences for the Tag & Seal dashboard." />
    <div className="mt-6 grid gap-6 md:grid-cols-12">
      <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto md:col-span-3 md:flex-col md:self-start">{sections.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => select(id)} aria-current={active === id ? "page" : undefined} className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active === id ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}><Icon className="size-4" />{label}</button>)}</nav>
      <div className="min-w-0 md:col-span-9">
        {active === "profile" && <ProfileDashboard embedded />}
        {active === "appearance" && <Card className="shadow-none"><CardHeader><h2 className="text-lg font-semibold">Appearance</h2><p className="text-sm text-muted-foreground">Choose how the dashboard looks on this browser. Changes apply immediately.</p></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-3">{[{ id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }, { id: "system", label: "System", icon: Monitor }].map(({ id, label, icon: Icon }) => <button key={id} disabled={!mounted} aria-pressed={mounted && theme === id} onClick={() => setTheme(id)} className={`relative space-y-4 rounded-xl border p-4 text-left focus-visible:ring-2 focus-visible:ring-ring ${mounted && theme === id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/40"}`}><div aria-hidden="true" className={`flex h-24 gap-2 rounded-md border p-2 ${id === "dark" ? "bg-slate-900" : id === "light" ? "bg-white" : "bg-gradient-to-r from-white to-slate-900"}`}><div className="w-1/4 rounded bg-emerald-700/40" /><div className="flex-1 space-y-2"><div className="h-3 rounded bg-slate-400/40" /><div className="h-12 rounded bg-slate-400/20" /></div></div><span className="flex items-center gap-2 text-sm font-medium"><Icon className="size-4" />{label}{mounted && theme === id && <Check className="ml-auto size-4 text-primary" />}</span></button>)}</div><p className="mt-5 text-xs text-muted-foreground">System follows your device’s light or dark appearance.</p></CardContent></Card>}
        {active === "region" && <Card className="shadow-none"><CardHeader><h2 className="text-lg font-semibold">Language & region</h2><p className="text-sm text-muted-foreground">The current formats used for financial reports and printed documents.</p></CardHeader><CardContent><dl className="divide-y">{[["Interface language", "English"], ["Report timezone", "Africa/Dar_es_Salaam · EAT (UTC+03:00)"], ["Financial currency", "Tanzanian shilling · TZS"], ["Date example", reportDate("2026-11-12T09:30:00Z", true)]].map(([label, value]) => <div key={label} className="grid gap-1 py-4 sm:grid-cols-2"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="text-sm font-medium">{value}</dd></div>)}</dl><p className="mt-4 text-xs text-muted-foreground">These are shared report defaults. Language and currency switching are not currently available.</p></CardContent></Card>}
      </div>
    </div>
  </div>;
}
