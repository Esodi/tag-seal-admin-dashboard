"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, PawPrint, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardPage } from "@/components/ui/dashboard";
import { EmptyCard } from "@/components/ui/empty-card";
import { FormDialog } from "@/components/ui/form-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePanel } from "@/components/ui/table-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { setupSend, useSetupResource } from "./animal-setup-api";
import { SetupStatus } from "./setup-status";
import type { AnimalTypeSummary } from "./types";

export const SETUP_HREF = "/dashboard/blueprints/animal-types-events";

/** Every animal type with the events farmers can record for it. */
export function AnimalTypesPage() {
  const { data, error, reload } = useSetupResource<AnimalTypeSummary[]>("");
  const [picking, setPicking] = useState(false);
  const configured = data?.filter((type) => type.configured) ?? [];

  return <DashboardPage>
    <DashboardHeader parent="Animal Setup" parentHref="/dashboard/blueprints" title="Animal Type & Event Blueprints"
      description="Choose the events farmers record for each animal type, and the details each event asks for."
      actions={<Button onClick={() => setPicking(true)} disabled={!data}><Plus />Set up animal type</Button>} />
    {error ? <EmptyCard icon={PawPrint} title="Could not load animal types" description={error} action={<Button onClick={reload}>Try again</Button>} />
      : !data ? <Skeleton className="h-72 w-full" />
        : configured.length === 0 ? <EmptyCard icon={PawPrint} title="No animal type set up yet"
          description="Until you set one up, the app keeps using its built-in event screens."
          action={<Button onClick={() => setPicking(true)}><Plus />Set up animal type</Button>} />
          : <TablePanel>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Animal type</TableHead><TableHead>Events</TableHead><TableHead>Version</TableHead><TableHead>Status</TableHead>
                <TableHead className="text-right"><span className="sr-only">Open</span></TableHead>
              </TableRow></TableHeader>
              <TableBody>{configured.map((type) => <TableRow key={type.id}>
                <TableCell className="font-medium"><Link href={`${SETUP_HREF}/${type.id}`} className="hover:underline">{type.name}</Link></TableCell>
                <TableCell>{type.eventsCount}</TableCell>
                <TableCell>{type.publishedVersion ? `v${type.publishedVersion}` : "—"}{type.hasDraft && type.publishedVersion ? <span className="ml-2 text-xs text-muted-foreground">+ draft</span> : null}</TableCell>
                <TableCell><SetupStatus published={type.publishedVersion !== null} hasDraft={type.hasDraft} live={type.live} /></TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm" asChild><Link href={`${SETUP_HREF}/${type.id}`}>Open<ChevronRight /></Link></Button></TableCell>
              </TableRow>)}</TableBody>
            </Table>
          </TablePanel>}
    {picking && data && <TypePickerDialog types={data} open={picking} onOpenChange={setPicking} />}
  </DashboardPage>;
}

function TypePickerDialog({ types, open, onOpenChange }: { types: AnimalTypeSummary[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function submit() {
    if (selected === null) {
      setError("Choose an animal type.");
      return false;
    }
    try {
      await setupSend(`/${selected}`, "POST");
      toast.success("Animal type set up. Add the events farmers should record.");
      router.push(`${SETUP_HREF}/${selected}`);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "The animal type could not be set up.");
      return false;
    }
  }

  return <FormDialog open={open} onOpenChange={onOpenChange} size="md" title="Set up animal type"
    description="Types that are already set up are greyed out. Open them from the list to change their events."
    submitLabel="Continue" onSubmit={submit}>
    <div role="radiogroup" aria-label="Animal type" className="grid gap-2 sm:grid-cols-2">
      {types.map((type) => {
        const active = selected === type.id;
        return <button key={type.id} type="button" role="radio" aria-checked={active} disabled={type.configured}
          onClick={() => { setSelected(type.id); setError(""); }}
          className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
            type.configured ? "cursor-not-allowed bg-muted/40 text-muted-foreground" : "hover:border-primary/60 hover:bg-accent/40",
            active && "border-primary bg-accent/60 ring-2 ring-primary/20")}>
          <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", active && "border-primary bg-primary text-primary-foreground")}>{active && <Check className="size-3" />}</span>
          <span className="min-w-0 flex-1 font-medium">{type.name}</span>
          {type.configured && <Badge variant="outline">Set up</Badge>}
        </button>;
      })}
    </div>
    {error && <p role="alert" className="text-supporting text-danger">{error}</p>}
  </FormDialog>;
}
