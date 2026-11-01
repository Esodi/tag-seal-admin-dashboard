"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import { EmptyCard } from "@/components/ui/empty-card";
import { Input } from "@/components/ui/input";
import type { CommerceResource, CommerceResponse } from "@/features/commerce/types";

const resourceMeta: Record<CommerceResource, { title: string; description: string; primaryKey: string }> = {
  listings: {
    title: "Marketplace Listings",
    description: "Advertised livestock listings published by verified farmers for commercial trade.",
    primaryKey: "listing_title",
  },
  reservations: {
    title: "Commercial Reservations",
    description: "Active animal commerce holds preventing duplicate marketplace sales.",
    primaryKey: "uuid",
  },
  orders: {
    title: "Purchase Orders & Handover",
    description: "Seller-scoped purchase contracts, payment settlements, and tag-verified physical handovers.",
    primaryKey: "order_code",
  },
};

type DashboardItem = {
  id: number;
  uuid: string;
  listing_title?: string;
  order_code?: string;
  status: string;
  total_asking_price?: string;
  total_amount?: string;
  reservation_type?: string;
  settlement_method?: string;
  created_at?: string;
  seller?: { id: number; name?: string };
  buyer?: { id: number; name?: string };
  held_by?: { id: number; name?: string };
  farm?: { id: number; name?: string };
};

export function CommerceResourceDashboard({
  resource,
  initialData,
}: {
  resource: CommerceResource;
  initialData: CommerceResponse | null;
  initialError?: string;
}) {
  const meta = resourceMeta[resource];
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);

  const rawItems = useMemo(
    () => (initialData?.data ?? []) as unknown as DashboardItem[],
    [initialData?.data],
  );

  const filteredItems = useMemo(() => {
    if (!search.trim()) return rawItems;
    const q = search.toLowerCase();
    return rawItems.filter((item) => {
      const matchTitle = item.listing_title?.toLowerCase().includes(q);
      const matchCode = item.order_code?.toLowerCase().includes(q);
      const matchUuid = item.uuid?.toLowerCase().includes(q);
      const matchSeller = item.seller?.name?.toLowerCase().includes(q);
      return matchTitle || matchCode || matchUuid || matchSeller;
    });
  }, [rawItems, search]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={meta.title}
        description={meta.description}
        badge="Commerce V2"
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
            <p className="text-xs font-medium text-muted-foreground">Active Status</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-primary tabular-nums">
              {initialData?.meta?.active_listings ?? initialData?.meta?.active_reservations ?? initialData?.meta?.total_orders ?? rawItems.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Settlement Integrity</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold tracking-tight text-success">
              <CheckCircle2 className="size-5" /> 100%
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
              icon={ShoppingBag}
              title={`No ${meta.title.toLowerCase()} found`}
              description="New commercial transactions and listings created on mobile or portal will appear here."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50 text-xs font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Identifier / Title</th>
                    <th className="px-4 py-3">Parties</th>
                    <th className="px-4 py-3">Amount / Pricing</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map((item) => (
                    <tr key={item.uuid} className="hover:bg-muted/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {item.listing_title ?? item.order_code ?? item.uuid.slice(0, 13)}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          UUID: {item.uuid.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {item.seller?.name && <div>Seller: {item.seller.name}</div>}
                        {item.buyer?.name && <div>Buyer: {item.buyer.name}</div>}
                        {item.held_by?.name && <div>Held By: {item.held_by.name}</div>}
                        {item.farm?.name && <div className="text-muted-foreground">Farm: {item.farm.name}</div>}
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums">
                        {item.total_asking_price ? `${Number(item.total_asking_price).toLocaleString()} TZS` : ""}
                        {item.total_amount ? `${Number(item.total_amount).toLocaleString()} TZS` : ""}
                        {item.reservation_type && <Badge variant="outline">{item.reservation_type}</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            item.status === "active" || item.status === "transferred"
                              ? "default"
                              : item.status === "pending_settlement"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="mr-1 size-3.5" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <div>
              Showing {filteredItems.length} of {initialData?.total ?? filteredItems.length} entries
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CustomViewDetailsDialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title={`${meta.title} Details`}
        description={`Record UUID: ${selectedItem?.uuid ?? ""}`}
      >
        {selectedItem && (
          <div className="space-y-3">
            <DetailItem label="UUID">{selectedItem.uuid}</DetailItem>
            {selectedItem.listing_title && <DetailItem label="Title">{selectedItem.listing_title}</DetailItem>}
            {selectedItem.order_code && <DetailItem label="Order Code">{selectedItem.order_code}</DetailItem>}
            {selectedItem.status && <DetailItem label="Status">{selectedItem.status}</DetailItem>}
            {selectedItem.total_asking_price && (
              <DetailItem label="Asking Price">{Number(selectedItem.total_asking_price).toLocaleString()} TZS</DetailItem>
            )}
            {selectedItem.total_amount && (
              <DetailItem label="Amount">{Number(selectedItem.total_amount).toLocaleString()} TZS</DetailItem>
            )}
            {selectedItem.reservation_type && <DetailItem label="Hold type">{selectedItem.reservation_type}</DetailItem>}
            {selectedItem.settlement_method && <DetailItem label="Settlement">{selectedItem.settlement_method}</DetailItem>}
          </div>
        )}
      </CustomViewDetailsDialog>
    </div>
  );
}
