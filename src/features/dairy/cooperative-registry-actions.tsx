"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, MoreVertical, Pencil, RotateCcw, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import { CooperativeRegistryForm } from "./cooperative-registry-form";
import { CollectionCentreEditForm } from "./collection-centre-edit-form";
import { FactoryMembersDialog } from "./factory-members-dialog";
import type { RegistryRow, RegistryType } from "./cooperative-registry-types";

export function CooperativeRegistryActions({ row, type, canManage, onChanged }: {
  row: RegistryRow;
  type: RegistryType;
  canManage: boolean;
  onChanged: () => void;
}) {
  const [viewing, setViewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [managingMembers, setManagingMembers] = useState(false);
  const active = Boolean(row.is_active);

  async function changeStatus() {
    try {
      const response = await authenticatedFetch(`/api/admin/dairy/cooperatives/${type}/${encodeURIComponent(row.uuid)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !active }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not update status.");
      toast.success(active ? "Record marked inactive." : "Record restored.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update status.");
    }
  }

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.name}`}><MoreVertical /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {type === "factories" ? <DropdownMenuItem asChild><Link href={`/dashboard/dairy/factories/${encodeURIComponent(row.uuid)}`}><Eye />View details</Link></DropdownMenuItem> : <DropdownMenuItem onSelect={() => setViewing(true)}><Eye />View details</DropdownMenuItem>}
        {canManage && <>
          <DropdownMenuItem onSelect={() => setEditing(true)}><Pencil />Edit</DropdownMenuItem>
          {type === "factories" && <DropdownMenuItem onSelect={() => setManagingMembers(true)}><Users />Operators &amp; managers</DropdownMenuItem>}
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive={active} onSelect={() => setConfirming(true)}>
            {active ? <Trash2 /> : <RotateCcw />}{active ? "Archive" : "Restore"}
          </DropdownMenuItem>
        </>}
      </DropdownMenuContent>
    </DropdownMenu>
    <CustomViewDetailsDialog open={viewing} onOpenChange={setViewing} title={row.name} description={type === "centres" ? "Collection centre details" : "Organisation details"} size="lg">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Name">{row.name}</DetailItem>
        <DetailItem label="Status"><StatusBadge status={active ? "active" : "inactive"} /></DetailItem>
        {type === "amcos" && <DetailItem label="Union">{row.mcu_name || "Independent"}</DetailItem>}
        {type === "centres" && <>
          <DetailItem label="Cooperative">{row.amcos_name || "—"}</DetailItem>
          <DetailItem label="Location">{[row.district_name, row.region_name].filter(Boolean).join(", ") || "—"}</DetailItem>
        </>}
        {type === "mcus" && <>
          <DetailItem label="Registration number">{row.registration_number || "—"}</DetailItem>
          <DetailItem label="Coverage">{[row.all_regions ? "All regions" : [row.district_name, row.region_name].filter(Boolean).join(", "), row.country_name].filter(Boolean).join(" · ") || "—"}</DetailItem>
        </>}
        <DetailItem label="Contact name">{row.contact_name || "—"}</DetailItem>
        <DetailItem label="Contact phone">{row.contact_phone || "—"}</DetailItem>
      </div>
    </CustomViewDetailsDialog>
    {editing && type !== "centres" && <CooperativeRegistryForm type={type} record={row} open={editing} onOpenChange={setEditing} onSaved={onChanged} />}
    {managingMembers && <FactoryMembersDialog factory={row} open={managingMembers} onOpenChange={setManagingMembers} />}
    {editing && type === "centres" && <CollectionCentreEditForm record={row} open={editing} onOpenChange={setEditing} onSaved={onChanged} />}
    <ConfirmationAlertDialog open={confirming} onOpenChange={setConfirming}
      title={`${active ? "Archive" : "Restore"} ${row.name}?`}
      description={active ? type === "centres" ? "This marks the centre inactive and preserves its stock and history. New deliveries are blocked; other existing operations may still be available." : "This marks the record inactive and preserves its history. Linked records and existing member access are not changed." : "This marks the record active again. Linked records are not changed."}
      confirmLabel={active ? "Archive" : "Restore"} destructive={active} onConfirm={changeStatus} />
  </>;
}
