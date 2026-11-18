"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, BarChart3, Beef, Briefcase, CircleHelp, Gavel, Landmark,
  LayoutDashboard, MapPinned, PawPrint, Search, Settings, Settings2,
  ShieldCheck, ShoppingBag, Stethoscope, Users, Warehouse,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from "@/components/ui/dialog";
import { featureGroups } from "@/lib/features";

const groupIcons = {
  people: Users,
  events: Activity,
  animals: Beef,
  career: Briefcase,
  commerce: ShoppingBag,
  auction: Gavel,
  vet: Stethoscope,
  dairy: Warehouse,
  blueprints: PawPrint,
  finance: Landmark,
  reference: Settings2,
  locations: MapPinned,
  security: ShieldCheck,
  workspace: LayoutDashboard,
} as const;

const groupLabels: Record<string, string> = {
  people: "People",
  events: "Events",
  animals: "Animals",
  career: "Careers",
  commerce: "Commerce",
  auction: "Auctions",
  vet: "Veterinary",
  dairy: "Cooperatives",
  blueprints: "Animal Setup",
  finance: "Finance",
  reference: "Reference Data",
  locations: "Locations",
  security: "Security",
  workspace: "Workspace",
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

type CommandItem = {
  id: string;
  label: string;
  group: string;
  groupSlug: string;
  href: string;
  keywords: string;
};

function buildCommandItems(): CommandItem[] {
  const workspace: CommandItem[] = [
    { id: "workspace/overview", label: "Overview", group: "Workspace", groupSlug: "workspace", href: "/dashboard", keywords: "home dashboard" },
    { id: "workspace/analytics", label: "Reports & Analysis", group: "Workspace", groupSlug: "workspace", href: "/dashboard/analytics", keywords: "reports analytics charts" },
    { id: "workspace/help", label: "Help Center", group: "Workspace", groupSlug: "workspace", href: "/dashboard/help", keywords: "help docs support" },
    { id: "workspace/settings", label: "Settings", group: "Workspace", groupSlug: "workspace", href: "/dashboard/settings", keywords: "settings profile account" },
  ];

  const features = featureGroups.flatMap((group) => {
    const groupLabel = groupLabels[group.slug] ?? group.label;
    const section: CommandItem = {
      id: `section/${group.slug}`,
      label: groupLabel,
      group: groupLabel,
      groupSlug: group.slug,
      href: `/dashboard/${group.slug}`,
      keywords: `${group.description ?? ""} ${group.slug}`,
    };
    const items = group.features
      .filter((feature) => !feature.hidden)
      .map((feature) => {
        const path = `${group.slug}/${feature.slug}`;
        return {
          id: path,
          label: featureLabels[path] ?? feature.label,
          group: groupLabel,
          groupSlug: group.slug,
          href: `/dashboard/${group.slug}/${feature.slug}`,
          keywords: `${feature.description ?? ""} ${feature.slug} ${group.slug === "events" ? "event log" : ""}`,
        } satisfies CommandItem;
      });
    return [section, ...items];
  });

  return [...workspace, ...features];
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const items = useMemo(() => buildCommandItems(), []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items.slice(0, 12);
    return items
      .filter((item) =>
        `${item.label} ${item.group} ${item.keywords}`.toLowerCase().includes(needle),
      )
      .slice(0, 12);
  }, [items, query]);

  function run(href: string) {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        size="md"
        className="top-[18%] max-h-[min(32rem,calc(100dvh-2rem))] translate-y-0 gap-0 overflow-hidden p-0 sm:top-[18%] sm:translate-y-0"
      >
        <DialogTitle className="sr-only">Search features and pages</DialogTitle>
        <DialogDescription className="sr-only">
          Jump to sidebar features, events, and workspace pages.
        </DialogDescription>
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search features, events, pages…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(event) => {
              if (event.key === "Enter" && filtered[0]) {
                event.preventDefault();
                run(filtered[0].href);
              }
            }}
          />
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="min-h-0 max-h-80 overflow-y-auto overscroll-contain p-2">
          {filtered.length ? (
            filtered.map((item) => {
              const Icon = groupIcons[item.groupSlug as keyof typeof groupIcons] ?? Search;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => run(item.href)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none hover:bg-accent focus:bg-accent"
                >
                  <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.group}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">Go</span>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matching features or pages.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
