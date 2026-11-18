"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Gavel,
  MoreVertical,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { BulkRecordAction } from "@/components/ui/bulk-record-action";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import { DashboardPage } from "@/components/ui/dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { RecordPagination } from "@/components/ui/record-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { commerceDateTime, commerceLabel, commerceMoney } from "@/features/commerce/commerce-config";
import styles from "@/features/dairy/factory-details-page.module.css";
import { RegistryStatus } from "@/features/registry/registry-status";
import { registryRun, registrySend } from "@/features/registry/registry-api";
import { formatRecordDate } from "@/lib/resource-table";
import { SessionActions } from "./auction-actions";
import { centreLocation } from "./auction-columns";
import { roleOptions } from "./auction-config";
import { CentreForm } from "./auction-forms";
import type { AuctionCentreMemberRecord, AuctionCentreRecord, AuctionSessionRecord } from "./types";

/** Dialog to add or edit a member (manager, auctioneer, or clerk) at an auction centre. */
export function CentreMemberDialog({
  centre,
  member,
  open,
  onOpenChange,
  onSaved,
}: {
  centre: { uuid: string; name: string };
  member?: AuctionCentreMemberRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const base = `/api/admin/auction/centres/${encodeURIComponent(centre.uuid)}/members`;
  const [role, setRole] = useState(member?.role ?? "auctioneer");
  const [status, setStatus] = useState(member?.status ?? "active");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (member) {
      const ok = await registryRun(
        () => registrySend(`${base}/${member.id}`, "PUT", { role, status }),
        "Member updated.",
        onSaved,
      );
      if (ok) onOpenChange(false);
      return ok;
    }
    const phone = String(form.get("phone") ?? "").trim();
    const name = String(form.get("name") ?? "").trim() || null;
    const ok = await registryRun(
      () => registrySend(base, "POST", { phone, name, role }),
      "Member added. They sign in to the app with their phone number.",
      onSaved,
    );
    if (ok) onOpenChange(false);
    return ok;
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitLabel={member ? "Save changes" : "Add member"}
      title={member ? `Edit ${member.name || member.phone || "member"}` : `Add member to ${centre.name}`}
      description={
        member
          ? "Update this member's centre role or access status."
          : "If the phone number has no account yet, one is created. They sign in to the app with it and set their own PIN."
      }
    >
      {!member && (
        <>
          <Field>
            <FieldLabel htmlFor="member-phone" required>
              Phone number (app sign-in)
            </FieldLabel>
            <Input id="member-phone" name="phone" type="tel" required maxLength={30} placeholder="+255 7XX XXX XXX" />
          </Field>
          <Field>
            <FieldLabel htmlFor="member-name">Full name</FieldLabel>
            <Input id="member-name" name="name" maxLength={150} placeholder="e.g. Juma Bakari" />
            <FieldDescription>Used when creating a new account for this phone number.</FieldDescription>
          </Field>
        </>
      )}
      <Field>
        <FieldLabel htmlFor="member-role">Role at the centre</FieldLabel>
        <FormSelect id="member-role" value={role} onValueChange={setRole} options={roleOptions} />
      </Field>
      {member && (
        <Field>
          <FieldLabel htmlFor="member-status">Status</FieldLabel>
          <FormSelect
            id="member-status"
            value={status}
            onValueChange={setStatus}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </Field>
      )}
    </FormDialog>
  );
}

function CentreMemberActions({
  centre,
  member,
  onChanged,
}: {
  centre: { uuid: string; name: string };
  member: AuctionCentreMemberRecord;
  onChanged: () => void;
}) {
  const [viewing, setViewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const base = `/api/admin/auction/centres/${encodeURIComponent(centre.uuid)}/members`;
  const label = member.name || member.phone || member.email || "member";
  const active = member.status === "active";

  const update = (body: Record<string, unknown>, success: string) =>
    registryRun(() => registrySend(`${base}/${member.id}`, "PUT", body), success, onChanged);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${label}`}>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setViewing(true)}>
            <Eye />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setEditing(true)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              void update(
                { status: active ? "inactive" : "active" },
                active ? "Member deactivated." : "Member activated.",
              )
            }
          >
            {active ? <UserX /> : <RotateCcw />}
            {active ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => setRemoving(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomViewDetailsDialog
        open={viewing}
        onOpenChange={setViewing}
        title={label}
        description={`${commerceLabel(member.role)} at ${centre.name}`}
        size="lg"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Full name">{member.name || "—"}</DetailItem>
          <DetailItem label="Phone (app sign-in)">{member.phone || "—"}</DetailItem>
          <DetailItem label="Email">{member.email || "—"}</DetailItem>
          <DetailItem label="Role">{commerceLabel(member.role)}</DetailItem>
          <DetailItem label="Status">
            <StatusBadge status={active ? "active" : "inactive"} />
          </DetailItem>
          <DetailItem label="Created at">{formatRecordDate(member.createdAt)}</DetailItem>
        </div>
      </CustomViewDetailsDialog>

      {editing && (
        <CentreMemberDialog
          centre={centre}
          member={member}
          open={editing}
          onOpenChange={setEditing}
          onSaved={onChanged}
        />
      )}

      <ConfirmationAlertDialog
        open={removing}
        onOpenChange={setRemoving}
        title={`Remove ${label}?`}
        description="They are removed from this auction centre and can no longer schedule or run auctions here. Their app account and past auctions are kept."
        confirmLabel="Remove"
        destructive
        onConfirm={async () => {
          await registryRun(() => registrySend(`${base}/${member.id}`, "DELETE"), "Member removed.", onChanged);
          setRemoving(false);
        }}
      />
    </>
  );
}

function CentreMembersTable({
  members,
  title,
  centre,
  onChanged,
}: {
  members: AuctionCentreMemberRecord[];
  title: string;
  centre: { uuid: string; name: string };
  onChanged: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("desc");
  const [pageSize, setPageSize] = useState(10);

  const filtered = members
    .filter(
      (m) =>
        (status === "all" || m.status === status) &&
        [m.name, m.phone, m.email, m.role].some((v) =>
          v?.toLowerCase().includes(search.trim().toLowerCase()),
        ),
    )
    .sort((a, b) => {
      if (sort.startsWith("alpha")) {
        return (a.name || "").localeCompare(b.name || "") * (sort === "alpha-asc" ? 1 : -1);
      }
      const time = (value?: string | null) => (value ? Date.parse(value) || 0 : 0);
      return (time(a.createdAt) - time(b.createdAt)) * (sort === "asc" ? 1 : -1) || a.id - b.id;
    });

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const visibleSelected = rows.filter((m) => selected.has(m.id));
  const allSelected = rows.length > 0 && visibleSelected.length === rows.length;
  const toggle = (id: number, on: boolean) =>
    setSelected((old) => {
      const next = new Set(old);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <TablePanel>
      <TableToolbar>
        <div className="relative min-w-0 flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            aria-label={`Search ${title}`}
            placeholder={`Search ${title}…`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <BulkRecordAction
            ids={[...selected].filter((id) => members.some((m) => m.id === id))}
            action="delete"
            getRequest={(id) => ({
              url: `/api/admin/auction/centres/${encodeURIComponent(centre.uuid)}/members/${encodeURIComponent(String(id))}`,
              method: "DELETE",
            })}
            onComplete={() => {
              setSelected(new Set());
              onChanged();
            }}
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter members by status" size="sm" className="h-8 w-auto min-w-32 font-normal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Sort members" size="sm" className="h-8 w-auto min-w-[9.5rem] font-normal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
              <SelectItem value="alpha-asc">Name (A–Z)</SelectItem>
              <SelectItem value="alpha-desc">Name (Z–A)</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Rows per page" size="sm" className="h-8 w-auto min-w-[6.25rem] font-normal">
              <span className="text-muted-foreground">Show</span>
              <SelectValue />
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

      {rows.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  aria-label={`Select all ${title} on this page`}
                  checked={allSelected ? true : visibleSelected.length ? "indeterminate" : false}
                  onCheckedChange={(v) =>
                    setSelected((old) => {
                      const next = new Set(old);
                      rows.forEach((m) => (v === true ? next.add(m.id) : next.delete(m.id)));
                      return next;
                    })
                  }
                />
              </TableHead>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((member, index) => (
              <TableRow key={member.id} data-state={selected.has(member.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${member.name || member.phone || "member"}`}
                    checked={selected.has(member.id)}
                    onCheckedChange={(v) => toggle(member.id, v === true)}
                  />
                </TableCell>
                <TableCell>{(current - 1) * pageSize + index + 1}</TableCell>
                <TableCell className="font-medium">{member.name || member.email || "—"}</TableCell>
                <TableCell>{member.phone || "—"}</TableCell>
                <TableCell>{commerceLabel(member.role)}</TableCell>
                <TableCell>
                  <StatusBadge status={member.status === "active" ? "active" : "inactive"} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatRecordDate(member.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <CentreMemberActions centre={centre} member={member} onChanged={onChanged} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-5">
          <EmptyCard icon={Users} title={`No ${title} found`} description="Add a member or adjust your search." />
        </div>
      )}
      <RecordPagination
        from={rows.length ? (current - 1) * pageSize + 1 : 0}
        to={Math.min(current * pageSize, filtered.length)}
        total={filtered.length}
        page={current}
        pageCount={pages}
        onPageChange={setPage}
      />
    </TablePanel>
  );
}

function CentreSessionsTable({
  sessions,
  onChanged,
}: {
  sessions: AuctionSessionRecord[];
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("desc");
  const [pageSize, setPageSize] = useState(10);

  const filtered = sessions
    .filter(
      (s) =>
        (status === "all" || s.status === status) &&
        [s.title, s.officer?.fullName, s.host?.name].some((v) =>
          v?.toLowerCase().includes(search.trim().toLowerCase()),
        ),
    )
    .sort((a, b) => {
      if (sort.startsWith("alpha")) {
        return (a.title || "").localeCompare(b.title || "") * (sort === "alpha-asc" ? 1 : -1);
      }
      const time = (value?: string | null) => (value ? Date.parse(value) || 0 : 0);
      return (time(a.createdAt) - time(b.createdAt)) * (sort === "asc" ? 1 : -1) || a.id - b.id;
    });

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <TablePanel>
      <TableToolbar>
        <div className="relative min-w-0 flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            aria-label="Search auction sessions"
            placeholder="Search auction title or auctioneer…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter sessions by status" size="sm" className="h-8 w-auto min-w-32 font-normal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Sort sessions" size="sm" className="h-8 w-auto min-w-[9.5rem] font-normal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
              <SelectItem value="alpha-asc">Title (A–Z)</SelectItem>
              <SelectItem value="alpha-desc">Title (Z–A)</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Rows per page" size="sm" className="h-8 w-auto min-w-[6.25rem] font-normal">
              <span className="text-muted-foreground">Show</span>
              <SelectValue />
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

      {rows.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Auction</TableHead>
              <TableHead>Auctioneer</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Lots</TableHead>
              <TableHead>Total sales</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((session, index) => (
              <TableRow key={session.uuid}>
                <TableCell>{(current - 1) * pageSize + index + 1}</TableCell>
                <TableCell>
                  <p className="font-medium">{session.title}</p>
                  <p className="text-xs text-muted-foreground">{commerceLabel(session.mode)}</p>
                </TableCell>
                <TableCell>{session.officer?.fullName || session.host?.name || "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {commerceDateTime(session.startedAt || session.scheduledAt)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {session.lotsCount ?? 0} ({session.soldCount ?? 0} sold)
                </TableCell>
                <TableCell className="tabular-nums">
                  {commerceMoney(session.grossSales, session.currency ?? "TZS")}
                </TableCell>
                <TableCell>
                  <RegistryStatus status={session.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatRecordDate(session.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <SessionActions row={session} onChanged={onChanged} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-5">
          <EmptyCard
            icon={Gavel}
            title="No auction sessions found"
            description="Scheduled, live, and past auctions conducted at this centre will appear here."
          />
        </div>
      )}
      <RecordPagination
        from={rows.length ? (current - 1) * pageSize + 1 : 0}
        to={Math.min(current * pageSize, filtered.length)}
        total={filtered.length}
        page={current}
        pageCount={pages}
        onPageChange={setPage}
      />
    </TablePanel>
  );
}

/**
 * Full-page Auction Centre details view, following the exact design pattern of FactoryDetailsPage.
 */
export function AuctionCentreDetailsPage({ uuid }: { uuid: string }) {
  const [centre, setCentre] = useState<AuctionCentreRecord | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [tab, setTab] = useState("details");

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await registrySend<AuctionCentreRecord>(
        `/api/admin/auction/centres/${encodeURIComponent(uuid)}`,
        "GET",
      );
      setCentre(data);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Auction centre could not be loaded.");
    }
  }, [uuid]);

  useEffect(() => {
    void load();
  }, [load, revision]);

  const reload = () => setRevision((n) => n + 1);

  if (error) {
    return (
      <DashboardPage>
        <Button variant="outline" asChild>
          <Link href="/dashboard/auction/centres">
            <ArrowLeft />
            Auction Centres
          </Link>
        </Button>
        <EmptyCard
          icon={Gavel}
          title="Could not load auction centre"
          description={error}
          action={<Button onClick={reload}>Try again</Button>}
        />
      </DashboardPage>
    );
  }

  if (!centre) {
    return (
      <DashboardPage>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </DashboardPage>
    );
  }

  const members = centre.members ?? [];
  const sessions = centre.sessions ?? [];
  const managers = members.filter((m) => m.role === "manager");
  const officersAndClerks = members.filter((m) => m.role !== "manager");
  const activeMembers = members.filter((m) => m.status === "active");
  const initials = centre.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const details: [string, string | null | undefined][] = [
    ["Market / centre name", centre.name],
    ["Centre code", centre.code],
    ["Location", [centre.wardName, centre.districtName, centre.regionName].filter(Boolean).join(", ") || centreLocation(centre)],
    ["Physical address", centre.address],
    [
      "GPS coordinates",
      centre.latitude != null && centre.longitude != null
        ? `${centre.latitude}, ${centre.longitude}`
        : null,
    ],
    ["Centre office / enquiries phone", centre.phone],
    ["Auction sessions", `${centre.sessionsCount ?? sessions.length} total · ${centre.liveCount ?? 0} live`],
    ["Description", centre.description],
    ["Created at", formatRecordDate(centre.createdAt)],
  ];

  return (
    <DashboardPage>
      <DashboardHeader
        parent="Auction Centres"
        parentHref="/dashboard/auction/centres"
        title="Auction centre details"
        description="Livestock market information, scheduled auctions, and the managers, auctioneers, and clerks who run it."
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/auction/centres">
              <ArrowLeft />
              Back to auction centres
            </Link>
          </Button>
        }
      />

      <section className={styles.summary} aria-label="Auction centre summary">
        <div className={styles.identity}>
          <div aria-hidden="true" className={styles.avatar}>
            {initials || <Gavel />}
          </div>
          <div className="min-w-0">
            <h2 className={styles.name}>{centre.name}</h2>
            <div className="mt-3">
              <StatusBadge status={centre.status === "active" ? "active" : "inactive"} />
            </div>
            <dl className={styles.metadata}>
              <div>
                <dt>Location</dt>
                <dd>{centreLocation(centre)}</dd>
              </div>
              <div>
                <dt>Centre code</dt>
                <dd>{centre.code || "—"}</dd>
              </div>
            </dl>
          </div>
          <div className={styles.actions}>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil />
              Update details
            </Button>
            <Button onClick={() => setAddingMember(true)}>
              <UserPlus />
              Add user or manager
            </Button>
          </div>
        </div>

        <dl className={styles.totals}>
          {[
            ["Managers", managers.length],
            ["Auctioneers & clerks", officersAndClerks.length],
            ["Active members", activeMembers.length],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className={styles.totalLabel}>{label}</dt>
              <dd className={styles.totalValue}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className={styles.tabs} style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
          <TabsTrigger className="w-full min-w-0 justify-self-stretch" style={{ width: "100%" }} value="details">
            Centre details
          </TabsTrigger>
          <TabsTrigger className="w-full min-w-0 justify-self-stretch" style={{ width: "100%" }} value="sessions">
            Auction sessions ({sessions.length})
          </TabsTrigger>
          <TabsTrigger className="w-full min-w-0 justify-self-stretch" style={{ width: "100%" }} value="managers">
            Managers ({managers.length})
          </TabsTrigger>
          <TabsTrigger className="w-full min-w-0 justify-self-stretch" style={{ width: "100%" }} value="users">
            Auctioneers &amp; clerks ({officersAndClerks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <section className="rounded-2xl border bg-card p-5 sm:p-7">
            <h3 className="mb-5 text-lg font-semibold">Details</h3>
            <dl className="divide-y border-t">
              {details.map(([label, value]) => (
                <div key={label} className="grid gap-2 py-4 text-sm sm:grid-cols-2">
                  <dt className="font-medium text-muted-foreground">{label}</dt>
                  <dd className="break-words font-medium">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </section>
        </TabsContent>

        <TabsContent value="sessions">
          <CentreSessionsTable sessions={sessions} onChanged={reload} />
        </TabsContent>

        <TabsContent value="managers">
          <CentreMembersTable members={managers} title="managers" centre={centre} onChanged={reload} />
        </TabsContent>

        <TabsContent value="users">
          <CentreMembersTable
            members={officersAndClerks}
            title="auctioneers and clerks"
            centre={centre}
            onChanged={reload}
          />
        </TabsContent>
      </Tabs>

      {editing && <CentreForm centre={centre} open={editing} onOpenChange={setEditing} onSaved={reload} />}
      {addingMember && (
        <CentreMemberDialog
          centre={centre}
          open={addingMember}
          onOpenChange={setAddingMember}
          onSaved={reload}
        />
      )}
    </DashboardPage>
  );
}
