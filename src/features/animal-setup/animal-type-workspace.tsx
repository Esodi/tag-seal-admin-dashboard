"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CircleAlert, CirclePause, CirclePlay, CopyPlus, ListPlus, Lock, MoreHorizontal, PawPrint, Pencil, Plus, Rocket, Scale, Sparkles, Trash2,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { DashboardPage } from "@/components/ui/dashboard";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { SetupError, setupSend, useSetupResource } from "./animal-setup-api";
import { SETUP_HREF } from "./animal-types-page";
import { EventDialog, type EventDialogMode } from "./event-dialog";
import { SetupStatus } from "./setup-status";
import { APPLIES_TO, WEIGHT_UNITS, type SetupEvent, type Workspace } from "./types";

type Confirm = { title: string; description: string; label: string; destructive?: boolean; run: () => Promise<void> };

/** One animal type: its events, and the publish → live controls. */
export function AnimalTypeWorkspace({ typeId }: { typeId: string }) {
  const router = useRouter();
  const { data, error, reload, setData } = useSetupResource<Workspace>(`/${typeId}`);
  const [dialog, setDialog] = useState<EventDialogMode | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [problems, setProblems] = useState<string[]>([]);

  async function act(path: string, method: string, success: string, after?: (next: Workspace | null) => void) {
    try {
      const next = await setupSend<Workspace | null>(path, method);
      setProblems([]);
      toast.success(success);
      if (after) after(next);
      else if (next) setData(next);
    } catch (e) {
      const messages = e instanceof SetupError ? e.messages : ["The request failed."];
      if (path.endsWith("/publish")) setProblems(messages);
      else toast.error(messages[0]);
    }
  }

  const back = <Button variant="outline" asChild><Link href={SETUP_HREF}><ArrowLeft />All animal types</Link></Button>;
  if (error) return <DashboardPage>{back}<EmptyCard icon={PawPrint} title="Could not load this animal type" description={error} action={<Button onClick={reload}>Try again</Button>} /></DashboardPage>;
  if (!data) return <DashboardPage><Skeleton className="h-40 w-full" /><Skeleton className="h-96 w-full" /></DashboardPage>;

  const base = `/${data.type.id}`;
  const hasDraft = data.editable;
  const published = data.published !== null;

  const publish = () => setConfirm({
    title: `Publish ${data.type.name} v${data.blueprint.version}?`,
    description: data.live
      ? "This type is live, so farmers get these events on their next sync."
      : "Publishing locks this version. The app keeps its built-in screens until you turn the type live.",
    label: "Publish",
    run: () => act(`${base}/publish`, "POST", "Published."),
  });
  const discard = () => setConfirm({
    title: "Discard draft?",
    description: published ? `Your changes are removed and v${data.published?.version} stays as it is.` : `${data.type.name} goes back to not set up.`,
    label: "Discard draft",
    destructive: true,
    run: () => act(base, "DELETE", "Draft discarded.", (next) => (next ? setData(next) : router.push(SETUP_HREF))),
  });
  const removeEvent = (event: SetupEvent) => setConfirm({
    title: `Remove ${event.name.en}?`,
    description: "Farmers will no longer see this event once the draft is published.",
    label: "Remove",
    destructive: true,
    run: () => act(`${base}/events/${event.uuid}`, "DELETE", "Event removed."),
  });
  const toggleLive = () => setConfirm(data.live ? {
    title: `Pause ${data.type.name}?`,
    description: "The app goes back to its built-in event screens for this type. Nothing recorded is lost.",
    label: "Pause",
    run: () => act(`${base}/pause`, "POST", "Paused. The app uses its built-in screens."),
  } : {
    title: `Turn ${data.type.name} live?`,
    description: `Farmers get the events of v${data.published?.version} on their next sync. You can pause at any time.`,
    label: "Go live",
    run: () => act(`${base}/live`, "POST", "Live. Farmers get these events on their next sync."),
  });

  return <DashboardPage>
    <DashboardHeader parent="Animal Type & Event Blueprints" parentHref={SETUP_HREF} title={`${data.type.name} Blueprint`}
      description="The events farmers can record for this animal type."
      actions={back} />

    <section className="card flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Version {data.blueprint.version}</h2>
          <SetupStatus published={published} hasDraft={hasDraft} live={data.live} />
        </div>
        <p className="text-sm text-muted-foreground">{statusText(data)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {hasDraft && <Button variant="outline" onClick={discard}><Trash2 />Discard draft</Button>}
        {hasDraft && <Button onClick={publish} disabled={!data.events.length}><Rocket />Publish v{data.blueprint.version}</Button>}
        {!hasDraft && <Button variant="outline" onClick={() => act(`${base}/new-version`, "POST", "New version opened. Make your changes, then publish.")}><CopyPlus />New version</Button>}
        {published && <Button variant={data.live ? "outline" : "default"} onClick={toggleLive}>{data.live ? <><CirclePause />Pause</> : <><CirclePlay />Go live</>}</Button>}
      </div>
    </section>

    {problems.length > 0 && <div role="alert" className="flex gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <div><p className="font-medium">Fix these before publishing:</p><ul className="ml-4 mt-1 list-disc">{problems.map((message) => <li key={message}>{message}</li>)}</ul></div>
    </div>}

    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Events</h2>
          <p className="mt-1 text-supporting text-muted-foreground">Farmers choose which of these to record. None of them is compulsory.</p>
        </div>
        {hasDraft && <DropdownMenu>
          <DropdownMenuTrigger asChild><Button><Plus />Add event</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={!data.standardEvents.length} onSelect={() => setDialog({ kind: "standard" })}><ListPlus />Standard event</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setDialog({ kind: "custom" })}><Sparkles />Custom event</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>}
      </div>
      {data.events.length === 0 ? <EmptyCard icon={ListPlus} title="No events yet"
        description="Start with a standard event such as Weight or Vaccination, or create your own."
        action={hasDraft ? <Button onClick={() => setDialog({ kind: data.standardEvents.length ? "standard" : "custom" })}><Plus />Add first event</Button> : undefined} />
        : <ul className="grid gap-3 md:grid-cols-2">{data.events.map((event) => <EventCard key={event.uuid} event={event} editable={hasDraft}
          onEdit={() => setDialog({ kind: "edit", event })} onRemove={() => removeEvent(event)} />)}</ul>}
      {!hasDraft && data.events.length > 0 && <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Lock className="size-3.5" />Published versions are locked. Choose New version to make changes.</p>}
    </section>

    {dialog && <EventDialog key={dialog.kind === "edit" ? dialog.event.uuid : dialog.kind} workspace={data} mode={dialog} open
      onOpenChange={(open) => { if (!open) setDialog(null); }} onSaved={setData} />}
    {confirm && <ConfirmationAlertDialog open onOpenChange={(open) => { if (!open) setConfirm(null); }} title={confirm.title} description={confirm.description}
      confirmLabel={confirm.label} destructive={confirm.destructive} onConfirm={async () => { await confirm.run(); setConfirm(null); }} />}
  </DashboardPage>;
}

function statusText(data: Workspace) {
  if (data.editable && !data.published) return "Draft. Add the events farmers should record, then publish. The app keeps its built-in screens until you go live.";
  if (data.editable) return `You are editing a new version. Farmers keep using v${data.published?.version} until you publish.`;
  if (data.live) return "Published and live. Farmers record these events in the app.";
  return "Published but not live. The app still uses its built-in screens for this type. Go live when you are ready.";
}

function EventCard({ event, editable, onEdit, onRemove }: { event: SetupEvent; editable: boolean; onEdit: () => void; onRemove: () => void }) {
  const applies = APPLIES_TO.find((item) => item.value === event.appliesTo)?.label ?? "All animals";
  const hasScale = event.fields.some((field) => field.type === "measurement" && WEIGHT_UNITS.includes(field.unit ?? "") && field.capture !== "manual");
  return <li className="flex flex-col gap-3 rounded-xl border p-4">
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="font-medium">{event.name.en}</h3>
        {event.name.sw && <p className="text-xs text-muted-foreground">{event.name.sw}</p>}
      </div>
      {editable && <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${event.name.en}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onEdit}><Pencil />Edit</DropdownMenuItem>
          <DropdownMenuItem onSelect={onRemove} className="text-danger"><Trash2 />Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>}
    </div>
    <div className="flex flex-wrap gap-1.5">
      <Badge variant={event.standard ? "secondary" : "outline"}>{event.standard ? "Standard" : "Custom"}</Badge>
      <Badge variant="outline">{applies}</Badge>
      {hasScale && <Badge variant="outline"><Scale />Scale ready</Badge>}
    </div>
    <p className="text-xs text-muted-foreground">
      {event.fields.slice(0, 4).map((field) => `${field.label.en}${field.required ? " *" : ""}`).join(" · ")}
      {event.fields.length > 4 ? ` · +${event.fields.length - 4} more` : ""}
      {event.fields.length === 0 ? "No fields" : ""}
    </p>
  </li>;
}
