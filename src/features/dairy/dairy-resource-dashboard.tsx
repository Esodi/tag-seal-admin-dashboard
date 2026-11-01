"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Milk,
  RefreshCw,
  Search,
  Truck,
  Warehouse,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import { EmptyCard } from "@/components/ui/empty-card";
import { Input } from "@/components/ui/input";
import type { DairyResource, DairyResponse } from "@/features/dairy/types";

const resourceMeta: Record<DairyResource, { title: string; description: string }> = {
  centres: {
    title: "Milk Collection Centres (MCC)",
    description: "Rural and peri-urban dairy intake centres with cooling capacity and digital scales.",
  },
  tanks: {
    title: "Bulk Cooling Tanks",
    description: "Refrigerated stainless-steel tanks tracking current volumes, CIP cleaning, and temperatures.",
  },
  batches: {
    title: "Daily Intake Batches",
    description: "Morning and evening intake sessions grouping individual farmer milk drops.",
  },
  intakes: {
    title: "Farmer Milk Intakes",
    description: "Digital scale intake records, rapid lab quality tests (fat, density), and instant receipts.",
  },
  dispatches: {
    title: "Tanker Dispatches",
    description: "Bulk milk transit orders with digital security seals and cold-chain temperature tracking.",
  },
  deliveries: {
    title: "Factory Deliveries",
    description: "Dairy processing plant weighbridge intake and volume variance reconciliation.",
  },
  transporters: {
    title: "Milk Transporter Organizations",
    description: "Fleet logistics carriers, insulated milk tankers, LATRA permits, and certified drivers.",
  },
  factories: {
    title: "Dairy Processing Plants & Warehouses",
    description: "Commercial processing plants, bulk silos, TDB licenses, and TBS food hygiene certificates.",
  },
  trips: {
    title: "Tanker Collection Trips",
    description: "Multi-stop collection journeys with on-the-road dynamic route additions (AddRoutes).",
  },
  "factory-tanks": {
    title: "Processing Plant Bulk Silos",
    description: "High-capacity factory silos and live bulk storage inventory gauges.",
  },
};

type DairyDashboardItem = {
  id: number;
  uuid: string;
  name?: string;
  centre_code?: string;
  tank_code?: string;
  batch_code?: string;
  dispatch_code?: string;
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
  current_stock_liters?: string;
  accepted_liters?: string;
  dispatched_volume_liters?: string;
  total_liters?: string;
  max_tanker_capacity_liters?: string;
  current_cargo_liters?: string;
  current_inventory_liters?: string;
  total_storage_capacity_liters?: string;
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
  farmer?: { id: number; name?: string };
  document_urls?: Record<string, string> | null;
  routes?: Array<{
    uuid: string;
    sequence_order: number;
    liters: string;
    temperature_celsius: string;
    status: string;
    phase?: string;
    destination_factory_uuid?: string;
    added_mid_trip: boolean;
    mcc?: { name: string };
  }>;
};

export function DairyResourceDashboard({
  resource,
  initialData,
}: {
  resource: DairyResource;
  initialData: DairyResponse | null;
  initialError?: string;
}) {
  const meta = resourceMeta[resource] ?? {
    title: "Dairy Operations",
    description: "Dairy logistics and collection management.",
  };
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<DairyDashboardItem | null>(null);

  const rawItems = useMemo(
    () => (initialData?.data ?? []) as unknown as DairyDashboardItem[],
    [initialData?.data],
  );

  const filteredItems = useMemo(() => {
    if (!search.trim()) return rawItems;
    const q = search.toLowerCase();
    return rawItems.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(q);
      const matchCode =
        item.centre_code?.toLowerCase().includes(q) ||
        item.tank_code?.toLowerCase().includes(q) ||
        item.batch_code?.toLowerCase().includes(q) ||
        item.dispatch_code?.toLowerCase().includes(q) ||
        item.trip_number?.toLowerCase().includes(q) ||
        item.factory_code?.toLowerCase().includes(q) ||
        item.license_number?.toLowerCase().includes(q) ||
        item.vehicle_plate_number?.toLowerCase().includes(q);
      const matchFarmer = item.farmer?.name?.toLowerCase().includes(q);
      const matchContact = (item.contact_person ?? item.contact_name)?.toLowerCase().includes(q);
      const matchUuid = item.uuid?.toLowerCase().includes(q);
      return matchName || matchCode || matchFarmer || matchContact || matchUuid;
    });
  }, [rawItems, search]);

  const getPhaseBadge = (phase?: string) => {
    if (!phase) return null;
    const p = phase.toUpperCase();
    if (p === "COMPLETED" || p === "DELIVERED") {
      return <Badge className="bg-emerald-600 hover:bg-emerald-700">{p}</Badge>;
    }
    if (p === "IN_TRANSIT") {
      return <Badge className="bg-amber-600 hover:bg-amber-700">{p}</Badge>;
    }
    if (p === "ARRIVED") {
      return <Badge className="bg-purple-600 hover:bg-purple-700">{p}</Badge>;
    }
    return <Badge variant="secondary">{p}</Badge>;
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={meta.title}
        description={meta.description}
        badge="Tag & Seal Dairy V2"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Records</p>
            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
              {initialData?.total ?? rawItems.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Volume Metrics</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-primary tabular-nums">
              {initialData?.meta?.total_accepted_liters
                ? `${Number(initialData.meta.total_accepted_liters).toLocaleString()} L`
                : `${rawItems.length} items`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Cold-Chain Assurance</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" /> &lt; 4.0°C Active
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${meta.title.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-1.5 size-3.5" /> Refresh
              </Button>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyCard
              icon={resource === "transporters" || resource === "trips" ? Truck : resource === "factories" ? Warehouse : Milk}
              title={`No ${meta.title.toLowerCase()} found`}
              description="Milk intakes, tanker transport trips, and factory inventory logs will appear here."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50 text-xs font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Entity / Code</th>
                    <th className="px-4 py-3">Metrics / Capacity</th>
                    <th className="px-4 py-3">Phase / Status</th>
                    <th className="px-4 py-3">Created / Timestamp</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map((item) => {
                    const code = item.centre_code ?? item.tank_code ?? item.batch_code ?? item.dispatch_code ?? item.trip_number ?? item.factory_code ?? item.name ?? item.uuid;
                    const quantity = item.accepted_liters ?? item.dispatched_volume_liters ?? item.total_liters ?? item.current_stock_liters ?? item.capacity_liters;
                    return <tr key={item.uuid}>
                      <td className="px-4 py-3 font-medium">{code}</td>
                      <td className="px-4 py-3 tabular-nums">{quantity ? `${Number(quantity).toLocaleString()} L` : "—"}</td>
                      <td className="px-4 py-3">{getPhaseBadge(item.phase) ?? <Badge variant="secondary">{item.status ?? item.approval_status ?? "—"}</Badge>}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.intake_timestamp ?? item.created_at}</td>
                      <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}><Eye className="mr-1 size-3.5" /> View</Button></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span>Showing {filteredItems.length} of {initialData?.total ?? filteredItems.length} entries</span>
            <div className="flex gap-1"><Button variant="outline" size="sm" disabled><ChevronLeft className="size-4" /></Button><Button variant="outline" size="sm" disabled><ChevronRight className="size-4" /></Button></div>
          </div>
        </CardContent>
      </Card>
      <CustomViewDetailsDialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)} title={`${meta.title} Details`} description={`Record UUID: ${selectedItem?.uuid ?? ""}`}>
        {selectedItem && <div className="space-y-3">
          <DetailItem label="UUID">{selectedItem.uuid}</DetailItem>
          {selectedItem.name && <DetailItem label="Name">{selectedItem.name}</DetailItem>}
          {selectedItem.status && <DetailItem label="Status">{selectedItem.status}</DetailItem>}
          {selectedItem.approval_status && <DetailItem label="Approval">{selectedItem.approval_status}</DetailItem>}
          {selectedItem.routes?.length ? <DetailItem label="Routes">{selectedItem.routes.length}</DetailItem> : null}
        </div>}
      </CustomViewDetailsDialog>
    </div>
  );
}
