"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Activity,
  ArrowDownWideNarrow,
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
  EVENT_RESOLVED_NAME_FIELD_MAP,
  getEventResourceConfig,
} from "@/features/events/event-config";
import type {
  EventFormField,
  EventOptions,
  EventRecordItem,
  EventResource,
  EventResponse,
  EventTableColumn,
} from "@/features/events/types";
import { authenticatedFetch } from "@/lib/auth/session";

type SortOrder = "desc" | "asc";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function formatNumber(value?: string | number | null, suffix = "") {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}${suffix}`;
  return `${num.toLocaleString("en-TZ")}${suffix}`;
}

export function EventResourceDashboard({
  resource,
  initialData,
  initialError,
}: {
  resource: EventResource;
  initialData: EventResponse | null;
  initialError?: string;
}) {
  const config = getEventResourceConfig(resource);
  const [data, setData] = useState<EventResponse | null>(initialData);
  const [error, setError] = useState(initialError);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "deleted">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [perPage, setPerPage] = useState(initialData?.meta.perPage ?? 15);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventRecordItem | null>(null);
  const [viewing, setViewing] = useState<EventRecordItem | null>(null);
  const [deleting, setDeleting] = useState<EventRecordItem | null>(null);
  const [restoring, setRestoring] = useState<EventRecordItem | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [options, setOptions] = useState<EventOptions>(
    initialData?.options ?? {},
  );
  const didMount = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadRecords = useCallback(
    async (
      nextPage = page,
      nextPerPage = perPage,
      nextSearch = debouncedSearch,
      nextStatus = statusFilter,
      nextSort = sortOrder,
      nextTab = activeTab,
    ) => {
      setLoading(true);
      setError(undefined);
      const params = new URLSearchParams({
        page: String(nextPage),
        per_page: String(nextPerPage),
        search: nextSearch,
        status: nextStatus,
        tab: nextTab,
        sort: nextSort === "asc" ? "oldest" : "latest",
      });
      try {
        const response = await authenticatedFetch(
          `/api/admin/events/${resource}?${params.toString()}`,
          { cache: "no-store" },
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.status === false) {
          throw new Error(
            payload?.message ?? `Unable to load ${config.title.toLowerCase()}.`,
          );
        }
        setData(payload.data);
        if (payload.data?.options) {
          setOptions(payload.data.options);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Unable to load ${config.title.toLowerCase()}.`,
        );
      } finally {
        setLoading(false);
      }
    },
    [
      activeTab,
      config.title,
      debouncedSearch,
      page,
      perPage,
      resource,
      sortOrder,
      statusFilter,
    ],
  );

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    void loadRecords(
      page,
      perPage,
      debouncedSearch,
      statusFilter,
      sortOrder,
      activeTab,
    );
  }, [
    activeTab,
    debouncedSearch,
    loadRecords,
    page,
    perPage,
    sortOrder,
    statusFilter,
  ]);

  const ensureOptions = useCallback(async () => {
    if (Object.keys(options).length > 0) return;
    try {
      const response = await authenticatedFetch(
        `/api/admin/events/${resource}/options`,
        { cache: "no-store" },
      );
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload?.data) {
        setOptions(payload.data);
      }
    } catch {
      // ignore
    }
  }, [options, resource]);

  const openCreate = () => {
    void ensureOptions();
    setEditing(null);
    setFieldErrors({});
    const today = new Date().toISOString().slice(0, 10);
    setFormValues({
      occurredAt: today,
      eventDate: today,
      recordStatus: "confirmed",
    });
    setFormOpen(true);
  };

  const openEdit = (record: EventRecordItem) => {
    void ensureOptions();
    setEditing(record);
    setFieldErrors({});
    const nextValues: Record<string, unknown> = { ...record };
    for (const dateKey of [
      "occurredAt",
      "eventDate",
      "labourStartedOn",
      "abortionDate",
      "nextAdministrationDate",
      "medicationDate",
      "nextMedicationDate",
      "followUpDate",
      "productionDate",
      "inseminationDate",
      "testDate",
      "startDate",
      "endDate",
      "transferDate",
    ]) {
      const raw = record[dateKey as keyof EventRecordItem];
      if (typeof raw === "string" && raw.length >= 10) {
        nextValues[dateKey] = raw.slice(0, 10);
      }
    }
    setFormValues(nextValues);
    setFormOpen(true);
  };

  const validateSection = useCallback(
    (sectionIndex: number) => {
      const section = config.formSections[sectionIndex];
      if (!section) return true;
      const errors: Record<string, string> = {};
      for (const field of section.fields) {
        if (field.required) {
          const val = formValues[field.name];
          if (val === undefined || val === null || String(val).trim() === "") {
            errors[field.name] = `${field.label} is required.`;
          }
        }
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errors }));
        toast.error(Object.values(errors)[0]);
        return false;
      }
      return true;
    },
    [config.formSections, formValues],
  );

  const handleSave = async (): Promise<boolean> => {
    for (let i = 0; i < config.formSections.length; i++) {
      if (!validateSection(i)) {
        return false;
      }
    }
    setFieldErrors({});
    try {
      const url = editing
        ? `/api/admin/events/${resource}/${editing.id}`
        : `/api/admin/events/${resource}`;
      const method = editing ? "PATCH" : "POST";
      const response = await authenticatedFetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formValues),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.status === false) {
        if (payload?.errors && typeof payload.errors === "object") {
          const mapped: Record<string, string> = {};
          for (const [key, messages] of Object.entries(payload.errors)) {
            if (Array.isArray(messages) && messages[0]) {
              mapped[key] = String(messages[0]);
            }
          }
          setFieldErrors(mapped);
        }
        throw new Error(
          payload?.message ?? `Unable to save ${config.singularLabel.toLowerCase()}.`,
        );
      }
      toast.success(
        editing
          ? `${config.singularLabel} updated successfully.`
          : `${config.singularLabel} recorded successfully.`,
      );
      setFormOpen(false);
      await loadRecords();
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Unable to save ${config.singularLabel.toLowerCase()}.`,
      );
      return false;
    }
  };

  const handleDelete = async (force = false) => {
    if (!deleting) return;
    try {
      const query = force ? "?force=1" : "";
      const response = await authenticatedFetch(
        `/api/admin/events/${resource}/${deleting.id}${query}`,
        { method: "DELETE" },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.status === false) {
        throw new Error(
          payload?.message ?? `Unable to delete ${config.singularLabel.toLowerCase()}.`,
        );
      }
      toast.success(
        payload?.message ?? `${config.singularLabel} deleted successfully.`,
      );
      setDeleting(null);
      await loadRecords();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Unable to delete ${config.singularLabel.toLowerCase()}.`,
      );
    }
  };

  const handleRestore = async () => {
    if (!restoring) return;
    try {
      const response = await authenticatedFetch(
        `/api/admin/events/${resource}/${restoring.id}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "restore" }),
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.status === false) {
        throw new Error(
          payload?.message ?? `Unable to restore ${config.singularLabel.toLowerCase()}.`,
        );
      }
      toast.success(
        payload?.message ?? `${config.singularLabel} restored successfully.`,
      );
      setRestoring(null);
      await loadRecords();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Unable to restore ${config.singularLabel.toLowerCase()}.`,
      );
    }
  };

  const renderField = useCallback(
    (field: EventFormField) => {
      const rawValue = formValues[field.name];
      const stringValue =
        rawValue === null || rawValue === undefined ? "" : String(rawValue);
      const errorText = fieldErrors[field.name];

      if (field.type === "select") {
        const list = field.optionsKey
          ? (options[field.optionsKey] ?? [])
          : (field.staticOptions ?? []);
        const resolvedKey = EVENT_RESOLVED_NAME_FIELD_MAP[field.name];
        const fallbackLabel =
          editing && resolvedKey
            ? String(editing[resolvedKey as keyof EventRecordItem] ?? "")
            : undefined;
        const baseOptions =
          stringValue &&
          fallbackLabel &&
          fallbackLabel !== "—" &&
          !list.some((opt) => opt.value === stringValue)
            ? [{ value: stringValue, label: fallbackLabel }, ...list]
            : list;

        const formattedOptions = baseOptions.map((opt) => ({
          value: opt.value,
          label: opt.description
            ? `${opt.label} · ${opt.description}`
            : opt.label,
        }));

        return (
          <Field key={field.name}>
            <FieldLabel required={field.required}>{field.label}</FieldLabel>
            <FormSelect
              value={stringValue}
              onValueChange={(next) => {
                setFormValues((prev) => ({ ...prev, [field.name]: next }));
                if (errorText) {
                  setFieldErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[field.name];
                    return copy;
                  });
                }
              }}
              options={formattedOptions}
              placeholder={
                field.placeholder ?? `Select ${field.label.toLowerCase()}`
              }
              searchable={
                field.optionsKey === "farms" ||
                field.optionsKey === "subjects" ||
                field.optionsKey === "livestock" ||
                formattedOptions.length > 5
              }
              invalid={Boolean(errorText)}
            />
            {field.description ? (
              <FieldDescription>{field.description}</FieldDescription>
            ) : null}
            <FieldError>{errorText}</FieldError>
          </Field>
        );
      }

      if (field.type === "textarea") {
        return (
          <Field key={field.name} className="sm:col-span-2">
            <FieldLabel required={field.required}>{field.label}</FieldLabel>
            <textarea
              rows={3}
              value={stringValue}
              placeholder={field.placeholder}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
            />
            <FieldError>{errorText}</FieldError>
          </Field>
        );
      }

      return (
        <Field key={field.name}>
          <FieldLabel required={field.required}>{field.label}</FieldLabel>
          <Input
            type={field.type}
            value={stringValue}
            placeholder={field.placeholder}
            aria-invalid={Boolean(errorText)}
            onChange={(e) => {
              setFormValues((prev) => ({
                ...prev,
                [field.name]: e.target.value,
              }));
              if (errorText) {
                setFieldErrors((prev) => {
                  const copy = { ...prev };
                  delete copy[field.name];
                  return copy;
                });
              }
            }}
          />
          {field.description ? (
            <FieldDescription>{field.description}</FieldDescription>
          ) : null}
          <FieldError>{errorText}</FieldError>
        </Field>
      );
    },
    [editing, fieldErrors, formValues, options],
  );

  const steps: FormStep[] = useMemo(
    () =>
      config.formSections.map((section, idx) => ({
        id: `${resource}-step-${idx}`,
        title: section.title,
        description: section.description,
        fieldNames: section.fields.map((f) => f.name),
        fieldCount: section.fields.length,
        content: (
          <div className="form-row-grid">
            {section.fields.map(renderField)}
          </div>
        ),
      })),
    [config.formSections, renderField, resource],
  );

  const renderCell = (record: EventRecordItem, column: EventTableColumn) => {
    switch (column.key) {
      case "subject":
        return (
          <div>
            <p className="font-semibold text-foreground">
              {record.subjectIdentifier ?? "—"}
            </p>
            {record.subjectLabel &&
            record.subjectLabel !== record.subjectIdentifier ? (
              <p className="text-xs text-muted-foreground">
                {record.subjectLabel}
              </p>
            ) : null}
          </div>
        );
      case "farm":
        return (
          <div>
            <p className="font-medium text-foreground">
              {record.farmName ?? "—"}
            </p>
            {record.farmerName && record.farmerName !== "—" ? (
              <p className="text-xs text-muted-foreground">
                Farmer: {record.farmerName}
              </p>
            ) : null}
          </div>
        );
      case "eventName":
        return (
          <Badge variant="outline" className="font-medium">
            {record.eventName ?? "—"}
          </Badge>
        );
      case "species":
        return (
          <Badge variant="secondary" className="font-medium">
            {record.speciesName ?? "—"}
          </Badge>
        );
      case "family":
        return (
          <Badge variant="outline" className="capitalize">
            {record.familyCode ?? "—"}
          </Badge>
        );
      case "payloadSummary":
        return (
          <span className="line-clamp-2 max-w-xs text-xs text-muted-foreground">
            {record.payloadSummary ?? "—"}
          </span>
        );
      case "occurredAt":
      case "eventDate":
      case "createdAt":
        return (
          <span className="text-xs text-muted-foreground">
            {formatDateTime(
              record[column.key as keyof EventRecordItem] as string | null,
            )}
          </span>
        );
      case "status": {
        const status = (record.recordStatus ?? "confirmed").toLowerCase();
        return (
          <StatusBadge
            status={status === "voided" ? "deleted" : status}
          />
        );
      }
      default: {
        const raw = record[column.key as keyof EventRecordItem];
        if (raw === null || raw === undefined || raw === "") {
          return <span className="text-muted-foreground">—</span>;
        }

        if (
          typeof raw === "string" &&
          /^\d{4}-\d{2}-\d{2}/.test(raw) &&
          raw.length <= 10
        ) {
          return (
            <span className="text-xs text-muted-foreground">
              {formatDate(raw)}
            </span>
          );
        }

        if (column.badge) {
          const badgeVariant =
            column.badge === "danger"
              ? "destructive"
              : column.badge === "success"
                ? "default"
                : "secondary";
          return (
            <Badge variant={badgeVariant} className="font-medium">
              {String(raw)}
              {column.unit ? ` ${column.unit}` : ""}
            </Badge>
          );
        }

        if (column.key === "price" || column.key === "salePrice") {
          return (
            <span className="font-semibold tabular-nums">
              TZS {formatNumber(raw as string | number)}
            </span>
          );
        }

        if (
          typeof raw === "number" ||
          (typeof raw === "string" &&
            !Number.isNaN(Number(raw)) &&
            Boolean(column.unit))
        ) {
          return (
            <span className="font-medium tabular-nums">
              {formatNumber(
                raw as string | number,
                column.unit ? ` ${column.unit}` : "",
              )}
            </span>
          );
        }

        return <span className="text-sm">{String(raw)}</span>;
      }
    }
  };

  const items = data?.items ?? [];
  const meta = data?.meta;
  const summary = data?.summary;
  const deletedCount = meta?.deletedCount ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        eyebrow="Events & Logs"
        title={config.title}
        description={config.description}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadRecords()}
              disabled={loading}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus />
              {config.primaryAction}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: config.stats.totalLabel,
            value: summary?.total ?? 0,
            note: config.stats.totalNote,
          },
          {
            label: config.stats.activeLabel,
            value: summary?.active ?? 0,
            note: config.stats.activeNote,
          },
          {
            label: config.stats.secondaryLabel,
            value: summary?.secondary ?? 0,
            note: config.stats.secondaryNote,
          },
          {
            label: config.stats.tertiaryLabel,
            value: summary?.tertiary ?? 0,
            note: config.stats.tertiaryNote,
          },
        ].map((card) => (
          <Card key={card.label} className="border-border/70 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {card.label}
                </p>
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Activity className="size-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight">
                <StatNumber value={card.value} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="space-y-4 p-5">
          {config.supportsTabs ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <Tabs
                value={activeTab}
                onValueChange={(next) => {
                  setActiveTab(next as "all" | "deleted");
                  setPage(1);
                }}
              >
                <TabsList>
                  <TabsTrigger value="all">
                    All
                    <Badge
                      variant="secondary"
                      className="ml-2 px-1.5 py-0 text-[10px]"
                    >
                      {summary?.total ?? 0}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="deleted">
                    Deleted
                    <Badge
                      variant="secondary"
                      className="ml-2 px-1.5 py-0 text-[10px]"
                    >
                      {deletedCount}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          ) : null}

          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={config.searchPlaceholder}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {config.supportsTabs && activeTab === "all" ? (
                <Select
                  value={statusFilter}
                  onValueChange={(next) => {
                    setStatusFilter(next);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                }
              >
                {sortOrder === "desc" ? (
                  <>
                    <ArrowDownWideNarrow className="size-4" />
                    Newest first
                  </>
                ) : (
                  <>
                    <ArrowUpNarrowWide className="size-4" />
                    Oldest first
                  </>
                )}
              </Button>

              <Select
                value={String(perPage)}
                onValueChange={(next) => {
                  setPerPage(Number(next));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[115px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 15, 25, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error ? (
            <EmptyCard
              icon={Database}
              title={`Unable to load ${config.title}`}
              description={error}
              action={
                <Button size="sm" onClick={() => void loadRecords()}>
                  <RefreshCw />
                  Try again
                </Button>
              }
            />
          ) : loading && !items.length ? (
            <div className="space-y-2.5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyCard
              icon={activeTab === "deleted" ? Trash2 : Database}
              title={
                activeTab === "deleted"
                  ? `No deleted ${config.title.toLowerCase()}`
                  : `No ${config.title.toLowerCase()} found`
              }
              description={
                search
                  ? "No records match your current search filter. Try clearing the search query."
                  : activeTab === "deleted"
                    ? "Deleted event records will appear here for restoration or permanent removal."
                    : `Get started by recording a new ${config.singularLabel.toLowerCase()}.`
              }
              action={
                activeTab === "deleted" ? undefined : (
                  <Button size="sm" onClick={openCreate}>
                    <Plus />
                    {config.primaryAction}
                  </Button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    {config.columns.map((column) => (
                      <TableHead key={column.key}>{column.label}</TableHead>
                    ))}
                    <TableHead className="w-16 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((record) => (
                    <TableRow key={record.id}>
                      {config.columns.map((column) => (
                        <TableCell key={column.key}>
                          {renderCell(record, column)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Row actions"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => setViewing(record)}
                            >
                              <Eye className="size-4" />
                              View details
                            </DropdownMenuItem>
                            {activeTab === "all" ? (
                              <>
                                <DropdownMenuItem
                                  onSelect={() => openEdit(record)}
                                >
                                  <Pencil className="size-4" />
                                  Edit payload
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  destructive
                                  onSelect={() => setDeleting(record)}
                                >
                                  <Trash2 className="size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  onSelect={() => setRestoring(record)}
                                >
                                  <RotateCcw className="size-4" />
                                  Restore
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  destructive
                                  onSelect={() => setDeleting(record)}
                                >
                                  <Trash2 className="size-4" />
                                  Delete permanently
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {meta && meta.total > 0 ? (
            <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground sm:flex-row">
              <p>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {meta.from ?? 0}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {meta.to ?? 0}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {meta.total}
                </span>{" "}
                records
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.currentPage <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <span className="px-2 font-medium text-foreground">
                  Page {meta.currentPage} of {meta.lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.currentPage >= meta.lastPage || loading}
                  onClick={() =>
                    setPage((p) => Math.min(meta.lastPage, p + 1))
                  }
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        size="xl"
        title={
          editing
            ? `Update ${config.singularLabel}`
            : `Record ${config.singularLabel}`
        }
        description={config.description}
        submitLabel={editing ? "Save changes" : config.primaryAction}
        steps={steps}
        errors={fieldErrors}
        allowStepJump={Boolean(editing)}
        onValidateStep={(stepIdx) => validateSection(stepIdx)}
        onSubmit={handleSave}
      />

      <CustomViewDetailsDialog
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title={`${config.singularLabel} Details`}
        description="Complete operational event record and resolved payload values."
        actions={
          viewing ? (
            <Button
              type="button"
              onClick={() => {
                const target = viewing;
                setViewing(null);
                openEdit(target);
              }}
            >
              <Pencil />
              Edit payload
            </Button>
          ) : null
        }
      >
        {viewing ? (
          <div className="form-row-grid">
            {viewing.subjectLabel ? (
              <DetailItem label="Animal / Group">
                {viewing.subjectLabel}
              </DetailItem>
            ) : null}
            {viewing.livestockLabel ? (
              <DetailItem label="Livestock Tag">
                {String(viewing.livestockLabel)}
              </DetailItem>
            ) : null}
            <DetailItem label="Farm">{viewing.farmName ?? "—"}</DetailItem>
            <DetailItem label="Farmer">{viewing.farmerName ?? "—"}</DetailItem>
            {viewing.eventName ? (
              <DetailItem label="Event Name">{viewing.eventName}</DetailItem>
            ) : null}
            {viewing.speciesName ? (
              <DetailItem label="Species">{viewing.speciesName}</DetailItem>
            ) : null}
            {viewing.familyCode ? (
              <DetailItem label="Event Family">{viewing.familyCode}</DetailItem>
            ) : null}
            {config.columns
              .filter(
                (col) =>
                  ![
                    "subject",
                    "farm",
                    "eventName",
                    "species",
                    "family",
                    "status",
                    "occurredAt",
                    "eventDate",
                    "createdAt",
                  ].includes(col.key),
              )
              .map((col) => (
                <DetailItem key={col.key} label={col.label}>
                  {String(viewing[col.key as keyof EventRecordItem] ?? "—") ||
                    "—"}
                </DetailItem>
              ))}
            <DetailItem label="Record Status">
              {(viewing.recordStatus ?? "confirmed").toUpperCase()}
            </DetailItem>
            {viewing.revision ? (
              <DetailItem label="Revision">{`v${viewing.revision}`}</DetailItem>
            ) : null}
            <DetailItem label="Date Recorded">
              {formatDateTime(
                (viewing.occurredAt as string | null) ??
                  (viewing.eventDate as string | null),
              )}
            </DetailItem>
            <DetailItem label="Last Updated">
              {formatDateTime(viewing.updatedAt)}
            </DetailItem>
          </div>
        ) : null}
      </CustomViewDetailsDialog>

      {activeTab === "deleted" && config.supportsTabs ? (
        <TypedConfirmationAlertDialog
          open={Boolean(deleting)}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          title={`Permanently delete ${config.singularLabel}?`}
          description="This action cannot be undone. The event record will be permanently removed from the ledger."
          icon={<Trash2 className="size-5" />}
          confirmationText="delete"
          confirmLabel="Delete permanently"
          onConfirm={() => void handleDelete(true)}
        />
      ) : (
        <ConfirmationAlertDialog
          open={Boolean(deleting)}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          title={`Delete ${config.singularLabel}?`}
          description={
            config.supportsTabs
              ? "This event record will be moved to the Deleted tab and can be restored by a System Administrator."
              : "This identification event record will be deleted."
          }
          confirmLabel="Delete"
          destructive
          icon={<Trash2 className="size-5" />}
          onConfirm={() => void handleDelete(false)}
        />
      )}

      <ConfirmationAlertDialog
        open={Boolean(restoring)}
        onOpenChange={(open) => {
          if (!open) setRestoring(null);
        }}
        title={`Restore ${config.singularLabel}?`}
        description="This event record will be restored to active confirmed status in the ledger."
        confirmLabel="Restore record"
        icon={<RotateCcw className="size-5" />}
        onConfirm={() => void handleRestore()}
      />
    </div>
  );
}
