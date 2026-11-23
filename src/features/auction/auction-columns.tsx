import { commerceDateTime, commerceLabel, commerceMoney } from "@/features/commerce/commerce-config";
import { RegistryStatus } from "@/features/registry/registry-status";
import { registryColumn, type RegistryColumn } from "@/features/registry/types";
import { formatRecordDate } from "@/lib/resource-table";
import type {
  AuctionBidRecord,
  AuctionCentreRecord,
  AuctionIntakeRecord,
  AuctionOfficerRecord,
  AuctionSaleRecord,
  AuctionSessionRecord,
} from "./types";

const twoLine = (title: string, note?: string | null) => <div className="min-w-44 max-w-64 whitespace-normal"><p className="font-medium leading-5 [overflow-wrap:anywhere]">{title}</p>{note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}</div>;

export const centreLocation = (row: AuctionCentreRecord) => [row.address, row.districtName, row.regionName].filter(Boolean).join(", ") || "—";

export const centreColumns: RegistryColumn<AuctionCentreRecord>[] = [
  registryColumn("centre", "Centre", (r) => r.name, (r) => twoLine(r.name, r.code)),
  registryColumn("location", "Location", centreLocation, (r) => <span className="block max-w-56 whitespace-normal">{centreLocation(r)}</span>),
  registryColumn("phone", "Phone", (r) => r.phone || "—"),
  registryColumn("members", "Members", (r) => String(r.membersCount ?? 0), undefined, "text-right tabular-nums"),
  registryColumn("sessions", "Auctions", (r) => String(r.sessionsCount ?? 0), undefined, "text-right tabular-nums"),
  registryColumn("status", "Status", (r) => commerceLabel(r.status), (r) => <RegistryStatus status={r.status} />),
  registryColumn("created", "Created at", (r) => formatRecordDate(r.createdAt ?? undefined), undefined, "text-muted-foreground"),
];

export const officerColumns: RegistryColumn<AuctionOfficerRecord>[] = [
  registryColumn("officer", "Officer", (r) => r.fullName, (r) => twoLine(r.fullName, r.officerNo)),
  registryColumn("phone", "Phone", (r) => r.phone || "—"),
  registryColumn("centre", "Requested centre", (r) => r.requestedCentre?.name || "—"),
  registryColumn("approval", "Approval", (r) => commerceLabel(r.verificationStatus), (r) => <RegistryStatus status={r.verificationStatus} />),
  registryColumn("status", "Status", (r) => commerceLabel(r.status), (r) => <RegistryStatus status={r.status} />),
  registryColumn("created", "Created at", (r) => formatRecordDate(r.createdAt ?? undefined), undefined, "text-muted-foreground"),
];

export const sessionColumns: RegistryColumn<AuctionSessionRecord>[] = [
  registryColumn("session", "Auction", (r) => r.title, (r) => twoLine(r.title, commerceLabel(r.mode))),
  registryColumn("centre", "Centre", (r) => r.centre?.name || "—"),
  registryColumn("officer", "Officer", (r) => r.officer?.fullName || r.host?.name || "—"),
  registryColumn("scheduled", "Scheduled (EAT)", (r) => commerceDateTime(r.scheduledAt)),
  registryColumn("lots", "Lots sold", (r) => `${r.soldCount ?? 0} / ${r.lotsCount ?? 0}`, undefined, "text-right tabular-nums"),
  registryColumn("sales", "Gross sales", (r) => commerceMoney(r.grossSales, r.currency ?? "TZS"), undefined, "text-right font-medium tabular-nums"),
  registryColumn("status", "Status", (r) => commerceLabel(r.status), (r) => <RegistryStatus status={r.status} />),
  registryColumn("created", "Created at", (r) => formatRecordDate(r.createdAt ?? undefined), undefined, "text-muted-foreground"),
];

export const intakeColumns: RegistryColumn<AuctionIntakeRecord>[] = [
  registryColumn(
    "animal",
    "Animal",
    (r) => r.livestock?.name || r.livestock?.identificationNumber || r.livestockUuid,
    (r) => twoLine(r.livestock?.name || r.livestock?.identificationNumber || "—", r.livestock?.identificationNumber || r.livestockUuid),
  ),
  registryColumn("centre", "Centre", (r) => r.centreName || "—"),
  registryColumn(
    "farmer",
    "Farmer / Farm",
    (r) => r.farmerName || r.farmName || "—",
    (r) => twoLine(r.farmerName || "—", r.farmName || r.farmerPhone),
  ),
  registryColumn(
    "askingPrice",
    "Asking price",
    (r) => (r.askingPrice != null ? commerceMoney(r.askingPrice, "TZS") : "—"),
    undefined,
    "text-right font-medium tabular-nums",
  ),
  registryColumn("created", "Created at", (r) => formatRecordDate(r.createdAt ?? undefined), undefined, "text-muted-foreground"),
  registryColumn("status", "Status", (r) => commerceLabel(r.status), (r) => <RegistryStatus status={r.status} />),
];

export const bidColumns: RegistryColumn<AuctionBidRecord>[] = [
  registryColumn(
    "lot",
    "Lot / Animal",
    (r) => r.lotTitle || r.livestock?.name || r.livestock?.identificationNumber || "—",
    (r) => twoLine(r.lotTitle || r.livestock?.name || "—", r.lotNumber != null ? `Lot #${r.lotNumber}` : undefined),
  ),
  registryColumn(
    "session",
    "Auction",
    (r) => r.sessionTitle || "—",
    (r) => twoLine(r.sessionTitle || "—", r.centreName),
  ),
  registryColumn(
    "bidder",
    "Bidder",
    (r) => r.bidderName || (r.bidderNumber != null ? `Bidder #${r.bidderNumber}` : "—"),
    (r) => twoLine(r.bidderName || "—", r.bidderNumber != null ? `Bidder #${r.bidderNumber}${r.bidderPhone ? ` · ${r.bidderPhone}` : ""}` : r.bidderPhone),
  ),
  registryColumn("amount", "Bid amount", (r) => commerceMoney(r.amount, r.currency ?? "TZS"), undefined, "text-right font-medium tabular-nums"),
  registryColumn("created", "Created at", (r) => commerceDateTime(r.createdAt), undefined, "text-muted-foreground"),
  registryColumn("status", "Status", (r) => commerceLabel(r.status), (r) => <RegistryStatus status={r.status} />),
];

export const saleColumns: RegistryColumn<AuctionSaleRecord>[] = [
  registryColumn(
    "receipt",
    "Receipt",
    (r) => r.receiptNo || r.uuid,
    (r) => twoLine(r.receiptNo || "—", commerceLabel(r.channel ?? "live")),
  ),
  registryColumn(
    "animal",
    "Animal / Lot",
    (r) => r.livestock?.name || r.livestock?.identificationNumber || "—",
    (r) => twoLine(r.livestock?.name || r.livestock?.identificationNumber || "—", r.sessionTitle),
  ),
  registryColumn(
    "buyer",
    "Buyer",
    (r) => r.buyerName || "—",
    (r) => twoLine(r.buyerName || "—", r.buyerPhone),
  ),
  registryColumn("amount", "Amount", (r) => commerceMoney(r.amount, r.currency ?? "TZS"), undefined, "text-right font-medium tabular-nums"),
  registryColumn("created", "Created at", (r) => commerceDateTime(r.createdAt), undefined, "text-muted-foreground"),
  registryColumn("status", "Payment", (r) => commerceLabel(r.status), (r) => <RegistryStatus status={r.status} />),
];
