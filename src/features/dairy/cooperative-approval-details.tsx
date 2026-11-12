"use client";

import { UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { applicantName, applicationDate, type CooperativeApplication } from "./cooperative-approval-types";

export function CooperativeApprovalDetails({ application, role, saving, error, onClose, onRole, onDecision }: {
  application: CooperativeApplication | null;
  role: string;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onRole: (role: string) => void;
  onDecision: (decision: "approved" | "rejected" | null) => void;
}) {
  if (!application) return null;
  const farmer = application.farmer_details;
  return <CustomViewDetailsDialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}
    title={applicantName(application)} description="Review the membership request and choose an action." size="lg"
    actions={<>
      <Button variant="outline" disabled={saving} onClick={() => onDecision("rejected")}><UserX />Disapprove</Button>
      <Button disabled={saving} onClick={() => onDecision("approved")}><UserCheck />Approve</Button>
    </>}>
    <div className="space-y-5">
      <section>
        <h3 className="mb-3 text-sm font-semibold">Application details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Cooperative">{application.amcos_name}</DetailItem>
          <DetailItem label="Status"><StatusBadge status="pending" /></DetailItem>
          <DetailItem label="Phone">{application.phone || "—"}</DetailItem>
          <DetailItem label="Submitted">{applicationDate(application.created_at)}</DetailItem>
          <DetailItem label="Gender">{application.applicant_gender || "—"}</DetailItem>
          <DetailItem label="Date of birth">{applicationDate(application.applicant_date_of_birth)}</DetailItem>
        </div>
      </section>
      {farmer && <section>
        <h3 className="mb-3 text-sm font-semibold">Registered farmer</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Name">{[farmer.first_name, farmer.middle_name, farmer.surname].filter(Boolean).join(" ")}</DetailItem>
          <DetailItem label="Farmer number">{farmer.farmer_number}</DetailItem>
          <DetailItem label="Gender">{farmer.gender}</DetailItem>
          <DetailItem label="Date of birth">{applicationDate(farmer.date_of_birth)}</DetailItem>
          <DetailItem label="Farmer type">{farmer.farmer_type}</DetailItem>
          <DetailItem label="Status"><StatusBadge status={farmer.status} /></DetailItem>
        </div>
      </section>}
      <section className="space-y-3">
        <div><h3 className="text-sm font-semibold">Access on approval</h3><p className="mt-1 text-xs text-muted-foreground">Choose the role for this member.</p></div>
        <div className="space-y-1.5">
          <label htmlFor="approval-role" className="text-xs font-medium text-muted-foreground">Role</label>
          <Select value={role} onValueChange={onRole} disabled={saving}>
            <SelectTrigger id="approval-role" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="amcos_user">AMCOS User</SelectItem>
              <SelectItem value="amcos_admin">Cooperative administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          Approved AMCOS Users have full access to all collection centres under their cooperative, can record intakes, and can register new collection centres directly via the mobile app.
        </div>
      </section>
      {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    </div>
  </CustomViewDetailsDialog>;
}
