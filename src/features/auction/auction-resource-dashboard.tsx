"use client";

import { useState } from "react";
import { Gavel } from "lucide-react";
import { RegistryDashboard } from "@/features/registry/registry-dashboard";
import type { RegistryResponse } from "@/features/registry/types";
import { useRegistryRecords } from "@/features/registry/use-registry-records";
import { CentreActions, OfficerActions, SessionActions } from "./auction-actions";
import { centreColumns, officerColumns, sessionColumns } from "./auction-columns";
import { auctionAddLabel, auctionConfig, auctionEndpoint } from "./auction-config";
import { CentreForm, OfficerForm } from "./auction-forms";
import type { AuctionCentreRecord, AuctionOfficerRecord, AuctionRecord, AuctionResource, AuctionSessionRecord } from "./types";

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

export function AuctionResourceDashboard({ resource, initialData, initialError }: Props<AuctionRecord> & { resource: AuctionResource }) {
  if (resource === "centres") return <Centres initialData={initialData as RegistryResponse<AuctionCentreRecord> | null} initialError={initialError} />;
  if (resource === "officers") return <Officers initialData={initialData as RegistryResponse<AuctionOfficerRecord> | null} initialError={initialError} />;
  return <Sessions initialData={initialData as RegistryResponse<AuctionSessionRecord> | null} initialError={initialError} />;
}
