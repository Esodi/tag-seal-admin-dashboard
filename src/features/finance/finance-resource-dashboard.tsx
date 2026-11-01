"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  Landmark,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
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
import { toast } from "@/components/ui/toast";
import {
  FINANCE_RESOLVED_NAME_FIELD_MAP,
  getFinanceResourceConfig,
} from "@/features/finance/finance-config";
import type {
  FinanceCrudResource,
  FinanceFormField,
  FinanceOptions,
  FinanceRecordItem,
  FinanceResponse,
  FinanceTableColumn,
} from "@/features/finance/types";
import { authenticatedFetch } from "@/lib/auth/session";

type SortOrder = "desc" | "asc";

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatTzs(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `TZS ${num.toLocaleString("en-TZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function FinanceResourceDashboard({
  resource,
  initialData,
  initialError,
}: {
  resource: FinanceCrudResource;
  initialData: FinanceResponse | null;
  initialError?: string;
}) {
  const config = getFinanceResourceConfig(resource);
  const [data, setData] = useState<FinanceResponse | null>(initialData);
  const [error, setError] = useState(initialError);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [perPage, setPerPage] = useState(initialData?.meta.perPage ?? 15);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceRecordItem | null>(null);
  const [viewing, setViewing] = useState<FinanceRecordItem | null>(null);
  const [deleting, setDeleting] = useState<FinanceRecordItem | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [options, setOptions] = useState<FinanceOptions>(
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
    ) => {
      setLoading(true);
      setError(undefined);
      const params = new URLSearchParams({
        page: String(nextPage),
        per_page: String(nextPerPage),
        search: nextSearch,
        status: nextStatus,
        sort: nextSort === "asc" ? "oldest" : "latest",
      });
      try {
        const response = await authenticatedFetch(
          `/api/admin/finance/${resource}?${params.toString()}`,
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
    void loadRecords(page, perPage, debouncedSearch, statusFilter, sortOrder);
  }, [debouncedSearch, loadRecords, page, perPage, sortOrder, statusFilter]);

  const ensureOptions = useCallback(async () => {
    if (Object.keys(options).length > 0) return;
    try {
      const response = await authenticatedFetch(
        `/api/admin/finance/${resource}/options`,
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
      quantity: 1,
      status: resource === "income" ? "received" : "pending",
      sourceType: "manual",
      incomeDate: today,
      expenseDate: today,
    });
    setFormOpen(true);
  };

  const openEdit = (record: FinanceRecordItem) => {
    void ensureOptions();
    setEditing(record);
    setFieldErrors({});
    const nextValues: Record<string, unknown> = {
      ...record,
      farmerId: record.farmerId ? String(record.farmerId) : "",
      extensionOfficerId: record.extensionOfficerId
        ? String(record.extensionOfficerId)
        : "",
    };
    if (record.incomeDate && record.incomeDate.length >= 10) {
      nextValues.incomeDate = record.incomeDate.slice(0, 10);
    }
    if (record.expenseDate && record.expenseDate.length >= 10) {
      nextValues.expenseDate = record.expenseDate.slice(0, 10);
    }
    setFormValues(nextValues);
    setFormOpen(true);
  };

  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      setFormValues((prev) => {
        const next: Record<string, unknown> = { ...prev, [name]: value };
        if (resource === "income" && (name === "quantity" || name === "unitAmount")) {
          const qty = Number(name === "quantity" ? value : next.quantity ?? 1);
          const unit = Number(name === "unitAmount" ? value : next.unitAmount ?? 0);
          if (!Number.isNaN(qty) && !Number.isNaN(unit) && qty > 0 && unit >= 0) {
            next.totalAmount = Number((qty * unit).toFixed(2));
          }
        }
        if (resource === "expenditure" && (name === "quantity" || name === "unitCost")) {
          const qty = Number(name === "quantity" ? value : next.quantity ?? 1);
          const unit = Number(name === "unitCost" ? value : next.unitCost ?? 0);
          if (!Number.isNaN(qty) && !Number.isNaN(unit) && qty > 0 && unit >= 0) {
            next.totalCost = Number((qty * unit).toFixed(2));
          }
        }
        return next;
      });
      setFieldErrors((prev) => {
        if (!prev[name]) return prev;
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    },
    [resource],
  );

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
        ? `/api/admin/finance/${resource}/${editing.id}`
        : `/api/admin/finance/${resource}`;
      const method = editing ? "PATCH" : "POST";
      const payloadToSend = { ...formValues };
      if (payloadToSend.farmerId === "") delete payloadToSend.farmerId;
      if (payloadToSend.extensionOfficerId === "")
        delete payloadToSend.extensionOfficerId;

      const response = await authenticatedFetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payloadToSend),
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
          payload?.message ??
            `Unable to save ${config.singularLabel.toLowerCase()}.`,
        );
      }
      toast.success(
        editing
          ? `${config.singularLabel} updated successfully.`
          : `${config.singularLabel} created successfully.`,
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

  const handleMarkPaid = async (record: FinanceRecordItem) => {
    try {
      const response = await authenticatedFetch(
        `/api/admin/finance/bills/${record.id}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ markPaid: true }),
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.status === false) {
        throw new Error(payload?.message ?? "Unable to mark bill as paid.");
      }
      toast.success(`Bill ${record.billNo ?? ""} marked as paid.`);
      await loadRecords();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to mark bill as paid.",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const response = await authenticatedFetch(
        `/api/admin/finance/${resource}/${deleting.id}`,
        { method: "DELETE" },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.status === false) {
        throw new Error(
          payload?.message ??
            `Unable to delete ${config.singularLabel.toLowerCase()}.`,
        );
      }
      toast.success(`${config.singularLabel} deleted successfully.`);
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

  const renderField = useCallback(
    (field: FinanceFormField) => {
      const rawValue = formValues[field.name];
      const stringValue =
        rawValue === null || rawValue === undefined ? "" : String(rawValue);
      const errorText = fieldErrors[field.name];

      if (field.type === "select") {
        const list = field.optionsKey
          ? (options[field.optionsKey] ?? [])
          : (field.staticOptions ?? []);
        const resolvedKey = FINANCE_RESOLVED_NAME_FIELD_MAP[field.name];
        const fallbackLabel =
          editing && resolvedKey
            ? String(editing[resolvedKey as keyof FinanceRecordItem] ?? "")
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
              onValueChange={(next) => handleFieldChange(field.name, next)}
              options={formattedOptions}
              placeholder={
                field.placeholder ?? `Select ${field.label.toLowerCase()}`
              }
              searchable={
                field.optionsKey === "farms" ||
                field.optionsKey === "farmers" ||
                field.optionsKey === "extensionOfficers" ||
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
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
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
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
          {field.description ? (
            <FieldDescription>{field.description}</FieldDescription>
          ) : null}
          <FieldError>{errorText}</FieldError>
        </Field>
      );
    },
    [editing, fieldErrors, formValues, handleFieldChange, options],
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

  const renderCell = (
    record: FinanceRecordItem,
    column: FinanceTableColumn,
  ) => {
    switch (column.key) {
      case "billNo":
      case "referenceNo":
        return (
          <span className="font-mono text-xs font-semibold text-foreground">
            {(record[column.key as keyof FinanceRecordItem] as string) || "—"}
          </span>
        );
      case "sourceType":
        return (
          <Badge variant="outline" className="uppercase">
            {record.sourceType ?? "MANUAL"}
          </Badge>
        );
      case "farm":
        return (
          <span className="font-medium text-foreground">
            {record.farmName ?? "—"}
          </span>
        );
      case "subjectType":
        return record.subjectType ? (
          <Badge variant="secondary" className="uppercase">
            {record.subjectType}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case "quantity":
        return (
          <span className="tabular-nums font-medium">
            {(record.quantity ?? 1).toLocaleString("en-TZ")}
          </span>
        );
      case "amount":
      case "unitAmount":
      case "totalAmount":
      case "unitCost":
      case "totalCost":
        return (
          <span className="font-semibold tabular-nums text-foreground">
            {formatTzs(
              record[column.key as keyof FinanceRecordItem] as number | null,
            )}
          </span>
        );
      case "status":
        return <StatusBadge status={record.status ?? "pending"} />;
      case "incomeDate":
      case "expenseDate":
      case "createdAt":
        return (
          <span className="text-xs text-muted-foreground">
            {formatDateTime(
              record[column.key as keyof FinanceRecordItem] as string | null,
            )}
          </span>
        );
      default: {
        const raw = record[column.key as keyof FinanceRecordItem];
        return (
          <span className="text-sm">
            {raw === null || raw === undefined || raw === ""
              ? "—"
              : String(raw)}
          </span>
        );
      }
    }
  };

  const items = data?.items ?? [];
  const meta = data?.meta;
  const summary = data?.summary;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        eyebrow="Finance & Billing"
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
            prefix: config.stats.tertiaryPrefix,
          },
        ].map((card) => (
          <Card key={card.label} className="border-border/70 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {card.label}
                </p>
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Landmark className="size-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight">
                <StatNumber value={card.value} prefix={card.prefix} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="space-y-4 p-5">
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
              <Select
                value={statusFilter}
                onValueChange={(next) => {
                  setStatusFilter(next);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[155px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {config.statusFilterOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
              icon={Database}
              title={`No ${config.title.toLowerCase()} found`}
              description={
                search
                  ? "No records match your current search filter."
                  : `Get started by creating your first ${config.singularLabel.toLowerCase()}.`
              }
              action={
                <Button size="sm" onClick={openCreate}>
                  <Plus />
                  {config.primaryAction}
                </Button>
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
                            <DropdownMenuItem onSelect={() => openEdit(record)}>
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            {resource === "bills" &&
                            record.status !== "paid" ? (
                              <DropdownMenuItem
                                onSelect={() => void handleMarkPaid(record)}
                              >
                                <CheckCircle2 className="size-4 text-success" />
                                Mark as Paid
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              destructive
                              onSelect={() => setDeleting(record)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
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
            : `Create ${config.singularLabel}`
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
        description="Complete financial record and resolved party information."
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
              Edit {config.singularLabel.toLowerCase()}
            </Button>
          ) : null
        }
      >
        {viewing ? (
          <div className="form-row-grid">
            {viewing.billNo ? (
              <DetailItem label="Bill No">{viewing.billNo}</DetailItem>
            ) : null}
            {viewing.referenceNo ? (
              <DetailItem label="Reference No">
                {viewing.referenceNo}
              </DetailItem>
            ) : null}
            {viewing.sourceType ? (
              <DetailItem label="Source Type">
                {viewing.sourceType.toUpperCase()}
              </DetailItem>
            ) : null}
            <DetailItem label="Farm">{viewing.farmName ?? "—"}</DetailItem>
            <DetailItem label="Farmer">{viewing.farmerName ?? "—"}</DetailItem>
            {resource === "bills" ? (
              <DetailItem label="Extension Officer">
                {viewing.extensionOfficerName ?? "—"}
              </DetailItem>
            ) : null}
            <DetailItem label="Subject">
              {viewing.subjectType ?? "—"}
            </DetailItem>
            <DetailItem label="Quantity">
              {String(viewing.quantity ?? 1)}
            </DetailItem>
            {resource === "bills" ? (
              <DetailItem label="Amount">
                {formatTzs(viewing.amount)}
              </DetailItem>
            ) : null}
            {resource === "income" ? (
              <>
                <DetailItem label="Unit Amount">
                  {formatTzs(viewing.unitAmount)}
                </DetailItem>
                <DetailItem label="Total Amount">
                  {formatTzs(viewing.totalAmount)}
                </DetailItem>
                <DetailItem label="Income Date">
                  {formatDateTime(viewing.incomeDate)}
                </DetailItem>
              </>
            ) : null}
            {resource === "expenditure" ? (
              <>
                <DetailItem label="Unit Cost">
                  {formatTzs(viewing.unitCost)}
                </DetailItem>
                <DetailItem label="Total Cost">
                  {formatTzs(viewing.totalCost)}
                </DetailItem>
                <DetailItem label="Expense Date">
                  {formatDateTime(viewing.expenseDate)}
                </DetailItem>
              </>
            ) : null}
            <DetailItem label="Status">
              <StatusBadge status={viewing.status ?? "pending"} />
            </DetailItem>
            <DetailItem label="Notes">{viewing.notes ?? "—"}</DetailItem>
            <DetailItem label="Created At">
              {formatDateTime(viewing.createdAt)}
            </DetailItem>
            <DetailItem label="Updated At">
              {formatDateTime(viewing.updatedAt)}
            </DetailItem>
          </div>
        ) : null}
      </CustomViewDetailsDialog>

      <ConfirmationAlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title={`Delete ${config.singularLabel}?`}
        description="This financial record will be permanently deleted from the ledger."
        confirmLabel="Delete"
        destructive
        icon={<Trash2 className="size-5" />}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}

