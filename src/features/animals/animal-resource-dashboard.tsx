"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDownAZ,
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
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import type { FormStep } from "@/components/ui/form-stepper";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { TypedConfirmationAlertDialog } from "@/components/ui/typed-confirmation-alert-dialog";
import {
  ANIMAL_RESOLVED_NAME_FIELD_MAP,
  getAnimalResourceConfig,
} from "@/features/animals/animal-config";
import type {
  AnimalFormField,
  AnimalOptions,
  AnimalRecord,
  AnimalResource,
  AnimalResponse,
  AnimalTableColumn,
} from "@/features/animals/types";
import { authenticatedFetch } from "@/lib/auth/session";

type SortOrder = "desc" | "asc" | "alpha-asc" | "alpha-desc";
type ResourceTab = "all" | "deleted";

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

const COLOR_SWATCH_MAP: Record<string, string> = {
  black: "#18181b",
  white: "#ffffff",
  brown: "#78350f",
  red: "#ef4444",
  gray: "#6b7280",
  grey: "#6b7280",
  yellow: "#eab308",
  cream: "#fef08a",
  tan: "#d2b48c",
};

type Props = {
  resource: AnimalResource;
  initialRecords: AnimalResponse | null;
  initialOptions: AnimalOptions | null;
  initialError: string | null;
};

export function AnimalResourceDashboard({
  resource,
  initialRecords,
  initialOptions,
  initialError,
}: Props) {
  const config = getAnimalResourceConfig(resource);
  const [result, setResult] = useState<AnimalResponse | null>(initialRecords);
  const [options, setOptions] = useState<AnimalOptions>(initialOptions ?? {});
  const [loadError, setLoadError] = useState(initialError);
  const [loading, setLoading] = useState(!initialRecords);
  const [tab, setTab] = useState<ResourceTab>("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortOrder>("desc");
  const [page, setPage] = useState(initialRecords?.meta.currentPage ?? 1);
  const [pageSize, setPageSize] = useState(initialRecords?.meta.perPage ?? 10);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AnimalRecord | null>(null);
  const [viewing, setViewing] = useState<AnimalRecord | null>(null);
  const [deleting, setDeleting] = useState<AnimalRecord | null>(null);
  const [permanentDeleting, setPermanentDeleting] =
    useState<AnimalRecord | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPermanentDeleteOpen, setBulkPermanentDeleteOpen] = useState(false);
  const firstRequest = useRef(true);

  const isSoftDeletable = Boolean(config.softDeletable);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(pageSize),
      sort,
    });
    if (isSoftDeletable) {
      params.set("tab", tab);
    }
    if (query.trim()) params.set("search", query.trim());
    if (status !== "all") params.set("status", status);
    try {
      const response = await authenticatedFetch(
        `/api/admin/animals/${resource}?${params}`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload.message ?? `${config.title} could not be loaded.`,
        );
      }
      setResult(payload);
      setSelected(new Set());
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : `${config.title} could not be loaded.`,
      );
    } finally {
      setLoading(false);
    }
  }, [
    config.title,
    isSoftDeletable,
    page,
    pageSize,
    query,
    resource,
    sort,
    status,
    tab,
  ]);

  const loadOptions = useCallback(async () => {
    try {
      const response = await authenticatedFetch(
        `/api/admin/animals/${resource}/options`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (response.ok) setOptions(payload.data ?? {});
    } catch {
      // Existing options remain usable if refreshing option catalogs fails.
    }
  }, [resource]);

  useEffect(() => {
    if (firstRequest.current && initialRecords) {
      firstRequest.current = false;
      return;
    }
    const timer = window.setTimeout(() => void load(), query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [initialRecords, load, query]);

  const refresh = async () => {
    await Promise.all([load(), loadOptions()]);
  };

  const remove = async (force = false, targetRecord?: AnimalRecord | null) => {
    const target = targetRecord ?? (force ? permanentDeleting : deleting);
    if (!target) return;
    try {
      const suffix = force ? "?force=1" : "";
      const response = await authenticatedFetch(
        `/api/admin/animals/${resource}/${target.id}${suffix}`,
        { method: "DELETE" },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          payload?.message ??
            `${capitalize(config.singular)} could not be deleted.`,
        );
      }
      if (force) {
        setPermanentDeleting(null);
      } else {
        setDeleting(null);
      }
      toast.success(
        payload?.message ??
          (force
            ? `${capitalize(config.singular)} permanently deleted.`
            : `${capitalize(config.singular)} deleted.`),
      );
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `${capitalize(config.singular)} could not be deleted.`,
      );
    }
  };

  const restoreRecord = async (recordToRestore: AnimalRecord) => {
    try {
      const response = await authenticatedFetch(
        `/api/admin/animals/${resource}/${recordToRestore.id}?restore=1`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "restore" }),
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          payload?.message ??
            `${capitalize(config.singular)} could not be restored.`,
        );
      }
      toast.success(
        payload?.message ?? `${capitalize(config.singular)} restored.`,
      );
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `${capitalize(config.singular)} could not be restored.`,
      );
    }
  };

  const restoreBulk = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    let restoredCount = 0;
    let firstErrorMessage: string | null = null;

    for (const id of ids) {
      try {
        const response = await authenticatedFetch(
          `/api/admin/animals/${resource}/${id}?restore=1`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "restore" }),
          },
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          firstErrorMessage ??=
            payload?.message ??
            `${capitalize(config.singular)} could not be restored.`;
        } else {
          restoredCount += 1;
        }
      } catch (error) {
        firstErrorMessage ??=
          error instanceof Error ? error.message : "Bulk restore failed.";
      }
    }

    setSelected(new Set());
    if (restoredCount > 0) {
      toast.success(
        `Restored ${restoredCount} ${restoredCount === 1 ? config.singular : config.title.toLowerCase()}.`,
      );
    }
    if (firstErrorMessage) {
      toast.error(firstErrorMessage);
    }
    await refresh();
  };

  const removeBulk = async (force = false) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    let deletedCount = 0;
    let firstErrorMessage: string | null = null;
    const suffix = force ? "?force=1" : "";

    for (const id of ids) {
      try {
        const response = await authenticatedFetch(
          `/api/admin/animals/${resource}/${id}${suffix}`,
          { method: "DELETE" },
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          firstErrorMessage ??=
            payload?.message ??
            `${capitalize(config.singular)} could not be deleted.`;
        } else {
          deletedCount += 1;
        }
      } catch (error) {
        firstErrorMessage ??=
          error instanceof Error ? error.message : "Bulk delete failed.";
      }
    }

    if (force) {
      setBulkPermanentDeleteOpen(false);
    } else {
      setBulkDeleteOpen(false);
    }
    setSelected(new Set());
    if (deletedCount > 0) {
      toast.success(
        force
          ? `Permanently deleted ${deletedCount} ${deletedCount === 1 ? config.singular : config.title.toLowerCase()}.`
          : `Deleted ${deletedCount} ${deletedCount === 1 ? config.singular : config.title.toLowerCase()}.`,
      );
    }
    if (firstErrorMessage) {
      toast.error(firstErrorMessage);
    }
    await refresh();
  };

  const rows = result?.data ?? [];
  const hasActiveFilters = query.trim().length > 0 || status !== "all";
  const selectedSortOption =
    SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];
  const SelectedSortIcon = selectedSortOption.icon;

  const toggleAllOnPage = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(rows.map((record) => record.id)));
    } else {
      setSelected(new Set());
    }
  };

  const toggleOne = (id: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardHeader
        parent="Animals & Livestock"
        parentHref="/dashboard/animals"
        title={config.title}
        description={config.description}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus />
            {config.createLabel}
          </Button>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {(result?.meta.stats ?? []).map((stat) => (
          <Card key={stat.label} className="gap-1 py-4 shadow-none">
            <CardContent className="px-4">
              <p className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              {loading && !result ? (
                <Skeleton className="my-1 h-8 w-16" />
              ) : (
                <p className="mt-2 text-2xl font-bold">
                  <StatNumber value={stat.value} />
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
        {!result &&
          Array.from({ length: 3 }, (_, index) => (
            <Card key={index} className="gap-1 py-4 shadow-none">
              <CardContent className="px-4">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="my-2 h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
      </div>

      <Card className="mt-4 gap-0 overflow-hidden py-0 shadow-none">
        {isSoftDeletable ? (
          <div className="border-b px-4 pt-2">
            <Tabs
              value={tab}
              onValueChange={(value) => {
                setTab(value as ResourceTab);
                setPage(1);
                setSelected(new Set());
              }}
            >
              <TabsList variant="line">
                <TabsTrigger value="all">
                  All {config.title.toLowerCase()}
                </TabsTrigger>
                <TabsTrigger value="deleted">
                  Deleted
                  {(result?.meta.deletedCount ?? 0) > 0 ? (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 h-4 px-1.5 text-[10px] tabular-nums"
                    >
                      {result?.meta.deletedCount}
                    </Badge>
                  ) : null}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
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
            {selected.size > 0 ? (
              isSoftDeletable && tab === "deleted" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void restoreBulk()}
                  >
                    <RotateCcw />
                    Restore ({selected.size})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkPermanentDeleteOpen(true)}
                  >
                    <Trash2 />
                    Delete permanently ({selected.size})
                  </Button>
                </>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 />
                  Delete ({selected.size})
                </Button>
              )
            ) : null}

            {config.statusOptions && (!isSoftDeletable || tab === "all") ? (
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
            ) : null}

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
        </div>

        {loadError ? (
          <div className="p-4">
            <EmptyCard
              icon={Database}
              title={`Could not load ${config.title.toLowerCase()}`}
              description={loadError}
              action={
                <Button variant="outline" size="sm" onClick={() => void load()}>
                  <RefreshCw />
                  Try again
                </Button>
              }
            />
          </div>
        ) : (
          <AnimalTable
            config={config}
            rows={rows}
            loading={loading}
            from={result?.meta.from ?? 1}
            selected={selected}
            tab={isSoftDeletable ? tab : "all"}
            hasActiveFilters={hasActiveFilters}
            onToggleAll={toggleAllOnPage}
            onToggleOne={toggleOne}
            onCreate={() => setCreating(true)}
            onView={setViewing}
            onEdit={setEditing}
            onDelete={setDeleting}
            onRestore={(record) => void restoreRecord(record)}
            onPermanentDelete={setPermanentDeleting}
          />
        )}

        {result && !loadError ? (
          <div className="flex flex-col gap-3 border-t px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {result.meta.from ?? 0}–{result.meta.to ?? 0} of{" "}
              {result.meta.total.toLocaleString("en-TZ")}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </Button>
              <span className="px-2 tabular-nums">
                Page {result.meta.currentPage} of {result.meta.lastPage}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page >= result.meta.lastPage || loading}
                onClick={() => setPage((value) => value + 1)}
                aria-label="Next page"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <AnimalFormDialog
        key={`create-${resource}-${creating}`}
        open={creating}
        onOpenChange={setCreating}
        resource={resource}
        options={options}
        onSaved={refresh}
      />
      {editing ? (
        <AnimalFormDialog
          key={`${resource}-${editing.id}`}
          open={Boolean(editing)}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          resource={resource}
          options={options}
          record={editing}
          onSaved={refresh}
        />
      ) : null}
      <AnimalDetailsDialog
        resource={resource}
        record={viewing}
        options={options}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        onEdit={(record) => {
          setViewing(null);
          setEditing(record);
        }}
      />

      {isSoftDeletable ? (
        <>
          <ConfirmationAlertDialog
            open={Boolean(deleting)}
            onOpenChange={(open) => {
              if (!open) setDeleting(null);
            }}
            title={`Delete ${config.singular}?`}
            description={
              <>
                This will move{" "}
                <strong>
                  {deleting
                    ? recordName(deleting, config.columns)
                    : config.singular}
                </strong>{" "}
                to the <strong>Deleted</strong> tab. You can restore it or
                permanently delete it later.
              </>
            }
            confirmLabel="Delete"
            destructive
            icon={<Trash2 className="size-5" />}
            onConfirm={() => void remove(false)}
          />
          <TypedConfirmationAlertDialog
            open={Boolean(permanentDeleting)}
            onOpenChange={(open) => {
              if (!open) setPermanentDeleting(null);
            }}
            title={`Permanently delete ${config.singular}?`}
            description={
              <>
                <strong>
                  {permanentDeleting
                    ? recordName(permanentDeleting, config.columns)
                    : config.singular}
                </strong>{" "}
                will be permanently removed and cannot be undone.
              </>
            }
            icon={<Trash2 className="size-5" />}
            confirmationText="delete"
            confirmLabel="Delete permanently"
            onConfirm={() => void remove(true)}
          />
          <ConfirmationAlertDialog
            open={bulkDeleteOpen}
            onOpenChange={setBulkDeleteOpen}
            title={`Delete ${selected.size} ${selected.size === 1 ? config.singular : config.title.toLowerCase()}?`}
            description={`Selected ${config.title.toLowerCase()} will be moved to the Deleted tab. You can restore them later.`}
            confirmLabel="Delete selected"
            destructive
            icon={<Trash2 className="size-5" />}
            onConfirm={() => void removeBulk(false)}
          />
          <TypedConfirmationAlertDialog
            open={bulkPermanentDeleteOpen}
            onOpenChange={setBulkPermanentDeleteOpen}
            title={`Permanently delete ${selected.size} ${selected.size === 1 ? config.singular : config.title.toLowerCase()}?`}
            description={`This will permanently delete ${selected.size} ${selected.size === 1 ? config.singular : config.title.toLowerCase()} and cannot be undone.`}
            icon={<Trash2 className="size-5" />}
            confirmationText="delete"
            confirmLabel="Delete permanently"
            onConfirm={() => void removeBulk(true)}
          />
        </>
      ) : (
        <>
          <TypedConfirmationAlertDialog
            open={Boolean(deleting)}
            onOpenChange={(open) => {
              if (!open) setDeleting(null);
            }}
            title={`Delete ${config.singular}?`}
            description={
              <>
                This permanently removes{" "}
                <strong>
                  {deleting
                    ? recordName(deleting, config.columns)
                    : config.singular}
                </strong>
                .
              </>
            }
            icon={<Trash2 className="size-5" />}
            confirmationText="delete"
            confirmLabel="Delete permanently"
            onConfirm={() => void remove(false)}
          />
          <ConfirmationAlertDialog
            open={bulkDeleteOpen}
            onOpenChange={setBulkDeleteOpen}
            title={`Delete ${selected.size} ${selected.size === 1 ? config.singular : config.title.toLowerCase()}?`}
            description="Selected records will be permanently removed."
            confirmLabel="Delete selected"
            destructive
            icon={<Trash2 className="size-5" />}
            onConfirm={() => void removeBulk(false)}
          />
        </>
      )}
    </div>
  );
}

function AnimalTable({
  config,
  rows,
  loading,
  from,
  selected,
  tab,
  hasActiveFilters,
  onToggleAll,
  onToggleOne,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
}: {
  config: ReturnType<typeof getAnimalResourceConfig>;
  rows: AnimalRecord[];
  loading: boolean;
  from: number;
  selected: Set<number>;
  tab: ResourceTab;
  hasActiveFilters: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onCreate: () => void;
  onView: (record: AnimalRecord) => void;
  onEdit: (record: AnimalRecord) => void;
  onDelete: (record: AnimalRecord) => void;
  onRestore: (record: AnimalRecord) => void;
  onPermanentDelete: (record: AnimalRecord) => void;
}) {
  if (loading && rows.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-12" />
            <TableHead className="w-14">#</TableHead>
            {config.columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }, (_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="size-4 rounded-[4px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-6" />
              </TableCell>
              {config.columns.map((column, cellIndex) => (
                <TableCell key={column.key}>
                  <Skeleton
                    className={cellIndex === 0 ? "h-4 w-36" : "h-4 w-24"}
                  />
                </TableCell>
              ))}
              <TableCell>
                <Skeleton className="size-7 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="p-4">
        <EmptyCard
          icon={tab === "deleted" ? Trash2 : Database}
          title={
            tab === "deleted"
              ? `No deleted ${config.title.toLowerCase()}`
              : hasActiveFilters
                ? `No matching ${config.title.toLowerCase()}`
                : `No ${config.title.toLowerCase()} yet`
          }
          description={
            tab === "deleted"
              ? `Deleted ${config.title.toLowerCase()} will appear here so you can restore them or permanently delete them.`
              : hasActiveFilters
                ? "Try adjusting your search query or status filter."
                : `Get started by registering the first ${config.singular}.`
          }
          action={
            tab === "all" && !hasActiveFilters ? (
              <Button size="sm" onClick={onCreate}>
                <Plus />
                {config.createLabel}
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  const allSelected =
    rows.length > 0 && rows.every((record) => selected.has(record.id));
  const someSelected = rows.some((record) => selected.has(record.id));

  return (
    <div
      className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-12">
              <Checkbox
                aria-label={`Select all ${config.title.toLowerCase()} on this page`}
                checked={
                  allSelected ? true : someSelected ? "indeterminate" : false
                }
                onCheckedChange={(value) => onToggleAll(value === true)}
              />
            </TableHead>
            <TableHead className="w-14">#</TableHead>
            {config.columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((record, index) => {
            const isSelected = selected.has(record.id);
            const displayName = recordName(record, config.columns);

            return (
              <TableRow
                key={record.id}
                data-state={isSelected ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${displayName}`}
                    checked={isSelected}
                    onCheckedChange={(value) =>
                      onToggleOne(record.id, value === true)
                    }
                  />
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {from + index}
                </TableCell>
                {config.columns.map((column) => (
                  <TableCell key={column.key}>
                    {renderAnimalCell(record, column)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${displayName}`}
                      >
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onView(record)}>
                        <Eye />
                        View details
                      </DropdownMenuItem>
                      {tab === "deleted" ? (
                        <>
                          <DropdownMenuItem onSelect={() => onRestore(record)}>
                            <RotateCcw />
                            Restore
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            destructive
                            onSelect={() => onPermanentDelete(record)}
                          >
                            <Trash2 />
                            Delete permanently
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem onSelect={() => onEdit(record)}>
                            <Pencil />
                            Update {config.singular}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            destructive
                            onSelect={() => onDelete(record)}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function AnimalFormDialog({
  open,
  onOpenChange,
  resource,
  options,
  record,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: AnimalResource;
  options: AnimalOptions;
  record?: AnimalRecord;
  onSaved: () => Promise<void>;
}) {
  const config = getAnimalResourceConfig(resource);
  const editing = Boolean(record);
  const allFields = useMemo(
    () => config.sections.flatMap((section) => section.fields),
    [config.sections],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>(() =>
    initialFormValues(allFields, record),
  );
  const [checkboxValues, setCheckboxValues] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        allFields
          .filter((field) => field.type === "checkbox")
          .map((field) => [
            field.name,
            Boolean(record?.[field.name] ?? field.defaultValue ?? false),
          ]),
      ),
  );

  const handleFieldChange = useCallback(
    (fieldName: string, nextValue: string) => {
      setValues((previous) => {
        const next = { ...previous, [fieldName]: nextValue };
        const clearChildren = (parentName: string) => {
          for (const candidate of allFields) {
            if (candidate.parentField === parentName && next[candidate.name]) {
              next[candidate.name] = "";
              clearChildren(candidate.name);
            }
          }
        };
        clearChildren(fieldName);
        return next;
      });
    },
    [allFields],
  );

  const validateFields = useCallback(
    (fieldsToCheck: AnimalFormField[]) => {
      const nextErrors: Record<string, string> = {};
      for (const field of fieldsToCheck) {
        if (field.type === "checkbox") continue;
        const value = String(values[field.name] ?? "").trim();
        if (field.required && value === "") {
          nextErrors[field.name] = `${field.label} is required.`;
        }
      }
      if (Object.keys(nextErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...nextErrors }));
        toast.error(Object.values(nextErrors)[0]);
        return false;
      }
      return true;
    },
    [values],
  );

  const validateStep = useCallback(
    (stepIndex: number) => {
      const section = config.sections[stepIndex];
      if (!section) return true;
      return validateFields(section.fields);
    },
    [config.sections, validateFields],
  );

  const steps: FormStep[] = useMemo(
    () =>
      config.sections.map((section, index) => ({
        id: `${resource}-step-${index}`,
        title: section.title,
        description: section.description,
        fieldNames: section.fields.map((field) => field.name),
        fieldCount: section.fields.length,
        content: (
          <div className="form-row-grid">
            {section.fields.map((field) => (
              <AnimalField
                key={field.name}
                field={field}
                record={record}
                options={options}
                values={values}
                onChange={handleFieldChange}
                checkboxValue={Boolean(checkboxValues[field.name])}
                onCheckboxChange={(checked) =>
                  setCheckboxValues((prev) => ({
                    ...prev,
                    [field.name]: checked,
                  }))
                }
                error={errors[field.name]}
              />
            ))}
          </div>
        ),
      })),
    [
      checkboxValues,
      config.sections,
      errors,
      handleFieldChange,
      options,
      record,
      resource,
      values,
    ],
  );

  const submit = async () => {
    setErrors({});
    if (!validateFields(allFields)) {
      return false;
    }

    const payload: Record<string, unknown> = {};
    for (const field of allFields) {
      if (field.type === "checkbox") {
        payload[field.name] = Boolean(checkboxValues[field.name]);
        continue;
      }
      const value = String(values[field.name] ?? "").trim();
      payload[field.name] =
        value === "" ? null : field.type === "number" ? Number(value) : value;
    }

    try {
      const response = await authenticatedFetch(
        editing
          ? `/api/admin/animals/${resource}/${record!.id}`
          : `/api/admin/animals/${resource}`,
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) setErrors(normalizeErrors(result.errors));
        throw new Error(
          result.message ??
            firstError(result.errors) ??
            `${capitalize(config.singular)} could not be saved.`,
        );
      }
      toast.success(
        result.message ??
          `${capitalize(config.singular)} ${editing ? "updated" : "created"}.`,
      );
      await onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `${capitalize(config.singular)} could not be saved.`,
      );
      return false;
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={editing ? `Update ${config.singular}` : config.createLabel}
      description={`Complete the ${config.singular} details below.`}
      submitLabel={editing ? "Save changes" : config.createLabel}
      steps={steps}
      errors={errors}
      allowStepJump={editing}
      onValidateStep={(stepIndex) => validateStep(stepIndex)}
      onSubmit={submit}
    />
  );
}

function AnimalField({
  field,
  record,
  options,
  values,
  onChange,
  checkboxValue,
  onCheckboxChange,
  error,
}: {
  field: AnimalFormField;
  record?: AnimalRecord;
  options: AnimalOptions;
  values: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
  checkboxValue: boolean;
  onCheckboxChange: (checked: boolean) => void;
  error?: string;
}) {
  const id = `animal-${field.name}-${record?.id ?? "new"}`;
  const required = Boolean(field.required);
  const current = values[field.name] ?? "";
  const parentValue = field.parentField ? (values[field.parentField] ?? "") : "";
  const rawChoices = field.options ?? options[field.optionsKey ?? ""] ?? [];
  const choices = rawChoices.filter(
    (choice) =>
      choice.value === current ||
      !field.parentField ||
      !choice.parent ||
      !parentValue ||
      choice.parent === parentValue,
  );
  const className = field.full ? "sm:col-span-2" : undefined;

  if (field.type === "checkbox") {
    return (
      <Field className={className}>
        <label
          htmlFor={id}
          className="flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/20 p-3"
        >
          <Checkbox
            id={id}
            name={field.name}
            checked={checkboxValue}
            onCheckedChange={(checked) => onCheckboxChange(checked === true)}
          />
          <span>
            <span className="block text-sm font-medium">{field.label}</span>
            {field.helper ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {field.helper}
              </span>
            ) : null}
          </span>
        </label>
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  const resolvedNameKey = ANIMAL_RESOLVED_NAME_FIELD_MAP[field.name];
  const fallbackLabel =
    resolvedNameKey && record?.[resolvedNameKey]
      ? String(record[resolvedNameKey])
      : null;
  const hasCurrentInChoices = choices.some(
    (choice) => choice.value === current,
  );

  const selectOptions = [
    ...(!required
      ? [{ value: "", label: `Select ${field.label.toLowerCase()}` }]
      : []),
    ...(current !== "" && !hasCurrentInChoices && fallbackLabel
      ? [{ value: current, label: fallbackLabel }]
      : []),
    ...choices.map((choice) => ({
      value: choice.value,
      label: choice.description
        ? `${choice.label} · ${choice.description}`
        : choice.label,
    })),
  ];

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id} required={required}>
        {field.label}
      </FieldLabel>
      {field.type === "select" ? (
        <FormSelect
          id={id}
          value={current}
          onValueChange={(value) => onChange(field.name, value)}
          options={selectOptions}
          searchable={
            field.optionsKey === "farms" || selectOptions.length > 5
          }
          placeholder={`Select ${field.label.toLowerCase()}`}
          invalid={Boolean(error)}
        />
      ) : (
        <Input
          id={id}
          name={field.name}
          value={current}
          onChange={(event) => onChange(field.name, event.target.value)}
          type={field.type ?? "text"}
          required={required}
          placeholder={field.placeholder}
          step={field.step}
          aria-invalid={Boolean(error)}
        />
      )}
      {field.helper ? <FieldDescription>{field.helper}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function AnimalDetailsDialog({
  resource,
  record,
  options,
  onOpenChange,
  onEdit,
}: {
  resource: AnimalResource;
  record: AnimalRecord | null;
  options: AnimalOptions;
  onOpenChange: (open: boolean) => void;
  onEdit: (record: AnimalRecord) => void;
}) {
  const config = getAnimalResourceConfig(resource);
  const fields = config.sections
    .flatMap((section) => section.fields)
    .filter((field) => field.name !== "uuid");

  return (
    <CustomViewDetailsDialog
      open={Boolean(record)}
      onOpenChange={onOpenChange}
      title={`${capitalize(config.singular)} details`}
      description="Registration, classification and lifecycle information."
      actions={
        record ? (
          <Button type="button" onClick={() => onEdit(record)}>
            <Pencil />
            Update {config.singular}
          </Button>
        ) : null
      }
    >
      {record ? (
        <div className="form-row-grid">
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.full ? "sm:col-span-2" : undefined}
            >
              <DetailItem label={field.label}>
                {displayAnimalFieldValue(record, field, options)}
              </DetailItem>
            </div>
          ))}
          <DetailItem label="Created At">
            {formatDate(record.createdAt)}
          </DetailItem>
          <DetailItem label="Updated At">
            {formatDate(record.updatedAt)}
          </DetailItem>
        </div>
      ) : null}
    </CustomViewDetailsDialog>
  );
}

function renderAnimalCell(record: AnimalRecord, column: AnimalTableColumn) {
  const value = record[column.key];
  if (column.type === "status") {
    return <StatusBadge status={stringValue(value)} />;
  }
  if (column.type === "boolean") {
    return <StatusBadge status={Boolean(value)} />;
  }
  if (column.type === "color") {
    return renderColorSwatch(value);
  }
  if (column.type === "badge") {
    if (!value || value === "—") {
      return <span className="text-muted-foreground">—</span>;
    }
    return (
      <Badge variant="secondary" className="font-mono">
        {String(value)}
      </Badge>
    );
  }
  if (column.type === "count") {
    return (
      <span className="font-medium tabular-nums">
        {Number(value ?? 0).toLocaleString("en-TZ")}
      </span>
    );
  }
  const content =
    column.type === "date" ? formatDate(value) : humanValue(value);
  if (column.primary || column.secondaryKey) {
    return (
      <div>
        <p className="font-medium text-foreground">{content}</p>
        {column.secondaryKey && record[column.secondaryKey] ? (
          <p className="text-xs text-muted-foreground">
            {humanValue(record[column.secondaryKey])}
          </p>
        ) : null}
      </div>
    );
  }
  return <span className="text-muted-foreground">{content}</span>;
}

function displayAnimalFieldValue(
  record: AnimalRecord,
  field: AnimalFormField,
  options: AnimalOptions,
) {
  if (field.type === "checkbox") {
    return <StatusBadge status={Boolean(record[field.name])} />;
  }
  if (field.name === "status" || field.name === "lifecycle_status") {
    return <StatusBadge status={stringValue(record[field.name])} />;
  }
  if (field.name === "primaryColor" || field.name === "secondaryColor") {
    return renderColorSwatch(record[field.name]);
  }

  const resolvedKey = ANIMAL_RESOLVED_NAME_FIELD_MAP[field.name];
  if (resolvedKey) {
    const resolvedVal = record[resolvedKey];
    if (
      resolvedVal !== null &&
      resolvedVal !== undefined &&
      String(resolvedVal).trim() !== ""
    ) {
      return String(resolvedVal);
    }
    return "—";
  }

  const value = record[field.name];
  const choice = (
    field.options ??
    options[field.optionsKey ?? ""] ??
    []
  ).find((item) => item.value === stringValue(value));
  if (choice) return choice.label;
  if (field.type === "date") return formatDate(value);
  return humanValue(value);
}

function renderColorSwatch(value: unknown) {
  const raw = stringValue(value).trim();
  if (!raw) return <span className="text-muted-foreground">—</span>;
  const key = raw.toLowerCase();
  const swatch = COLOR_SWATCH_MAP[key] ?? "#9ca3af";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-muted/30 px-2.5 py-0.5 text-xs font-medium">
      <span
        className="size-3 rounded-full border border-black/25 shadow-2xs"
        style={{ backgroundColor: swatch }}
      />
      <span>{capitalize(raw)}</span>
    </span>
  );
}

function initialFormValues(fields: AnimalFormField[], record?: AnimalRecord) {
  return Object.fromEntries(
    fields.map((field) => [
      field.name,
      stringValue(record?.[field.name] ?? field.defaultValue ?? ""),
    ]),
  );
}

function recordName(record: AnimalRecord, columns: AnimalTableColumn[]) {
  const primary = columns.find((column) => column.primary) ?? columns[0];
  return humanValue(record[primary.key]);
}

function humanValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const raw = String(value);
  if (raw.includes("-") && /\d/.test(raw)) return raw;
  const text = raw
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function stringValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("en-TZ", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
}

function normalizeErrors(errors: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [
      key,
      Array.isArray(value) ? String(value[0]) : String(value),
    ]),
  );
}

function firstError(errors: unknown) {
  if (!errors || typeof errors !== "object") return null;
  const first = Object.values(errors)[0];
  return Array.isArray(first)
    ? String(first[0])
    : first
      ? String(first)
      : null;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

