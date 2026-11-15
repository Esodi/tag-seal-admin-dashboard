"use client";

import { todayInEat } from "@/lib/report-print";
import { RecordPagination } from "@/components/ui/record-pagination";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { TableTabSection, TablePanel, TableToolbar } from "@/components/ui/table-layout";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Database, Eye, MoreVertical, Pencil, Plus, RefreshCw, RotateCcw, Search, Trash2 } from "lucide-react";
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
  const [perPage, setPerPage] = useState(initialData?.meta.perPage ?? 10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPermanentDeleteOpen, setBulkPermanentDeleteOpen] = useState(false);

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
  const activeRequest = useRef<AbortController | null>(null);

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
      background = false,
    ) => {
      if (background && activeRequest.current) return;
      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;
      if (!background) { setLoading(true); setError(undefined); }
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
          { cache: "no-store", signal: controller.signal },
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.status === false) {
          throw new Error(
            payload?.message ?? `Unable to load ${config.title.toLowerCase()}.`,
          );
        }
        if (controller.signal.aborted) return;
        setData(payload.data);
        setError(undefined);
        if (!background) setSelected(new Set());
        if (payload.data?.options) {
          setOptions(payload.data.options);
        }
      } catch (err) {
        if (controller.signal.aborted || background) return;
        setError(
          err instanceof Error
            ? err.message
            : `Unable to load ${config.title.toLowerCase()}.`,
        );
      } finally {
        if (activeRequest.current === controller) {
          activeRequest.current = null;
          if (!background) setLoading(false);
        }
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

  useEffect(() => () => { activeRequest.current?.abort(); }, []);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine || loading ||
          formOpen || viewing || deleting || restoring || bulkDeleteOpen || bulkPermanentDeleteOpen || selected.size) return;
      void loadRecords(page, perPage, debouncedSearch, statusFilter, sortOrder, activeTab, true);
    };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadRecords, page, perPage, debouncedSearch, statusFilter, sortOrder, activeTab,
      loading, formOpen, viewing, deleting, restoring, bulkDeleteOpen, bulkPermanentDeleteOpen, selected.size]);

  const loadOptions = useCallback(
    async (farmUuid?: string | null) => {
      try {
        const query =
          farmUuid && String(farmUuid).trim() !== ""
            ? `?farm_uuid=${encodeURIComponent(String(farmUuid).trim())}`
            : "";
        const response = await authenticatedFetch(
          `/api/admin/events/${resource}/options${query}`,
          { cache: "no-store" },
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.data) return;

        setOptions((previous) => {
          const next = payload.data as EventOptions;
          // Keep farms list when loading farm-scoped animals.
          if (farmUuid && previous.farms?.length) {
            return {
              ...previous,
              ...next,
              farms: previous.farms,
            };
          }
          return next;
        });
      } catch {
        // ignore
      }
    },
    [resource],
  );

  const ensureOptions = useCallback(async () => {
    if (Object.keys(options).length > 0) return;
    await loadOptions();
  }, [loadOptions, options]);

  const openCreate = () => {
    void ensureOptions();
    setEditing(null);
    setFieldErrors({});
    const today = todayInEat();
    setFormValues({
      occurredAt: today,
      eventDate: today,
      recordStatus: "confirmed",
    });
    setFormOpen(true);
  };

  const openEdit = (record: EventRecordItem) => {
    void ensureOptions();
    const farmUuid =
      typeof record.farmUuid === "string" ? record.farmUuid : null;
    if (farmUuid) {
      void loadOptions(farmUuid);
    }
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

  const handleBulkDelete = async (force = false) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    let deletedCount = 0;
    let firstErrorMessage: string | null = null;
    const query = force ? "?force=1" : "";

    for (const id of ids) {
      try {
        const response = await authenticatedFetch(
          `/api/admin/events/${resource}/${id}${query}`,
          { method: "DELETE" },
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.status === false) {
          firstErrorMessage ??=
            payload?.message ??
            `Unable to delete ${config.singularLabel.toLowerCase()}.`;
        } else {
          deletedCount += 1;
        }
      } catch (err) {
        firstErrorMessage ??=
          err instanceof Error ? err.message : "Bulk delete failed.";
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
          ? `Permanently deleted ${deletedCount} ${deletedCount === 1 ? config.singularLabel.toLowerCase() : config.title.toLowerCase()}.`
          : `Deleted ${deletedCount} ${deletedCount === 1 ? config.singularLabel.toLowerCase() : config.title.toLowerCase()}.`,
      );
    }
    if (firstErrorMessage) {
      toast.error(firstErrorMessage);
    }
    await loadRecords();
  };

  const handleBulkRestore = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    let restoredCount = 0;
    let firstErrorMessage: string | null = null;

    for (const id of ids) {
      try {
        const response = await authenticatedFetch(
          `/api/admin/events/${resource}/${id}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "restore" }),
          },
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.status === false) {
          firstErrorMessage ??=
            payload?.message ??
            `Unable to restore ${config.singularLabel.toLowerCase()}.`;
        } else {
          restoredCount += 1;
        }
      } catch (err) {
        firstErrorMessage ??=
          err instanceof Error ? err.message : "Bulk restore failed.";
      }
    }

    setSelected(new Set());
    if (restoredCount > 0) {
      toast.success(
        `Restored ${restoredCount} ${restoredCount === 1 ? config.singularLabel.toLowerCase() : config.title.toLowerCase()}.`,
      );
    }
    if (firstErrorMessage) {
      toast.error(firstErrorMessage);
    }
    await loadRecords();
  };

  const renderField = useCallback(
    (field: EventFormField) => {
      const rawValue = formValues[field.name];
      const stringValue =
        rawValue === null || rawValue === undefined ? "" : String(rawValue);
      const errorText = fieldErrors[field.name];

      if (field.type === "select") {
        const parentRaw = field.dependsOn
          ? formValues[field.dependsOn]
          : undefined;
        const parentValue =
          parentRaw === null || parentRaw === undefined
            ? ""
            : String(parentRaw);
        const parentBlocked = Boolean(field.dependsOn && !parentValue);

        let list = field.optionsKey
          ? (options[field.optionsKey] ?? [])
          : (field.staticOptions ?? []);

        if (field.filterByFarmField) {
          const farmRaw = formValues[field.filterByFarmField];
          const farmValue =
            farmRaw === null || farmRaw === undefined ? "" : String(farmRaw);
          if (farmValue) {
            list = list.filter(
              (opt) => !opt.farmUuid || opt.farmUuid === farmValue,
            );
          } else {
            list = [];
          }
        }

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

        const isLargeList =
          field.optionsKey === "farms" ||
          field.optionsKey === "subjects" ||
          field.optionsKey === "livestock" ||
          formattedOptions.length > 5;

        const helperText = parentBlocked
          ? `Select ${field.dependsOn === "farmUuid" ? "a farm" : "the parent field"} first.`
          : field.description;

        return (
          <Field key={field.name}>
            <FieldLabel required={field.required}>{field.label}</FieldLabel>
            <FormSelect
              value={parentBlocked ? "" : stringValue}
              disabled={parentBlocked}
              onValueChange={(next) => {
                setFormValues((prev) => {
                  const updated: Record<string, unknown> = {
                    ...prev,
                    [field.name]: next,
                  };
                  // Changing farm clears dependent animal / livestock picks.
                  if (field.name === "farmUuid") {
                    updated.subjectUuid = "";
                    updated.livestockUuid = "";
                  }
                  return updated;
                });
                if (field.name === "farmUuid" && next) {
                  void loadOptions(next);
                }
                if (errorText) {
                  setFieldErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[field.name];
                    if (field.name === "farmUuid") {
                      delete copy.subjectUuid;
                      delete copy.livestockUuid;
                    }
                    return copy;
                  });
                }
              }}
              options={formattedOptions}
              placeholder={
                parentBlocked
                  ? "Select farm first"
                  : (field.placeholder ??
                    `Select ${field.label.toLowerCase()}`)
              }
              searchable={isLargeList}
              searchPlaceholder={
                field.optionsKey === "farms"
                  ? "Search farms…"
                  : field.optionsKey === "subjects"
                    ? "Search animals…"
                    : field.optionsKey === "livestock"
                      ? "Search livestock…"
                      : "Search options…"
              }
              invalid={Boolean(errorText)}
            />
            {helperText ? (
              <FieldDescription>{helperText}</FieldDescription>
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
    [editing, fieldErrors, formValues, loadOptions, options],
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

  const toggleAllOnPage = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(items.map((record) => record.id)));
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

  const allSelected =
    items.length > 0 && items.every((record) => selected.has(record.id));
  const someSelected = items.some((record) => selected.has(record.id));

  const statsList = (
    data?.meta as {
      stats?: Array<{ label: string; value: number; note?: string }>;
    }
  )?.stats ?? [
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
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        eyebrow="Events & Logs"
        title={config.title}
        description={config.description}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={openCreate}>
              <Plus />
              {config.primaryAction}
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statsList.map((stat) => (
          <DashboardStatCard key={stat.label} label={<>{stat.label}</>} value={<StatNumber value={stat.value} />} note={<>{stat.note}</>} loading={loading && !data} />
        ))}
        {!data &&
          Array.from({ length: 4 }, (_, index) => (
            <DashboardStatCard key={index} loading />
          ))}
      </div>

      <TablePanel>
        <div className="min-w-0 [&>[data-slot=card]]:m-5">
          {config.supportsTabs ? (
            <TableTabSection>
              <Tabs
                value={activeTab}
                onValueChange={(next) => {
                  setActiveTab(next as "all" | "deleted");
                  setPage(1);
                  setSelected(new Set());
                }}
              >
                <TabsList variant="resource" aria-label="Record visibility">
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
            </TableTabSection>
          ) : null}

          <TableToolbar className="justify-between">
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
              {selected.size > 0 ? (
                activeTab === "deleted" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleBulkRestore()}
                    >
                      <RotateCcw className="size-4" />
                      Restore ({selected.size})
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setBulkPermanentDeleteOpen(true)}
                    >
                      <Trash2 className="size-4" />
                      Delete permanently ({selected.size})
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    Delete ({selected.size})
                  </Button>
                )
              ) : null}

              {config.supportsTabs && activeTab === "all" ? (
                <Select
                  value={statusFilter}
                  onValueChange={(next) => {
                    setStatusFilter(next);
                    setPage(1);
                    setSelected(new Set());
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

              <Select value={sortOrder} onValueChange={(value) => { setSortOrder(value as SortOrder); setPage(1); setSelected(new Set()); }}>
                <SelectTrigger aria-label="Sort records" size="sm" className="h-8 w-auto min-w-[9.5rem] max-w-56 font-normal">
                  {sortOrder === "desc" ? <ArrowDownWideNarrow className="size-3.5 text-muted-foreground" /> : <ArrowUpNarrowWide className="size-3.5 text-muted-foreground" />}
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent align="end"><SelectItem value="desc">Newest first</SelectItem><SelectItem value="asc">Oldest first</SelectItem></SelectContent>
              </Select>

              <Select
                value={String(perPage)}
                onValueChange={(next) => {
                  setPerPage(Number(next));
                  setPage(1);
                  setSelected(new Set());
                }}
              >
                <SelectTrigger aria-label="Rows per page" size="sm" className="h-8 w-auto min-w-[6.25rem] max-w-40 font-normal">
                  <span className="text-muted-foreground">Show</span>
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent align="end">
                  {[10, 30, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TableToolbar>

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
            <div className="min-w-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12" />
                    <TableHead className="w-14">#</TableHead>
                    {config.columns.map((column) => (
                      <TableHead key={column.key}>{column.label}</TableHead>
                    ))}
                    <TableHead className="w-16 text-right"><span className="sr-only">Actions</span></TableHead>
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
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto size-7 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            <div
              className={`min-w-0 ${
                loading ? "opacity-60 transition-opacity" : "transition-opacity"
              }`}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        aria-label={`Select all ${config.title.toLowerCase()} on this page`}
                        checked={
                          allSelected ? true : someSelected ? "indeterminate" : false
                        }
                        onCheckedChange={(value) => toggleAllOnPage(value === true)}
                      />
                    </TableHead>
                    <TableHead className="w-14">#</TableHead>
                    {config.columns.map((column) => (
                      <TableHead key={column.key}>{column.label}</TableHead>
                    ))}
                    <TableHead className="w-16 text-right"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((record, index) => {
                    const isSelected = selected.has(record.id);
                    return (
                      <TableRow
                        key={record.id}
                        data-state={isSelected ? "selected" : undefined}
                      >
                        <TableCell>
                          <Checkbox
                            aria-label={`Select ${record.eventName ?? record.subjectIdentifier ?? "record"}`}
                            checked={isSelected}
                            onCheckedChange={(value) =>
                              toggleOne(record.id, value === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {(meta?.from ?? (page - 1) * perPage + 1) + index}
                        </TableCell>
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
                  );
                })}
                </TableBody>
              </Table>
            </div>
          )}

          {meta ? (
            <RecordPagination from={meta.from} to={meta.to} total={meta.total} page={meta.currentPage} pageCount={meta.lastPage} onPageChange={setPage} disabled={loading} />
          ) : null}
        </div>
      </TablePanel>

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

      <ConfirmationAlertDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selected.size} ${selected.size === 1 ? config.singularLabel.toLowerCase() : config.title.toLowerCase()}?`}
        description={
          config.supportsTabs
            ? `Selected ${config.title.toLowerCase()} will be moved to the Deleted tab. You can restore them later.`
            : `Selected ${config.title.toLowerCase()} will be deleted.`
        }
        confirmLabel="Delete selected"
        destructive
        icon={<Trash2 className="size-5" />}
        onConfirm={() => void handleBulkDelete(false)}
      />

      <TypedConfirmationAlertDialog
        open={bulkPermanentDeleteOpen}
        onOpenChange={setBulkPermanentDeleteOpen}
        title={`Permanently delete ${selected.size} ${selected.size === 1 ? config.singularLabel.toLowerCase() : config.title.toLowerCase()}?`}
        description={`This will permanently delete ${selected.size} ${selected.size === 1 ? config.singularLabel.toLowerCase() : config.title.toLowerCase()} and cannot be undone.`}
        confirmationText="delete"
        confirmLabel="Delete permanently"
        icon={<Trash2 className="size-5" />}
        onConfirm={() => void handleBulkDelete(true)}
      />
    </div>
  );
}
