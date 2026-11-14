"use client";

import { RecordPagination } from "@/components/ui/record-pagination";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpAZ, ArrowUpNarrowWide, Database, Eye, MoreVertical, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import {
  CustomViewDetailsDialog,
  DetailItem, DetailSection,
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
import { TypedConfirmationAlertDialog } from "@/components/ui/typed-confirmation-alert-dialog";
import {
  getReferenceResourceConfig,
  REFERENCE_RESOLVED_NAME_FIELD_MAP,
} from "@/features/reference/reference-config";
import type {
  ReferenceFormField,
  ReferenceOptions,
  ReferenceRecord,
  ReferenceResource,
  ReferenceResponse,
  ReferenceTableColumn,
} from "@/features/reference/types";
import { authenticatedFetch } from "@/lib/auth/session";

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

type Props = {
  resource: ReferenceResource;
  initialRecords: ReferenceResponse | null;
  initialOptions: ReferenceOptions | null;
  initialError: string | null;
};

export function ReferenceResourceDashboard({
  resource,
  initialRecords,
  initialOptions,
  initialError,
}: Props) {
  const config = getReferenceResourceConfig(resource);
  const [result, setResult] = useState<ReferenceResponse | null>(
    initialRecords,
  );
  const [options, setOptions] = useState<ReferenceOptions>(
    initialOptions ?? {},
  );
  const [loadError, setLoadError] = useState(initialError);
  const [loading, setLoading] = useState(!initialRecords);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortOrder>("desc");
  const [page, setPage] = useState(initialRecords?.meta.currentPage ?? 1);
  const [pageSize, setPageSize] = useState(initialRecords?.meta.perPage ?? 10);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ReferenceRecord | null>(null);
  const [viewing, setViewing] = useState<ReferenceRecord | null>(null);
  const [deleting, setDeleting] = useState<ReferenceRecord | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const firstRequest = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(pageSize),
      sort,
    });
    if (query.trim()) params.set("search", query.trim());
    if (status !== "all") params.set("status", status);
    try {
      const response = await authenticatedFetch(
        `/api/admin/reference/${resource}?${params}`,
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
  }, [config.title, page, pageSize, query, resource, sort, status]);

  const loadOptions = useCallback(async () => {
    try {
      const response = await authenticatedFetch(
        `/api/admin/reference/${resource}/options`,
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

  const remove = async () => {
    if (!deleting) return;
    try {
      const response = await authenticatedFetch(
        `/api/admin/reference/${resource}/${deleting.id}`,
        { method: "DELETE" },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          payload?.message ??
            `${capitalize(config.singular)} could not be deleted.`,
        );
      }
      setDeleting(null);
      toast.success(
        payload?.message ?? `${capitalize(config.singular)} deleted.`,
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

  const removeBulk = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    let deletedCount = 0;
    let firstErrorMessage: string | null = null;

    for (const id of ids) {
      try {
        const response = await authenticatedFetch(
          `/api/admin/reference/${resource}/${id}`,
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

    setBulkDeleteOpen(false);
    setSelected(new Set());
    if (deletedCount > 0) {
      toast.success(
        `Deleted ${deletedCount} ${deletedCount === 1 ? config.singular : config.title.toLowerCase()}.`,
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
        parent="Reference Master Data"
        parentHref="/dashboard/reference"
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
          <DashboardStatCard key={stat.label} label={<>{stat.label}</>} value={<StatNumber value={stat.value} />} note={<>{stat.note}</>} loading={loading && !result} />
        ))}
        {!result &&
          Array.from({ length: 3 }, (_, index) => (
            <DashboardStatCard key={index} loading />
          ))}
      </div>

      <TablePanel className="mt-4">
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
            {selected.size > 0 ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 />
                Delete ({selected.size})
              </Button>
            ) : null}

            {config.statusOptions ? (
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
        </TableToolbar>

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
          <ReferenceTable
            config={config}
            rows={rows}
            loading={loading}
            from={result?.meta.from ?? 1}
            selected={selected}
            hasActiveFilters={hasActiveFilters}
            onToggleAll={toggleAllOnPage}
            onToggleOne={toggleOne}
            onCreate={() => setCreating(true)}
            onView={setViewing}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        )}

        {result && !loadError ? (
          <RecordPagination from={result.meta.from} to={result.meta.to} total={result.meta.total} page={result.meta.currentPage} pageCount={result.meta.lastPage} onPageChange={setPage} disabled={loading} />
        ) : null}
      </TablePanel>

      <ReferenceFormDialog
        key={`create-${resource}-${creating}`}
        open={creating}
        onOpenChange={setCreating}
        resource={resource}
        options={options}
        onSaved={refresh}
      />
      {editing ? (
        <ReferenceFormDialog
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
      <ReferenceDetailsDialog
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
      <TypedConfirmationAlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title={`Delete ${config.singular}?`}
        description={
          <>
            This permanently removes{" "}
            <strong>{deleting ? deleting.name : config.singular}</strong>.
          </>
        }
        icon={<Trash2 className="size-5" />}
        confirmationText="delete"
        confirmLabel="Delete permanently"
        onConfirm={() => void remove()}
      />
      <ConfirmationAlertDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selected.size} ${selected.size === 1 ? config.singular : config.title.toLowerCase()}?`}
        description="Selected records will be permanently removed."
        confirmLabel="Delete selected"
        destructive
        icon={<Trash2 className="size-5" />}
        onConfirm={() => void removeBulk()}
      />
    </div>
  );
}

function ReferenceTable({
  config,
  rows,
  loading,
  from,
  selected,
  hasActiveFilters,
  onToggleAll,
  onToggleOne,
  onCreate,
  onView,
  onEdit,
  onDelete,
}: {
  config: ReturnType<typeof getReferenceResourceConfig>;
  rows: ReferenceRecord[];
  loading: boolean;
  from: number;
  selected: Set<number>;
  hasActiveFilters: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onCreate: () => void;
  onView: (record: ReferenceRecord) => void;
  onEdit: (record: ReferenceRecord) => void;
  onDelete: (record: ReferenceRecord) => void;
}) {
  if (loading && rows.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
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
          icon={Database}
          title={
            hasActiveFilters
              ? `No matching ${config.title.toLowerCase()}`
              : `No ${config.title.toLowerCase()} yet`
          }
          description={
            hasActiveFilters
              ? "Try adjusting your search query or status filter."
              : `Get started by registering the first ${config.singular}.`
          }
          action={
            !hasActiveFilters ? (
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
          <TableRow>
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
            const displayName = record.name || `#${record.id}`;

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
                    {renderReferenceCell(record, column)}
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

function ReferenceFormDialog({
  open,
  onOpenChange,
  resource,
  options,
  record,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: ReferenceResource;
  options: ReferenceOptions;
  record?: ReferenceRecord;
  onSaved: () => Promise<void>;
}) {
  const config = getReferenceResourceConfig(resource);
  const editing = Boolean(record);
  const allFields = useMemo(
    () => config.sections.flatMap((section) => section.fields),
    [config.sections],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      allFields.map((field) => [
        field.name,
        stringValue(record?.[field.name] ?? field.defaultValue ?? ""),
      ]),
    ),
  );

  const handleFieldChange = useCallback(
    (fieldName: string, nextValue: string) => {
      setValues((previous) => ({ ...previous, [fieldName]: nextValue }));
    },
    [],
  );

  const validateFields = useCallback(
    (fieldsToCheck: ReferenceFormField[]) => {
      const nextErrors: Record<string, string> = {};
      for (const field of fieldsToCheck) {
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
              <ReferenceField
                key={field.name}
                field={field}
                record={record}
                options={options}
                values={values}
                onChange={handleFieldChange}
                error={errors[field.name]}
              />
            ))}
          </div>
        ),
      })),
    [
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
      const value = String(values[field.name] ?? "").trim();
      if (value === "") {
        payload[field.name] = null;
      } else if (field.name.endsWith("Id") && /^\d+$/.test(value)) {
        payload[field.name] = Number(value);
      } else {
        payload[field.name] = value;
      }
    }

    try {
      const response = await authenticatedFetch(
        editing
          ? `/api/admin/reference/${resource}/${record!.id}`
          : `/api/admin/reference/${resource}`,
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
      size={config.sections.length > 1 ? "xl" : "lg"}
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

function ReferenceField({
  field,
  record,
  options,
  values,
  onChange,
  error,
}: {
  field: ReferenceFormField;
  record?: ReferenceRecord;
  options: ReferenceOptions;
  values: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
  error?: string;
}) {
  const id = `reference-${field.name}-${record?.id ?? "new"}`;
  const required = Boolean(field.required);
  const current = values[field.name] ?? "";
  const choices = useMemo(
    () => field.options ?? options[field.optionsKey ?? ""] ?? [],
    [field.options, field.optionsKey, options],
  );

  const resolvedNameKey = REFERENCE_RESOLVED_NAME_FIELD_MAP[field.name];
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
    <Field className={field.full ? "sm:col-span-2" : undefined}>
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
          required={required}
          placeholder={field.placeholder}
          aria-invalid={Boolean(error)}
        />
      )}
      {field.helper ? <FieldDescription>{field.helper}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function ReferenceDetailsDialog({
  resource,
  record,
  options,
  onOpenChange,
  onEdit,
}: {
  resource: ReferenceResource;
  record: ReferenceRecord | null;
  options: ReferenceOptions;
  onOpenChange: (open: boolean) => void;
  onEdit: (record: ReferenceRecord) => void;
}) {
  const config = getReferenceResourceConfig(resource);
  const sections = config.sections.map((section) => ({
    ...section,
    fields: section.fields.filter((field) => field.name !== "uuid"),
  })).filter((section) => section.fields.length > 0);

  return (
    <CustomViewDetailsDialog
      open={Boolean(record)}
      onOpenChange={onOpenChange}
      title={`${capitalize(config.singular)} details`}
      description="Reference catalogue record details and timestamps."
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
        <div className="space-y-6">
          {sections.map((section) => (
            <DetailSection key={section.title} title={section.title}>
              {section.fields.map((field) => (
                <DetailItem key={field.name} label={field.label} className={field.full ? "sm:col-span-2" : undefined}>
                  {displayReferenceFieldValue(record, field, options)}
                </DetailItem>
              ))}
            </DetailSection>
          ))}
          <DetailSection title="Record information">
            <DetailItem label="Created at">{formatDate(record.createdAt)}</DetailItem>
            <DetailItem label="Updated at">{formatDate(record.updatedAt)}</DetailItem>
          </DetailSection>
        </div>
      ) : null}
    </CustomViewDetailsDialog>
  );
}

function renderReferenceCell(
  record: ReferenceRecord,
  column: ReferenceTableColumn,
) {
  const value = record[column.key];
  if (column.type === "status") {
    return <StatusBadge status={stringValue(value)} />;
  }
  if (column.type === "badge") {
    return value ? (
      <Badge variant="secondary" className="font-mono">
        {String(value)}
      </Badge>
    ) : (
      <span className="text-muted-foreground">—</span>
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

function displayReferenceFieldValue(
  record: ReferenceRecord,
  field: ReferenceFormField,
  options: ReferenceOptions,
) {
  if (field.name === "status") {
    return <StatusBadge status={stringValue(record[field.name])} />;
  }

  const resolvedKey = REFERENCE_RESOLVED_NAME_FIELD_MAP[field.name];
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
  return humanValue(value);
}

function humanValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
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
