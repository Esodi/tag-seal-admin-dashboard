import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRecordDate } from "@/lib/resource-table";
import { commerceDateTime, commerceLabel, commerceMoney, isListing, isOrder, personName, recordTitle } from "./commerce-config";
import type { CommercePerson, CommerceRecord, CommerceResource } from "./types";

export function CommerceStatus({ status }: { status: string }) {
  const tone = ["active", "fulfilled", "sold", "transferred"].includes(status)
    ? "border-success/20 bg-success/10 text-success"
    : ["disputed", "cancelled", "expired", "withdrawn"].includes(status)
      ? "border-danger/20 bg-danger/5 text-danger"
      : ["pending_settlement", "reserved", "under_negotiation", "ready_for_handover"].includes(status)
        ? "border-warning/30 bg-warning/10 text-foreground"
        : "border-border bg-muted/50 text-muted-foreground";
  return <Badge variant="outline" className={cn("gap-1.5 px-2.5 py-1 text-[11px] font-medium", tone)}><span className="size-1.5 rounded-full bg-current" aria-hidden="true" />{commerceLabel(status)}</Badge>;
}

export function CommercePersonCell({ person }: { person?: CommercePerson }) {
  const name = personName(person);
  return <div className="max-w-48 whitespace-normal"><p className="font-medium [overflow-wrap:anywhere]">{name}</p>{person?.email && person.email !== name && <p className="mt-0.5 text-xs text-muted-foreground [overflow-wrap:anywhere]">{person.email}</p>}</div>;
}

export type CommerceColumn = {
  key: string;
  label: string;
  className?: string;
  render: (record: CommerceRecord) => ReactNode;
  value: (record: CommerceRecord) => string;
};

function column(key: string, label: string, value: CommerceColumn["value"], render?: CommerceColumn["render"], className?: string): CommerceColumn {
  return { key, label, value, render: render ?? value, className };
}

const identity = (record: CommerceRecord) => <div className="min-w-44 max-w-64 whitespace-normal"><p className="font-medium leading-5 [overflow-wrap:anywhere]">{recordTitle(record)}</p><p className="mt-0.5 text-xs text-muted-foreground">{isListing(record) ? commerceLabel(record.listing_type) : isOrder(record) ? commerceLabel(record.source_type) : record.livestock?.identificationNumber || record.livestock_uuid}</p></div>;

export function commerceColumns(resource: CommerceResource): CommerceColumn[] {
  const columns: CommerceColumn[] = resource === "listings" ? [
    column("listing", "Listing", recordTitle, identity),
    column("seller", "Seller", (r) => isListing(r) ? personName(r.seller) : "—", (r) => <CommercePersonCell person={isListing(r) ? r.seller : undefined} />),
    column("farm", "Farm", (r) => isListing(r) ? r.farm?.name || "—" : "—"),
    column("price", "Asking price", (r) => isListing(r) ? commerceMoney(r.total_asking_price, r.currency) : "—", (r) => isListing(r) ? <div className="tabular-nums"><p className="font-medium">{commerceMoney(r.total_asking_price, r.currency)}</p><p className="mt-0.5 text-xs text-muted-foreground">{r.is_negotiable ? "Negotiable" : "Fixed price"}</p></div> : "—", "text-right"),
  ] : resource === "reservations" ? [
    column("animal", "Animal", recordTitle, identity),
    column("type", "Hold type", (r) => !isListing(r) && !isOrder(r) ? commerceLabel(r.reservation_type) : "—"),
    column("holder", "Held by", (r) => !isListing(r) && !isOrder(r) ? personName(r.held_by) : "—", (r) => <CommercePersonCell person={!isListing(r) && !isOrder(r) ? r.held_by : undefined} />),
    column("expires", "Expires (EAT)", (r) => !isListing(r) && !isOrder(r) ? commerceDateTime(r.expires_at) : "—"),
  ] : [
    column("order", "Order", recordTitle, identity),
    column("seller", "Seller", (r) => isOrder(r) ? personName(r.seller) : "—", (r) => <CommercePersonCell person={isOrder(r) ? r.seller : undefined} />),
    column("buyer", "Buyer", (r) => isOrder(r) ? personName(r.buyer) : "—", (r) => <CommercePersonCell person={isOrder(r) ? r.buyer : undefined} />),
    column("amount", "Order amount", (r) => isOrder(r) ? commerceMoney(r.total_amount, r.currency) : "—", undefined, "text-right font-medium tabular-nums"),
    column("settlement", "Settlement", (r) => isOrder(r) ? commerceLabel(r.settlement_method) : "—"),
  ];
  return [...columns,
    column("status", "Status", (r) => commerceLabel(r.status), (r) => <CommerceStatus status={r.status} />),
    column("created", "Created at", (r) => formatRecordDate(r.created_at), undefined, "text-muted-foreground"),
  ];
}
