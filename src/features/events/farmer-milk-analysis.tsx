"use client";

import { useMemo, useState } from "react";
import { LineChart as LineChartIcon, MoreVertical } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EventRecordItem } from "@/features/events/types";

export type MilkPeriodFilter = "today" | "week" | "month" | "all";

export type FarmerMilkGroup = {
  key: string;
  farmerName: string;
  farms: string[];
  sessions: number;
  totalLitres: number;
  avgLitres: number;
  latestDate: string | null;
  records: EventRecordItem[];
};

export function parseMilkLitres(record: EventRecordItem): number {
  const raw =
    record.milkQuantity ??
    record.amount ??
    record.quantity ??
    (typeof record.payloadSummary === "string" ? record.payloadSummary : 0);
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
  const match = String(raw ?? "").match(/\d+(?:\.\d+)?/);
  return match ? Number.parseFloat(match[0]) || 0 : 0;
}

function recordDate(record: EventRecordItem): Date | null {
  const raw =
    (typeof record.occurredAt === "string" && record.occurredAt) ||
    (typeof record.eventDate === "string" && record.eventDate) ||
    (typeof record.createdAt === "string" && record.createdAt) ||
    null;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function groupMilkingsByFarmer(
  records: EventRecordItem[],
  search = "",
): FarmerMilkGroup[] {
  const map = new Map<string, FarmerMilkGroup>();
  const q = search.trim().toLowerCase();

  for (const record of records) {
    const farmerName =
      (typeof record.farmerName === "string" && record.farmerName.trim()) ||
      "Unknown Farmer";
    const farmName =
      (typeof record.farmName === "string" && record.farmName.trim()) || "";
    if (
      q &&
      !farmerName.toLowerCase().includes(q) &&
      !farmName.toLowerCase().includes(q)
    ) {
      continue;
    }

    const litres = parseMilkLitres(record);
    const dt = recordDate(record);
    const iso = dt ? dt.toISOString() : null;
    const key = farmerName.toLowerCase();
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        key,
        farmerName,
        farms: farmName ? [farmName] : [],
        sessions: 1,
        totalLitres: litres,
        avgLitres: litres,
        latestDate: iso,
        records: [record],
      });
    } else {
      existing.sessions += 1;
      existing.totalLitres += litres;
      existing.avgLitres = existing.totalLitres / existing.sessions;
      if (farmName && !existing.farms.includes(farmName)) {
        existing.farms.push(farmName);
      }
      if (iso && (!existing.latestDate || iso > existing.latestDate)) {
        existing.latestDate = iso;
      }
      existing.records.push(record);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalLitres - a.totalLitres);
}

export function FarmerMilkTable({
  groups,
  onOpenGraph,
}: {
  groups: FarmerMilkGroup[];
  onOpenGraph: (farmerKey?: string) => void;
}) {
  if (groups.length === 0) {
    return (
      <EmptyCard
        icon={LineChartIcon}
        title="No farmer milk records found"
        description="Milk production grouped by farmer will appear here."
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Farmer</TableHead>
            <TableHead className="hidden md:table-cell">Farms</TableHead>
            <TableHead>Sessions</TableHead>
            <TableHead className="whitespace-nowrap">Total Milk</TableHead>
            <TableHead className="hidden sm:table-cell whitespace-nowrap">
              Avg / Session
            </TableHead>
            <TableHead className="hidden lg:table-cell whitespace-nowrap">
              Latest Milking
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group, index) => (
            <TableRow key={group.key}>
              <TableCell className="text-muted-foreground tabular-nums">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium whitespace-nowrap">
                {group.farmerName}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {group.farms.length > 0 ? group.farms.join(", ") : "—"}
              </TableCell>
              <TableCell className="tabular-nums">{group.sessions}</TableCell>
              <TableCell className="font-semibold tabular-nums whitespace-nowrap">
                {group.totalLitres.toFixed(1)} L
              </TableCell>
              <TableCell className="hidden sm:table-cell tabular-nums whitespace-nowrap">
                {group.avgLitres.toFixed(1)} L
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                {group.latestDate
                  ? new Intl.DateTimeFormat("en-TZ", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(group.latestDate))
                  : "—"}
              </TableCell>
              <TableCell>
                <StatusBadge status="active" />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onOpenGraph(group.key)}>
                      <LineChartIcon className="size-4" />
                      View Line-Graph
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function FarmerMilkLineGraphDialog({
  open,
  onOpenChange,
  records,
  groups,
  selectedFarmerKey,
  onSelectFarmerKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: EventRecordItem[];
  groups: FarmerMilkGroup[];
  selectedFarmerKey: string;
  onSelectFarmerKey: (key: string) => void;
}) {
  const [period, setPeriod] = useState<MilkPeriodFilter>("week");

  const filteredRecords = useMemo(() => {
    const base =
      selectedFarmerKey === "all"
        ? records
        : (groups.find((g) => g.key === selectedFarmerKey)?.records ?? []);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return base.filter((record) => {
      if (period === "all") return true;
      const dt = recordDate(record);
      if (!dt) return false;
      if (period === "today") return dt >= todayStart;
      if (period === "week") return dt >= weekStart;
      if (period === "month") return dt >= monthStart;
      return true;
    });
  }, [records, groups, selectedFarmerKey, period]);

  const series = useMemo(() => {
    const buckets = new Map<string, { label: string; sortKey: string; litres: number; sessions: number }>();
    for (const record of filteredRecords) {
      const dt = recordDate(record);
      if (!dt) continue;
      const litres = parseMilkLitres(record);
      const sortKey =
        period === "today"
          ? `${String(dt.getHours()).padStart(2, "0")}:00`
          : dt.toISOString().slice(0, 10);
      const label =
        period === "today"
          ? `${String(dt.getHours()).padStart(2, "0")}:00`
          : new Intl.DateTimeFormat("en-TZ", {
              day: "numeric",
              month: "short",
            }).format(dt);
      const existing = buckets.get(sortKey);
      if (existing) {
        existing.litres += litres;
        existing.sessions += 1;
      } else {
        buckets.set(sortKey, { label, sortKey, litres, sessions: 1 });
      }
    }
    const sorted = Array.from(buckets.values()).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey),
    );
    if (sorted.length > 0 && sorted[0].litres > 0) {
      return [{ label: "0", sortKey: "", litres: 0, sessions: 0 }, ...sorted];
    }
    return sorted;
  }, [filteredRecords, period]);

  const totalLitres = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + parseMilkLitres(r), 0),
    [filteredRecords],
  );
  const avgLitres =
    filteredRecords.length > 0 ? totalLitres / filteredRecords.length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-5xl sm:max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle>Farmer Milk Line-Graph Analysis</DialogTitle>
          <DialogDescription>
            Track milk production trend across time by farmer and period.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              Total: {totalLitres.toFixed(1)} L
            </Badge>
            <Badge variant="secondary">
              Sessions: {filteredRecords.length}
            </Badge>
            <Badge variant="secondary">
              Avg / Session: {avgLitres.toFixed(1)} L
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Select value={selectedFarmerKey} onValueChange={onSelectFarmerKey}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All farmers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All farmers</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.key} value={g.key}>
                    {g.farmerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as MilkPeriodFilter)}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {series.length === 0 ? (
          <EmptyCard
            icon={LineChartIcon}
            title="No milk records in selected period"
            description="Try switching the period filter to All Time."
          />
        ) : (
          <div className="h-64 w-full min-w-0 pt-2 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={series}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="milkShadowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <YAxis
                  domain={[0, "auto"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <Tooltip content={<ChartTooltip unit="L" />} />
                <Area
                  type="monotone"
                  dataKey="litres"
                  name="Milk"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fill="url(#milkShadowGradient)"
                  dot={{ r: 3.5, fill: "var(--primary)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
