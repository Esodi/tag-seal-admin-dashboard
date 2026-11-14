"use client";

import Link from "next/link";
import { reportDate } from "@/lib/report-print";
import { RecordPagination } from "@/components/ui/record-pagination";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { useMemo, useState } from "react";
import { Activity, ArrowDownAZ, ArrowDownWideNarrow, ArrowUpAZ, ArrowUpNarrowWide, Copy, Eye, FileStack, Layers, MoreVertical, Pencil, Plus, Search, Send, Sparkles, Trash2 } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { toast } from "@/components/ui/toast";
import { blueprintResourceConfigs } from "./blueprint-config";
import { BlueprintPreviewModal } from "./blueprint-preview-modal";
import type {
  AnimalBlueprintRecord,
  BlueprintOptionsResponse,
  BlueprintRecord,
  BlueprintResource,
  BlueprintResponse,
  DynamicSpeciesRecord,
  EventDefinitionRecord,
  FormDefinitionRecord,
  LookupSetRecord,
} from "./types";

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

function getRecordVersion(record: BlueprintRecord): string {
  if ("version" in record && typeof record.version === "number") {
    return `v${record.version}`;
  }
  if ("blueprint_version" in record && typeof record.blueprint_version === "number") {
    return `v${record.blueprint_version}`;
  }
  return "v1";
}

function getRecordKey(record: BlueprintRecord): string {
  if ("uuid" in record && record.uuid) return record.uuid;
  if ("id" in record && record.id) return String(record.id);
  return record.code || "unknown";
}

function getRecordDisplayName(record: BlueprintRecord): string {
  if ("name" in record && record.name) return record.name;
  if ("species" in record && record.species?.name) return record.species.name;
  if ("code" in record && record.code) return record.code;
  return "Record";
}

export function BlueprintResourceDashboard({
  resource,
  initialData,
  initialOptions,
  initialError,
}: {
  resource: BlueprintResource;
  initialData: BlueprintResponse | null;
  initialOptions?: BlueprintOptionsResponse["data"] | null;
  initialError?: string | null;
}) {
  const config = blueprintResourceConfigs[resource];
  const [items, setItems] = useState<BlueprintRecord[]>(() => initialData?.data ?? []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [secondaryFilter, setSecondaryFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Dialog targets
  const [selectedRecord, setSelectedRecord] = useState<BlueprintRecord | null>(null);
  const [previewRecord, setPreviewRecord] = useState<BlueprintRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [publishTarget, setPublishTarget] = useState<BlueprintRecord | null>(null);
  const [cloneTarget, setCloneTarget] = useState<BlueprintRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlueprintRecord | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Form states for Create modal
  const [createFormCode, setCreateFormCode] = useState("");
  const [createFormName, setCreateFormName] = useState("");
  const [createSpeciesUuid, setCreateSpeciesUuid] = useState("");
  const [createRegFormUuid, setCreateRegFormUuid] = useState("");
  const [createBlueprintUuid, setCreateBlueprintUuid] = useState("");
  const [createFamily, setCreateFamily] = useState("other");
  const [createPurpose, setCreatePurpose] = useState<"registration" | "event">("registration");
  const [createSubjectMode, setCreateSubjectMode] = useState<"individual" | "group">("individual");
  const [createGroupLabel, setCreateGroupLabel] = useState("");

  const filteredItems = useMemo(() => {
    const result = items.filter((item) => {
      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      // Secondary filter
      if (secondaryFilter !== "all") {
        if (resource === "event-definitions") {
          const ev = item as EventDefinitionRecord;
          if (ev.family !== secondaryFilter) return false;
        } else if (resource === "form-definitions") {
          const fd = item as FormDefinitionRecord;
          if (fd.purpose !== secondaryFilter) return false;
        } else if (resource === "dynamic-species") {
          const sp = item as DynamicSpeciesRecord;
          if (sp.default_subject_mode !== secondaryFilter) return false;
        }
      }

      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const codeMatch = "code" in item && item.code?.toLowerCase().includes(q);
      const nameMatch = "name" in item && item.name?.toLowerCase().includes(q);
      const speciesMatch =
        "species" in item && item.species?.name?.toLowerCase().includes(q);
      return Boolean(codeMatch || nameMatch || speciesMatch);
    });

    // Sorting
    return result.sort((a, b) => {
      if (sort === "desc") {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      }
      if (sort === "asc") {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return da - db;
      }
      const nameA = getRecordDisplayName(a).toLowerCase();
      const nameB = getRecordDisplayName(b).toLowerCase();
      if (sort === "alpha-asc") return nameA.localeCompare(nameB);
      if (sort === "alpha-desc") return nameB.localeCompare(nameA);
      return 0;
    });
  }, [items, search, statusFilter, secondaryFilter, sort, resource]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter((i) => i.status === "published").length;
    const draft = items.filter((i) => i.status === "draft").length;
    const retired = items.filter((i) => i.status === "retired").length;
    return { total, published, draft, retired };
  }, [items]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const from = filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(filteredItems.length, currentPage * pageSize);

  // Selection handlers
  const allOnPageSelected =
    paginatedItems.length > 0 &&
    paginatedItems.every((item) => selected.has(getRecordKey(item)));
  const someOnPageSelected = paginatedItems.some((item) =>
    selected.has(getRecordKey(item)),
  );

  const toggleAllOnPage = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const item of paginatedItems) {
        const key = getRecordKey(item);
        if (checked) {
          next.add(key);
        } else {
          next.delete(key);
        }
      }
      return next;
    });
  };

  const toggleOne = (key: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  // Handlers
  const handlePublish = async (record: BlueprintRecord) => {
    try {
      const idOrUuid = record.uuid || record.id;
      const res = await fetch(`/api/admin/blueprints/${resource}/${idOrUuid}/publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        throw new Error(data.message || "Failed to publish definition.");
      }
      setItems((prev) =>
        prev.map((i) =>
          getRecordKey(i) === getRecordKey(record) ? { ...i, status: "published" as const } : i,
        ),
      );
      toast.success(`${config.singular} has been published and manifest compiled.`);
      setPublishTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error publishing.");
    }
  };

  const handleClone = async (record: BlueprintRecord) => {
    try {
      const idOrUuid = record.uuid || record.id;
      const res = await fetch(`/api/admin/blueprints/${resource}/${idOrUuid}/clone`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        throw new Error(data.message || "Failed to clone definition.");
      }
      if (data.data) {
        setItems((prev) => [data.data, ...prev]);
      }
      toast.success(`Created new draft version for ${record.code || "definition"}.`);
      setCloneTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error cloning.");
    }
  };

  const handleDelete = async (record: BlueprintRecord) => {
    try {
      const idOrUuid = record.uuid || record.id;
      const res = await fetch(`/api/admin/blueprints/${resource}/${idOrUuid}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        throw new Error(data.message || "Failed to delete definition.");
      }
      if (record.status === "draft") {
        setItems((prev) => prev.filter((i) => getRecordKey(i) !== getRecordKey(record)));
      } else {
        setItems((prev) =>
          prev.map((i) =>
            getRecordKey(i) === getRecordKey(record) ? { ...i, status: "retired" as const } : i,
          ),
        );
      }
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(getRecordKey(record));
        return next;
      });
      toast.success(`${config.singular} status updated.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting.");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const keys = Array.from(selected);
      for (const key of keys) {
        await fetch(`/api/admin/blueprints/${resource}/${key}`, {
          method: "DELETE",
        });
      }
      setItems((prev) =>
        prev
          .map((item) => {
            const key = getRecordKey(item);
            if (selected.has(key)) {
              return item.status === "draft" ? null : { ...item, status: "retired" as const };
            }
            return item;
          })
          .filter(Boolean) as BlueprintRecord[],
      );
      setSelected(new Set());
      setBulkDeleteOpen(false);
      toast.success(`Updated ${keys.length} records.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error performing bulk action.");
    }
  };

  const refreshItems = async () => {
    try {
      const res = await fetch(`/api/admin/blueprints/${resource}`);
      const data = await res.json();
      if (data?.data) {
        setItems(data.data);
      }
    } catch {
      // Silently catch background refresh errors
    }
  };

  const handleCreateSubmit = async () => {
    try {
      let payload: Record<string, unknown> = {};

      if (resource === "event-definitions") {
        payload = {
          name: createFormName,
          code: createFormCode,
          blueprintUuid: createBlueprintUuid,
          formUuid: createRegFormUuid,
          family: createFamily,
        };
      } else if (resource === "form-definitions") {
        payload = {
          code: createFormCode,
          purpose: createPurpose,
          version: 1,
        };
      } else if (resource === "lookup-sets") {
        payload = {
          name: createFormName,
          code: createFormCode,
          version: 1,
        };
      } else if (resource === "dynamic-species") {
        payload = {
          name: createFormName,
          code: createFormCode,
          defaultSubjectMode: createSubjectMode,
          groupDisplayName: createGroupLabel || null,
        };
      }

      const res = await fetch(`/api/admin/blueprints/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || result.status === false) {
        throw new Error(result.message || "Failed to create definition.");
      }

      if (result.data) {
        setItems((prev) => [result.data, ...prev]);
      }
      toast.success(`${config.singular} added in draft status.`);
      setIsCreateOpen(false);
      setCreateFormCode("");
      setCreateFormName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Validation error.");
    }
  };

  const SelectedSortIcon =
    SORT_OPTIONS.find((opt) => opt.value === sort)?.icon ?? ArrowDownWideNarrow;

  return (
    <div className="space-y-6">
      <DashboardHeader
        eyebrow="Configuration"
        parent="Blueprint Engine"
        parentHref="/dashboard/blueprints"
        title={config.title}
        description={config.description}

        actions={
          resource === "animal-blueprints" ? (
            <Button size="sm" asChild className="gap-1.5 font-semibold">
              <Link href="/dashboard/blueprints/animal-types-events">
                <Sparkles className="size-4" />
                Open Animal Type & Event Blueprints
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5 font-semibold"
            >
              <Plus className="size-4" />
              {config.createLabel}
            </Button>
          )
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard label={<>Total Records</>} value={<StatNumber value={stats.total} />} note={<>Catalog definitions registered</>} />

        <DashboardStatCard label={<>Published (Active)</>} value={<StatNumber value={stats.published} />} note={<>Synced to mobile offline manifests</>} />

        <DashboardStatCard label={<>Draft Versions</>} value={<StatNumber value={stats.draft} />} note={<>Under active schema configuration</>} />

        <DashboardStatCard label={<>Retired</>} value={<StatNumber value={stats.retired} />} note={<>Archived platform revisions</>} />
      </div>

      {/* Main Container Card matching Reference Resource Dashboard */}
      <TablePanel className="mt-4">
        {/* Filter and Action Header */}
        <TableToolbar>
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
              placeholder={config.searchPlaceholder}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            {selected.size > 0 ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" />
                Delete / Retire ({selected.size})
              </Button>
            ) : null}

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Filter by status"
                size="sm"
                className="h-8 w-auto min-w-[8.5rem] max-w-44 font-normal"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All statuses ({items.length})</SelectItem>
                <SelectItem value="published">Published ({stats.published})</SelectItem>
                <SelectItem value="draft">Drafts ({stats.draft})</SelectItem>
                <SelectItem value="retired">Retired ({stats.retired})</SelectItem>
              </SelectContent>
            </Select>

            {/* Secondary Category Filter */}
            {resource === "event-definitions" && (
              <Select
                value={secondaryFilter}
                onValueChange={(val) => {
                  setSecondaryFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Filter by family"
                  size="sm"
                  className="h-8 w-auto min-w-[8.5rem] max-w-44 font-normal"
                >
                  <SelectValue placeholder="Family" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Families</SelectItem>
                  <SelectItem value="health">Health & Vet</SelectItem>
                  <SelectItem value="reproduction">Reproduction</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="feeding">Feeding</SelectItem>
                  <SelectItem value="lifecycle">Lifecycle</SelectItem>
                </SelectContent>
              </Select>
            )}

            {resource === "form-definitions" && (
              <Select
                value={secondaryFilter}
                onValueChange={(val) => {
                  setSecondaryFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Filter by purpose"
                  size="sm"
                  className="h-8 w-auto min-w-[8.5rem] max-w-44 font-normal"
                >
                  <SelectValue placeholder="Purpose" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Purposes</SelectItem>
                  <SelectItem value="registration">Registration Forms</SelectItem>
                  <SelectItem value="event">Event Forms</SelectItem>
                </SelectContent>
              </Select>
            )}

            {resource === "dynamic-species" && (
              <Select
                value={secondaryFilter}
                onValueChange={(val) => {
                  setSecondaryFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Filter by mode"
                  size="sm"
                  className="h-8 w-auto min-w-[8.5rem] max-w-44 font-normal"
                >
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Subject Modes</SelectItem>
                  <SelectItem value="individual">Individual Animals</SelectItem>
                  <SelectItem value="group">Group / Herds</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Sort Select */}
            <Select
              value={sort}
              onValueChange={(val) => {
                setSort(val as SortOrder);
                setPage(1);
              }}
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
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Page Size Select */}
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
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TableToolbar>

        {/* Main Table or Empty Card */}
        {filteredItems.length === 0 ? (
          <div className="p-4">
            <EmptyCard
              icon={FileStack}
              title={
                search || statusFilter !== "all" || secondaryFilter !== "all"
                  ? `No matching ${config.title.toLowerCase()}`
                  : `No ${config.title.toLowerCase()} yet`
              }
              description={
                search || statusFilter !== "all" || secondaryFilter !== "all"
                  ? "Try adjusting your search query or filter options."
                  : `Get started by registering the first ${config.singular.toLowerCase()}.`
              }
              action={
                <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5 font-semibold">
                  <Plus className="size-4" />
                  {config.createLabel}
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    aria-label={`Select all ${config.title.toLowerCase()} on this page`}
                    checked={
                      allOnPageSelected
                        ? true
                        : someOnPageSelected
                        ? "indeterminate"
                        : false
                    }
                    onCheckedChange={(val) => toggleAllOnPage(val === true)}
                  />
                </TableHead>
                <TableHead className="w-14">#</TableHead>
                {config.columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                <TableHead className="w-24 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((record, index) => {
                const key = getRecordKey(record);
                const isSelected = selected.has(key);
                const isDraft = record.status === "draft";
                const displayName = getRecordDisplayName(record);

                return (
                  <TableRow
                    key={key}
                    data-state={isSelected ? "selected" : undefined}
                    className="transition hover:bg-muted/30"
                  >
                    <TableCell>
                      <Checkbox
                        aria-label={`Select ${displayName}`}
                        checked={isSelected}
                        onCheckedChange={(val) => toggleOne(key, val === true)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>

                    {/* Columns rendered according to active resource */}
                    {resource === "animal-blueprints" && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                              <Sparkles className="size-3.5" />
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">
                                {(record as AnimalBlueprintRecord).species?.name || "Standard Animal"}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {record.code}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                            {record.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {(record as AnimalBlueprintRecord).animal_type || "Cattle"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {getRecordVersion(record)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {(record as AnimalBlueprintRecord).events_count ?? 6} events
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.created_at?.slice(0, 10)}
                        </TableCell>
                      </>
                    )}

                    {resource === "event-definitions" && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                              <Activity className="size-3.5" />
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">
                                {(record as EventDefinitionRecord).name}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {record.code}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {(record as EventDefinitionRecord).blueprint?.code || "Universal"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {(record as EventDefinitionRecord).behavior_code || "Standard"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {(record as EventDefinitionRecord).family || "other"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                            {(record as EventDefinitionRecord).form?.code || "form_schema"}
                          </code>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.created_at?.slice(0, 10)}
                        </TableCell>
                      </>
                    )}

                    {resource === "form-definitions" && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-muted px-2 py-1 font-mono text-xs font-semibold text-foreground">
                              {record.code}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {getRecordVersion(record)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {(record as FormDefinitionRecord).purpose}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {(record as FormDefinitionRecord).schema_json?.sections?.length ?? 1} sections
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">EN, SW</span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.created_at?.slice(0, 10)}
                        </TableCell>
                      </>
                    )}

                    {resource === "lookup-sets" && (
                      <>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-foreground">
                              {(record as LookupSetRecord).name}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              {record.code}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                            {record.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {getRecordVersion(record)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {(record as LookupSetRecord).parent?.name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {(record as LookupSetRecord).options?.length ?? 0} choices
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.created_at?.slice(0, 10)}
                        </TableCell>
                      </>
                    )}

                    {resource === "dynamic-species" && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                              <Layers className="size-3.5" />
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">
                                {(record as DynamicSpeciesRecord).name}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {record.code}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                            {record.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {(record as DynamicSpeciesRecord).default_subject_mode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {(record as DynamicSpeciesRecord).group_display_name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {(record as DynamicSpeciesRecord).mobile_type_name ?? "Cattle"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {(record as DynamicSpeciesRecord).capabilities_json?.reproduction ?? "Live birth"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.created_at?.slice(0, 10)}
                        </TableCell>
                      </>
                    )}

                    {/* Action Dropdown Menu matching BreedDashboard */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${displayName}`}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem onClick={() => setSelectedRecord(record)}>
                            <Eye className="size-4 text-muted-foreground" />
                            View details
                          </DropdownMenuItem>

                          {resource === "animal-blueprints" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setIsCreateOpen(true);
                              }}
                              className="font-medium text-primary"
                            >
                              <Pencil className="size-4" />
                              Studio editor
                            </DropdownMenuItem>
                          )}

                          {(resource === "animal-blueprints" ||
                            resource === "form-definitions" ||
                            resource === "event-definitions") && (
                            <DropdownMenuItem
                              onClick={() => setPreviewRecord(record)}
                              className="font-medium"
                            >
                              <Sparkles className="size-4 text-amber-500" />
                              Preview schema
                            </DropdownMenuItem>
                          )}

                          {isDraft && (
                            <DropdownMenuItem
                              onClick={() => setPublishTarget(record)}
                              className="text-emerald-600"
                            >
                              <Send className="size-4" />
                              Publish definition
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem onClick={() => setCloneTarget(record)}>
                            <Copy className="size-4 text-muted-foreground" />
                            Clone new version
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(record)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-4" />
                            {isDraft ? "Delete draft" : "Retire definition"}
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

        {/* Standard Pagination Footer matching Reference Resource Dashboard */}
        <RecordPagination from={from} to={to} total={filteredItems.length} page={currentPage} pageCount={totalPages} onPageChange={setPage} />
      </TablePanel>

      {/* View Details Dialog */}
      {selectedRecord && (
        <CustomViewDetailsDialog
          open={Boolean(selectedRecord)}
          onOpenChange={(open) => !open && setSelectedRecord(null)}
          title={`${config.singular} Details`}
          description={`Full configuration schema and metadata for ${selectedRecord.code || "record"}.`}
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Code">{selectedRecord.code}</DetailItem>
              <DetailItem label="Version">{getRecordVersion(selectedRecord)}</DetailItem>
              <DetailItem label="Status">{selectedRecord.status}</DetailItem>
              <DetailItem label="UUID">{selectedRecord.uuid}</DetailItem>
              <DetailItem label="Created (EAT)">{reportDate(selectedRecord.created_at, true)}</DetailItem>
              <DetailItem label="Updated (EAT)">{reportDate(selectedRecord.updated_at, true)}</DetailItem>
            </div>

            {/* JSON Inspector for configuration schemas */}
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-foreground">Configuration Schema (JSON)</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Immutable Snapshot
                </Badge>
              </div>
              <pre className="max-h-60 overflow-auto rounded-lg bg-card p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                {JSON.stringify(
                  "schema_json" in selectedRecord
                    ? selectedRecord.schema_json
                    : "settings_json" in selectedRecord
                    ? selectedRecord.settings_json
                    : selectedRecord,
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        </CustomViewDetailsDialog>
      )}

      {/* Interactive Blueprint & Form Preview Modal */}
      {previewRecord && (
        <BlueprintPreviewModal
          open={Boolean(previewRecord)}
          onOpenChange={(open) => !open && setPreviewRecord(null)}
          blueprint={resource === "animal-blueprints" ? (previewRecord as AnimalBlueprintRecord) : undefined}
          eventRecord={resource === "event-definitions" ? (previewRecord as EventDefinitionRecord) : undefined}
          formSchema={resource === "form-definitions" ? (previewRecord as FormDefinitionRecord).schema_json : undefined}
        />
      )}

      {/* Publish Confirmation Alert Dialog */}
      <ConfirmationAlertDialog
        open={Boolean(publishTarget)}
        onOpenChange={(open) => !open && setPublishTarget(null)}
        title={`Publish ${config.singular}?`}
        description={`Publishing ${publishTarget?.code || "this definition"} will make it immutable, calculate its sha256 checksum, and sync it to the mobile offline manifest. Existing drafts will be archived.`}
        confirmLabel="Yes, publish definition"
        onConfirm={() => {
          if (publishTarget) return handlePublish(publishTarget);
        }}
      />

      {/* Clone Confirmation Dialog */}
      <ConfirmationAlertDialog
        open={Boolean(cloneTarget)}
        onOpenChange={(open) => !open && setCloneTarget(null)}
        title={`Clone ${config.singular}?`}
        description={`This will clone ${cloneTarget?.code || "this definition"} into a new draft version. You can customize the fields before publishing.`}
        confirmLabel="Create clone version"
        onConfirm={() => {
          if (cloneTarget) return handleClone(cloneTarget);
        }}
      />

      {/* Delete / Retire Confirmation Dialog */}
      <ConfirmationAlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget?.status === "draft" ? "Delete Draft Definition?" : "Retire Definition?"}
        description={
          deleteTarget?.status === "draft"
            ? "This will permanently delete this draft definition."
            : "Published definitions cannot be hard-deleted to preserve ledger history. It will be marked retired and prevented from new animal assignments."
        }
        confirmLabel={deleteTarget?.status === "draft" ? "Delete Draft" : "Retire Version"}
        destructive={true}
        onConfirm={() => {
          if (deleteTarget) return handleDelete(deleteTarget);
        }}
      />

      {/* Bulk Delete / Retire Confirmation Dialog */}
      <ConfirmationAlertDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete or Retire ${selected.size} ${selected.size === 1 ? config.singular : config.title.toLowerCase()}?`}
        description="Drafts will be deleted permanently. Published definitions will be retired to preserve historical integrity."
        confirmLabel="Confirm Bulk Action"
        destructive={true}
        onConfirm={handleBulkDelete}
      />

      {resource !== "animal-blueprints" && (
        <FormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          title={config.createLabel}
          description={`Add a new ${config.singular.toLowerCase()} to the Blueprint Engine.`}
          onSubmit={handleCreateSubmit}
          submitLabel="Create definition"
        >
          <div className="form-row-grid py-2">
            {resource === "event-definitions" && (
              <>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold">Event Name</label>
                  <Input
                    value={createFormName}
                    onChange={(e) => setCreateFormName(e.target.value)}
                    placeholder="e.g. Routine Weight Recording"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Event Code</label>
                  <Input
                    value={createFormCode}
                    onChange={(e) => setCreateFormCode(e.target.value)}
                    placeholder="e.g. record_weight"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold">Target Blueprint</label>
                  <Select value={createBlueprintUuid} onValueChange={setCreateBlueprintUuid}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select blueprint..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(initialOptions?.blueprints ?? [
                        { uuid: "bp-1", code: "cattle.standard", version: 1, status: "published" },
                        { uuid: "bp-2", code: "swine.standard", version: 1, status: "published" },
                      ]).map((bp) => (
                        <SelectItem key={bp.uuid} value={bp.uuid}>
                          {bp.code} (v{bp.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Event Family</label>
                  <Select value={createFamily} onValueChange={setCreateFamily}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Health & Vet</SelectItem>
                      <SelectItem value="reproduction">Breeding & Reproduction</SelectItem>
                      <SelectItem value="production">Production & Yield</SelectItem>
                      <SelectItem value="inventory">Inventory & Weight</SelectItem>
                      <SelectItem value="feeding">Feeding & Nutrition</SelectItem>
                      <SelectItem value="lifecycle">Lifecycle & Movement</SelectItem>
                      <SelectItem value="other">General Husbandry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold">Event Form Schema</label>
                  <Select value={createRegFormUuid} onValueChange={setCreateRegFormUuid}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select event form..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(initialOptions?.event_forms ?? [
                        { uuid: "ef-1", code: "form_weight_v1", version: 1, status: "published" },
                        { uuid: "ef-2", code: "form_feeding_v1", version: 1, status: "published" },
                      ]).map((f) => (
                        <SelectItem key={f.uuid} value={f.uuid}>
                          {f.code} (v{f.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {resource === "form-definitions" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Form Code</label>
                  <Input
                    value={createFormCode}
                    onChange={(e) => setCreateFormCode(e.target.value)}
                    placeholder="e.g. form_vaccination_v1"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Form Purpose</label>
                  <Select
                    value={createPurpose}
                    onValueChange={(val) => setCreatePurpose(val as "registration" | "event")}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registration">Animal Registration (Intake)</SelectItem>
                      <SelectItem value="event">Operational Event Record</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {resource === "lookup-sets" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Lookup Name</label>
                  <Input
                    value={createFormName}
                    onChange={(e) => setCreateFormName(e.target.value)}
                    placeholder="e.g. Disposal Reasons"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Lookup Code</label>
                  <Input
                    value={createFormCode}
                    onChange={(e) => setCreateFormCode(e.target.value)}
                    placeholder="e.g. disposal_reasons"
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </>
            )}

            {resource === "dynamic-species" && (
              <>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold">Species Name</label>
                  <Input
                    value={createFormName}
                    onChange={(e) => setCreateFormName(e.target.value)}
                    placeholder="e.g. Dairy Cattle (Ng'ombe wa Maziwa)"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Species Code</label>
                  <Input
                    value={createFormCode}
                    onChange={(e) => setCreateFormCode(e.target.value)}
                    placeholder="e.g. dairy_cattle"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Default Subject Mode</label>
                  <Select
                    value={createSubjectMode}
                    onValueChange={(val) => setCreateSubjectMode(val as "individual" | "group")}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Animals</SelectItem>
                      <SelectItem value="group">Group / Population (Flock, Pen)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Group Display Label (optional)</label>
                  <Input
                    value={createGroupLabel}
                    onChange={(e) => setCreateGroupLabel(e.target.value)}
                    placeholder="e.g. Herd, Flock, Pond, Pen"
                    className="h-9 text-xs"
                  />
                </div>
              </>
            )}
          </div>
        </FormDialog>
      )}
    </div>
  );
}
