"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { MoreVertical, Plus, RotateCcw, Trash2, UserX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { CustomViewDetailsDialog, DetailItem, DetailSection } from "@/components/ui/custom-view-details-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RegistryStatus } from "@/features/registry/registry-status";
import { registryRun, registrySend } from "@/features/registry/registry-api";
import { formatRecordDate } from "@/lib/resource-table";
import { centreLocation } from "./auction-columns";
import { roleOptions } from "./auction-config";
import type { AuctionCentreMemberRecord, AuctionCentreRecord } from "./types";

/** Centre details plus the people who run it: add by phone, change role, deactivate or remove. */
export function CentreDetails({ centre, open, onOpenChange, onChanged }: { centre: AuctionCentreRecord; open: boolean; onOpenChange: (open: boolean) => void; onChanged: () => void }) {
  const base = `/api/admin/auction/centres/${encodeURIComponent(centre.uuid)}/members`;
  const [members, setMembers] = useState<AuctionCentreMemberRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addRole, setAddRole] = useState("auctioneer");
  const [removing, setRemoving] = useState<AuctionCentreMemberRecord | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setMembers(await registrySend<AuctionCentreMemberRecord[]>(base, "GET"));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not load the members.");
    }
  }, [base]);

  useEffect(() => { if (open) void load(); }, [open, load]);

  const changed = () => { void load(); onChanged(); };
  const update = (member: AuctionCentreMemberRecord, body: Record<string, unknown>, success: string) =>
    registryRun(() => registrySend(`${base}/${member.id}`, "PUT", body), success, changed);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") ?? "").trim();
    const name = String(form.get("name") ?? "").trim() || null;
    const ok = await registryRun(() => registrySend(base, "POST", { phone, name, role: addRole }), "Member added. They sign in to the app with their phone number.", changed);
    if (ok) setAdding(false);
    return ok;
  }

  return <>
    <CustomViewDetailsDialog open={open} onOpenChange={onOpenChange} title={centre.name} description={`Auction centre · ${centre.code}`} size="xl">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Status"><RegistryStatus status={centre.status} /></DetailItem>
        <DetailItem label="Phone">{centre.phone || "—"}</DetailItem>
        <DetailItem label="Location">{centreLocation(centre)}</DetailItem>
        <DetailItem label="Auctions">{centre.sessionsCount ?? 0} total · {centre.liveCount ?? 0} live</DetailItem>
        {centre.description && <DetailItem label="Description" className="sm:col-span-2">{centre.description}</DetailItem>}
      </div>
      <DetailSection title="People at this centre" description="Managers and auctioneers can schedule and run auctions here. Clerks help with lots.">
        <div className="flex justify-end"><Button size="sm" onClick={() => setAdding(true)}><Plus />Add member</Button></div>
        {error ? <EmptyCard icon={RotateCcw} title="Could not load the members" description={error} action={<Button variant="outline" onClick={() => void load()}>Try again</Button>} />
          : members === null ? <div className="grid gap-2">{Array.from({ length: 3 }, (_, row) => <Skeleton key={row} className="h-10 w-full" />)}</div>
          : !members.length ? <EmptyCard icon={Users} title="No members yet" description="Add the centre manager and auctioneers by their phone number." />
          : <Table aria-label={`Members of ${centre.name}`}>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Added</TableHead><TableHead className="w-12"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
            <TableBody>{members.map((member) => <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name || member.email || "—"}</TableCell>
              <TableCell>{member.phone || "—"}</TableCell>
              <TableCell className="min-w-36"><FormSelect id={`member-role-${member.id}`} size="sm" value={member.role} options={roleOptions}
                onValueChange={(role) => { if (role !== member.role) void update(member, { role }, "Role updated."); }} /></TableCell>
              <TableCell><RegistryStatus status={member.status} /></TableCell>
              <TableCell className="text-muted-foreground">{formatRecordDate(member.createdAt)}</TableCell>
              <TableCell className="text-right"><DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.name ?? "member"}`}><MoreVertical /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {member.status === "active"
                    ? <DropdownMenuItem onSelect={() => void update(member, { status: "inactive" }, "Member deactivated.")}><UserX />Deactivate</DropdownMenuItem>
                    : <DropdownMenuItem onSelect={() => void update(member, { status: "active" }, "Member activated.")}><RotateCcw />Activate</DropdownMenuItem>}
                  <DropdownMenuItem destructive onSelect={() => setRemoving(member)}><Trash2 />Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu></TableCell>
            </TableRow>)}</TableBody>
          </Table>}
      </DetailSection>
    </CustomViewDetailsDialog>

    {adding && <FormDialog open={adding} onOpenChange={setAdding} onSubmit={add} submitLabel="Add member" title={`Add member to ${centre.name}`}
      description="If the phone number has no account yet, one is created. They sign in to the app with it and set their own PIN.">
      <Field><FieldLabel htmlFor="member-phone" required>Phone number</FieldLabel><Input id="member-phone" name="phone" type="tel" required maxLength={30} /></Field>
      <Field><FieldLabel htmlFor="member-name">Full name</FieldLabel><Input id="member-name" name="name" maxLength={150} /><FieldDescription>Used only when a new account is created.</FieldDescription></Field>
      <Field><FieldLabel htmlFor="member-role">Role</FieldLabel><FormSelect id="member-role" value={addRole} onValueChange={setAddRole} options={roleOptions} /></Field>
    </FormDialog>}

    <ConfirmationAlertDialog open={Boolean(removing)} onOpenChange={(value) => { if (!value) setRemoving(null); }} title={`Remove ${removing?.name ?? "this member"}?`}
      description="They can no longer run auctions at this centre. Their account and past auctions are kept."
      confirmLabel="Remove" destructive onConfirm={async () => { if (removing) await registryRun(() => registrySend(`${base}/${removing.id}`, "DELETE"), "Member removed.", changed); setRemoving(null); }} />
  </>;
}
