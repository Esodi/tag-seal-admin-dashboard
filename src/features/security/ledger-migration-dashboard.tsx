"use client";

import { DashboardStatCard } from "@/components/ui/dashboard";
import { TablePanel } from "@/components/ui/table-layout";
import { useCallback, useEffect, useState } from "react";
import { ArrowRightLeft, RefreshCw, ShieldAlert } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { EmptyCard } from "@/components/ui/empty-card";
import { FormDialog } from "@/components/ui/form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatNumber } from "@/components/ui/stat-number";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";

type FamilyMigrationRecord = {
  family: string;
  label: string;
  description: string;
  authority: "legacy" | "ledger_shadow" | "ledger" | "retired";
  tables: string[];
  legacyCount: number;
  ledgerCount: number;
  reconciled: boolean;
  reconcilePassed?: boolean | null;
  latestRunUuid?: string | null;
  canAdvanceToLedger?: boolean;
};

const AUTHORITY_DESCRIPTIONS: Record<string, string> = {
  legacy: "App still uses legacy screens; server bridges every save into event_records.",
  ledger_shadow: "Manifest signals dual-path readiness while reconcile stays green under load.",
  ledger: "Dynamic forms are primary; ledger writes and mirrors to legacy until retirement.",
  retired: "Legacy writes blocked. Portal and app run on the ledger only; archive before drop.",
};

/** Slow Portal→App pass: no retired flip from the UI (Gate E is later). */
const AUTHORITY_NEXT_STATES: Record<string, string[]> = {
  legacy: ["ledger_shadow"],
  ledger_shadow: ["ledger", "legacy"],
  ledger: ["ledger_shadow"],
  retired: ["ledger"],
};

export function LedgerMigrationDashboard() {
  const [families, setFamilies] = useState<FamilyMigrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitionTarget, setTransitionTarget] = useState<FamilyMigrationRecord | null>(null);
  const [nextAuthority, setNextAuthority] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch("/api/admin/security/ledger-migration", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not load ledger migration status.");
      setFamilies(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading ledger migration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAuthorityChange = async () => {
    if (!transitionTarget || !nextAuthority) return;
    setSaving(true);
    try {
      const response = await authenticatedFetch("/api/admin/security/ledger-migration/change-authority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family: transitionTarget.family,
          authority: nextAuthority,
        }),
      });
      const payload = await response.json();
      if (!response.ok || payload.status === false) {
        throw new Error(payload.message ?? "Failed to change family authority.");
      }
      toast.success(`${transitionTarget.label} authority updated to ${nextAuthority}.`);
      setTransitionTarget(null);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error transitioning authority.");
    } finally {
      setSaving(false);
    }
  };

  const fullyMigrated = families.filter((f) => f.authority === "ledger" || f.authority === "retired").length;
  const inShadow = families.filter((f) => f.authority === "ledger_shadow").length;
  const legacyOnly = families.filter((f) => f.authority === "legacy").length;

  return (
    <div className="space-y-6">
      <DashboardHeader
        eyebrow="System & Security"
        parent="Security"
        parentHref="/dashboard/security"
        title="Ledger Migration & Authority"
        description="Monitor the transition of operational event families from legacy tables to the dynamic event ledger."

        actions={
          <Button size="sm" variant="outline" onClick={() => void load()} className="gap-1.5 font-medium">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        <DashboardStatCard label={<>Ledger Active / Retired</>} value={<StatNumber value={fullyMigrated} />} note={<>Families operating directly on dynamic ledger</>} />

        <DashboardStatCard label={<>Ledger Shadow (Dual-Write)</>} value={<StatNumber value={inShadow} />} note={<>Dual writing to both ledger and legacy tables</>} />

        <DashboardStatCard label={<>Legacy Authority</>} value={<StatNumber value={legacyOnly} />} note={<>Families awaiting ledger transition</>} />
      </div>

      {/* Main Container Card */}
      <TablePanel className="mt-4">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h3 className="font-semibold text-foreground">Operational Event Families</h3>
            <p className="text-xs text-muted-foreground">
              Transition authorities family-by-family without service downtime. Mobile sync automatically adopts changes.
            </p>
          </div>
        </div>

        {error ? (
          <div className="p-4">
            <EmptyCard
              icon={ShieldAlert}
              title="Could not load migration state"
              description={error}
              action={
                <Button size="sm" variant="outline" onClick={() => void load()}>
                  <RefreshCw className="size-4" />
                  Try again
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Family</TableHead>
                <TableHead>Current Authority</TableHead>
                <TableHead>Legacy Records</TableHead>
                <TableHead>Ledger Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-36 text-right"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {families.map((fam) => {
                const authorityColors: Record<string, string> = {
                  legacy: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
                  ledger_shadow: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                  ledger: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                  retired: "border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
                };

                return (
                  <TableRow key={fam.family} className="transition hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{fam.label}</p>
                        <p className="text-xs text-muted-foreground">{fam.description}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {fam.tables.map((tbl) => (
                            <code key={tbl} className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
                              {tbl}
                            </code>
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={`font-mono text-xs capitalize ${authorityColors[fam.authority]}`}>
                        {fam.authority.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell className="tabular-nums font-mono text-xs">
                      {fam.legacyCount.toLocaleString("en-TZ")}
                    </TableCell>

                    <TableCell className="tabular-nums font-mono text-xs font-semibold text-foreground">
                      {fam.ledgerCount.toLocaleString("en-TZ")}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          fam.reconcilePassed
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        }
                      >
                        {fam.reconcilePassed ? "Reconcile PASS" : fam.latestRunUuid ? "Reconcile FAIL" : "Never reconciled"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTransitionTarget(fam);
                          setNextAuthority(AUTHORITY_NEXT_STATES[fam.authority]?.[0] ?? "ledger");
                        }}
                        className="gap-1 text-xs font-semibold"
                      >
                        <ArrowRightLeft className="size-3.5" />
                        Transition
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TablePanel>

      {/* Transition Authority Modal */}
      {transitionTarget && (
        <FormDialog
          open={Boolean(transitionTarget)}
          onOpenChange={(open) => !open && setTransitionTarget(null)}
          title={`Transition Authority: ${transitionTarget.label}`}
          description={`Change the operational and recording authority for the ${transitionTarget.family} event family.`}
          onSubmit={handleAuthorityChange}
          submitLabel={saving ? "Transitioning..." : "Apply Authority Transition"}
        >
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Current Authority</label>
              <Badge variant="outline" className="font-mono text-xs capitalize">
                {transitionTarget.authority.replace("_", " ")}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {AUTHORITY_DESCRIPTIONS[transitionTarget.authority]}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Target Authority State</label>
              <Select value={nextAuthority} onValueChange={setNextAuthority}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(AUTHORITY_NEXT_STATES[transitionTarget.authority] ?? ["ledger"]).map((st) => (
                    <SelectItem key={st} value={st}>
                      {st.replace("_", " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {nextAuthority && (
                <p className="text-xs text-primary mt-1">
                  {AUTHORITY_DESCRIPTIONS[nextAuthority]}
                </p>
              )}
              {(nextAuthority === "ledger" || nextAuthority === "retired") && !transitionTarget.canAdvanceToLedger && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  Blocked until reconcile PASS. On the server run:{" "}
                  <code className="font-mono">php artisan tag-and-seal:ledger reconcile {transitionTarget.family} --repair</code>
                </p>
              )}
            </div>
          </div>
        </FormDialog>
      )}
    </div>
  );
}
