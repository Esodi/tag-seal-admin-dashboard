"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Ban, Check, Eye, MoreVertical, Pencil, RotateCcw, Trash2, Users, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { CustomViewDetailsDialog, DetailItem, DetailSection } from "@/components/ui/custom-view-details-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { commerceDateTime, commerceLabel, commerceMoney } from "@/features/commerce/commerce-config";
import { RegistryStatus } from "@/features/registry/registry-status";
import { registryRun, registrySend } from "@/features/registry/registry-api";
import { formatRecordDate } from "@/lib/resource-table";
import { CentreMemberDialog } from "./auction-centre-details";
import { CentreForm } from "./auction-forms";
import { OfficerApproveForm, OfficerEditForm, OfficerLicence } from "./auction-officer-forms";
import type { AuctionCentreRecord, AuctionOfficerRecord, AuctionSessionRecord } from "./types";

type ActionProps<T> = { row: T; onChanged: () => void };

function Trigger({ name }: { name: string }) {
  return <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name}`}><MoreVertical /></Button></DropdownMenuTrigger>;
}

export function CentreActions({ row, onChanged }: ActionProps<AuctionCentreRecord>) {
  const [editing, setEditing] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const path = `/api/admin/auction/centres/${encodeURIComponent(row.uuid)}`;

  return <>
    <DropdownMenu>
      <Trigger name={row.name} />
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild><Link href={`/dashboard/auction/centres/${encodeURIComponent(row.uuid)}`}><Eye />View details</Link></DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setEditing(true)}><Pencil />Edit</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setAddingMember(true)}><Users />Managers &amp; auctioneers</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => setDeleting(true)}><Trash2 />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    {editing && <CentreForm centre={row} open={editing} onOpenChange={setEditing} onSaved={onChanged} />}
    {addingMember && <CentreMemberDialog centre={row} open={addingMember} onOpenChange={setAddingMember} onSaved={onChanged} />}
    <ConfirmationAlertDialog open={deleting} onOpenChange={setDeleting} title={`Delete ${row.name}?`}
      description="A centre that already has auctions is deactivated instead, so its auction history is kept."
      confirmLabel="Delete" destructive onConfirm={async () => { await registryRun(() => registrySend(path, "DELETE"), "Centre removed.", onChanged); }} />
  </>;
}

export function OfficerActions({ row, onChanged }: ActionProps<AuctionOfficerRecord>) {
  const [viewing, setViewing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [editing, setEditing] = useState(false);
  const path = `/api/admin/auction/officers/${encodeURIComponent(row.uuid)}`;
  const pending = row.verificationStatus === "pending";

  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const remarks = String(new FormData(event.currentTarget).get("remarks") ?? "").trim();
    const ok = await registryRun(() => registrySend(`${path}/reject`, "POST", { remarks }), `${row.fullName} rejected.`, onChanged);
    if (ok) setRejecting(false);
    return ok;
  }

  return <>
    <DropdownMenu>
      <Trigger name={row.fullName} />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setViewing(true)}><Eye />View details</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setEditing(true)}><Pencil />Edit</DropdownMenuItem>
        {pending && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setApproving(true)}><Check />Approve</DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => setRejecting(true)}><X />Reject</DropdownMenuItem>
        </>}
        <DropdownMenuSeparator />
        {row.status === "active"
          ? <DropdownMenuItem destructive onSelect={() => setDeactivating(true)}><UserX />Deactivate</DropdownMenuItem>
          : <DropdownMenuItem onSelect={() => void registryRun(() => registrySend(path, "PUT", { status: "active" }), `${row.fullName} activated.`, onChanged)}><RotateCcw />Activate</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>

    <CustomViewDetailsDialog open={viewing} onOpenChange={setViewing} title={row.fullName} description={`Auction officer · ${row.officerNo}`} size="lg"
      actions={pending ? <Button onClick={() => { setViewing(false); setApproving(true); }}><Check />Approve</Button> : undefined}>
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Approval"><RegistryStatus status={row.verificationStatus} /></DetailItem>
        <DetailItem label="Status"><RegistryStatus status={row.status} /></DetailItem>
        <DetailItem label="Phone">{row.phone || "—"}</DetailItem>
        <DetailItem label="Email">{row.email || "—"}</DetailItem>
        <DetailItem label="National ID">{row.nationalId || "—"}</DetailItem>
        <DetailItem label="Licence number">{row.licenceNo || "—"}</DetailItem>
        <DetailItem label="Licence document"><OfficerLicence officer={row} /></DetailItem>
        <DetailItem label="Requested centre">{row.requestedCentre ? `${row.requestedCentre.name} · ${row.requestedCentre.code}` : "—"}</DetailItem>
        <DetailItem label="Address">{row.address || "—"}</DetailItem>
        <DetailItem label="Applied">{formatRecordDate(row.createdAt)}</DetailItem>
        <DetailItem label="Approved">{formatRecordDate(row.verifiedAt)}</DetailItem>
        {row.centres && row.centres.length > 0 && <DetailItem label="Centres" className="sm:col-span-2">{row.centres.map((centre) => `${centre.name ?? "—"} (${commerceLabel(centre.myRole)})`).join(", ")}</DetailItem>}
        {row.bio && <DetailItem label="About" className="sm:col-span-2">{row.bio}</DetailItem>}
        {row.verificationNotes && <DetailItem label="Remarks" className="sm:col-span-2">{row.verificationNotes}</DetailItem>}
      </div>
    </CustomViewDetailsDialog>

    {rejecting && <FormDialog open={rejecting} onOpenChange={setRejecting} title={`Reject ${row.fullName}?`} description="The applicant sees this reason in the app and can apply again." onSubmit={reject} submitLabel="Reject">
      <Field><FieldLabel htmlFor="officer-remarks" required>Reason</FieldLabel><Textarea id="officer-remarks" name="remarks" required maxLength={500} /></Field>
    </FormDialog>}

    {approving && <OfficerApproveForm officer={row} open={approving} onOpenChange={setApproving} onSaved={onChanged} />}
    {editing && <OfficerEditForm officer={row} open={editing} onOpenChange={setEditing} onSaved={onChanged} />}
    <ConfirmationAlertDialog open={deactivating} onOpenChange={setDeactivating} title={`Deactivate ${row.fullName}?`}
      description="They can no longer schedule or run auctions. Their past auctions are kept and you can activate them again."
      confirmLabel="Deactivate" destructive onConfirm={async () => { await registryRun(() => registrySend(path, "DELETE"), `${row.fullName} deactivated.`, onChanged); }} />
  </>;
}

/** Loads one session with its lots while the details dialog is open. */
function useSessionLots(uuid: string, open: boolean) {
  const [session, setSession] = useState<AuctionSessionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    registrySend<AuctionSessionRecord>(`/api/admin/auction/sessions/${encodeURIComponent(uuid)}`, "GET")
      .then(setSession)
      .catch((failure: unknown) => setError(failure instanceof Error ? failure.message : "Could not load the lots."));
  }, [uuid, open]);
  return { session, error };
}

export function SessionActions({ row, onChanged }: ActionProps<AuctionSessionRecord>) {
  const [viewing, setViewing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [republishing, setRepublishing] = useState(false);
  const path = `/api/admin/auction/sessions/${encodeURIComponent(row.uuid)}`;
  const { session, error } = useSessionLots(row.uuid, viewing);
  const currency = row.currency ?? "TZS";

  return <>
    <DropdownMenu>
      <Trigger name={row.title} />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setViewing(true)}><Eye />View details and lots</DropdownMenuItem>
        {row.status === "scheduled" && <><DropdownMenuSeparator /><DropdownMenuItem destructive onSelect={() => setCancelling(true)}><Ban />Cancel auction</DropdownMenuItem></>}
        {["ended", "cancelled"].includes(row.status) && <><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => setRepublishing(true)}><RotateCcw />Republish</DropdownMenuItem></>}
      </DropdownMenuContent>
    </DropdownMenu>

    <CustomViewDetailsDialog open={viewing} onOpenChange={setViewing} title={row.title} description={`Auction · ${commerceLabel(row.mode)}`} size="xl">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Status"><RegistryStatus status={row.status} /></DetailItem>
        <DetailItem label="Centre">{row.centre ? `${row.centre.name} · ${row.centre.code}` : "—"}</DetailItem>
        <DetailItem label="Officer">{row.officer?.fullName || row.host?.name || "—"}</DetailItem>
        <DetailItem label="Scheduled (EAT)">{commerceDateTime(row.scheduledAt)}</DetailItem>
        <DetailItem label="Started">{commerceDateTime(row.startedAt)}</DetailItem>
        <DetailItem label="Ended">{commerceDateTime(row.endedAt)}</DetailItem>
        <DetailItem label="Lots sold">{row.soldCount ?? 0} of {row.lotsCount ?? 0}</DetailItem>
        <DetailItem label="Gross sales">{commerceMoney(row.grossSales, currency)}</DetailItem>
        {row.description && <DetailItem label="Description" className="sm:col-span-2">{row.description}</DetailItem>}
      </div>
      <DetailSection title="Lots">
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p>
          : !session ? <div className="grid gap-2">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div>
          : !session.lots?.length ? <p className="text-sm text-muted-foreground">No lots in this auction.</p>
          : <Table aria-label="Lots">
            <TableHeader><TableRow><TableHead className="w-14">#</TableHead><TableHead>Lot</TableHead><TableHead className="text-right">Starting price</TableHead><TableHead className="text-right">Current price</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{session.lots.map((lot) => <TableRow key={lot.uuid}>
              <TableCell className="tabular-nums text-muted-foreground">{lot.lotNumber ?? "—"}</TableCell>
              <TableCell className="font-medium">{lot.title || lot.livestock?.identificationNumber || lot.livestock?.name || "—"}</TableCell>
              <TableCell className="text-right tabular-nums">{commerceMoney(lot.startingPrice, currency)}</TableCell>
              <TableCell className="text-right tabular-nums">{commerceMoney(lot.currentPrice, currency)}</TableCell>
              <TableCell><RegistryStatus status={lot.status} /></TableCell>
            </TableRow>)}</TableBody>
          </Table>}
      </DetailSection>
    </CustomViewDetailsDialog>

    <ConfirmationAlertDialog open={cancelling} onOpenChange={setCancelling} title={`Cancel ${row.title}?`}
      description="The auction will not start and its lots are cancelled. You can republish it later."
      confirmLabel="Cancel auction" cancelLabel="Keep auction" destructive onConfirm={async () => { await registryRun(() => registrySend(`${path}/cancel`, "POST"), "Auction cancelled.", onChanged); }} />
    <ConfirmationAlertDialog open={republishing} onOpenChange={setRepublishing} title={`Republish ${row.title}?`}
      description="A new auction is scheduled for tomorrow with the animals that were not sold. The officer can change the time in the app."
      confirmLabel="Republish" onConfirm={async () => { await registryRun(() => registrySend(`${path}/republish`, "POST"), "Auction republished.", onChanged); }} />
  </>;
}
