import { commerceLabel } from "@/features/commerce/commerce-config";
import { RegistryStatus } from "@/features/registry/registry-status";
import { registryColumn, type RegistryColumn } from "@/features/registry/types";
import { formatRecordDate } from "@/lib/resource-table";
import type { VetRecord, VetServiceRequestRecord } from "./types";
import { missingVetDocuments, requiredVetDocuments } from "./vet-document-rules";

const twoLine = (title: string, note?: string | null) => <div className="min-w-44 max-w-64 whitespace-normal"><p className="font-medium leading-5 [overflow-wrap:anywhere]">{title}</p>{note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}</div>;

export const animalLabel = (row: VetServiceRequestRecord) => [row.livestock?.identificationNumber, row.livestock?.name].filter(Boolean).join(" · ") || "—";

export const vetColumns: RegistryColumn<VetRecord>[] = [
  registryColumn("vet", "Vet", (r) => r.fullName, (r) => twoLine(r.fullName, r.clinicName || r.referenceNo)),
  registryColumn("phone", "Phone", (r) => r.phoneNumber || "—"),
  registryColumn("licence", "Licence", (r) => r.medicalLicenseNo || "—"),
  registryColumn("documents", "Documents", (r) => `${requiredVetDocuments.length - missingVetDocuments(r).length}/${requiredVetDocuments.length}`, (r) => {
    const missing = missingVetDocuments(r).length;
    return <span className={missing ? "font-medium text-destructive tabular-nums" : "tabular-nums text-muted-foreground"}>{requiredVetDocuments.length - missing}/{requiredVetDocuments.length}{missing ? " · missing" : ""}</span>;
  }),
  registryColumn("visits", "Visits done", (r) => String(r.completedRequestsCount ?? 0), undefined, "text-right tabular-nums"),
  registryColumn("approval", "Approval", (r) => commerceLabel(r.verificationStatus), (r) => <RegistryStatus status={r.verificationStatus} />),
  registryColumn("status", "Status", (r) => r.status === "notActive" ? "Not Active" : commerceLabel(r.status), (r) => <RegistryStatus status={r.status} />),
  registryColumn("created", "Created at", (r) => formatRecordDate(r.createdAt), undefined, "text-muted-foreground"),
];

export const requestColumns: RegistryColumn<VetServiceRequestRecord>[] = [
  registryColumn("problem", "Problem", (r) => commerceLabel(r.problemCategory), (r) => twoLine(commerceLabel(r.problemCategory), r.urgency ? `${commerceLabel(r.urgency)} urgency` : null)),
  registryColumn("farmer", "Farmer", (r) => r.farmer?.name || "—"),
  registryColumn("animal", "Animal", animalLabel),
  registryColumn("vet", "Vet", (r) => r.vet?.fullName || "Not assigned"),
  registryColumn("location", "Location", (r) => r.locationAddress || "—", (r) => <span className="block max-w-56 whitespace-normal">{r.locationAddress || "—"}</span>),
  registryColumn("status", "Status", (r) => commerceLabel(r.status), (r) => <RegistryStatus status={r.status} />),
  registryColumn("created", "Created at", (r) => formatRecordDate(r.timeline?.createdAt ?? undefined), undefined, "text-muted-foreground"),
];
