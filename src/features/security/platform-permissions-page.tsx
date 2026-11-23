"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Search,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardStatCard } from "@/components/ui/dashboard";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatNumber } from "@/components/ui/stat-number";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import {
  canEnterPortal,
  getRoleDisplayLabel,
  getVisibleSections,
  PORTAL_COOP_ROLES,
  type PlatformRole,
} from "@/lib/permissions";

type Permission = { code: string; name: string };

type Account = {
  id: number;
  username: string;
  email?: string | null;
  role: string;
  platformRole: PlatformRole;
  cooperativeRoles?: string[];
  canEnterPortal?: boolean;
  hasCustomPermissions?: boolean;
  status: string;
  permissions: string[];
};

type PermissionData = {
  actor: { id: number; platformRole: PlatformRole };
  users: Account[];
  permissions: Permission[];
};

const SECTION_LABELS: Record<string, string> = {
  people: "People",
  events: "Events",
  animals: "Animals & Farms",
  career: "Careers",
  commerce: "Commerce",
  auction: "Auctions",
  vet: "Veterinary",
  dairy: "Cooperatives",
  blueprints: "Animal Setup",
  finance: "Finance",
  reference: "Reference Data",
  locations: "Locations",
  security: "Security",
};

const PERMISSION_GROUPS: { title: string; prefixes: string[] }[] = [
  { title: "Accounts & People", prefixes: ["accounts.", "reports."] },
  { title: "Cooperatives & Dairy", prefixes: ["dairy."] },
  { title: "Animals & Events", prefixes: ["subjects.", "events.", "records."] },
  { title: "Veterinary & Auctions", prefixes: ["vet.", "auction."] },
  { title: "Commerce & Finance", prefixes: ["commerce.", "finance."] },
  { title: "Configuration & Setup", prefixes: ["configuration."] },
  { title: "System & Security", prefixes: ["upgrades.", "permissions."] },
];

const COOP_ROLE_LABELS: Record<string, string> = {
  mcu_admin: "MCU Admin",
  amcos_admin: "AMCOS Admin",
  amcos_user: "AMCOS User",
  centre_clerk: "Centre Clerk",
};

export function PlatformPermissionsPage() {
  const [data, setData] = useState<PermissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState<"all" | "portal" | "app_only">("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [editingUser, setEditingUser] = useState<Account | null>(null);
  const [draftRole, setDraftRole] = useState<PlatformRole>("appUser");
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await authenticatedFetch("/api/admin/platform-permissions", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Permissions could not be loaded.");
      }
      setData(payload.data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Permissions could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const users = useMemo(() => data?.users ?? [], [data?.users]);
  const allPermissions = useMemo(() => data?.permissions ?? [], [data?.permissions]);

  const stats = useMemo(() => {
    const portalEnabled = users.filter((u) => u.canEnterPortal ?? canEnterPortal(u)).length;
    const superAdmins = users.filter((u) => u.platformRole === "superAdmin").length;
    const coopStaff = users.filter((u) =>
      (u.cooperativeRoles ?? []).some((r) => (PORTAL_COOP_ROLES as readonly string[]).includes(r)),
    ).length;
    return {
      total: users.length,
      portalEnabled,
      superAdmins,
      coopStaff,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return users.filter((user) => {
      const portalOk = user.canEnterPortal ?? canEnterPortal(user);
      if (accessFilter === "portal" && !portalOk) return false;
      if (accessFilter === "app_only" && portalOk) return false;

      if (roleFilter !== "all") {
        if (roleFilter === "mcu_admin" || roleFilter === "amcos_user") {
          if (!(user.cooperativeRoles ?? []).includes(roleFilter)) return false;
        } else if (user.platformRole !== roleFilter) {
          return false;
        }
      }

      if (!term) return true;
      const haystack = [
        user.username,
        user.email ?? "",
        user.role,
        user.platformRole,
        ...(user.cooperativeRoles ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [users, query, accessFilter, roleFilter]);

  const groupedPermissions = useMemo(() => {
    const used = new Set<string>();
    const groups = PERMISSION_GROUPS.map((group) => {
      const items = allPermissions.filter((perm) =>
        group.prefixes.some((prefix) => perm.code.startsWith(prefix)),
      );
      items.forEach((item) => used.add(item.code));
      return { title: group.title, items };
    }).filter((group) => group.items.length > 0);

    const remaining = allPermissions.filter((perm) => !used.has(perm.code));
    if (remaining.length > 0) {
      groups.push({ title: "Other Permissions", items: remaining });
    }
    return groups;
  }, [allPermissions]);

  const openEditor = (user: Account) => {
    setEditingUser(user);
    setDraftRole(user.platformRole);
    setDraftPermissions(
      user.platformRole === "superAdmin"
        ? allPermissions.map((p) => p.code)
        : [...user.permissions],
    );
  };

  const applyPreset = (preset: "mcu_admin" | "amcos_user" | "auditor" | "clear") => {
    if (preset === "mcu_admin") {
      setDraftPermissions(["dairy.view", "dairy.manage", "reports.view"]);
    } else if (preset === "amcos_user") {
      setDraftPermissions(["dairy.view", "reports.view"]);
    } else if (preset === "auditor") {
      setDraftPermissions(
        allPermissions
          .map((p) => p.code)
          .filter((code) => code.endsWith(".view")),
      );
    } else {
      setDraftPermissions([]);
    }
  };

  const toggleGroup = (codes: string[], selectAll: boolean) => {
    setDraftPermissions((current) => {
      const next = new Set(current);
      for (const code of codes) {
        if (code === "permissions.manage" && data?.actor.platformRole !== "superAdmin") {
          continue;
        }
        if (selectAll) next.add(code);
        else next.delete(code);
      }
      return Array.from(next);
    });
  };

  const saveAccess = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const response = await authenticatedFetch(`/api/admin/platform-permissions/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissions: draftRole === "superAdmin" ? allPermissions.map((p) => p.code) : draftPermissions,
          platformRole: draftRole,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Permissions could not be updated.");
      }
      toast.success(`Access updated for ${editingUser.username}.`);
      setEditingUser(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Permissions could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  const previewSections = useMemo(() => {
    if (!editingUser) return [];
    return getVisibleSections({
      platformRole: draftRole,
      cooperativeRoles: editingUser.cooperativeRoles,
      permissions: draftPermissions,
    });
  }, [editingUser, draftRole, draftPermissions]);

  const isEditingSelf = editingUser && data ? String(editingUser.id) === String(data.actor.id) : false;
  const actorIsSuperAdmin = data?.actor.platformRole === "superAdmin";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        eyebrow="System & Security"
        parent="Security"
        parentHref="/dashboard/security"
        title="Platform Permissions & Portal Access"
        description="Manage which accounts can enter the admin portal (SuperAdmin, Admin, MCU Admin, AMCOS User) and control which sections each user can see."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard label="Total Accounts" value={<StatNumber value={stats.total} />} note="Registered platform accounts" />
        <DashboardStatCard label="Portal Enabled" value={<StatNumber value={stats.portalEnabled} />} note="Allowed into admin portal" />
        <DashboardStatCard label="SuperAdmins" value={<StatNumber value={stats.superAdmins} />} note="Unrestricted platform access" />
        <DashboardStatCard label="MCU & AMCOS Staff" value={<StatNumber value={stats.coopStaff} />} note="Cooperative portal accounts" />
      </div>

      <TablePanel>
        <TableToolbar>
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search username, email, role..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select
              value={accessFilter}
              onValueChange={(value) => setAccessFilter(value as "all" | "portal" | "app_only")}
            >
              <SelectTrigger size="sm" className="h-8 w-auto min-w-[9rem] text-xs font-normal">
                <SelectValue placeholder="Portal Access" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="portal">Portal Enabled</SelectItem>
                <SelectItem value="app_only">App Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger size="sm" className="h-8 w-auto min-w-[9rem] text-xs font-normal">
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="superAdmin">SuperAdmin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="mcu_admin">MCU Admin</SelectItem>
                <SelectItem value="amcos_user">AMCOS User</SelectItem>
                <SelectItem value="appUser">App User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TableToolbar>
        {loadError ? (
          <div className="p-6 text-center text-sm text-destructive">{loadError}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Portal Role &amp; Coop</TableHead>
                <TableHead>Portal Entry</TableHead>
                <TableHead>Visible Sections</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                    Loading platform accounts and permissions...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                    No matching accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => {
                  const portalOk = user.canEnterPortal ?? canEnterPortal(user);
                  const visibleSections = portalOk ? getVisibleSections(user) : [];
                  const roleLabel = getRoleDisplayLabel(user);

                  return (
                    <TableRow key={user.id} className="transition hover:bg-muted/30">
                      <TableCell className="tabular-nums text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{user.username}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email || `Account #${user.id} · ${user.role}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={
                              user.platformRole === "superAdmin"
                                ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                : user.platformRole === "admin"
                                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                  : "text-muted-foreground"
                            }
                          >
                            {roleLabel}
                          </Badge>
                          {(user.cooperativeRoles ?? []).map((coopRole) => (
                            <Badge key={coopRole} variant="secondary" className="text-[11px]">
                              {COOP_ROLE_LABELS[coopRole] ?? coopRole}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {portalOk ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            <CheckCircle2 className="mr-1 size-3" />
                            Allowed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <Lock className="mr-1 size-3" />
                            App Only
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!portalOk ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : user.platformRole === "superAdmin" ? (
                          <Badge variant="secondary" className="text-xs">
                            All 13 sections
                          </Badge>
                        ) : visibleSections.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Overview only</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {visibleSections.slice(0, 3).map((slug) => (
                              <Badge key={slug} variant="outline" className="text-[11px] font-normal">
                                {SECTION_LABELS[slug] ?? slug}
                              </Badge>
                            ))}
                            {visibleSections.length > 3 && (
                              <Badge variant="secondary" className="text-[11px]">
                                +{visibleSections.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums text-xs">
                        {user.platformRole === "superAdmin" ? (
                          <span className="font-medium text-foreground">All ({allPermissions.length})</span>
                        ) : (
                          <span className="text-muted-foreground">
                            {user.permissions.length} / {allPermissions.length}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.status === "active"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "text-muted-foreground"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs font-semibold"
                          onClick={() => openEditor(user)}
                        >
                          <SlidersHorizontal className="size-3.5" />
                          Manage Access
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </TablePanel>

      <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              Manage Portal Access — {editingUser?.username}
            </DialogTitle>
            <DialogDescription>
              Configure platform role and granular module permissions. Only permitted sections will be shown in this user&apos;s sidebar.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <DialogBody className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
              {isEditingSelf && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  You cannot modify your own role or permissions. Ask another SuperAdmin to make changes to your account.
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="edit-platform-role">Platform Role</FieldLabel>
                  <FormSelect
                    id="edit-platform-role"
                    value={draftRole}
                    disabled={!actorIsSuperAdmin || isEditingSelf}
                    onValueChange={(value) => {
                      const nextRole = value as PlatformRole;
                      setDraftRole(nextRole);
                      if (nextRole === "superAdmin") {
                        setDraftPermissions(allPermissions.map((p) => p.code));
                      }
                    }}
                    options={[
                      { value: "appUser", label: "App User (Coop roles still enter if approved)" },
                      { value: "admin", label: "Admin (Portal Staff)" },
                      { value: "superAdmin", label: "SuperAdmin (Full Access)" },
                    ]}
                  />
                </Field>

                <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                  <p className="font-semibold text-foreground">Cooperative &amp; Portal Status</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(editingUser.cooperativeRoles ?? []).length > 0 ? (
                      editingUser.cooperativeRoles!.map((r) => (
                        <Badge key={r} variant="secondary" className="text-[11px]">
                          {COOP_ROLE_LABELS[r] ?? r}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No approved cooperative role</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-muted-foreground">
                    Portal entry:{" "}
                    <span className="font-medium text-foreground">
                      {canEnterPortal({
                        platformRole: draftRole,
                        cooperativeRoles: editingUser.cooperativeRoles,
                      })
                        ? "Allowed"
                        : "Blocked (App Only)"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground">
                    Sidebar Visibility Preview ({previewSections.length} of {Object.keys(SECTION_LABELS).length} sections visible)
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(SECTION_LABELS).map(([slug, label]) => {
                    const visible = previewSections.includes(slug);
                    return (
                      <Badge
                        key={slug}
                        variant={visible ? "default" : "outline"}
                        className={
                          visible
                            ? "gap-1 text-[11px]"
                            : "gap-1 text-[11px] text-muted-foreground opacity-55"
                        }
                      >
                        {visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {draftRole !== "superAdmin" && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Quick presets:</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={isEditingSelf}
                      onClick={() => applyPreset("mcu_admin")}
                    >
                      MCU Admin (Dairy + Reports)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={isEditingSelf}
                      onClick={() => applyPreset("amcos_user")}
                    >
                      AMCOS User (Dairy View)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={isEditingSelf}
                      onClick={() => applyPreset("auditor")}
                    >
                      Read-Only All Views
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground"
                      disabled={isEditingSelf}
                      onClick={() => applyPreset("clear")}
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {groupedPermissions.map((group) => {
                      const groupCodes = group.items.map((item) => item.code);
                      const allChecked = groupCodes.every((code) => draftPermissions.includes(code));
                      return (
                        <div key={group.title} className="rounded-lg border p-3">
                          <div className="mb-2.5 flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {group.title}
                            </h4>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              disabled={isEditingSelf}
                              onClick={() => toggleGroup(groupCodes, !allChecked)}
                            >
                              {allChecked ? "Clear group" : "Select all"}
                            </Button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {group.items.map((permission) => {
                              const locked =
                                isEditingSelf ||
                                (permission.code === "permissions.manage" && !actorIsSuperAdmin);
                              const checked = draftPermissions.includes(permission.code);
                              return (
                                <label
                                  key={permission.code}
                                  className="flex cursor-pointer items-start gap-2.5 rounded-md bg-muted/35 p-2.5 text-xs transition hover:bg-muted/60"
                                >
                                  <Checkbox
                                    disabled={locked}
                                    checked={checked}
                                    onCheckedChange={(state) =>
                                      setDraftPermissions((current) =>
                                        state === true
                                          ? [...current, permission.code]
                                          : current.filter((c) => c !== permission.code),
                                      )
                                    }
                                  />
                                  <span className="min-w-0">
                                    <span className="block font-medium text-foreground">
                                      {permission.name}
                                    </span>
                                    <span className="font-mono text-[11px] text-muted-foreground">
                                      {permission.code}
                                    </span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {draftRole === "superAdmin" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                  SuperAdmins automatically have unrestricted access to all portal sections and permissions.
                </div>
              )}
            </DialogBody>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveAccess} disabled={saving || isEditingSelf}>
              {saving ? "Saving..." : "Save Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
