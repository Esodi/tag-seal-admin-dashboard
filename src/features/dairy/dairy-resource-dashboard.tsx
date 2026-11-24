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
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Eye, MoreVertical, Milk, Plus, RefreshCw, Search, Truck, Warehouse } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import { EmptyCard } from "@/components/ui/empty-card";
import { Field, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { authenticatedFetch } from "@/lib/auth/session";
import { toast } from "sonner";
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
  seasons: {
    title: "Season Milk Prices",
    description: "Seasonal milk prices per litre or kilogram configured for MCU and AMCOS cooperatives.",
  },
  ledger: {
    title: "Farmer Ledger & Debts",
    description: "Farmer delivery credits, payouts received, expenses/debts, and running account balances.",
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
  expected_amount?: string | null;
  price_per_unit?: string | number | null;
  payment_status?: string;
  return_outcome?: string | null;
  return_note?: string | null;
  source?: string | null;
  season_code?: string | null;
  amcos_name?: string | null;
  mcu_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  entry_type?: string | null;
  credit_amount?: string | number | null;
  debit_amount?: string | number | null;
  balance_after?: string | number | null;
  reference_number?: string | null;
  description?: string | null;
  entry_date?: string | null;
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
  const [addingSeason, setAddingSeason] = useState(false);
  const [amcosOptions, setAmcosOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [seasonAmcos, setSeasonAmcos] = useState("");
  const [seasonUnit, setSeasonUnit] = useState("l");
  const { data, error, loading, pageSize, setPageSize, setPage, reload, search, setSearch, sort, setSort, status, setStatus } = useDairyRecords(resource, initialData, initialError, Boolean(selectedItem));

  useEffect(() => {
    if (!addingSeason || amcosOptions.length > 0) return;
    authenticatedFetch("/api/admin/dairy/cooperatives/amcos?per_page=100", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        const list = (payload?.data?.data ?? payload?.data ?? []) as Array<{ uuid?: string; name?: string }>;
        setAmcosOptions(
          list
            .filter((a) => a.uuid && a.name)
            .map((a) => ({ value: String(a.uuid), label: String(a.name) })),
        );
      })
      .catch(() => undefined);
  }, [addingSeason, amcosOptions.length]);

  async function saveSeason(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      amcos_uuid: seasonAmcos,
      name: String(form.get("name") ?? "").trim(),
      price_per_unit: Number(form.get("price_per_unit") ?? 0),
      unit: seasonUnit,
      start_date: String(form.get("start_date") ?? "").trim(),
      end_date: String(form.get("end_date") ?? "").trim() || null,
      is_active: true,
    };
    const res = await authenticatedFetch("/api/admin/dairy/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || payload.status === false) {
      toast.error(payload?.message ?? "Could not save season price.");
      return false;
    }
    toast.success("Season milk price saved.");
    setAddingSeason(false);
    reload();
    return true;
  }

  const rawItems = useMemo(() => (data?.data ?? []) as unknown as DairyDashboardItem[], [data?.data]);
  const statuses = resource === "intakes" ? [["accepted", "Fully accepted"], ["rejected", "With rejected milk"]]
    : resource === "dispatches" ? [["dispatched", "Dispatched"], ["on_trip", "On trip"], ["in_transit", "In transit"], ["arrived", "Arrived"], ["delivered", "Delivered"], ["reconciled", "Reconciled"]]
    : resource === "deliveries" ? [["accepted_full", "Fully accepted"], ["accepted_with_deduction", "Accepted with deduction"], ["rejected_spoiled", "Rejected"]]
    : resource === "trips" ? [["PREPARING", "Preparing"], ["IN_TRANSIT", "In transit"], ["ARRIVED", "Arrived"], ["COMPLETED", "Completed"]]
    : resource === "seasons" ? [["active", "Active"], ["inactive", "Inactive"]]
    : resource === "ledger" ? [["credit_intake", "Delivery credit"], ["debit_payout", "Farmer payout"], ["debit_expense", "Expense / debt"]]
    : [];
  const columns = resource === "intakes" ? ["Farmer / Intake", "Collection centre", "Delivered", "Accepted / Rejected", "Temperature", "Quality"]
    : resource === "dispatches" ? ["Dispatch / Batch", "Centre / Destination", "Driver / Vehicle", "Volume", "Loading temperature", "Status"]
    : resource === "deliveries" ? ["Delivery / Trip", "Factory", "Received / Accepted", "Variance", "Arrival temperature", "Quality"]
    : resource === "seasons" ? ["Season", "Cooperative", "Price / Unit", "Period", "Status"]
    : resource === "ledger" ? ["Farmer / Ref", "Cooperative", "Entry", "Balance After", "Status"]
    : ["Trip / Vehicle", "Driver / Transporter", "Destination", "Volume", "Dispatches", "Status"];
  const temperature = (value?: string | null) => value == null || value === "" ? "—" : `${value} °C`;
  const pair = (primary?: string | null, secondary?: string | null) => <><p className="font-medium">{primary || "—"}</p>{secondary && <p className="text-xs text-muted-foreground">{secondary}</p>}</>;
  const recordStatus = (item: DairyDashboardItem) => resource === "intakes"
    ? (item.approval_status && item.approval_status !== "approved" ? item.approval_status : Number(item.rejected_quantity) > 0 ? "With rejected milk" : "Accepted")
    : resource === "seasons" ? (item.is_active ? "active" : "inactive")
    : resource === "ledger" ? (item.entry_type ?? "entry")
    : item.phase || item.status || item.factory_qa_status || "Unknown";
  const badge = (value: string) => ["accepted", "completed", "delivered", "reconciled", "accepted_full", "active", "credit_intake"].includes(value.toLowerCase()) ? <Badge className="capitalize">{value.toLowerCase().replaceAll("_", " ")}</Badge> : <StatusBadge status={value} />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        parent="Cooperative Operations" parentHref="/dashboard/dairy"
        title={meta.title}
        description={meta.description}
        actions={resource === "seasons" ? (
          <Button onClick={() => setAddingSeason(true)}>
            <Plus />
            Set season price
          </Button>
        ) : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard label={meta.title} value={data?.total ?? "—"} note="Records matching your filters" />
        {volumeMeta[resource] && <DashboardStatCard label={<>{volumeMeta[resource][0]}</>} value={litres(data?.meta?.[volumeMeta[resource][1]])} note="Across all records" />}
        {resource === "intakes" && <DashboardStatCard label="Rejected volume" value={litres(data?.meta?.total_rejected_liters)} note="Across all milk intakes" />}
        {resource === "trips" && <DashboardStatCard label="In transit" value={data?.meta?.in_transit ?? "—"} note="Trips currently on the road" />}
        {resource === "dispatches" && <DashboardStatCard label="Reconciled dispatches" value={data?.meta?.reconciled ?? "—"} note="Matched against factory receipt" />}
        {resource === "deliveries" && <DashboardStatCard label={<>Net variance (received − dispatched)</>} value={data?.meta ? signedLitres(data.meta.total_variance_liters) : "—"} note="Across all factory receipts" />}
        {resource === "seasons" && <DashboardStatCard label="Active seasons" value={data?.meta?.active_seasons ?? "—"} note="Currently applying to deliveries" />}
        {resource === "ledger" && <DashboardStatCard label="Total credits" value={data?.meta?.total_credits != null ? `TZS ${Number(data.meta.total_credits).toLocaleString("en-TZ")}` : "—"} note="Earned from accepted milk" />}
        {resource === "ledger" && <DashboardStatCard label="Net balance owed" value={data?.meta?.net_balance != null ? `TZS ${Number(data.meta.net_balance).toLocaleString("en-TZ")}` : "—"} note="Credits minus payouts & debts" />}
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
                      </> : resource === "seasons" ? <>
                        <TableCell>{pair(item.name, item.season_code)}</TableCell>
                        <TableCell>{pair(item.amcos_name, item.mcu_name)}</TableCell>
                        <TableCell className="font-medium tabular-nums">{item.price_per_unit != null ? `TZS ${Number(item.price_per_unit).toLocaleString("en-TZ")} / ${item.unit ?? "l"}` : "—"}</TableCell>
                        <TableCell>{pair(item.start_date, item.end_date ?? "Ongoing")}</TableCell>
                      </> : resource === "ledger" ? <>
                        <TableCell>{pair(item.farmer_name, item.reference_number)}</TableCell>
                        <TableCell>{pair(item.amcos_name, item.centre_name)}</TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {Number(item.credit_amount ?? 0) > 0
                            ? `+TZS ${Number(item.credit_amount).toLocaleString("en-TZ")}`
                            : `-TZS ${Number(item.debit_amount ?? 0).toLocaleString("en-TZ")}`}
                        </TableCell>
                        <TableCell className="tabular-nums">{`TZS ${Number(item.balance_after ?? 0).toLocaleString("en-TZ")}`}</TableCell>
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
            <DetailItem label="Season price">{selectedItem.price_per_unit == null ? "—" : `TZS ${Number(selectedItem.price_per_unit).toLocaleString("en-TZ")}`}</DetailItem>
            <DetailItem label="Expected amount">{selectedItem.expected_amount == null ? "—" : `TZS ${Number(selectedItem.expected_amount).toLocaleString("en-TZ")}`}</DetailItem>
            <DetailItem label="Payable">{selectedItem.payable_amount == null ? "—" : `TZS ${Number(selectedItem.payable_amount).toLocaleString("en-TZ")}`}</DetailItem>
            <DetailItem label="Payment">{selectedItem.payment_status ?? "—"}</DetailItem>
            <DetailItem label="Return outcome">{selectedItem.return_outcome ? selectedItem.return_outcome.replaceAll("_", " ") : "—"}</DetailItem>
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
          {resource === "seasons" && <>
            <DetailItem label="Season">{selectedItem.name ?? "—"}</DetailItem>
            <DetailItem label="Code">{selectedItem.season_code ?? "—"}</DetailItem>
            <DetailItem label="Cooperative">{selectedItem.amcos_name ?? "—"}</DetailItem>
            <DetailItem label="Union (MCU)">{selectedItem.mcu_name ?? "—"}</DetailItem>
            <DetailItem label="Price">{selectedItem.price_per_unit != null ? `TZS ${Number(selectedItem.price_per_unit).toLocaleString("en-TZ")} / ${selectedItem.unit ?? "l"}` : "—"}</DetailItem>
            <DetailItem label="Period">{[selectedItem.start_date, selectedItem.end_date ?? "Ongoing"].filter(Boolean).join(" → ")}</DetailItem>
          </>}
          {resource === "ledger" && <>
            <DetailItem label="Farmer">{selectedItem.farmer_name ?? "—"}</DetailItem>
            <DetailItem label="Reference">{selectedItem.reference_number ?? "—"}</DetailItem>
            <DetailItem label="Cooperative">{selectedItem.amcos_name ?? "—"}</DetailItem>
            <DetailItem label="Entry type">{selectedItem.entry_type ?? "—"}</DetailItem>
            <DetailItem label="Credit">{`TZS ${Number(selectedItem.credit_amount ?? 0).toLocaleString("en-TZ")}`}</DetailItem>
            <DetailItem label="Debit">{`TZS ${Number(selectedItem.debit_amount ?? 0).toLocaleString("en-TZ")}`}</DetailItem>
            <DetailItem label="Balance after">{`TZS ${Number(selectedItem.balance_after ?? 0).toLocaleString("en-TZ")}`}</DetailItem>
            <DetailItem label="Description" className="sm:col-span-2">{selectedItem.description ?? "—"}</DetailItem>
          </>}
        </div>}
      </CustomViewDetailsDialog>
      {addingSeason && (
        <FormDialog
          open={addingSeason}
          onOpenChange={setAddingSeason}
          title="Set Season Milk Price"
          description="Sets the active seasonal price per litre or kg for this AMCOS cooperative."
          onSubmit={saveSeason}
          submitLabel="Save season price"
        >
          <Field>
            <FieldLabel htmlFor="season-amcos" required>Cooperative (AMCOS)</FieldLabel>
            <FormSelect id="season-amcos" value={seasonAmcos} onValueChange={setSeasonAmcos} options={amcosOptions} placeholder="Select AMCOS" />
          </Field>
          <Field>
            <FieldLabel htmlFor="season-name" required>Season name</FieldLabel>
            <Input id="season-name" name="name" required maxLength={255} placeholder="e.g. Dry Season 2026" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="season-price" required>Price per unit (TZS)</FieldLabel>
              <Input id="season-price" name="price_per_unit" type="number" min={1} step="0.01" required placeholder="1500" />
            </Field>
            <Field>
              <FieldLabel htmlFor="season-unit">Unit</FieldLabel>
              <FormSelect id="season-unit" value={seasonUnit} onValueChange={setSeasonUnit} options={[{ value: "l", label: "Litres (L)" }, { value: "kg", label: "Kilograms (kg)" }]} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="season-start" required>Start date</FieldLabel>
              <Input id="season-start" name="start_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="season-end">End date (optional)</FieldLabel>
              <Input id="season-end" name="end_date" type="date" />
            </Field>
          </div>
        </FormDialog>
      )}
    </div>
  );
}
