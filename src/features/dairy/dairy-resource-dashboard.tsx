"use client";

import { useDairyRecords } from "./use-dairy-records";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RecordPagination } from "@/components/ui/record-pagination";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { formatRecordDate } from "@/lib/resource-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { Eye, MoreVertical, Milk, RefreshCw, Search, Truck, Warehouse } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import { EmptyCard } from "@/components/ui/empty-card";
import { Input } from "@/components/ui/input";
import type { DairyResource, DairyResponse } from "@/features/dairy/types";

const resourceMeta: Record<DairyResource, { title: string; description: string }> = {
  centres: {
    title: "Collection Centres",
    description: "Centres where farmers deliver milk, with their milk stock balance.",
  },
  intakes: {
    title: "Milk Intakes",
    description: "Milk each farmer delivers: litres, quality tests and temperature, accepted and rejected quantities.",
  },
  dispatches: {
    title: "Milk Dispatches",
    description: "Milk sent from a collection centre to a factory: batch, loading time and temperature, seals, driver and vehicle.",
  },
  deliveries: {
    title: "Factory Receipts & Reconciliation",
    description: "Milk a factory receives, compared with what was dispatched: shortages, spillages and quality rejections.",
  },
  transporters: {
    title: "Transporters",
    description: "Milk transport companies, their permits, vehicles and drivers.",
  },
  factories: {
    title: "Factories",
    description: "Processing factories that receive milk from collection centres.",
  },
  trips: {
    title: "Driver Trips",
    description: "Journeys a driver creates from dispatches assigned to them and drives to the factory.",
  },
};

type DispatchRow = {
  uuid: string;
  dispatch_code: string;
  batch_number?: string | null;
  centre_name?: string | null;
  quantity: string;
  unit?: string;
  status: string;
};

type DairyDashboardItem = {
  id: number;
  uuid: string;
  name?: string;
  centre_code?: string;
  dispatch_code?: string;
  batch_number?: string | null;
  centre_name?: string | null;
  destination_name?: string | null;
  quantity?: string;
  unit?: string;
  loaded_at?: string | null;
  dispatched_at?: string | null;
  dispatch_temperature_celsius?: string | null;
  driver_name?: string | null;
  transporter_name?: string | null;
  delivery_note_number?: string;
  factory_name?: string | null;
  received_volume_liters?: string;
  accepted_volume_liters?: string;
  discrepancy_liters?: string;
  spillage_reason?: string | null;
  factory_qa_status?: string;
  seals_intact?: boolean | number;
  arrival_temperature_celsius?: string;
  received_at?: string | null;
  dispatches?: DispatchRow[];
  trip_number?: string;
  factory_code?: string;
  license_number?: string;
  tin_number?: string;
  contact_person?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  approval_status?: "pending" | "approved" | "rejected";
  approval_remarks?: string | null;
  capacity_liters?: string;
  rejection_reason?: string;
  driver?: { name?: string };
  transporter?: { name?: string };
  destination_factory?: { name?: string };
  dispatched_volume_liters?: string;
  total_liters?: string;
  max_tanker_capacity_liters?: string;
  current_cargo_liters?: string;
  is_full?: boolean;
  fill_percentage?: number;
  remaining_capacity_liters?: number;
  destination_factory_uuid?: string;
  manager_user_id?: number | null;
  phase?: string;
  vehicle_plate_number?: string;
  temperature_celsius?: string;
  fat_percentage?: string;
  density_lactometer?: string;
  status?: string;
  is_active?: boolean;
  intake_timestamp?: string;
  created_at: string;
  receipt_number?: string;
  farmer_name?: string | null;
  member_number?: string | null;
  gross_quantity?: string;
  accepted_quantity?: string;
  rejected_quantity?: string;
  delivery_session?: string | null;
  payable_amount?: string;
  payment_status?: string;
  document_urls?: Record<string, string> | null;
};

const litres = (value?: string | number | null) =>
  value === undefined || value === null || value === "" ? "—" : `${Number(value).toLocaleString("en-TZ")} L`;

const signedLitres = (value?: string | number | null) => {
  const n = Number(value ?? 0);
  return `${n > 0 ? "+" : ""}${n.toLocaleString("en-TZ")} L`;
};

const volumeMeta: Partial<Record<DairyResource, [string, string]>> = {
  intakes: ["Accepted volume", "total_accepted_liters"],
  dispatches: ["Dispatched volume", "total_dispatched_liters"],
  deliveries: ["Received volume", "total_received_liters"],
  trips: ["Total milk volume", "total_liters"],
};

export function DairyResourceDashboard({
  resource,
  initialData,
  initialError,
}: {
  resource: DairyResource;
  initialData: DairyResponse | null;
  initialError?: string;
}) {
  const meta = resourceMeta[resource] ?? {
    title: "Cooperative Operations",
    description: "Dairy logistics and collection management.",
  };
  const [selectedItem, setSelectedItem] = useState<DairyDashboardItem | null>(null);
  const { data, error, loading, pageSize, setPageSize, setPage, reload, search, setSearch, sort, setSort, status, setStatus } = useDairyRecords(resource, initialData, initialError, Boolean(selectedItem));
  const rawItems = useMemo(() => (data?.data ?? []) as unknown as DairyDashboardItem[], [data?.data]);
  const statuses = resource === "intakes" ? [["accepted", "Fully accepted"], ["rejected", "With rejected milk"]]
    : resource === "dispatches" ? [["dispatched", "Dispatched"], ["on_trip", "On trip"], ["in_transit", "In transit"], ["arrived", "Arrived"], ["delivered", "Delivered"], ["reconciled", "Reconciled"]]
    : resource === "deliveries" ? [["accepted_full", "Fully accepted"], ["accepted_with_deduction", "Accepted with deduction"], ["rejected_spoiled", "Rejected"]]
    : resource === "trips" ? [["PREPARING", "Preparing"], ["IN_TRANSIT", "In transit"], ["ARRIVED", "Arrived"], ["COMPLETED", "Completed"]] : [];
  const columns = resource === "intakes" ? ["Farmer / Intake", "Collection centre", "Delivered", "Accepted / Rejected", "Temperature", "Quality"]
    : resource === "dispatches" ? ["Dispatch / Batch", "Centre / Destination", "Driver / Vehicle", "Volume", "Loading temperature", "Status"]
    : resource === "deliveries" ? ["Delivery / Trip", "Factory", "Received / Accepted", "Variance", "Arrival temperature", "Quality"]
    : ["Trip / Vehicle", "Driver / Transporter", "Destination", "Volume", "Dispatches", "Status"];
  const temperature = (value?: string | null) => value == null || value === "" ? "—" : `${value} °C`;
  const pair = (primary?: string | null, secondary?: string | null) => <><p className="font-medium">{primary || "—"}</p>{secondary && <p className="text-xs text-muted-foreground">{secondary}</p>}</>;
  const recordStatus = (item: DairyDashboardItem) => resource === "intakes" ? Number(item.rejected_quantity) > 0 ? "With rejected milk" : "Accepted" : item.phase || item.status || item.factory_qa_status || "Unknown";
  const badge = (value: string) => ["accepted", "completed", "delivered", "reconciled", "accepted_full"].includes(value.toLowerCase()) ? <Badge className="capitalize">{value.toLowerCase().replaceAll("_", " ")}</Badge> : <StatusBadge status={value} />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        parent="Cooperative Operations" parentHref="/dashboard/dairy"
        title={meta.title}
        description={meta.description}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard label={meta.title} value={data?.total ?? "—"} note="Records matching your filters" />
        {volumeMeta[resource] && <DashboardStatCard label={<>{volumeMeta[resource][0]}</>} value={litres(data?.meta?.[volumeMeta[resource][1]])} note="Across all records" />}
        {resource === "intakes" && <DashboardStatCard label="Rejected volume" value={litres(data?.meta?.total_rejected_liters)} note="Across all milk intakes" />}
        {resource === "trips" && <DashboardStatCard label="In transit" value={data?.meta?.in_transit ?? "—"} note="Trips currently on the road" />}
        {resource === "dispatches" && <DashboardStatCard label="Reconciled dispatches" value={data?.meta?.reconciled ?? "—"} note="Matched against factory receipt" />}
        {resource === "deliveries" && <DashboardStatCard label={<>Net variance (received − dispatched)</>} value={data?.meta ? signedLitres(data.meta.total_variance_liters) : "—"} note="Across all factory receipts" />}
      </div>

      <TablePanel aria-busy={loading}>
        <div className="min-w-0 [&>[data-slot=card]]:m-5">
          <TableToolbar className="justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search records" placeholder={resource === "intakes" ? "Search receipt, centre or farmer…" : resource === "trips" ? "Search trip or vehicle plate…" : "Search records…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              {statuses.length > 0 && <Select value={status} onValueChange={setStatus}>
                <SelectTrigger aria-label="Filter by status" size="sm" className="h-8 w-auto min-w-32 font-normal"><SelectValue /></SelectTrigger>
                <SelectContent align="end"><SelectItem value="all">All statuses</SelectItem>{statuses.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>}
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger aria-label="Sort records" size="sm" className="h-8 w-auto min-w-[9.5rem] font-normal"><SelectValue /></SelectTrigger>
                <SelectContent align="end"><SelectItem value="desc">Newest first</SelectItem><SelectItem value="asc">Oldest first</SelectItem></SelectContent>
              </Select>
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger aria-label="Rows per page" size="sm" className="h-8 w-auto min-w-[6.25rem] font-normal"><span className="text-muted-foreground">Show</span><SelectValue /></SelectTrigger>
                <SelectContent align="end">{[10, 30, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </TableToolbar>

          {error ? <div className="p-5" role="alert"><EmptyCard icon={RefreshCw} title="Records could not be loaded" description={error} action={<Button variant="outline" onClick={reload}>Try again</Button>} /></div> : loading ? <div className="p-5"><Skeleton className="h-48 w-full" /></div> : rawItems.length === 0 ? (
            <EmptyCard
              icon={resource === "transporters" || resource === "trips" ? Truck : resource === "factories" ? Warehouse : Milk}
              title={`No ${meta.title.toLowerCase()} found`}
              description="Records appear here once they are saved and synced."
            />
          ) : (
            <div className="min-w-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">#</TableHead>
                    {columns.map((column) => <TableHead key={column}>{column}</TableHead>)}
                    <TableHead>Created at</TableHead>
                    <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawItems.map((item, index) => {
                    return <TableRow key={item.uuid}>
                      <TableCell className="text-muted-foreground tabular-nums">{((data?.current_page ?? 1) - 1) * pageSize + index + 1}</TableCell>
                      {resource === "intakes" ? <>
                        <TableCell>{pair(item.farmer_name, item.receipt_number)}</TableCell>
                        <TableCell>{item.centre_name || "—"}</TableCell>
                        <TableCell className="tabular-nums">{litres(item.gross_quantity)}</TableCell>
                        <TableCell>{pair(litres(item.accepted_quantity), `${litres(item.rejected_quantity)} rejected`)}</TableCell>
                        <TableCell>{temperature(item.temperature_celsius)}</TableCell>
                      </> : resource === "dispatches" ? <>
                        <TableCell>{pair(item.dispatch_code, item.batch_number)}</TableCell>
                        <TableCell>{pair(item.centre_name, item.destination_name)}</TableCell>
                        <TableCell>{pair(item.driver_name, item.vehicle_plate_number)}</TableCell>
                        <TableCell className="tabular-nums">{litres(item.quantity)}</TableCell>
                        <TableCell>{temperature(item.dispatch_temperature_celsius)}</TableCell>
                      </> : resource === "deliveries" ? <>
                        <TableCell>{pair(item.delivery_note_number, item.trip_number)}</TableCell>
                        <TableCell>{item.factory_name || "—"}</TableCell>
                        <TableCell>{pair(litres(item.received_volume_liters), `${litres(item.accepted_volume_liters)} accepted`)}</TableCell>
                        <TableCell className="tabular-nums">{signedLitres(item.discrepancy_liters)}</TableCell>
                        <TableCell>{temperature(item.arrival_temperature_celsius)}</TableCell>
                      </> : <>
                        <TableCell>{pair(item.trip_number, item.vehicle_plate_number)}</TableCell>
                        <TableCell>{pair(item.driver?.name, item.transporter?.name)}</TableCell>
                        <TableCell>{item.destination_factory?.name || "—"}</TableCell>
                        <TableCell className="tabular-nums">{litres(item.total_liters)}</TableCell>
                        <TableCell>{item.dispatches?.length ?? 0}</TableCell>
                      </>}
                      <TableCell>{badge(recordStatus(item))}</TableCell>
                      <TableCell className="text-muted-foreground">{formatRecordDate(resource === "intakes" ? item.intake_timestamp ?? item.created_at : item.created_at)}</TableCell>
                      <TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${item.uuid}`}><MoreVertical /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setSelectedItem(item)}><Eye />View details</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                    </TableRow>;
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <RecordPagination from={rawItems.length ? ((data?.current_page ?? 1) - 1) * pageSize + 1 : 0} to={Math.min((data?.current_page ?? 1) * pageSize, data?.total ?? 0)} total={data?.total ?? 0} page={data?.current_page ?? 1} pageCount={data?.last_page ?? 1} onPageChange={setPage} disabled={loading || Boolean(error)} />
        </div>
      </TablePanel>
      <CustomViewDetailsDialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)} title={`${meta.title} Details`} description="Cooperative dairy record details">
        {selectedItem && <div className="grid gap-3 sm:grid-cols-2">
          {resource === "intakes" && <>
            <DetailItem label="Receipt">{selectedItem.receipt_number ?? "—"}</DetailItem>
            <DetailItem label="Farmer">{[selectedItem.farmer_name, selectedItem.member_number].filter(Boolean).join(" · ") || "—"}</DetailItem>
            <DetailItem label="Collection centre">{selectedItem.centre_name ?? "—"}</DetailItem>
            <DetailItem label="Session">{selectedItem.delivery_session ?? "—"}</DetailItem>
            <DetailItem label="Delivered">{litres(selectedItem.gross_quantity)}</DetailItem>
            <DetailItem label="Accepted">{litres(selectedItem.accepted_quantity)}</DetailItem>
            <DetailItem label="Rejected">{litres(selectedItem.rejected_quantity)}</DetailItem>
            <DetailItem label="Payable">{selectedItem.payable_amount == null ? "—" : `TZS ${Number(selectedItem.payable_amount).toLocaleString("en-TZ")}`}</DetailItem>
            <DetailItem label="Payment">{selectedItem.payment_status ?? "—"}</DetailItem>
            <DetailItem label="Rejection reason">{selectedItem.rejection_reason || "—"}</DetailItem>
            <DetailItem label="Temperature">{temperature(selectedItem.temperature_celsius)}</DetailItem>
            <DetailItem label="Fat content">{selectedItem.fat_percentage == null ? "—" : `${selectedItem.fat_percentage}%`}</DetailItem>
            <DetailItem label="Density">{selectedItem.density_lactometer ?? "—"}</DetailItem>
            <DetailItem label="Received at">{formatRecordDate(selectedItem.intake_timestamp)}</DetailItem>
          </>}
          {selectedItem.name && <DetailItem label="Name">{selectedItem.name}</DetailItem>}
          {selectedItem.status && <DetailItem label="Status">{selectedItem.status}</DetailItem>}
          {selectedItem.approval_status && <DetailItem label="Approval">{selectedItem.approval_status}</DetailItem>}
          {resource === "dispatches" && <>
            <DetailItem label="Dispatch code">{selectedItem.dispatch_code}</DetailItem>
            <DetailItem label="Batch">{selectedItem.batch_number ?? "—"}</DetailItem>
            <DetailItem label="From centre">{selectedItem.centre_name ?? "—"}</DetailItem>
            <DetailItem label="To factory">{selectedItem.destination_name ?? "—"}</DetailItem>
            <DetailItem label="Quantity">{litres(selectedItem.quantity)}</DetailItem>
            <DetailItem label="Loading temperature">{temperature(selectedItem.dispatch_temperature_celsius)}</DetailItem>
            <DetailItem label="Loaded at">{formatRecordDate(selectedItem.loaded_at ?? selectedItem.dispatched_at ?? undefined)}</DetailItem>
            <DetailItem label="Driver and vehicle">{[selectedItem.driver_name, selectedItem.vehicle_plate_number].filter(Boolean).join(" · ") || "—"}</DetailItem>
            <DetailItem label="Trip">{selectedItem.trip_number ?? "Not on a trip yet"}</DetailItem>
          </>}
          {resource === "deliveries" && <>
            <DetailItem label="Delivery note">{selectedItem.delivery_note_number}</DetailItem>
            <DetailItem label="Trip">{[selectedItem.trip_number, selectedItem.vehicle_plate_number].filter(Boolean).join(" · ") || "—"}</DetailItem>
            <DetailItem label="Factory">{selectedItem.factory_name ?? "—"}</DetailItem>
            <DetailItem label="Dispatched">{litres(selectedItem.dispatched_volume_liters)}</DetailItem>
            <DetailItem label="Received">{litres(selectedItem.received_volume_liters)}</DetailItem>
            <DetailItem label="Accepted">{litres(selectedItem.accepted_volume_liters)}</DetailItem>
            <DetailItem label="Variance">{signedLitres(selectedItem.discrepancy_liters)}</DetailItem>
            <DetailItem label="Shortage or rejection reason">{selectedItem.spillage_reason ?? "—"}</DetailItem>
            <DetailItem label="Arrival temperature">{temperature(selectedItem.arrival_temperature_celsius)}</DetailItem>
            <DetailItem label="Seals intact">{selectedItem.seals_intact ? "Yes" : "No"}</DetailItem>
          </>}
          {resource === "trips" && <>
            <DetailItem label="Trip">{selectedItem.trip_number}</DetailItem>
            <DetailItem label="Driver">{selectedItem.driver?.name}</DetailItem>
            <DetailItem label="Transporter">{selectedItem.transporter?.name}</DetailItem>
            <DetailItem label="Destination">{selectedItem.destination_factory?.name}</DetailItem>
            <DetailItem label="Phase">{badge(recordStatus(selectedItem))}</DetailItem>
            <DetailItem label="Vehicle">{selectedItem.vehicle_plate_number ?? "—"}</DetailItem>
            <DetailItem label="Total">{litres(selectedItem.total_liters)}</DetailItem>
            {selectedItem.dispatches?.map((d) => <DetailItem key={d.uuid} label={`${d.dispatch_code}${d.batch_number && d.batch_number !== d.dispatch_code ? ` · ${d.batch_number}` : ""}`}>{`${d.centre_name ?? "—"} · ${litres(d.quantity)} · ${d.status}`}</DetailItem>)}
          </>}
        </div>}
      </CustomViewDetailsDialog>
    </div>
  );
}
