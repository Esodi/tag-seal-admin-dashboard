"use client";

import { useState } from "react";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import { formatRecordDate } from "@/lib/resource-table";
import { FactoryMembersDialog, type FactoryMember } from "./factory-members-dialog";

export function FactoryMemberActions({ factory, member, canManage, onChanged }: {
  factory: { uuid: string; name: string };
  member: FactoryMember;
  canManage: boolean;
  onChanged: () => void;
}) {
  const [viewing, setViewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const label = member.name || member.phone || "member";

  async function remove() {
    try {
      const response = await authenticatedFetch(`/api/admin/dairy/factories/${encodeURIComponent(factory.uuid)}/members/${encodeURIComponent(member.uuid)}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message ?? "Could not delete member.");
      toast.success("Member removed from the factory.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete member.");
    }
  }

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${label}`}><MoreVertical /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setViewing(true)}><Eye />View details</DropdownMenuItem>
        {canManage && <>
          <DropdownMenuItem onSelect={() => setEditing(true)}><Pencil />Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => setDeleting(true)}><Trash2 />Delete</DropdownMenuItem>
        </>}
      </DropdownMenuContent>
    </DropdownMenu>
    <CustomViewDetailsDialog open={viewing} onOpenChange={setViewing} title={label} description={`${member.role === "manager" ? "Factory manager" : "Factory user"} at ${factory.name}`} size="lg">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Full name">{member.name || "—"}</DetailItem>
        <DetailItem label="Phone (app sign-in)">{member.phone || "—"}</DetailItem>
        <DetailItem label="Role">{member.role === "manager" ? "Manager (approves arrivals)" : "Operator (receives milk)"}</DetailItem>
        <DetailItem label="Status"><StatusBadge status={member.is_active ? "active" : "inactive"} /></DetailItem>
        <DetailItem label="Identification number">{member.identity_number || "—"}</DetailItem>
        <DetailItem label="TIN number">{member.tin_number || "—"}</DetailItem>
        <DetailItem label="Staff ID">{member.staff_id || "—"}</DetailItem>
        <DetailItem label="Created at">{formatRecordDate(member.created_at)}</DetailItem>
      </div>
    </CustomViewDetailsDialog>
    {editing && <FactoryMembersDialog factory={factory} member={member} open={editing} onOpenChange={setEditing} onSaved={onChanged} />}
    <ConfirmationAlertDialog open={deleting} onOpenChange={setDeleting} title={`Delete ${label}?`}
      description="They are removed from this factory and can no longer receive or approve milk here. Their app account and past records are kept."
      confirmLabel="Delete" destructive onConfirm={remove} />
  </>;
}
