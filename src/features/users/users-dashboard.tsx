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
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpAZ, ArrowUpNarrowWide, Eye, ListFilter, MoreVertical, Pencil, Plus, RefreshCw, Search, Trash2, UserCheck, UserX } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { TypedConfirmationAlertDialog } from "@/components/ui/typed-confirmation-alert-dialog";
import {
  getPeopleResourceConfig,
  RESOLVED_NAME_FIELD_MAP,
} from "@/features/people/resource-config";
import type { FormField, PeopleOptions, PeopleRecord } from "@/features/people/types";
import type {
  UserAccount,
  UserFormOptions,
  UsersResponse,
} from "@/features/users/types";
import { authenticatedFetch } from "@/lib/auth/session";

type SortOrder = "desc" | "asc" | "alpha-asc" | "alpha-desc";

const SORT_OPTIONS: Array<{
  value: SortOrder;
  label: string;
  icon: typeof ArrowDownWideNarrow;
}> = [
  { value: "desc", label: "Newest first", icon: ArrowDownWideNarrow },
  { value: "asc", label: "Oldest first", icon: ArrowUpNarrowWide },
  { value: "alpha-asc", label: "Username (A–Z)", icon: ArrowDownAZ },
  { value: "alpha-desc", label: "Username (Z–A)", icon: ArrowUpAZ },
];

const PAGE_SIZE_OPTIONS = [10, 30, 50, 100] as const;

const CREDENTIAL_FIELD_NAMES = new Set([
  "username",
  "email",
  "password",
  "status",
  "createdBy",
  "accountRole",
]);

type Props = {
  initialUsers: UsersResponse | null;
  initialOptions: UserFormOptions | null;
  initialError: string | null;
};

const emptyStats = { total: 0, active: 0, systemUsers: 0, farmers: 0 };

function roleResourceKey(role: string) {
  switch (role) {
    case "farmer":
      return "farmers" as const;
    case "extensionOfficer":
      return "extension-officers" as const;
    case "farmInvitedUser":
      return "farm-users" as const;
    case "systemUser":
    case "vet":
    default:
      return "system-user-profiles" as const;
  }
}

export function UsersDashboard({
  initialUsers,
  initialOptions,
  initialError,
}: Props) {
  const [result, setResult] = useState<UsersResponse | null>(initialUsers);
  const [loadError, setLoadError] = useState(initialError);
  const [loading, setLoading] = useState(!initialUsers);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortOrder>("desc");
  const [page, setPage] = useState(initialUsers?.meta.currentPage ?? 1);
  const [pageSize, setPageSize] = useState(initialUsers?.meta.perPage ?? 10);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [viewing, setViewing] = useState<UserAccount | null>(null);
  const [deleting, setDeleting] = useState<UserAccount | null>(null);
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
    if (role !== "all") params.set("role", role);
    if (status !== "all") params.set("status", status);
    try {
      const response = await authenticatedFetch(`/api/admin/users?${params}`, {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "User accounts could not be loaded.");
      }
      setResult(payload);
      setSelected(new Set());
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "User accounts could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query, role, sort, status]);

  useEffect(() => {
    if (firstRequest.current && initialUsers) {
      firstRequest.current = false;
      return;
    }
    const timer = window.setTimeout(() => void load(), query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, query, initialUsers]);

  const refreshAfterMutation = async () => {
    await load();
  };

  const toggleStatus = async (user: UserAccount) => {
    const next = user.status === "active" ? "notActive" : "active";
    try {
      const response = await authenticatedFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload.message ??
            firstError(payload.errors) ??
            "Account status could not be changed.",
        );
      }
      toast.success(
        next === "active" ? "Account activated." : "Account deactivated.",
      );
      await refreshAfterMutation();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Account status could not be changed.",
      );
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      const response = await authenticatedFetch(
        `/api/admin/users/${deleting.id}`,
        { method: "DELETE" },
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Account could not be deleted.");
      }
      setDeleting(null);
      toast.success("User account deleted.");
      await refreshAfterMutation();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Account could not be deleted.",
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
        const response = await authenticatedFetch(`/api/admin/users/${id}`, {
          method: "DELETE",
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          firstErrorMessage ??=
            payload?.message ?? "Account could not be deleted.";
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
        `Deleted ${deletedCount} user ${deletedCount === 1 ? "account" : "accounts"}.`,
      );
    }
    if (firstErrorMessage) {
      toast.error(firstErrorMessage);
    }
    await refreshAfterMutation();
  };

  const stats = result?.meta.stats ?? emptyStats;
  const rows = result?.data ?? [];
  const hasActiveFilters =
    query.trim().length > 0 || role !== "all" || status !== "all";
  const selectedSortOption =
    SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];
  const SelectedSortIcon = selectedSortOption.icon;

  const toggleAllOnPage = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(rows.map((user) => user.id)));
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
        parent="People & Organization"
        parentHref="/dashboard/people"
        title="User Accounts"
        description="Manage authentication accounts, role-specific profiles, account state and platform permissions."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus />
            Create account
          </Button>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total accounts",
            value: stats.total,
            note: "All authentication accounts",
          },
          {
            label: "Active accounts",
            value: stats.active,
            note: "Allowed to sign in",
          },
          {
            label: "System users",
            value: stats.systemUsers,
            note: "Administrative accounts",
          },
          {
            label: "Farmer accounts",
            value: stats.farmers,
            note: "Linked farmer profiles",
          },
        ].map(({ label, value, note }) => (
          <DashboardStatCard key={label} label={<>{label}</>} value={<StatNumber value={value} />} note={<>{note}</>} loading={loading && !result} />
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
              placeholder="Search name, username or email…"
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

            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value);
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Filter by role"
                size="sm"
                className="h-8 w-auto min-w-[8.5rem] max-w-44 font-normal"
              >
                <ListFilter className="size-3.5 text-muted-foreground" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All roles</SelectItem>
                {(initialOptions?.roles ?? []).map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                {(initialOptions?.statuses ?? []).map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value as SortOrder);
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Sort accounts"
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
              icon={UserX}
              title="Could not load user accounts"
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
          <UsersTable
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
            onToggleStatus={(user) => void toggleStatus(user)}
            onDelete={setDeleting}
          />
        )}

        {result && !loadError ? (
          <RecordPagination from={result.meta.from} to={result.meta.to} total={result.meta.total} page={result.meta.currentPage} pageCount={result.meta.lastPage} onPageChange={setPage} disabled={loading} />
        ) : null}
      </TablePanel>

      {initialOptions ? (
        <UserAccountFormDialog
          key={`create-user-${creating}`}
          open={creating}
          onOpenChange={setCreating}
          options={initialOptions}
          onSaved={refreshAfterMutation}
        />
      ) : null}
      {initialOptions && editing ? (
        <UserAccountFormDialog
          key={editing.id}
          open={Boolean(editing)}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          options={initialOptions}
          user={editing}
          onSaved={refreshAfterMutation}
        />
      ) : null}
      <UserDetailsDialog
        user={viewing}
        options={initialOptions}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        onEdit={(user) => {
          setViewing(null);
          setEditing(user);
        }}
      />
      <TypedConfirmationAlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete user account?"
        description={
          <>
            This removes <strong>{deleting?.username}</strong>&apos;s login
            account. The linked person profile is kept.
          </>
        }
        icon={<Trash2 className="size-5" />}
        confirmationText="delete"
        onConfirm={remove}
      />
      <ConfirmationAlertDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selected.size} user ${selected.size === 1 ? "account" : "accounts"}?`}
        description="Selected login accounts will be permanently removed. Their linked person profiles are preserved."
        confirmLabel="Delete selected"
        destructive
        icon={<Trash2 className="size-5" />}
        onConfirm={removeBulk}
      />
    </div>
  );
}

function UsersTable({
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
  onToggleStatus,
  onDelete,
}: {
  rows: UserAccount[];
  loading: boolean;
  from: number;
  selected: Set<number>;
  hasActiveFilters: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onCreate: () => void;
  onView: (user: UserAccount) => void;
  onEdit: (user: UserAccount) => void;
  onToggleStatus: (user: UserAccount) => void;
  onDelete: (user: UserAccount) => void;
}) {
  if (loading && rows.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
            <TableHead className="w-14">#</TableHead>
            <TableHead>Full name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email address</TableHead>
            <TableHead>User role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
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
              <TableCell>
                <Skeleton className="h-4 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
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
          icon={UserX}
          title={
            hasActiveFilters
              ? "No matching user accounts"
              : "No user accounts yet"
          }
          description={
            hasActiveFilters
              ? "Try changing the search query, role or status filter."
              : "Create the first user account to grant access to the platform."
          }
          action={
            !hasActiveFilters ? (
              <Button size="sm" onClick={onCreate}>
                <Plus />
                Create account
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  const allSelected =
    rows.length > 0 && rows.every((user) => selected.has(user.id));
  const someSelected = rows.some((user) => selected.has(user.id));

  return (
    <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                aria-label="Select all user accounts on this page"
                checked={
                  allSelected ? true : someSelected ? "indeterminate" : false
                }
                onCheckedChange={(value) => onToggleAll(value === true)}
              />
            </TableHead>
            <TableHead className="w-14">#</TableHead>
            <TableHead>Full name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email address</TableHead>
            <TableHead>User role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((user, index) => {
            const isSelected = selected.has(user.id);

            return (
              <TableRow
                key={user.id}
                data-state={isSelected ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${user.username}`}
                    checked={isSelected}
                    onCheckedChange={(value) =>
                      onToggleOne(user.id, value === true)
                    }
                  />
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {from + index}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {user.profile?.name ?? "Unlinked profile"}
                  </p>
                  {user.profile?.phone ? (
                    <p className="text-xs text-muted-foreground">
                      {user.profile.phone}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.roleLabel}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${user.username}`}
                      >
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onView(user)}>
                        <Eye />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onEdit(user)}>
                        <Pencil />
                        Update account
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onToggleStatus(user)}>
                        {user.status === "active" ? <UserX /> : <UserCheck />}
                        {user.status === "active" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        destructive
                        onSelect={() => onDelete(user)}
                      >
                        <Trash2 />
                        Delete account
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

function UserAccountFormDialog({
  open,
  onOpenChange,
  options,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: UserFormOptions;
  user?: UserAccount;
  onSaved: () => Promise<void>;
}) {
  const editing = Boolean(user);
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role ?? "systemUser");
  const [status, setStatus] = useState(user?.status ?? "active");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(
    () => new Set(user?.permissions.map((item) => item.id) ?? []),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resourceKey = roleResourceKey(role);
  const roleConfig = useMemo(
    () => getPeopleResourceConfig(resourceKey),
    [resourceKey],
  );

  const roleSections = useMemo(
    () =>
      roleConfig.sections
        .map((section) => ({
          ...section,
          fields: section.fields.filter(
            (field) => !CREDENTIAL_FIELD_NAMES.has(field.name),
          ),
        }))
        .filter((section) => section.fields.length > 0),
    [roleConfig.sections],
  );

  const roleFields = useMemo(
    () => roleSections.flatMap((section) => section.fields),
    [roleSections],
  );

  const peopleOptions: PeopleOptions = useMemo(
    () => ({
      farms: options.farms ?? [],
      countries: options.countries ?? [],
      regions: options.regions ?? [],
      districts: options.districts ?? [],
      wards: options.wards ?? [],
      villages: options.villages ?? [],
      streets: options.streets ?? [],
      identityCardTypes: options.identityCardTypes ?? [],
      schoolLevels: options.schoolLevels ?? [],
    }),
    [options],
  );

  const [profileValues, setProfileValues] = useState<Record<string, string>>(
    () => initialRoleValues(roleFields, user?.profileDetails),
  );
  const [checkboxValues, setCheckboxValues] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        roleFields
          .filter((field) => field.type === "checkbox")
          .map((field) => [
            field.name,
            Boolean(
              user?.profileDetails?.[field.name] ?? field.defaultValue ?? false,
            ),
          ]),
      ),
  );

  const handleRoleChange = useCallback(
    (nextRole: string) => {
      setRole(nextRole);
      const nextConfig = getPeopleResourceConfig(roleResourceKey(nextRole));
      const nextFields = nextConfig.sections
        .flatMap((section) => section.fields)
        .filter((field) => !CREDENTIAL_FIELD_NAMES.has(field.name));
      setProfileValues((prev) => {
        const defaults = initialRoleValues(
          nextFields,
          user?.role === nextRole ? user?.profileDetails : null,
        );
        return {
          ...defaults,
          ...Object.fromEntries(
            Object.entries(prev).filter(
              ([key, val]) => val !== "" && key in defaults,
            ),
          ),
        };
      });
    },
    [user?.profileDetails, user?.role],
  );

  const handleFieldChange = useCallback(
    (fieldName: string, nextValue: string) => {
      setProfileValues((previous) => {
        const next = { ...previous, [fieldName]: nextValue };
        const clearChildren = (parentName: string) => {
          for (const candidate of roleFields) {
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
    [roleFields],
  );

  const roleLabel =
    options.roles.find((item) => item.value === role)?.label ?? "Role";

  const validateCredentialsStep = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    if (!username.trim()) nextErrors.username = "Username is required.";
    if (!email.trim()) nextErrors.email = "Email address is required.";
    if (!editing && !password) {
      nextErrors.password = "Password is required.";
    } else if (password && password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (!status) nextErrors.status = "Account status is required.";
    if (!role) nextErrors.role = "User role is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      toast.error(Object.values(nextErrors)[0]);
      return false;
    }
    return true;
  }, [editing, email, password, role, status, username]);

  const validateRoleFields = useCallback(
    (fieldsToCheck: FormField[]) => {
      const nextErrors: Record<string, string> = {};
      for (const field of fieldsToCheck) {
        if (field.type === "checkbox") continue;
        const value = String(profileValues[field.name] ?? "").trim();
        const isRequired = Boolean(
          field.required || (field.requiredOnCreate && !editing),
        );
        if (isRequired && value === "") {
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
    [editing, profileValues],
  );

  const validateStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex === 0) {
        return validateCredentialsStep();
      }
      const roleSection = roleSections[stepIndex - 1];
      if (roleSection) {
        return validateRoleFields(roleSection.fields);
      }
      return true;
    },
    [roleSections, validateCredentialsStep, validateRoleFields],
  );

  const submit = async () => {
    setErrors({});
    if (!validateCredentialsStep() || !validateRoleFields(roleFields)) {
      return false;
    }

    const payload: Record<string, unknown> = {
      username: username.trim(),
      email: email.trim(),
      password,
      role,
      status,
      platformPermissions: Array.from(selectedPermissions),
    };

    for (const field of roleFields) {
      if (field.type === "checkbox") {
        payload[field.name] = Boolean(checkboxValues[field.name]);
        continue;
      }
      const value = String(profileValues[field.name] ?? "").trim();
      payload[field.name] =
        value === "" ? null : field.type === "number" ? Number(value) : value;
    }

    try {
      const response = await authenticatedFetch(
        editing ? `/api/admin/users/${user!.id}` : "/api/admin/users",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) {
          setErrors(
            Object.fromEntries(
              Object.entries(result.errors).map(([key, value]) => [
                key,
                Array.isArray(value) ? String(value[0]) : String(value),
              ]),
            ),
          );
        }
        throw new Error(
          result.message ??
            firstError(result.errors) ??
            "The account could not be saved.",
        );
      }
      toast.success(
        editing
          ? "User account and profile updated."
          : "User account and role profile created.",
      );
      await onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The account could not be saved.",
      );
      return false;
    }
  };

  const steps: FormStep[] = useMemo(() => {
    const baseSteps: FormStep[] = [
      {
        id: "account-credentials",
        title: "Credentials & role",
        description:
          "Login credentials, account status and user role. Selecting a role configures the profile steps.",
        fieldNames: ["username", "email", "password", "status", "role"],
        fieldCount: 5,
        content: (
          <div className="form-row-grid">
            <Field>
              <FieldLabel htmlFor="user-username" required>
                Username
              </FieldLabel>
              <Input
                id="user-username"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                aria-invalid={Boolean(errors.username)}
                required
              />
              <FieldError>{errors.username}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="user-email" required>
                Email address
              </FieldLabel>
              <Input
                id="user-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                required
              />
              <FieldError>{errors.email}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="user-password" required={!editing}>
                {editing ? "New password" : "Password"}
              </FieldLabel>
              <Input
                id="user-password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required={!editing}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
              />
              <FieldDescription>
                {editing
                  ? "Leave blank to retain the current password."
                  : "Use at least 8 characters."}
              </FieldDescription>
              <FieldError>{errors.password}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="user-status" required>
                Account status
              </FieldLabel>
              <FormSelect
                id="user-status"
                value={status}
                onValueChange={setStatus}
                options={options.statuses}
                invalid={Boolean(errors.status)}
              />
              <FieldError>{errors.status}</FieldError>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="user-role" required>
                User role
              </FieldLabel>
              <FormSelect
                id="user-role"
                value={role}
                onValueChange={handleRoleChange}
                options={options.roles}
                invalid={Boolean(errors.role)}
              />
              <FieldDescription>
                {options.roles.find((item) => item.value === role)?.description}
              </FieldDescription>
              <FieldError>{errors.role}</FieldError>
            </Field>
          </div>
        ),
      },
      ...roleSections.map((section, index) => ({
        id: `role-${role}-step-${index}`,
        title: `${roleLabel} · ${section.title}`,
        description: section.description,
        fieldNames: section.fields.map((field) => field.name),
        fieldCount: section.fields.length,
        content: (
          <div className="form-row-grid">
            {section.fields.map((field) => (
              <RoleProfileField
                key={`${role}-${field.name}`}
                field={field}
                profileDetails={user?.profileDetails}
                options={peopleOptions}
                values={profileValues}
                onChange={handleFieldChange}
                checkboxValue={Boolean(checkboxValues[field.name])}
                onCheckboxChange={(checked) =>
                  setCheckboxValues((prev) => ({
                    ...prev,
                    [field.name]: checked,
                  }))
                }
                error={errors[field.name]}
                editing={editing}
              />
            ))}
          </div>
        ),
      })),
    ];

    if (role === "systemUser") {
      baseSteps.push({
        id: "platform-permissions",
        title: "Platform permissions",
        description:
          "Grant only the administrative capabilities this system user needs.",
        fieldNames: ["platformPermissions"],
        fieldCount: Math.max(options.permissions.length, 1),
        content: (
          <div className="form-row-grid">
            {options.permissions.map((permission) => {
              const checked = selectedPermissions.has(permission.id);
              return (
                <label
                  key={permission.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/20 p-3"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => {
                      setSelectedPermissions((prev) => {
                        const next = new Set(prev);
                        if (value === true) next.add(permission.id);
                        else next.delete(permission.id);
                        return next;
                      });
                    }}
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      {permission.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {permission.code}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        ),
      });
    }

    return baseSteps;
  }, [
    checkboxValues,
    editing,
    email,
    errors,
    handleFieldChange,
    handleRoleChange,
    options.permissions,
    options.roles,
    options.statuses,
    password,
    peopleOptions,
    profileValues,
    role,
    roleLabel,
    roleSections,
    selectedPermissions,
    status,
    user?.profileDetails,
    username,
  ]);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={editing ? "Update user account" : "Create user account"}
      description="Register login credentials and role-specific profile information."
      submitLabel={editing ? "Save changes" : "Create account"}
      steps={steps}
      errors={errors}
      allowStepJump={editing}
      onValidateStep={(stepIndex) => validateStep(stepIndex)}
      onSubmit={submit}
    />
  );
}

function RoleProfileField({
  field,
  profileDetails,
  options,
  values,
  onChange,
  checkboxValue,
  onCheckboxChange,
  error,
  editing,
}: {
  field: FormField;
  profileDetails?: Record<string, unknown> | null;
  options: PeopleOptions;
  values: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
  checkboxValue: boolean;
  onCheckboxChange: (checked: boolean) => void;
  error?: string;
  editing: boolean;
}) {
  const id = `user-role-field-${field.name}`;
  const required = Boolean(
    field.required || (field.requiredOnCreate && !editing),
  );
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

  const resolvedNameKey = RESOLVED_NAME_FIELD_MAP[field.name];
  const fallbackLabel =
    resolvedNameKey && profileDetails?.[resolvedNameKey]
      ? String(profileDetails[resolvedNameKey])
      : null;
  const hasCurrentInChoices = choices.some((choice) => choice.value === current);

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
      ) : field.type === "textarea" ? (
        <Textarea
          id={id}
          value={current}
          onChange={(event) => onChange(field.name, event.target.value)}
          required={required}
          placeholder={field.placeholder}
          rows={3}
          aria-invalid={Boolean(error)}
        />
      ) : (
        <Input
          id={id}
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

function UserDetailsDialog({
  user,
  options,
  onOpenChange,
  onEdit,
}: {
  user: UserAccount | null;
  options: UserFormOptions | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (user: UserAccount) => void;
}) {
  const peopleOptions: PeopleOptions = useMemo(
    () => ({
      farms: options?.farms ?? [],
      countries: options?.countries ?? [],
      regions: options?.regions ?? [],
      districts: options?.districts ?? [],
      wards: options?.wards ?? [],
      villages: options?.villages ?? [],
      streets: options?.streets ?? [],
      identityCardTypes: options?.identityCardTypes ?? [],
      schoolLevels: options?.schoolLevels ?? [],
    }),
    [options],
  );

  const roleSections = useMemo(() => {
    if (!user) return [];
    const roleConfig = getPeopleResourceConfig(roleResourceKey(user.role));
    return roleConfig.sections.map((section) => ({
      ...section,
      fields: section.fields.filter((field) =>
        !CREDENTIAL_FIELD_NAMES.has(field.name) && field.type !== "password" && field.name !== "uuid",
      ),
    })).filter((section) => section.fields.length > 0);
  }, [user]);

  const profileRecord = (user?.profileDetails ?? null) as PeopleRecord | null;

  return (
    <CustomViewDetailsDialog
      open={Boolean(user)}
      onOpenChange={onOpenChange}
      title="User account details"
      description="Authentication, role-specific profile and platform access."
      actions={
        user ? (
          <Button type="button" onClick={() => onEdit(user)}>
            <Pencil />
            Update account
          </Button>
        ) : null
      }
    >
      {user ? (
        <div className="space-y-6">
          <DetailSection title="Account overview">
          <DetailItem label="Full name">
            {user.profile?.name ?? "Unlinked"}
          </DetailItem>
          <DetailItem label="Username">{user.username}</DetailItem>
          <DetailItem label="Email address">{user.email}</DetailItem>
          <DetailItem label="Phone">{user.profile?.phone ?? "—"}</DetailItem>
          <DetailItem label="Role">
            <Badge variant="secondary">{user.roleLabel}</Badge>
          </DetailItem>
          <DetailItem label="Status">
            <StatusBadge status={user.status} />
          </DetailItem>
          {user.profileDetails?.farmerNo ? (
            <DetailItem label="Farmer number">
              <Badge variant="outline" className="font-mono">
                {String(user.profileDetails.farmerNo)}
              </Badge>
            </DetailItem>
          ) : null}
          </DetailSection>
          {profileRecord ? roleSections.map((section) => (
            <DetailSection key={section.title} title={section.title}>
              {section.fields.map((field) => (
                <DetailItem key={field.name} label={field.label} className={field.full ? "sm:col-span-2" : undefined}>
                  {displayFieldValue(profileRecord, field, peopleOptions)}
                </DetailItem>
              ))}
            </DetailSection>
          )) : null}
          <DetailSection title="Access & record information">
          {user.profileDetails?.createdByName ? (
            <DetailItem label="Created by">
              {String(user.profileDetails.createdByName)}
            </DetailItem>
          ) : null}
          <DetailItem label="Created">{formatDate(user.createdAt)}</DetailItem>
          <DetailItem label="Updated">{formatDate(user.updatedAt)}</DetailItem>
          <div className="sm:col-span-2">
            <DetailItem label="Platform permissions">
              <div className="mt-1 flex flex-wrap gap-1.5">
                {user.permissions.length ? (
                  user.permissions.map((permission) => (
                    <Badge key={permission.id} variant="outline">
                      {permission.code}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs font-normal text-muted-foreground">
                    No explicit platform permissions.
                  </span>
                )}
              </div>
            </DetailItem>
          </div>
          </DetailSection>
        </div>
      ) : null}
    </CustomViewDetailsDialog>
  );
}

function displayFieldValue(
  record: PeopleRecord,
  field: FormField,
  options: PeopleOptions,
) {
  if (field.type === "checkbox") {
    return <StatusBadge status={Boolean(record[field.name])} />;
  }
  if (field.name === "status") {
    return <StatusBadge status={String(record[field.name] ?? "")} />;
  }

  const resolvedKey = RESOLVED_NAME_FIELD_MAP[field.name];
  if (resolvedKey) {
    const resolvedVal = record[resolvedKey];
    if (
      resolvedVal !== null &&
      resolvedVal !== undefined &&
      String(resolvedVal).trim() !== "" &&
      String(resolvedVal) !== "N/A"
    ) {
      return String(resolvedVal);
    }
  }

  const rawValue = record[field.name];
  const valueStr =
    rawValue === null || rawValue === undefined ? "" : String(rawValue);
  const choice = (
    field.options ??
    options[field.optionsKey ?? ""] ??
    []
  ).find((item) => item.value === valueStr);
  if (choice) return choice.label;
  if (field.type === "date") {
    return valueStr ? formatDate(valueStr) : "—";
  }
  if (resolvedKey) {
    return "—";
  }
  if (valueStr === "") return "—";
  return valueStr
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function initialRoleValues(
  fields: FormField[],
  profileDetails?: Record<string, unknown> | null,
) {
  return Object.fromEntries(
    fields.map((field) => {
      const raw = profileDetails?.[field.name] ?? field.defaultValue ?? "";
      return [field.name, raw === null || raw === undefined ? "" : String(raw)];
    }),
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-TZ", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
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
