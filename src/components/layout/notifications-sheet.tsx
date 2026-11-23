"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  ChevronRight,
  ClipboardCheck,
  Inbox,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NotificationCategory = "approvals" | "operations" | "system";

type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  count: number;
  href: string;
  severity: "info" | "warning" | "danger";
  timestamp: string;
};

const READ_STORAGE_KEY = "tagseal_read_notifications_v1";

export function NotificationsSheet() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"all" | NotificationCategory>("all");
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(READ_STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/dashboard/notifications", {
        cache: "no-store",
      });
      if (!response.ok) return;
      const payload = await response.json();
      setItems((payload?.data?.items ?? []) as NotificationItem[]);
    } catch {
      // Keep previous notifications on transient failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (open) {
      void load();
    }
  }, [open, load]);

  const persistRead = (next: Set<string>) => {
    setReadIds(next);
    try {
      window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // ignore storage quota errors
    }
  };

  const markAsRead = (id: string) => {
    const next = new Set(readIds);
    next.add(id);
    persistRead(next);
  };

  const markAllRead = () => {
    persistRead(new Set(items.map((item) => item.id)));
  };

  const unreadCount = useMemo(
    () => items.filter((item) => !readIds.has(item.id)).length,
    [items, readIds],
  );

  const filteredItems = useMemo(
    () => (tab === "all" ? items : items.filter((item) => item.category === tab)),
    [items, tab],
  );

  const categoryIcon = (item: NotificationItem) => {
    if (item.severity === "danger") {
      return <ShieldAlert className="size-4 text-destructive" />;
    }
    if (item.category === "approvals") {
      return <ClipboardCheck className="size-4 text-amber-600 dark:text-amber-400" />;
    }
    return <AlertTriangle className="size-4 text-primary" />;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="relative rounded-xl p-2.5 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-background" />
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="tabular-nums text-[11px]">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <SheetDescription>
            Pending approvals, operational alerts, and system notices for your role.
          </SheetDescription>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {(
              [
                { key: "all", label: "All" },
                { key: "approvals", label: "Approvals" },
                { key: "operations", label: "Operations" },
                { key: "system", label: "System" },
              ] as const
            ).map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setTab(filter.key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  tab === filter.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </SheetHeader>

        <SheetBody>
          {loading && items.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">All caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No pending approvals or alerts in this category.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredItems.map((item) => {
                const isUnread = !readIds.has(item.id);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      markAsRead(item.id);
                      setOpen(false);
                    }}
                    className={`group flex items-start gap-3 rounded-xl border p-3.5 transition hover:bg-muted/50 ${
                      isUnread ? "border-primary/30 bg-primary/[0.03]" : "bg-card"
                    }`}
                  >
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
                      {categoryIcon(item)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.title}
                        </p>
                        <Badge
                          variant={item.severity === "danger" ? "destructive" : "secondary"}
                          className="shrink-0 tabular-nums text-[11px]"
                        >
                          {item.count}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="capitalize">{item.category}</span>
                        <span className="inline-flex items-center gap-0.5 font-medium text-primary group-hover:underline">
                          Review <ChevronRight className="size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </SheetBody>

        <SheetFooter>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
