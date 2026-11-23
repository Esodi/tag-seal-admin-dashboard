"use client";

import { useState } from "react";
import { Gavel } from "lucide-react";
import { RegistryDashboard } from "@/features/registry/registry-dashboard";
import type { RegistryResponse } from "@/features/registry/types";
import { useRegistryRecords } from "@/features/registry/use-registry-records";
import { BidActions, CentreActions, IntakeActions, OfficerActions, SaleActions, SessionActions } from "./auction-actions";
import { bidColumns, centreColumns, intakeColumns, officerColumns, saleColumns, sessionColumns } from "./auction-columns";
import { auctionAddLabel, auctionConfig, auctionEndpoint } from "./auction-config";
import { CentreForm, OfficerForm } from "./auction-forms";
import type {
  AuctionBidRecord,
  AuctionCentreRecord,
  AuctionIntakeRecord,
  AuctionOfficerRecord,
  AuctionRecord,
  AuctionResource,
  AuctionSaleRecord,
  AuctionSessionRecord,
} from "./types";

type Props<T> = { initialData: RegistryResponse<T> | null; initialError?: string };
const shared = { parent: "Auction", parentHref: "/dashboard/auction", emptyIcon: Gavel };

function Centres({ initialData, initialError }: Props<AuctionCentreRecord>) {
  const records = useRegistryRecords(auctionEndpoint("centres"), initialData, initialError);
  const [adding, setAdding] = useState(false);
  return <>
    <RegistryDashboard {...shared} config={auctionConfig.centres} records={records} columns={centreColumns} exportName="auction-centres"
      rowKey={(row) => row.uuid} rowTitle={(row) => row.name} rowActions={(row) => <CentreActions row={row} onChanged={records.reload} />}
      addLabel={auctionAddLabel.centres} onAdd={() => setAdding(true)} />
    {adding && <CentreForm open={adding} onOpenChange={setAdding} onSaved={records.reload} />}
  </>;
}

function Officers({ initialData, initialError }: Props<AuctionOfficerRecord>) {
  const records = useRegistryRecords(auctionEndpoint("officers"), initialData, initialError);
  const [adding, setAdding] = useState(false);
  return <>
    <RegistryDashboard {...shared} config={auctionConfig.officers} records={records} columns={officerColumns} exportName="auction-officers"
      rowKey={(row) => row.uuid} rowTitle={(row) => row.fullName} rowActions={(row) => <OfficerActions row={row} onChanged={records.reload} />}
      addLabel={auctionAddLabel.officers} onAdd={() => setAdding(true)} />
    {adding && <OfficerForm open={adding} onOpenChange={setAdding} onSaved={records.reload} />}
  </>;
}

function Sessions({ initialData, initialError }: Props<AuctionSessionRecord>) {
  const records = useRegistryRecords(auctionEndpoint("sessions"), initialData, initialError);
  return <RegistryDashboard {...shared} config={auctionConfig.sessions} records={records} columns={sessionColumns} exportName="auction-sessions"
    rowKey={(row) => row.uuid} rowTitle={(row) => row.title} rowActions={(row) => <SessionActions row={row} onChanged={records.reload} />} />;
}

function Intakes({ initialData, initialError }: Props<AuctionIntakeRecord>) {
  const records = useRegistryRecords(auctionEndpoint("intakes"), initialData, initialError);
  return <RegistryDashboard {...shared} config={auctionConfig.intakes} records={records} columns={intakeColumns} exportName="auction-intakes"
    rowKey={(row) => row.uuid} rowTitle={(row) => row.livestock?.name || row.livestock?.identificationNumber || row.livestockUuid}
    rowActions={(row) => <IntakeActions row={row} onChanged={records.reload} />} />;
}

function Bids({ initialData, initialError }: Props<AuctionBidRecord>) {
  const records = useRegistryRecords(auctionEndpoint("bids"), initialData, initialError);
  return <RegistryDashboard {...shared} config={auctionConfig.bids} records={records} columns={bidColumns} exportName="auction-bids"
    rowKey={(row) => row.uuid} rowTitle={(row) => row.lotTitle || row.bidderName || row.uuid}
    rowActions={(row) => <BidActions row={row} />} />;
}

function Sales({ initialData, initialError }: Props<AuctionSaleRecord>) {
  const records = useRegistryRecords(auctionEndpoint("sales"), initialData, initialError);
  return <RegistryDashboard {...shared} config={auctionConfig.sales} records={records} columns={saleColumns} exportName="auction-sales"
    rowKey={(row) => row.uuid} rowTitle={(row) => row.receiptNo || row.buyerName || row.uuid}
    rowActions={(row) => <SaleActions row={row} onChanged={records.reload} />} />;
}

export function AuctionResourceDashboard({ resource, initialData, initialError }: Props<AuctionRecord> & { resource: AuctionResource }) {
  if (resource === "centres") return <Centres initialData={initialData as RegistryResponse<AuctionCentreRecord> | null} initialError={initialError} />;
  if (resource === "officers") return <Officers initialData={initialData as RegistryResponse<AuctionOfficerRecord> | null} initialError={initialError} />;
  if (resource === "sessions") return <Sessions initialData={initialData as RegistryResponse<AuctionSessionRecord> | null} initialError={initialError} />;
  if (resource === "intakes") return <Intakes initialData={initialData as RegistryResponse<AuctionIntakeRecord> | null} initialError={initialError} />;
  if (resource === "bids") return <Bids initialData={initialData as RegistryResponse<AuctionBidRecord> | null} initialError={initialError} />;
  return <Sales initialData={initialData as RegistryResponse<AuctionSaleRecord> | null} initialError={initialError} />;
}
