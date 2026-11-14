import { commerceDateTime, commerceLabel, commerceMoney } from "@/features/commerce/commerce-config";
import { RegistryStatus } from "@/features/registry/registry-status";
import { registryColumn, type RegistryColumn } from "@/features/registry/types";
import { formatRecordDate } from "@/lib/resource-table";
import type { AuctionCentreRecord, AuctionOfficerRecord, AuctionSessionRecord } from "./types";

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
