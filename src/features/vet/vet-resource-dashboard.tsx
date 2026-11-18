"use client";

import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { RegistryDashboard } from "@/features/registry/registry-dashboard";
import type { RegistryResponse } from "@/features/registry/types";
import { useRegistryRecords } from "@/features/registry/use-registry-records";
import { RequestForm } from "./request-form";
import { RequestActions, VetActions } from "./vet-actions";
import { requestColumns, vetColumns } from "./vet-columns";
import { vetConfig, vetEndpoint } from "./vet-config";
import { VetForm } from "./vet-form";
import type { VetAnyRecord, VetRecord, VetResource, VetServiceRequestRecord } from "./types";

type Props<T> = { initialData: RegistryResponse<T> | null; initialError?: string };
const shared = { parent: "Veterinary", parentHref: "/dashboard/vet", emptyIcon: Stethoscope };

function Vets({ initialData, initialError }: Props<VetRecord>) {
  const records = useRegistryRecords(vetEndpoint("vets"), initialData, initialError);
  const [adding, setAdding] = useState(false);
  return <>
    <RegistryDashboard {...shared} config={vetConfig.vets} records={records} columns={vetColumns} exportName="veterinarians"
      rowKey={(row) => String(row.id)} rowTitle={(row) => row.fullName} rowActions={(row) => <VetActions row={row} onChanged={records.reload} />}
      deleteEndpoint={(id) => `/api/admin/vet/vets/${encodeURIComponent(id)}`}
      addLabel="Add vet" onAdd={() => setAdding(true)} />
    {adding && <VetForm open={adding} onOpenChange={setAdding} onSaved={records.reload} />}
  </>;
}

function Requests({ initialData, initialError }: Props<VetServiceRequestRecord>) {
  const records = useRegistryRecords(vetEndpoint("requests"), initialData, initialError);
  const [adding, setAdding] = useState(false);
  return <>
    <RegistryDashboard {...shared} config={vetConfig.requests} records={records} columns={requestColumns} exportName="vet-service-requests"
      rowKey={(row) => row.uuid} rowTitle={(row) => row.problemCategory ?? "request"}
      rowActions={(row) => <RequestActions row={row} onChanged={records.reload} />}
      deleteEndpoint={(uuid) => `/api/admin/vet/requests/${encodeURIComponent(uuid)}`}
      addLabel="Add service request" onAdd={() => setAdding(true)} />
    {adding && <RequestForm open={adding} onOpenChange={setAdding} onSaved={records.reload} />}
  </>;
}

export function VetResourceDashboard({ resource, initialData, initialError }: Props<VetAnyRecord> & { resource: VetResource }) {
  if (resource === "vets") return <Vets initialData={initialData as RegistryResponse<VetRecord> | null} initialError={initialError} />;
  return <Requests initialData={initialData as RegistryResponse<VetServiceRequestRecord> | null} initialError={initialError} />;
}
