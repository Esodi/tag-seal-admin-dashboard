"use client";

import { RecordPagination } from "@/components/ui/record-pagination";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Eye, FileText, LoaderCircle, MoreVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
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
import { Field, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
import { authenticatedFetch } from "@/lib/auth/session";
import {
  at,
  careerConfig,
  dateText,
  label,
  PAGE_SIZE_OPTIONS,
  reviewStatuses,
  SORT_OPTIONS,
  text,
  type CareerColumn,
  type SortOrder,
} from "./resource-config";
import type {
  CareerOptions,
  CareerRecord,
  CareerResource,
  CareerResponse,
} from "./types";

export function CareerResourceDashboard({
  resource,
  initialData,
  initialOptions,
  initialError,
  parent,
  parentHref,
}: {
  resource: CareerResource;
  initialData: CareerResponse | null;
  initialOptions: CareerOptions | null;
  initialError: string | null;
  parent?: string;
  parentHref?: string;
}) {
  const config = careerConfig[resource];
  const [result, setResult] = useState<CareerResponse | null>(initialData);
  const [options, setOptions] = useState<CareerOptions | null>(initialOptions);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(!initialData);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [group, setGroup] = useState("all");
  const [sort, setSort] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [viewing, setViewing] = useState<CareerRecord | null>(null);
  const [viewLoading, setViewLoading] = useState<number | null>(null);
  const [editing, setEditing] = useState<CareerRecord | "new" | null>(null);
  const [deleting, setDeleting] = useState<CareerRecord | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const firstRequest = useRef(true);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(pageSize),
        sort: sort.startsWith("alpha")
          ? sort === "alpha-asc"
            ? "asc"
            : "desc"
          : sort,
        status,
      });
      if (query.trim()) params.set("search", query.trim());
      if (group !== "all") {
        params.set(resource === "memberships" ? "feature" : "group", group);
      }

      try {
        const response = await authenticatedFetch(
          `/api/admin/career/${resource}?${params}`,
          { signal, cache: "no-store" },
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message ?? "Records could not be loaded.");
        }
        if (!signal?.aborted) {
          setResult(payload as CareerResponse);
          setSelected(new Set());
        }
      } catch (err) {
        if (!signal?.aborted) {
          setError(
            err instanceof Error ? err.message : "Records could not be loaded.",
          );
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [group, page, pageSize, query, resource, sort, status],
  );

  useEffect(() => {
    if (firstRequest.current && initialData) {
      firstRequest.current = false;
      return;
    }
    firstRequest.current = false;
    const controller = new AbortController();
    const timer = setTimeout(() => void load(controller.signal), 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [load, initialData, query]);

  useEffect(() => {
    if (initialOptions) return;
    const controller = new AbortController();
    void authenticatedFetch(`/api/admin/career/${resource}/options`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.ok) {
          const payload = await response.json();
          setOptions(payload.data);
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [resource, initialOptions]);

  const refresh = async () => {
    await load();
  };

  const removeRecord = async () => {
    if (!deleting) return;
    try {
      const response = await authenticatedFetch(
        `/api/admin/career/${resource}/${deleting.id}`,
        { method: "DELETE" },
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "The record could not be deleted.");
      }
      toast.success(payload.message ?? "Record deleted.");
      setDeleting(null);
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "The record could not be deleted.",
      );
    }
  };

  const removeBulk = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    let deletedCount = 0;
    let firstError: string | null = null;

    for (const id of ids) {
      try {
        const response = await authenticatedFetch(
          `/api/admin/career/${resource}/${id}`,
          { method: "DELETE" },
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          firstError ??= payload?.message ?? "Failed to delete record.";
        } else {
          deletedCount += 1;
        }
      } catch (err) {
        firstError ??=
          err instanceof Error ? err.message : "Bulk delete failed.";
      }
    }

    setBulkDeleteOpen(false);
    setSelected(new Set());
    if (deletedCount > 0) {
      toast.success(
        `Deleted ${deletedCount} ${deletedCount === 1 ? config.singular : `${config.singular}s`}.`,
      );
    }
    if (firstError) {
      toast.error(firstError);
    }
    await refresh();
  };

  const view = async (record: CareerRecord) => {
    setViewLoading(record.id);
    try {
      const response = await authenticatedFetch(
        `/api/admin/career/${resource}/${record.id}`,
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "The record could not be loaded.");
      }
      setViewing(payload.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "The record could not be loaded.",
      );
    } finally {
      setViewLoading(null);
    }
  };

  const canEdit = (record: CareerRecord) =>
    resource === "jobs" ||
    resource === "job-seekers" ||
    ["job-types", "job-options"].includes(resource) ||
    (resource === "applications" &&
      !record.onboarding &&
      reviewStatuses.includes(record.status));

  const rows = result?.data ?? [];
  const allOnPageSelected =
    rows.length > 0 && rows.every((row) => selected.has(row.id));

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        rows.forEach((r) => next.delete(r.id));
      } else {
        rows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  const toggleRow = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedSortOption =
    SORT_OPTIONS.find((s) => s.value === sort) ?? SORT_OPTIONS[0];
  const SelectedSortIcon = selectedSortOption.icon;

  const from = result?.meta ? (page - 1) * pageSize + 1 : 0;
  const to = result?.meta
    ? Math.min(page * pageSize, result.meta.total)
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        parent={parent ?? "Career & Jobs"}
        parentHref={parentHref ?? "/dashboard/career"}
        title={config.title}
        description={config.description}
        actions={
          config.create ? (
            <Button onClick={() => setEditing("new")}>
              <Plus />
              {config.create}
            </Button>
          ) : undefined
        }
      />

      {/* Summary Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {result?.meta.stats.map((stat) => (
          <DashboardStatCard key={stat.label} label={<>{stat.label}</>} value={<StatNumber value={stat.value} />} note={<>{stat.note}</>} loading={loading && !result} />
        ))}
        {!result &&
          Array.from({ length: 3 }, (_, index) => (
            <DashboardStatCard key={index} loading />
          ))}
      </div>

      {/* Main Table Card */}
      <TablePanel className="mt-4">
        {/* Filter Toolbar (without Refresh button) */}
        <TableToolbar>
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="pl-9"
              placeholder={config.searchPlaceholder}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            {/* Bulk Delete Button when items selected */}
            {selected.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete ({selected.size})
              </Button>
            )}

            {/* Context Group Filter for memberships or job-options */}
            {["memberships", "job-options"].includes(resource) && (
              <Select
                value={group}
                onValueChange={(value) => {
                  setGroup(value);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Filter by group"
                  size="sm"
                  className="h-8 w-auto min-w-[8.5rem] max-w-48 font-normal"
                >
                  <SelectValue
                    placeholder={
                      resource === "memberships" ? "Membership" : "Field group"
                    }
                  />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">
                    {resource === "memberships"
                      ? "All memberships"
                      : "All form fields"}
                  </SelectItem>
                  {(resource === "memberships"
                    ? options?.features ?? []
                    : options?.groups ?? []
                  ).map((val) => (
                    <SelectItem key={val} value={val}>
                      {label(val)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Status Filter */}
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
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
                <SelectItem value="all">All statuses</SelectItem>
                {config.statusOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Selector */}
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value as SortOrder);
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
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Page Size Selector */}
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
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

        {/* Load Error Banner */}
        {error ? (
          <div className="p-4">
            <EmptyCard
              icon={FileText}
              title={`Could not load ${config.title.toLowerCase()}`}
              description={error}
              action={
                <Button variant="outline" size="sm" onClick={() => void load()}>
                  Try again
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={toggleAllOnPage}
                    aria-label="Select all on this page"
                  />
                </TableHead>
                <TableHead className="w-12 text-muted-foreground font-medium">
                  #
                </TableHead>
                {config.columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                <TableHead className="w-24 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }, (_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-6" />
                      </TableCell>
                      {config.columns.map((column) => (
                        <TableCell key={column.key}>
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Skeleton className="h-6 w-6 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : rows.map((record, index) => {
                    const isSelected = selected.has(record.id);
                    return (
                      <TableRow
                        key={record.id}
                        data-state={isSelected ? "selected" : undefined}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRow(record.id)}
                            aria-label={`Select ${record.name || record.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums text-xs">
                          {(page - 1) * pageSize + index + 1}
                        </TableCell>
                        {config.columns.map((column) => (
                          <TableCell
                            key={column.key}
                            className={column.primary ? "min-w-48" : undefined}
                          >
                            <Cell record={record} column={column} />
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={viewLoading !== null}
                                aria-label={`Actions for ${record.name || record.id}`}
                              >
                                {viewLoading === record.id ? (
                                  <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="size-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => void view(record)}
                              >
                                <Eye className="size-4" />
                                View details
                              </DropdownMenuItem>
                              {canEdit(record) && (
                                <DropdownMenuItem
                                  onClick={() => setEditing(record)}
                                >
                                  <Pencil className="size-4" />
                                  {resource === "applications"
                                    ? "Review status"
                                    : "Edit"}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => setDeleting(record)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={config.columns.length + 3}
                    className="p-8 text-center"
                  >
                    <EmptyCard
                      icon={FileText}
                      title={
                        query || status !== "all" || group !== "all"
                          ? "No matching records found"
                          : `No ${config.title.toLowerCase()} recorded yet`
                      }
                      description={
                        query || status !== "all" || group !== "all"
                          ? "Try adjusting your search criteria or resetting the active filters."
                          : "New records will be listed here as soon as they are submitted or registered."
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination Footer */}
        {result && !error ? (
          <RecordPagination from={from} to={to} total={result.meta.total} page={result.meta.currentPage} pageCount={result.meta.lastPage} onPageChange={setPage} disabled={loading} />
        ) : null}
      </TablePanel>

      {/* Details View Dialog */}
      <CustomViewDetailsDialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        title={viewing?.name || config.singular}
        description={`${config.singular} #${viewing?.id ?? ""}`}
        actions={
          viewing && canEdit(viewing) ? (
            <Button
              onClick={() => {
                setEditing(viewing);
                setViewing(null);
              }}
            >
              <Pencil className="size-4" />
              {resource === "applications" ? "Review status" : "Edit record"}
            </Button>
          ) : undefined
        }
      >
        {viewing && <RecordDetails record={viewing} resource={resource} />}
      </CustomViewDetailsDialog>

      {/* Edit / Create Form Dialog */}
      {editing && resource === "workers" ? (
        <PendingWorkerForm
          options={options}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      ) : (
        editing && (
          <RecordForm
            key={editing === "new" ? "new" : editing.id}
            record={editing}
            resource={resource}
            options={options}
            onClose={() => setEditing(null)}
            onSaved={async () => {
              setEditing(null);
              await refresh();
            }}
          />
        )
      )}

      {/* Delete Confirmation Alert Dialog (Single record) */}
      <ConfirmationAlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${config.singular}?`}
        description={
          <>
            Are you sure you want to delete{" "}
            <strong>{deleting?.name || `#${deleting?.id}`}</strong>? This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={removeRecord}
      />

      {/* Bulk Delete Confirmation Alert Dialog */}
      <ConfirmationAlertDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selected.size} ${selected.size === 1 ? config.singular : `${config.singular}s`}?`}
        description={
          <>
            Are you sure you want to delete the <strong>{selected.size}</strong>{" "}
            selected {selected.size === 1 ? config.singular : `${config.singular}s`}?
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete selected"
        destructive
        onConfirm={removeBulk}
      />
    </div>
  );
}

function Cell({
  record,
  column,
}: {
  record: CareerRecord;
  column: CareerColumn;
}) {
  const value = at(record, column.key);
  const secondary = column.secondaryKey
    ? at(record, column.secondaryKey)
    : undefined;

  if (column.primary) {
    return (
      <div>
        <span className="font-semibold text-foreground">
          {text(value)}
        </span>
        {secondary ? (
          <span className="block text-xs font-normal text-muted-foreground">
            {text(secondary)}
          </span>
        ) : null}
      </div>
    );
  }

  if (column.kind === "date") {
    return (
      <span className="whitespace-nowrap text-muted-foreground text-xs">
        {dateText(value)}
      </span>
    );
  }

  if (column.kind === "status") {
    return value ? (
      <StatusBadge status={label(String(value))} />
    ) : (
      <span className="text-muted-foreground text-xs">Not started</span>
    );
  }

  if (column.kind === "verified") {
    return <StatusBadge status={Boolean(value)} />;
  }

  if (column.kind === "capacity") {
    return (
      <span className="whitespace-nowrap tabular-nums text-xs font-medium">
        {text(record.positions_count)} total
        <span className="block text-[11px] font-normal text-muted-foreground">
          {text(record.occupied_positions)} filled ·{" "}
          {text(record.available_positions)} open
        </span>
      </span>
    );
  }

  if (column.kind === "badge") {
    return (
      <Badge variant="outline" className="text-xs font-normal">
        {label(text(value))}
      </Badge>
    );
  }

  return (
    <div>
      <span className="block max-w-64 whitespace-normal break-words text-xs">
        {text(value)}
      </span>
      {secondary ? (
        <span className="block text-[11px] text-muted-foreground">
          {text(secondary)}
        </span>
      ) : null}
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function FieldsGrid({
  object,
  keys,
}: {
  object: Record<string, unknown>;
  keys: string[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {keys.map((key) => (
        <DetailItem key={key} label={label(key)}>
          {text(object[key])}
        </DetailItem>
      ))}
    </div>
  );
}

function AttachmentCard({
  document,
}: {
  document: Record<string, unknown>;
}) {
  const fileName = text(document.fileName ?? document.title);
  const encoded = document.fileData ?? document.data;
  const supported = /\.(pdf|png|jpe?g|webp|docx?)$/i.test(fileName);
  const available =
    typeof encoded === "string" && encoded.length > 0 && supported;
  const [opening, setOpening] = useState(false);

  function openFile() {
    if (!available || typeof encoded !== "string") return;
    setOpening(true);
    try {
      const bytes = Uint8Array.from(
        atob(encoded.replace(/^data:[^;]+;base64,/, "")),
        (char) => char.charCodeAt(0),
      );
      const extension = fileName.split(".").pop()?.toLowerCase();
      const mime =
        extension === "pdf"
          ? "application/pdf"
          : ["png", "jpg", "jpeg", "webp"].includes(extension ?? "")
            ? `image/${extension === "jpg" ? "jpeg" : extension}`
            : "application/octet-stream";
      const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener";
      if (mime === "application/octet-stream") anchor.download = fileName;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      toast.error("The stored document could not be opened.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
      <FileText className="size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {text(document.title ?? fileName)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {fileName}
          {!available && " · File content unavailable"}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={!available || opening}
        onClick={openFile}
      >
        Open
      </Button>
    </div>
  );
}

function ProfileDetails({
  profile,
}: {
  profile: Record<string, unknown>;
}) {
  const documents: Record<string, unknown>[] = [];
  const addDoc = (value: unknown) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const doc = value as Record<string, unknown>;
      if (doc.type === "recommendation") return;
      const existing = documents.find(
        (item) =>
          (item.id && item.id === doc.id) ||
          (item.type === "cv" &&
            doc.type === "cv" &&
            item.fileData &&
            item.fileData === doc.fileData),
      );
      if (existing) {
        if (!existing.fileData && doc.fileData) existing.fileData = doc.fileData;
        return;
      }
      documents.push(doc);
    }
  };

  if (profile.resumeFileName) {
    addDoc({
      id: "cv-resume",
      type: "cv",
      title: "CV / Resume Document",
      fileName: profile.resumeFileName,
      fileData: profile.resumeData,
    });
  }

  const qualifications = Array.isArray(profile.qualifications)
    ? (profile.qualifications as Record<string, unknown>[])
    : [];

  for (const qualification of qualifications) {
    if (qualification.certificateFile) {
      addDoc({
        id: `qualification-${qualification.id}`,
        type: "certificate",
        title: qualification.field || "Qualification Certificate",
        fileName: qualification.certificateFile,
        fileData: qualification.certificateData,
      });
    }
  }

  if (Array.isArray(profile.documents)) profile.documents.forEach(addDoc);

  return (
    <div className="space-y-4">
      <DetailSection title="Personal details">
        <FieldsGrid
          object={profile}
          keys={[
            "fullName",
            "phone",
            "email",
            "gender",
            "dateOfBirth",
            "nidaNumber",
          ]}
        />
      </DetailSection>

      <DetailSection title="Location">
        <FieldsGrid
          object={profile}
          keys={["country", "region", "district", "ward", "villageOrStreet"]}
        />
      </DetailSection>

      <DetailSection title="Skills & capabilities">
        <p className="text-sm leading-relaxed text-foreground">
          {text(profile.skills)}
        </p>
      </DetailSection>

      <DetailSection title="Educational qualifications">
        {qualifications.length ? (
          <div className="space-y-3">
            {qualifications.map((qualification, i) => (
              <div
                key={String(qualification.id ?? i)}
                className="rounded-lg border bg-muted/10 p-3"
              >
                <FieldsGrid
                  object={qualification}
                  keys={["level", "field", "institution", "year"]}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No formal qualifications submitted.
          </p>
        )}
      </DetailSection>

      <DetailSection title="Work experience">
        {Array.isArray(profile.experiences) && profile.experiences.length ? (
          <div className="space-y-3">
            {(profile.experiences as Record<string, unknown>[]).map(
              (experience, i) => (
                <div
                  key={String(experience.id ?? i)}
                  className="rounded-lg border bg-muted/10 p-3"
                >
                  <FieldsGrid
                    object={experience}
                    keys={[
                      "farmName",
                      "role",
                      "startYear",
                      "endYear",
                      "region",
                      "description",
                    ]}
                  />
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No prior experience submitted.
          </p>
        )}
      </DetailSection>

      <DetailSection title="CV & supporting attachments">
        {documents.length ? (
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <AttachmentCard
                key={`${text(doc.id)}-${index}`}
                document={doc}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No document attachments submitted.
          </p>
        )}
      </DetailSection>
    </div>
  );
}

function RecordDetails({
  record,
  resource,
}: {
  record: CareerRecord;
  resource: CareerResource;
}) {
  return (
    <div className="space-y-5">
      {/* Top badges */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={label(record.status)} />
        {record.overdue === true && (
          <Badge variant="destructive">Overdue action</Badge>
        )}
        {record.phone_verified !== undefined && (
          <StatusBadge status={Boolean(record.phone_verified)} />
        )}
      </div>

      {resource === "jobs" && (
        <div className="space-y-4">
          <DetailSection title="Vacancy overview">
            <FieldsGrid
              object={record}
              keys={[
                "employer_name",
                "employer_identification",
                "category",
                "farm_name",
                "positions_count",
                "occupied_positions",
                "available_positions",
                "applications_count",
                "closes_at",
              ]}
            />
          </DetailSection>

          <DetailSection title="Employment details">
            <FieldsGrid
              object={record.details ?? {}}
              keys={[
                "jobNature",
                "workingModel",
                "experienceLevel",
                "salaryAmount",
                "startsAt",
                "country",
                "region",
                "district",
              ]}
            />
            {Boolean(record.details?.description) && (
              <div className="mt-3 border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Job description
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {text(record.details?.description)}
                </p>
              </div>
            )}
          </DetailSection>

          {["requirements", "responsibilities", "benefits"].map(
            (key) =>
              Array.isArray(record.details?.[key]) &&
              (record.details![key] as unknown[]).length > 0 && (
                <DetailSection key={key} title={label(key)}>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm">
                    {(record.details![key] as unknown[]).map((val, idx) => (
                      <li key={idx}>{text(val)}</li>
                    ))}
                  </ul>
                </DetailSection>
              ),
          )}

          {record.details?.allowsCoverLetter === true && (
            <DetailSection title="Application letter requirement">
              <p className="text-sm">
                Candidates must address their application letter to:{" "}
                <strong>{text(record.details.applicationLetterAddress)}</strong>
              </p>
            </DetailSection>
          )}
        </div>
      )}

      {resource === "applications" && (
        <div className="space-y-4">
          <DetailSection title="Application overview">
            <FieldsGrid
              object={record}
              keys={[
                "candidate_name",
                "candidate_phone",
                "candidate_nida",
                "candidate_location",
                "job_title",
                "job_category",
                "employer_name",
                "farm_name",
                "created_at",
                "joining_status",
              ]}
            />
          </DetailSection>

          <ProfileDetails profile={record.applicant_snapshot ?? {}} />

          {record.onboarding && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Joining process started</p>
                <p className="text-xs text-muted-foreground">
                  Status: {label(record.onboarding.status)}
                </p>
              </div>
              <Link
                href="/dashboard/career/onboardings"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Open joining registry →
              </Link>
            </div>
          )}
        </div>
      )}

      {resource === "job-seekers" && (
        <div className="space-y-4">
          <DetailSection title="Candidate summary">
            <FieldsGrid
              object={record}
              keys={[
                "candidate_name",
                "candidate_phone",
                "candidate_nida",
                "preferred_role",
                "candidate_location",
                "candidate_gender",
                "account_name",
                "created_at",
              ]}
            />
          </DetailSection>
          <ProfileDetails profile={record.details ?? {}} />
        </div>
      )}

      {["employers", "memberships"].includes(resource) && (
        <div className="space-y-4">
          <DetailSection title="Account & membership">
            <FieldsGrid
              object={record}
              keys={[
                "account_name",
                "phone",
                "feature",
                "organization_name",
                "farmer_id",
                "registered_farms",
                "account_role",
              ]}
            />
          </DetailSection>

          {record.details && (
            <DetailSection title="Registration details">
              <FieldsGrid
                object={record.details}
                keys={[
                  "name",
                  "type",
                  "phone",
                  "countryId",
                  "regionId",
                  "districtId",
                ]}
              />
            </DetailSection>
          )}

          <DetailSection title="Associated feature memberships">
            <div className="flex flex-wrap gap-2">
              {record.memberships?.map((membership) => (
                <Badge key={membership.id} variant="outline" className="px-2.5 py-1">
                  {label(membership.feature)}
                  {membership.farmer_id
                    ? ` · Farmer #${membership.farmer_id}`
                    : ""}
                </Badge>
              ))}
            </div>
          </DetailSection>
        </div>
      )}

      {["workers", "onboardings"].includes(resource) && (
        <div className="space-y-4">
          <DetailSection title="Assignment overview">
            <FieldsGrid
              object={record}
              keys={[
                "farm_name",
                "role_title",
                "employer_name",
                "source",
                "phone",
                "access_status",
                "sent_at",
                "activated_at",
                "arrived_at",
                "ended_at",
                "termination_reason",
              ]}
            />
          </DetailSection>

          <DetailSection title="Joining terms">
            <FieldsGrid
              object={record.terms ?? {}}
              keys={[
                "startDate",
                "responseDate",
                "reportingName",
                "reportingPhone",
                "instructions",
              ]}
            />
          </DetailSection>

          <DetailSection title="Applicant confirmation">
            {record.response ? (
              <FieldsGrid
                object={record.response}
                keys={[
                  "accept",
                  "availability",
                  "arrivalDate",
                  "phone",
                  "message",
                ]}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                No confirmation response recorded yet.
              </p>
            )}
          </DetailSection>

          <DetailSection title="Approved operational duties">
            <div className="flex flex-wrap gap-2">
              {record.permissions && record.permissions.length > 0 ? (
                record.permissions.map((perm) => (
                  <Badge key={perm} variant="outline" className="px-2.5 py-1">
                    {label(perm)}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  No specific duty modules granted yet.
                </span>
              )}
            </div>
          </DetailSection>

          <DetailSection title="Employment history">
            {record.history && record.history.length > 0 ? (
              <div className="space-y-2">
                {record.history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/20 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.role_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {dateText(item.activated_at)} – {dateText(item.ended_at)}
                        {item.termination_reason
                          ? ` · ${item.termination_reason}`
                          : ""}
                      </p>
                    </div>
                    <StatusBadge status={label(item.status)} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No prior employment assignments recorded.
              </p>
            )}
          </DetailSection>
        </div>
      )}

      {["job-types", "job-options"].includes(resource) && (
        <DetailSection title="Catalog item">
          <FieldsGrid
            object={record}
            keys={[
              "name_en",
              "name_sw",
              "code",
              ...(resource === "job-options" ? ["group"] : []),
              "created_at",
              "updated_at",
            ]}
          />
        </DetailSection>
      )}
    </div>
  );
}

function RecordForm({
  record,
  resource,
  options,
  onClose,
  onSaved,
}: {
  record: CareerRecord | "new";
  resource: CareerResource;
  options: CareerOptions | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const initial: Record<string, unknown> = record === "new" ? {} : record;
  const initialDetails = (initial.details as Record<string, unknown>) ?? {};
  const [values, setValues] = useState<Record<string, string>>({
    code: text(initial.code) === "—" ? "" : text(initial.code),
    name_en: text(initial.name_en) === "—" ? "" : text(initial.name_en),
    name_sw: text(initial.name_sw) === "—" ? "" : text(initial.name_sw),
    group: text(initial.group) === "—" ? "" : text(initial.group),
    positions_count: String(initial.positions_count ?? 1),
    closes_at:
      typeof initial.closes_at === "string"
        ? initial.closes_at.slice(0, 10)
        : "",
    status: String(initial.status ?? "submitted"),
    preferredRole: text(initialDetails.preferredRole ?? initial.preferred_role) === "—" ? "" : text(initialDetails.preferredRole ?? initial.preferred_role),
    region: text(initialDetails.region ?? initial.candidate_location) === "—" ? "" : text(initialDetails.region ?? initial.candidate_location),
  });
  const [active, setActive] = useState(
    initial.is_active !== false && initial.is_active !== 0,
  );
  const [closed, setClosed] = useState(Boolean(initial.closed));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    let data: Record<string, unknown>;

    if (resource === "jobs") {
      data = {
        closed,
        closes_at: values.closes_at || null,
        positions_count: Number(values.positions_count),
      };
    } else if (resource === "applications") {
      data = { status: values.status };
    } else if (resource === "job-seekers") {
      data = {
        status: active ? "active" : "not-active",
        preferredRole: values.preferredRole.trim() || null,
        region: values.region.trim() || null,
      };
    } else {
      data = {
        code: values.code.trim(),
        name_en: values.name_en.trim(),
        name_sw: values.name_sw.trim(),
        sort_order: 0,
        is_active: active,
        ...(resource === "job-options" ? { group: values.group } : {}),
      };
    }

    try {
      const response = await authenticatedFetch(
        `/api/admin/career/${resource}${record === "new" ? "" : `/${record.id}`}`,
        {
          method: record === "new" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      const payload = await response.json();
      if (!response.ok) {
        if (payload.errors) {
          setErrors(
            Object.fromEntries(
              Object.entries(payload.errors as Record<string, string[]>).map(
                ([k, v]) => [k, v[0]],
              ),
            ),
          );
        }
        throw new Error(payload.message ?? "The record could not be saved.");
      }
      toast.success(record === "new" ? "Record created." : "Changes saved.");
      await onSaved();
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "The record could not be saved.",
      );
      return false;
    }
  }

  const fields =
    resource === "jobs"
      ? ["positions_count", "closes_at"]
      : resource === "applications"
        ? []
        : resource === "job-seekers"
          ? ["preferredRole", "region"]
          : ["name_en", "name_sw", "code"];

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${record === "new" ? "Add" : "Edit"} ${careerConfig[resource].singular.toLowerCase()}`}
      description={
        resource === "applications"
          ? "Update the review status. Offer acceptance and farm access are handled through the owner-approved joining workflow."
          : resource === "job-seekers"
            ? "Update candidate role specialization, regional location and profile state."
            : "Changes will be reflected across mobile and web platforms."
      }
      onSubmit={submit}
      submitLabel="Save changes"
      size="lg"
      fieldsClassName="sm:grid-cols-2"
      errors={errors}
    >
      {resource === "job-options" && (
        <Field>
          <FieldLabel htmlFor="group" required>
            Form field group
          </FieldLabel>
          <FormSelect
            id="group"
            value={values.group}
            onValueChange={(val) => set("group", val)}
            options={(options?.groups ?? []).map((val) => ({
              value: val,
              label: label(val),
            }))}
            placeholder="Select form field group"
          />
          <FieldError>{errors.group}</FieldError>
        </Field>
      )}

      {fields.map((key) => (
        <Field key={key}>
          <FieldLabel
            htmlFor={key}
            required={key !== "closes_at" && key !== "preferredRole" && key !== "region"}
          >
            {(
              {
                name_en: "English name / label",
                name_sw: "Swahili name / label",
                positions_count: "Number of positions",
                closes_at: "Closing date",
                code: "Code identifier",
                preferredRole: "Preferred role / specialization",
                region: "Region location",
              } as Record<string, string>
            )[key] ?? label(key)}
          </FieldLabel>
          <Input
            id={key}
            type={
              key === "closes_at"
                ? "date"
                : key === "positions_count"
                  ? "number"
                  : "text"
            }
            min={key === "positions_count" ? 1 : undefined}
            maxLength={255}
            required={key !== "closes_at" && key !== "preferredRole" && key !== "region"}
            value={values[key]}
            aria-invalid={Boolean(errors[key])}
            onChange={(event) => set(key, event.target.value)}
          />
          <FieldError>{errors[key]}</FieldError>
        </Field>
      ))}

      {resource === "applications" ? (
        <Field>
          <FieldLabel htmlFor="status" required>
            Review status
          </FieldLabel>
          <FormSelect
            id="status"
            value={values.status}
            onValueChange={(val) => set("status", val)}
            options={reviewStatuses.map((val) => ({
              value: val,
              label: label(val),
            }))}
          />
          <FieldError>{errors.status}</FieldError>
        </Field>
      ) : (
        <label className="sm:col-span-2 flex items-center gap-3 text-sm cursor-pointer select-none pt-2">
          <Checkbox
            checked={resource === "jobs" ? closed : active}
            onCheckedChange={(checked) =>
              resource === "jobs"
                ? setClosed(checked === true)
                : setActive(checked === true)
            }
          />
          {resource === "jobs"
            ? "Close this vacancy to new candidate applications"
            : resource === "job-seekers"
              ? "Active candidate profile"
              : "Active — available in candidate selection forms"}
        </label>
      )}
    </FormDialog>
  );
}

function PendingWorkerForm({
  options,
  onClose,
  onSaved,
}: {
  options: CareerOptions | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [requestUuid] = useState(() => crypto.randomUUID());
  const today = new Date().toISOString().slice(0, 10);
  const [values, setValues] = useState<Record<string, string>>({
    farmUuid: "",
    name: "",
    phone: "",
    roleTitle: "",
    startDate: today,
    responseDate: today,
    reportingName: "",
    reportingPhone: "",
    instructions: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const renderField = (
    key: string,
    title: string,
    type = "text",
    required = true,
  ) => (
    <Field key={key} className={key === "instructions" || key === "roleTitle" ? "sm:col-span-2" : undefined}>
      <FieldLabel htmlFor={key} required={required}>
        {title}
      </FieldLabel>
      <Input
        id={key}
        value={values[key]}
        type={type}
        required={required}
        maxLength={key === "instructions" ? 3000 : 255}
        onChange={(event) => set(key, event.target.value)}
        aria-invalid={Boolean(errors[key])}
      />
      <FieldError>{errors[key]}</FieldError>
    </Field>
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await authenticatedFetch("/api/admin/career/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestUuid,
          farmUuid: values.farmUuid,
          name: values.name.trim(),
          phone: values.phone.trim(),
          roleTitle: values.roleTitle.trim(),
          terms: {
            startDate: values.startDate,
            responseDate: values.responseDate,
            reportingName: values.reportingName.trim(),
            reportingPhone: values.reportingPhone.trim(),
            instructions: values.instructions.trim(),
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        if (payload.errors) {
          setErrors(
            Object.fromEntries(
              Object.entries(payload.errors as Record<string, string[]>).map(
                ([k, v]) => [k.replace("terms.", ""), v[0]],
              ),
            ),
          );
        }
        throw new Error(
          payload.message ?? "Pending worker registration could not be saved.",
        );
      }
      toast.success(
        "Pending worker registered. The farm owner will review and activate access.",
      );
      await onSaved();
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Pending worker registration could not be saved.",
      );
      return false;
    }
  }

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Register pending worker"
      description="Record a proposed worker placement. This creates a pending onboarding request; farm access and permissions still require explicit owner approval."
      submitLabel="Save pending registration"
      onSubmit={submit}
      errors={errors}
      size="xl"
      onValidateStep={(index) => {
        const names =
          index === 0
            ? ["farmUuid", "name", "phone", "roleTitle"]
            : ["startDate", "responseDate", "reportingName", "reportingPhone"];
        const next = Object.fromEntries(
          names
            .filter((k) => !values[k].trim())
            .map((k) => [k, "This field is required."]),
        );
        setErrors(next);
        return !Object.keys(next).length;
      }}
      steps={[
        {
          id: "worker",
          title: "Worker & farm",
          description: "Candidate contact and target farm",
          fieldCount: 4,
          fieldNames: ["farmUuid", "name", "phone", "roleTitle"],
          content: (
            <FieldGrid>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="farmUuid" required>
                  Registered farm
                </FieldLabel>
                <FormSelect
                  id="farmUuid"
                  value={values.farmUuid}
                  placeholder="Select a registered farm"
                  options={options?.farms ?? []}
                  onValueChange={(val) => set("farmUuid", val)}
                />
                <FieldError>{errors.farmUuid}</FieldError>
                {options?.farms?.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No active farms available with an unambiguous owner account.
                  </p>
                )}
              </Field>
              {renderField("name", "Worker full name")}
              {renderField("phone", "Worker phone number", "tel")}
              {renderField("roleTitle", "Assigned job role / title")}
            </FieldGrid>
          ),
        },
        {
          id: "joining",
          title: "Joining details",
          description: "Dates and supervisor contact",
          fieldCount: 5,
          fieldNames: [
            "startDate",
            "responseDate",
            "reportingName",
            "reportingPhone",
            "instructions",
          ],
          content: (
            <FieldGrid>
              {renderField("startDate", "Proposed start date", "date")}
              {renderField("responseDate", "Reply deadline", "date")}
              {renderField("reportingName", "Supervisor / Contact person")}
              {renderField("reportingPhone", "Contact phone", "tel")}
              {renderField(
                "instructions",
                "Arrival / Reporting instructions",
                "text",
                false,
              )}
              <p className="sm:col-span-2 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                The farm owner will be notified to review this proposal, select
                appropriate operational duties, and activate access.
              </p>
            </FieldGrid>
          ),
        },
      ]}
    />
  );
}
