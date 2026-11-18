"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity, BarChart3, Beef, Bell, Briefcase, ChevronDown, CircleHelp,
  Gavel, Landmark, LayoutDashboard, MapPinned, Menu, PawPrint, Warehouse, Search, Settings,
  Settings2, ShieldCheck, ShoppingBag, Stethoscope, Users, X,
} from "lucide-react";
import { featureGroups } from "@/lib/features";
import { AccountMenu } from "@/components/layout/account-menu";
import { CommandPalette } from "@/components/layout/command-palette";
import { Logo } from "@/components/ui/logo";

const groupIcons = { people: Users, events: Activity, animals: Beef, career: Briefcase, commerce: ShoppingBag, auction: Gavel, vet: Stethoscope, dairy: Warehouse, blueprints: PawPrint, finance: Landmark, reference: Settings2, locations: MapPinned, security: ShieldCheck } as const;
const managementSlugs = ["people", "events", "animals", "career", "commerce", "auction", "vet", "dairy", "blueprints", "finance", "reference", "locations", "security"];
/** Sections that show per-item count badges in the sidebar. */
const badgedSections = new Set(["people", "events", "animals", "career", "commerce", "auction", "vet", "dairy"]);
const groupLabels: Record<string, string> = {
  people: "People", events: "Events", animals: "Animals", career: "Careers",
  commerce: "Commerce", auction: "Auctions", vet: "Veterinary", dairy: "Cooperatives", blueprints: "Animal Setup",
  finance: "Finance", reference: "Reference Data", locations: "Locations",
};
const featureLabels: Record<string, string> = {
  "dairy/unions": "Unions",
  "dairy/cooperatives": "Cooperatives",
  "dairy/centres": "Collection Centres",
  "dairy/transporters": "Transporters",
  "dairy/factories": "Factories",
  "people/system-user-profiles": "Admin Profiles",
  "animals/acquisition-methods": "Acquisition",
  "career/memberships": "Memberships",
  "career/onboardings": "Onboarding",
  "commerce/listings": "Listings",
  "reference/tail-docking-methods": "Tail Docking",
  "reference/teeth-clipping-methods": "Teeth Clipping",
};

type NavCounts = Record<string, Record<string, number>>;

function formatBadge(count: number | undefined): string | null {
  if (count == null || count <= 0) return null;
  if (count > 999) return "999+";
  return String(count);
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 font-semibold tracking-tight">
      <Logo size="sm" />
      <span>Tag & Seal</span>
    </Link>
  );
}

function NavLink({ href, label, icon: Icon, pathname, onClick }: { href: string; label: string; icon: React.ElementType; pathname: string; onClick: () => void }) {
  const active = pathname === href;
  return <Link href={href} onClick={onClick} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-accent font-semibold text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.8} /><span>{label}</span></Link>;
}

export function AdminShell({ children, user }: { children: React.ReactNode; user?: { username?: string; email?: string; firstname?: string; surname?: string } }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [navCounts, setNavCounts] = useState<NavCounts>({});
  const activeGroup = featureGroups.find((group) => pathname === `/dashboard/${group.slug}` || pathname.startsWith(`/dashboard/${group.slug}/`))?.slug;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({ people: true, ...(activeGroup ? { [activeGroup]: true } : {}) }));
  useEffect(() => { if (activeGroup) setOpenGroups((current) => ({ ...current, [activeGroup]: true })); }, [activeGroup]);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/dashboard/nav-counts", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && payload?.data && typeof payload.data === "object") {
          setNavCounts(payload.data as NavCounts);
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const close = () => setMobileOpen(false);

  const accordion = (slug: string) => {
    const group = featureGroups.find((item) => item.slug === slug)!;
    const visibleFeatures = group.features.filter((item) => !item.hidden);
    const GroupIcon = groupIcons[group.slug as keyof typeof groupIcons];
    const open = Boolean(openGroups[group.slug]);
    const groupActive = activeGroup === group.slug;
    const showBadges = badgedSections.has(group.slug);
    return <div key={group.slug}>
      <button type="button" onClick={() => setOpenGroups((current) => ({ ...current, [group.slug]: !current[group.slug] }))} aria-expanded={open} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${groupActive ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
        <GroupIcon className="size-[18px]" strokeWidth={groupActive ? 2.2 : 1.8} /><span className="min-w-0 flex-1 truncate">{groupLabels[group.slug] ?? group.label}</span><span className="text-[10px] tabular-nums text-muted-foreground">{visibleFeatures.length}</span><ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="overflow-hidden"><div className="ml-5 space-y-1 border-l py-1 pl-3">
        {visibleFeatures.map((item) => {
          const href = `/dashboard/${group.slug}/${item.slug}`;
          const active = pathname === href;
          const badge = showBadges ? formatBadge(navCounts[group.slug]?.[item.slug]) : null;
          return (
            <Link key={item.slug} href={href} onClick={close} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${active ? "bg-accent font-semibold text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <span className={`size-1.5 shrink-0 rounded-full ${active ? "bg-primary" : "bg-border"}`} />
              <span className="min-w-0 flex-1 truncate">{featureLabels[`${group.slug}/${item.slug}`] ?? item.label}</span>
              {badge ? <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{badge}</span> : null}
            </Link>
          );
        })}
      </div></div></div>
    </div>;
  };

  const sidebar = <div className="flex h-full flex-col">
    <div className="flex h-16 items-center justify-between px-4"><Brand /><button className="rounded-lg p-2 lg:hidden" onClick={close} aria-label="Close menu"><X className="size-5" /></button></div>
    <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-5">
      <p className="mb-2 mt-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
      <NavLink href="/dashboard" label="Overview" icon={LayoutDashboard} pathname={pathname} onClick={close} />
      <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Management</p>
      <div className="space-y-1">{managementSlugs.map(accordion)}</div>
    </nav>
    <div className="border-t p-3">
      <div className="mb-2 space-y-1"><NavLink href="/dashboard/analytics" label="Reports & Analysis" icon={BarChart3} pathname={pathname} onClick={close} /><NavLink href="/dashboard/help" label="Help Center" icon={CircleHelp} pathname={pathname} onClick={close} /><NavLink href="/dashboard/settings" label="Settings" icon={Settings} pathname={pathname} onClick={close} /></div>
      <AccountMenu user={user} onNavigate={close} />
    </div>
  </div>;

  return <div className="min-h-screen bg-background">
    <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[16.625rem] border-r bg-card lg:block">{sidebar}</aside>
    {mobileOpen && <><button className="fixed inset-0 z-40 bg-black/35 lg:hidden" aria-label="Close menu" onClick={close} /><aside className="fixed inset-y-0 left-0 z-50 w-[min(19rem,88vw)] border-r bg-card lg:hidden">{sidebar}</aside></>}
    <div className="lg:pl-[16.625rem]">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-xl sm:px-6">
        <button className="rounded-xl p-2 hover:bg-muted lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="relative hidden max-w-md flex-1 rounded-xl border bg-card text-left transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 md:block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <span className="flex h-10 items-center pl-10 pr-16 text-sm text-muted-foreground">Search features, events, pages…</span>
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border bg-muted px-2 py-1 text-[10px] text-muted-foreground">⌘ K</kbd>
        </button>
        <button type="button" className="grid size-10 place-items-center rounded-xl transition hover:bg-muted md:hidden" aria-label="Search" onClick={() => setCommandOpen(true)}>
          <Search className="size-5" />
        </button>
        <div className="ml-auto flex items-center gap-1"><Link href="/dashboard/help" aria-label="Help" title="Help" className="grid size-10 place-items-center rounded-xl transition hover:bg-muted"><CircleHelp className="size-5" /></Link><button className="relative rounded-xl p-2.5 hover:bg-muted" aria-label="Notifications"><Bell className="size-5" /><span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-background" /></button><AccountMenu compact user={user} /></div>
      </header>
      <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}
