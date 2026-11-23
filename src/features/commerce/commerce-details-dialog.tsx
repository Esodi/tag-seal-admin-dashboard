"use client";

import { useEffect, useState } from "react";
import { Package, RefreshCw } from "lucide-react";
import { MediaPreviewButton, MediaPreviewList } from "@/components/media/media-preview";
import { mediaSourceFrom } from "@/components/media/media-source";
import { Button } from "@/components/ui/button";
import { CustomViewDetailsDialog, DetailItem, DetailSection } from "@/components/ui/custom-view-details-dialog";
import { EmptyCard } from "@/components/ui/empty-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authenticatedFetch } from "@/lib/auth/session";
import { commerceConfig, commerceDateTime, commerceLabel, commerceMoney, isListing, isOrder, personName, recordTitle } from "./commerce-config";
import { CommerceStatus } from "./commerce-columns";
import type { CommerceItem, CommerceRecord, CommerceResource } from "./types";

function Items({ items, currency, order }: { items?: CommerceItem[]; currency: string; order: boolean }) {
  if (!items?.length) return null;
  return <section className="space-y-3"><h3 className="text-[14px] font-semibold">Included animals <span className="ml-1 text-muted-foreground">({items.length})</span></h3>
    <div className="overflow-hidden rounded-xl border"><Table aria-label="Included animals"><TableHeader><TableRow><TableHead>Animal</TableHead><TableHead>Tag / reference</TableHead><TableHead className="text-right">{order ? "Agreed price" : "Allocated price"}</TableHead></TableRow></TableHeader><TableBody>{items.map((item) => <TableRow key={item.uuid || item.id}><TableCell>{item.livestock?.name || "Unnamed animal"}</TableCell><TableCell className="font-mono text-xs">{item.livestock?.identificationNumber || item.livestock_uuid}</TableCell><TableCell className="text-right tabular-nums">{commerceMoney(order ? item.agreed_price : item.allocated_asking_price, currency)}</TableCell></TableRow>)}</TableBody></Table></div>
  </section>;
}

export function CommerceDetailsContent({ record }: { record: CommerceRecord }) {
  return <>
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-muted/20 p-4">
      <div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl border bg-card text-primary"><Package className="size-5" /></span><div className="min-w-0"><h3 className="text-base font-semibold [overflow-wrap:anywhere]">{recordTitle(record)}</h3><p className="mt-1 text-[12px] text-muted-foreground">{isListing(record) ? commerceLabel(record.listing_type) : isOrder(record) ? commerceLabel(record.source_type) : commerceLabel(record.reservation_type)}</p></div></div>
      <CommerceStatus status={record.status} />
    </div>
    {isListing(record) ? <>
      <DetailSection title="Pricing & availability">
        <DetailItem label="Asking price">{commerceMoney(record.total_asking_price, record.currency)}</DetailItem>
        <DetailItem label="Pricing terms">{record.is_negotiable ? "Negotiable" : "Fixed price"}</DetailItem>
        <DetailItem label="Minimum acceptable price">{commerceMoney(record.minimum_acceptable_price, record.currency)}</DetailItem>
        <DetailItem label="Available quantity">{record.available_quantity ?? "—"}</DetailItem>
        <DetailItem label="Reserved quantity">{record.reserved_quantity ?? "—"}</DetailItem>
        <DetailItem label="Sold quantity">{record.sold_quantity ?? "—"}</DetailItem>
      </DetailSection>
      <DetailSection title="Seller & farm">
        <DetailItem label="Seller">{personName(record.seller)}</DetailItem><DetailItem label="Email">{record.seller?.email || "—"}</DetailItem>
        <DetailItem label="Farm">{record.farm?.name || "—"}</DetailItem><DetailItem label="Location">{record.location_name || "—"}</DetailItem>
      </DetailSection>
      <section className="space-y-3"><h3 className="text-[14px] font-semibold">Photos <span className="ml-1 text-muted-foreground">({record.photo_urls?.length ?? 0})</span></h3>
        <MediaPreviewList variant="gallery" emptyText="The seller added no photos." items={(record.photo_urls ?? []).map((href, index) => ({ name: `Photo ${index + 1}.jpg`, href }))} />
      </section>
      {record.description && <DetailSection title="Listing description"><DetailItem label="Description" className="sm:col-span-2">{record.description}</DetailItem></DetailSection>}
      <Items items={record.items} currency={record.currency} order={false} />
      <DetailSection title="Publication & record information">
        <DetailItem label="Published (EAT)">{commerceDateTime(record.published_at)}</DetailItem><DetailItem label="Expires (EAT)">{commerceDateTime(record.expires_at)}</DetailItem>
        <DetailItem label="Created (EAT)">{commerceDateTime(record.created_at)}</DetailItem>
      </DetailSection>
    </> : isOrder(record) ? <>
      <DetailSection title="Buyer & seller">
        <DetailItem label="Seller">{personName(record.seller)}</DetailItem><DetailItem label="Buyer">{personName(record.buyer)}</DetailItem>
        <DetailItem label="Seller email">{record.seller?.email || "—"}</DetailItem><DetailItem label="Buyer email">{record.buyer?.email || "—"}</DetailItem>
        <DetailItem label="Origin farm">{record.origin_farm?.name || "—"}</DetailItem><DetailItem label="Destination farm">{record.destination_farm?.name || "—"}</DetailItem>
      </DetailSection>
      <DetailSection title="Payment & settlement">
        <DetailItem label="Order amount">{commerceMoney(record.total_amount, record.currency)}</DetailItem><DetailItem label="Settlement method">{commerceLabel(record.settlement_method)}</DetailItem>
        <DetailItem label="Payment reference">{record.payment_evidence_ref || "—"}</DetailItem><DetailItem label="Settlement verified (EAT)">{commerceDateTime(record.settlement_verified_at)}</DetailItem>
        <DetailItem label="Payment receipt">{(() => { const source = mediaSourceFrom(record.payment_evidence_receipt, "Payment receipt"); return source ? <MediaPreviewButton source={source} /> : "Not attached"; })()}</DetailItem>
        <DetailItem label="Evidence submitted (EAT)">{commerceDateTime(record.payment_evidence_submitted_at)}</DetailItem>
      </DetailSection>
      <DetailSection title="Handover & ownership">
        <DetailItem label="Reserved until (EAT)">{commerceDateTime(record.reserved_until)}</DetailItem><DetailItem label="Handover verified (EAT)">{commerceDateTime(record.handover_verified_at)}</DetailItem>
        <DetailItem label="Ownership transferred (EAT)">{commerceDateTime(record.ownership_transferred_at)}</DetailItem><DetailItem label="Created (EAT)">{commerceDateTime(record.created_at)}</DetailItem>
        {record.dispute_reason && <DetailItem label="Dispute reason" className="sm:col-span-2">{record.dispute_reason}</DetailItem>}
        {record.cancellation_reason && <DetailItem label="Cancellation reason" className="sm:col-span-2">{record.cancellation_reason}</DetailItem>}
      </DetailSection>
      <Items items={record.items} currency={record.currency} order />
    </> : <>
      <DetailSection title="Animal & reservation">
        <DetailItem label="Animal">{record.livestock?.name || "—"}</DetailItem><DetailItem label="Animal tag">{record.livestock?.identificationNumber || "—"}</DetailItem>
        <DetailItem label="Hold type">{commerceLabel(record.reservation_type)}</DetailItem>
        <DetailItem label="Held by">{personName(record.held_by)}</DetailItem><DetailItem label="Holder email">{record.held_by?.email || "—"}</DetailItem>
      </DetailSection>
      <DetailSection title="Timing & release">
        <DetailItem label="Created (EAT)">{commerceDateTime(record.created_at)}</DetailItem><DetailItem label="Expires (EAT)">{commerceDateTime(record.expires_at)}</DetailItem>
        <DetailItem label="Released (EAT)">{commerceDateTime(record.released_at)}</DetailItem><DetailItem label="Release reason">{record.release_reason || "—"}</DetailItem>
      </DetailSection>
    </>}
  </>;
}

export function CommerceDetailsDialog({ resource, record, onClose }: { resource: CommerceResource; record: CommerceRecord; onClose: () => void }) {
  const [detail, setDetail] = useState<CommerceRecord | null>(null);
  const [error, setError] = useState<string>();
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setDetail(null);
    setError(undefined);
    async function load() {
      try {
        const response = await authenticatedFetch(`/api/admin/commerce/${resource}/${encodeURIComponent(record.uuid)}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json();
        if (!response.ok || payload.status === false || !payload.data?.uuid) throw new Error(payload.message ?? "Record details could not be loaded.");
        if (!controller.signal.aborted) setDetail(payload.data);
      } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Record details could not be loaded."); }
    }
    void load();
    return () => controller.abort();
  }, [resource, record.uuid, revision]);

  return <CustomViewDetailsDialog open onOpenChange={(open) => { if (!open) onClose(); }} title={`${commerceLabel(commerceConfig[resource].singular)} details`} description={recordTitle(record)}>
    {error ? <div role="alert"><EmptyCard icon={RefreshCw} title="Could not load details" description={error} action={<Button variant="outline" onClick={() => setRevision((value) => value + 1)}>Try again</Button>} /></div> : detail ? <CommerceDetailsContent record={detail} /> : <div role="status" aria-label="Loading record details" className="space-y-5"><Skeleton className="h-24 w-full rounded-xl" /><div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div></div>}
  </CustomViewDetailsDialog>;
}
