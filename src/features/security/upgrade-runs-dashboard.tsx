"use client";

import { RecordPagination } from "@/components/ui/record-pagination";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { useCallback, useEffect, useState } from "react";
import { Eye, Layers, MoreVertical, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatNumber } from "@/components/ui/stat-number";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authenticatedFetch } from "@/lib/auth/session";

type UpgradeRun = {
  id: number;
  uuid: string;
  release: string;
  environment: string;
  state: "completed" | "in_progress" | "failed" | "rolled_back";
  backup_reference?: string | null;
  source_schema_version?: string | null;
  target_schema_version: string;
  started_at?: string | null;
  completed_at?: string | null;
  final_report_json?: Record<string, unknown> | null;
};

type ApiResponse = {
  data: UpgradeRun[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
    stats: Array<{ label: string; value: number; note: string }>;
  };
};

export function UpgradeRunsDashboard() {
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewing, setViewing] = useState<UpgradeRun | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(pageSize),
    });
    if (query.trim()) params.set("search", query.trim());
    if (status !== "all") params.set("status", status);

    try {
      const response = await authenticatedFetch(
        `/api/admin/security/upgrade-runs?${params}`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to load upgrade runs.");
      }
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading upgrade runs.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = result?.meta.stats ?? [
    { label: "Total Upgrade Runs", value: result?.meta.total ?? 0, note: "Platform version executions" },
    { label: "Completed", value: 0, note: "Successfully deployed upgrades" },
    { label: "Failed / Attention", value: 0, note: "Upgrade executions needing review" },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        eyebrow="System & Security"
        parent="Security"
        parentHref="/dashboard/security"
        title="Platform Upgrade Runs"
        description="Audit execution logs, environment schema upgrades and platform deployments."

        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => void load()}
            className="gap-1.5"
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <DashboardStatCard key={stat.label} label={<>{stat.label}</>} value={<StatNumber value={stat.value} />} note={<>{stat.note}</>} />
        ))}
      </div>

      {/* Table Container Card */}
      <TablePanel className="mt-4">
        <TableToolbar>
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9"
              placeholder="Search by release, version, UUID..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Filter by state"
                size="sm"
                className="h-8 w-auto min-w-[8.5rem] max-w-44 font-normal"
              >
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="rolled_back">Rolled Back</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Rows per page"
                size="sm"
                className="h-8 w-auto min-w-[6.25rem] max-w-40 font-normal"
              >
                <span className="text-muted-foreground">Show</span>
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent align="end">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TableToolbar>

        {error ? (
          <div className="p-4">
            <EmptyCard
              icon={ShieldAlert}
              title="Could not load upgrade runs"
              description={error}
              action={
                <Button size="sm" variant="outline" onClick={() => void load()}>
                  <RefreshCw className="size-4" />
                  Try again
                </Button>
              }
            />
          </div>
        ) : (result?.data ?? []).length === 0 ? (
          <div className="p-4">
            <EmptyCard
              icon={Layers}
              title="No upgrade runs recorded yet"
              description="Platform migration and version upgrade execution records will appear here."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                <TableHead>Run UUID</TableHead>
                <TableHead>Release</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Target Schema</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead className="w-24 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(result?.data ?? []).map((run, index) => {
                const isCompleted = run.state === "completed";
                const isFailed = run.state === "failed" || run.state === "rolled_back";

                return (
                  <TableRow key={run.uuid || run.id} className="transition hover:bg-muted/30">
                    <TableCell className="text-muted-foreground tabular-nums">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                        {run.uuid ? run.uuid.slice(0, 13) + "…" : "—"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">{run.release}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs uppercase">
                        {run.environment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {run.target_schema_version}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          isCompleted
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : isFailed
                            ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        }
                      >
                        {run.state.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {run.started_at ? new Date(run.started_at).toLocaleString("en-TZ") : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {run.completed_at ? new Date(run.completed_at).toLocaleString("en-TZ") : "In progress"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewing(run)}>
                            <Eye className="size-4 text-muted-foreground" />
                            View execution log
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {result && (
          <RecordPagination from={result.meta.from} to={result.meta.to} total={result.meta.total} page={result.meta.currentPage} pageCount={result.meta.lastPage} onPageChange={setPage} disabled={loading} />
        )}
      </TablePanel>

      {/* View Details Dialog */}
      {viewing && (
        <CustomViewDetailsDialog
          open={Boolean(viewing)}
          onOpenChange={(open) => !open && setViewing(null)}
          title={`Upgrade Run: ${viewing.release}`}
          description={`Execution metadata and schema migration report for ${viewing.uuid}.`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Run UUID">{viewing.uuid}</DetailItem>
              <DetailItem label="Release Version">{viewing.release}</DetailItem>
              <DetailItem label="Environment">{viewing.environment}</DetailItem>
              <DetailItem label="State">{viewing.state}</DetailItem>
              <DetailItem label="Source Schema">{viewing.source_schema_version ?? "—"}</DetailItem>
              <DetailItem label="Target Schema">{viewing.target_schema_version}</DetailItem>
              <DetailItem label="Started At">{viewing.started_at ? new Date(viewing.started_at).toLocaleString("en-TZ") : "—"}</DetailItem>
              <DetailItem label="Completed At">{viewing.completed_at ? new Date(viewing.completed_at).toLocaleString("en-TZ") : "In progress"}</DetailItem>
              {viewing.backup_reference && (
                <DetailItem label="Backup Reference">
                  <code className="font-mono text-xs text-muted-foreground">{viewing.backup_reference}</code>
                </DetailItem>
              )}
            </div>

            {viewing.final_report_json && (
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold text-foreground">Migration Report</span>
                  <Badge variant="outline" className="font-mono text-[10px]">JSON Payload</Badge>
                </div>
                <pre className="max-h-60 overflow-y-auto rounded-lg bg-card p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {JSON.stringify(viewing.final_report_json, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CustomViewDetailsDialog>
      )}
    </div>
  );
}
