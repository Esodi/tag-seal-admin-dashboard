"use client";

import { DashboardStatCard } from "@/components/ui/dashboard";
import { TablePanel, TableToolbar, TablePagination } from "@/components/ui/table-layout";
import { useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowDownToLine,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  ArrowUpNarrowWide,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  CustomViewDetailsDialog,
  DetailItem,
} from "@/components/ui/custom-view-details-dialog";
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
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FeatureDefinition, FeatureGroup } from "@/lib/features";

type SortOrder = "desc" | "asc" | "alpha-asc" | "alpha-desc";

const SORT_OPTIONS: Array<{
  value: SortOrder;
  label: string;
  icon: typeof ArrowDownWideNarrow;
}> = [
  { value: "desc", label: "Newest first", icon: ArrowDownWideNarrow },
  { value: "asc", label: "Oldest first", icon: ArrowUpNarrowWide },
  { value: "alpha-asc", label: "Name (A–Z)", icon: ArrowDownAZ },
  { value: "alpha-desc", label: "Name (Z–A)", icon: ArrowUpAZ },
];

const PAGE_SIZE_OPTIONS = [10, 30, 50, 100] as const;

const sampleNames = ["Mlimani", "Kijani", "Baraka", "Upendo", "Amani"];
const statusLabels = ["Active", "Draft", "Published", "Pending", "Archived"];

function sampleValue(column: string, index: number, feature: FeatureDefinition) {
  const key = column.toLowerCase();
  if (key.includes("status") || key === "active" || key.includes("state"))
    return statusLabels[index % statusLabels.length];
  if (key.includes("date") || key.includes("started") || key.includes("expires"))
    return `${18 + index} Oct 2026`;
  if (
    key.includes("amount") ||
    key.includes("income") ||
    key.includes("expenditure") ||
    key.includes("balance")
  )
    return `TZS ${(145000 + index * 82500).toLocaleString()}`;
  if (key.includes("version")) return `v${index + 1}.0`;
  if (key.includes("email")) return `user${index + 1}@tagandseal.co.tz`;
  if (key.includes("phone")) return `+255 71${index} 246 80${index}`;
  if (
    key.includes("location") ||
    key.includes("region") ||
    key.includes("district")
  )
    return ["Arusha", "Kilimanjaro", "Manyara", "Morogoro", "Dodoma"][index];
  if (
    key.includes("animals") ||
    key.includes("records") ||
    key.includes("usage") ||
    key.includes("fields") ||
    key.includes("options")
  )
    return String(24 + index * 17);
  if (
    index === 0 &&
    (key.includes("farm") ||
      key.includes("animal") ||
      key.includes("event") ||
      key.includes("profile") ||
      key.includes("user") ||
      key.includes("type") ||
      key.includes("method") ||
      key.includes("country") ||
      key.includes("region") ||
      key.includes("district") ||
      key.includes("ward") ||
      key.includes("village") ||
      key.includes("street"))
  )
    return `${sampleNames[index]} ${column}`;
  return index === 0
    ? `${feature.label} record`
    : `${sampleNames[index]} ${column}`;
}

export function FeatureWorkspace({
  group,
  feature,
}: {
  group: FeatureGroup;
  feature: FeatureDefinition;
}) {
  const [tab, setTab] = useState<"records" | "configuration" | "activity">(
    "records",
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<SortOrder>("desc");
  const [pageSize, setPageSize] = useState(10);
  const [viewing, setViewing] = useState<Record<string, string> | null>(null);

  const rows = useMemo(() => {
    const base = Array.from({ length: 5 }, (_, rowIndex) =>
      Object.fromEntries(
        feature.columns.map((column) => [
          column,
          sampleValue(column, rowIndex, feature),
        ]),
      ),
    );
    const filtered = base.filter((row) => {
      const matchesQuery =
        !query.trim() ||
        Object.values(row).some((val) =>
          val.toLowerCase().includes(query.trim().toLowerCase()),
        );
      const statusCol = feature.columns.find((col) =>
        col.toLowerCase().includes("status") || col.toLowerCase() === "active" || col.toLowerCase().includes("state"),
      );
      const matchesStatus =
        statusFilter === "all" ||
        !statusCol ||
        row[statusCol]?.toLowerCase() === statusFilter.toLowerCase();
      return matchesQuery && matchesStatus;
    });
    const firstColumn = feature.columns[0] ?? "";
    if (sort === "alpha-asc") {
      return [...filtered].sort((a, b) =>
        (a[firstColumn] ?? "").localeCompare(b[firstColumn] ?? ""),
      );
    }
    if (sort === "alpha-desc") {
      return [...filtered].sort((a, b) =>
        (b[firstColumn] ?? "").localeCompare(a[firstColumn] ?? ""),
      );
    }
    if (sort === "asc") {
      return [...filtered].reverse();
    }
    return filtered;
  }, [feature, query, sort, statusFilter]);

  const selectedSortOption =
    SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];
  const SelectedSortIcon = selectedSortOption.icon;

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardHeader
        parent={group.label}
        parentHref={`/dashboard/${group.slug}`}
        title={feature.label}
        description={feature.description}

        actions={
          <>
            <Button variant="outline">
              <ArrowDownToLine />
              Export
            </Button>
            <Button>
              <Plus />
              {feature.primaryAction}
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total records", value: 1248, note: "+8.2% this month" },
          { label: "Active", value: 1106, note: "88.6% of records" },
          { label: "Needs attention", value: 17, note: "4 updated today" },
        ].map(({ label, value, note }) => (
          <DashboardStatCard key={label} label={<>{label}</>} value={<StatNumber value={value} />} note={<>{note}</>} />
        ))}
      </div>

      <TablePanel className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex gap-1">
            {(["records", "configuration", "activity"] as const).map((item) => (
              <Button
                key={item}
                variant={tab === item ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTab(item)}
                className="capitalize"
              >
                {item}
              </Button>
            ))}
          </div>
          <Badge variant="outline">Workspace preview</Badge>
        </div>

        {tab === "records" ? (
          <>
            <TableToolbar>
              <div className="relative min-w-0 flex-1 lg:max-w-sm">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                  placeholder={`Search ${feature.label.toLowerCase()}…`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger
                    aria-label="Filter by status"
                    size="sm"
                    className="h-8 w-auto min-w-[8.5rem] max-w-44 font-normal"
                  >
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">All statuses</SelectItem>
                    {statusLabels.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value as SortOrder)}
                >
                  <SelectTrigger
                    aria-label="Sort records"
                    size="sm"
                    className="h-8 w-auto min-w-[9.5rem] max-w-56 font-normal"
                  >
                    <SelectedSortIcon className="size-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => setPageSize(Number(value))}
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
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TableToolbar>

            {rows.length === 0 ? (
              <div className="p-4">
                <EmptyCard
                  icon={Database}
                  title={`No matching ${feature.label.toLowerCase()}`}
                  description="Try adjusting your search query or status filter."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">#</TableHead>
                    {feature.columns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                    <TableHead className="w-12">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {index + 1}
                      </TableCell>
                      {feature.columns.map((column, columnIndex) => {
                        const cellValue = String(row[column] ?? "");
                        const isStatus =
                          /^(Active|Draft|Published|Pending|Archived)$/.test(
                            cellValue,
                          );
                        return (
                          <TableCell
                            key={column}
                            className={
                              columnIndex === 0
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {isStatus ? (
                              <StatusBadge status={cellValue} />
                            ) : (
                              cellValue
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Open row actions"
                            >
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setViewing(row)}>
                              <Eye />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setViewing(row)}>
                              <Pencil />
                              Inspect record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <TablePagination>
              <p>
                Showing {rows.length > 0 ? 1 : 0}–{rows.length} of{" "}
                {rows.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled
                  aria-label="Previous page"
                >
                  <ChevronLeft />
                </Button>
                <span className="px-2 tabular-nums">Page 1 of 1</span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled
                  aria-label="Next page"
                >
                  <ChevronRight />
                </Button>
              </div>
            </TablePagination>
          </>
        ) : (
          <div className="p-4">
            <EmptyCard
              icon={SlidersHorizontal}
              title={`${tab.charAt(0).toUpperCase() + tab.slice(1)} workspace configured`}
              description="This section is prepared for permissions, validation, audit history and Laravel API data."
            />
          </div>
        )}
      </TablePanel>

      <CustomViewDetailsDialog
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title={`${feature.label} details`}
        description={feature.description}
      >
        {viewing ? (
          <div className="form-row-grid">
            {feature.columns.map((column) => (
              <DetailItem key={column} label={column}>
                {viewing[column] ?? "—"}
              </DetailItem>
            ))}
          </div>
        ) : null}
      </CustomViewDetailsDialog>
    </div>
  );
}
