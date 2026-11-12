"use client";

import { useState } from "react";
import { Eye, MoreVertical, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import { TransporterFleetForm } from "./transporter-fleet-form";
import { driverName, isVehicle, type FleetKind, type FleetRow } from "./transporter-registry-types";
import { VehicleColor } from "./vehicle-color";

export function TransporterFleetActions({ kind, row, onChanged }: { kind: FleetKind; row: FleetRow; onChanged: () => void }) {
  const [viewing, setViewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const active = Boolean(row.is_active);
  const name = isVehicle(row) ? row.registration_number : driverName(row);
  const path = `/api/admin/dairy/transport/${kind}/${encodeURIComponent(row.uuid)}`;

  async function send(url: string, method: string, success: string) {
    try {
      const response = await authenticatedFetch(url, { method });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message ?? "The request failed.");
      toast.success(success);
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The request failed.");
    }
  }

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name}`}><MoreVertical /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setViewing(true)}><Eye />View details</DropdownMenuItem>
        {active && <DropdownMenuItem onSelect={() => setEditing(true)}><Pencil />Edit</DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive={active} onSelect={() => active ? setArchiving(true) : void send(`${path}/restore`, "POST", `${name} restored.`)}>
          {active ? <Trash2 /> : <RotateCcw />}{active ? "Delete" : "Restore"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <CustomViewDetailsDialog open={viewing} onOpenChange={setViewing} title={name} description={isVehicle(row) ? "Transport vehicle" : "Transport driver"} size="lg">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Status"><StatusBadge status={active ? "active" : "archived"} /></DetailItem>
        <DetailItem label="Transporter">{row.company_name}</DetailItem>
        {isVehicle(row) ? <>
          <DetailItem label="Type">{row.vehicle_type || "—"}</DetailItem>
          <DetailItem label="Colour"><VehicleColor code={row.color} /></DetailItem>
          <DetailItem label="Capacity">{row.tanker_capacity_liters ? `${Number(row.tanker_capacity_liters).toLocaleString("en-TZ")} L` : "—"}</DetailItem>
          <DetailItem label="Tare weight">{row.tare_weight_kg ? `${Number(row.tare_weight_kg).toLocaleString("en-TZ")} kg` : "—"}</DetailItem>
          <DetailItem label="Driver">{[row.driver_first_name, row.driver_middle_name, row.driver_last_name].filter(Boolean).join(" ") || "Unassigned"}</DetailItem>
        </> : <>
          <DetailItem label="Phone">{row.phone || "—"}</DetailItem>
          <DetailItem label="Email">{row.email || "—"}</DetailItem>
          <DetailItem label="Licence">{[row.driver_license_number, row.licence_class && `Class ${row.licence_class}`].filter(Boolean).join(" · ") || "—"}</DetailItem>
          <DetailItem label="Licence expiry">{row.licence_expiry?.slice(0, 10) || "—"}</DetailItem>
          <DetailItem label="National ID">{row.national_id || "—"}</DetailItem>
          <DetailItem label="Vehicle">{row.assigned_vehicle_plate || "Unassigned"}</DetailItem>
          <DetailItem label="App access"><Badge variant={row.pin_pending ? "outline" : "secondary"}>{row.pin_pending ? "Awaiting first login" : "PIN set"}</Badge></DetailItem>
        </>}
      </div>
    </CustomViewDetailsDialog>

    {editing && <TransporterFleetForm kind={kind} record={row} open={editing} onOpenChange={setEditing} onSaved={onChanged} />}
    <ConfirmationAlertDialog open={archiving} onOpenChange={setArchiving} title={`Delete ${name}?`} destructive confirmLabel="Delete"
      description={isVehicle(row)
        ? "The vehicle is archived and its driver is unassigned. Its trips are kept and it can be restored from the Archived tab."
        : "The driver is archived and unassigned from their vehicle. Their trips are kept and they can be restored from the Archived tab."}
      onConfirm={() => send(path, "DELETE", `${name} deleted.`)} />
  </>;
}
