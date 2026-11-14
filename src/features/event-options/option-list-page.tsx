"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Ban, Database, History, Info, ListChecks, Lock, MoreHorizontal, Pencil, Plus, RotateCcw, Sparkles } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { DashboardPage } from "@/components/ui/dashboard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePanel } from "@/components/ui/table-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { SetupError, sendTo, useAdminResource } from "@/features/animal-setup/animal-setup-api";
import { OPTIONS_API } from "./event-options-page";
import { OPTIONS_HREF, SOURCE_HELP, SOURCE_LABELS, type OptionAnswer, type OptionList } from "./types";

type Dialog = { kind: "add" } | { kind: "edit"; answer: OptionAnswer } | { kind: "rename" };

/** One option list: its answers in the order farmers see them. */
export function OptionListPage({ listId }: { listId: string }) {
  const { data, error, reload, setData } = useAdminResource<OptionList>(OPTIONS_API, `/${listId}`);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [deactivating, setDeactivating] = useState<OptionAnswer | null>(null);
  const [busy, setBusy] = useState(false);

  async function change(path: string, method: string, body: unknown, success: string) {
    setBusy(true);
    try {
      setData(await sendTo<OptionList>(OPTIONS_API, `/${listId}${path}`, method, body));
      toast.success(success);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The change could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <DashboardPage><EmptyCard icon={Database} title="Could not load this option list" description={error} action={<Button onClick={reload}>Try again</Button>} /></DashboardPage>;
  if (!data) return <DashboardPage><Skeleton className="h-24 w-full" /><Skeleton className="h-96 w-full" /></DashboardPage>;

  const move = (index: number, offset: number) => {
    const order = data.options.map((answer) => answer.uuid);
    [order[index], order[index + offset]] = [order[index + offset], order[index]];
    void change("/options/order", "POST", { order }, "Order saved.");
  };
  const SourceIcon = data.source === "system" ? Lock : data.source === "custom" ? Sparkles : History;
  const active = data.options.filter((answer) => answer.active).length;

  return <DashboardPage>
    <DashboardHeader parent="Event Field Options" parentHref={OPTIONS_HREF} title={data.name.en}
      description={[data.name.sw, `${active} active answer${active === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}
      actions={data.editable && <div className="flex gap-2">
        {data.source === "custom" && <Button variant="outline" onClick={() => setDialog({ kind: "rename" })}><Pencil />Rename</Button>}
        <Button onClick={() => setDialog({ kind: "add" })}><Plus />Add answer</Button>
      </div>} />

    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2"><Badge variant="outline"><SourceIcon />{SOURCE_LABELS[data.source]}</Badge></div>
        <p className="mt-2 text-sm text-muted-foreground">{SOURCE_HELP[data.source]}</p>
        <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground"><Info className="mt-0.5 size-3.5 shrink-0" />
          Farmers get changes the next time the app syncs. Deactivated answers stay on old records but can no longer be picked.</p>
      </section>
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Used in</h2>
        {data.usedIn.length
          ? <div className="mt-2 flex flex-wrap gap-1.5">{data.usedIn.map((name) => <Badge key={name} variant="secondary">{name}</Badge>)}</div>
          : <p className="mt-2 text-sm text-muted-foreground">No published event uses this list yet. Pick it in a choice field under Animal Type &amp; Event Blueprints.</p>}
      </section>
    </div>

    <TablePanel>
      {data.options.length ? <Table>
        <TableHeader><TableRow>
          <TableHead className="w-12">#</TableHead><TableHead>English</TableHead><TableHead>Swahili</TableHead><TableHead>Status</TableHead>
          {data.editable && <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>}
        </TableRow></TableHeader>
        <TableBody>{data.options.map((answer, index) => <TableRow key={answer.uuid} className={answer.active ? undefined : "opacity-60"}>
          <TableCell className="tabular-nums text-muted-foreground">{index + 1}</TableCell>
          <TableCell className="font-medium">{answer.label.en}</TableCell>
          <TableCell>{answer.label.sw || <span className="text-muted-foreground">Not translated</span>}</TableCell>
          <TableCell><Badge variant={answer.active ? "secondary" : "outline"}>{answer.active ? "Active" : "Deactivated"}</Badge></TableCell>
          {data.editable && <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" disabled={busy} aria-label={`Actions for ${answer.label.en}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setDialog({ kind: "edit", answer })}><Pencil />Edit</DropdownMenuItem>
                <DropdownMenuItem disabled={index === 0} onSelect={() => move(index, -1)}><ArrowUp />Move up</DropdownMenuItem>
                <DropdownMenuItem disabled={index === data.options.length - 1} onSelect={() => move(index, 1)}><ArrowDown />Move down</DropdownMenuItem>
                <DropdownMenuSeparator />
                {answer.active
                  ? <DropdownMenuItem destructive onSelect={() => setDeactivating(answer)}><Ban />Deactivate</DropdownMenuItem>
                  : <DropdownMenuItem onSelect={() => void change(`/options/${answer.uuid}`, "PATCH", { active: true }, `${answer.label.en} can be picked again.`)}><RotateCcw />Reactivate</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>}
        </TableRow>)}</TableBody>
      </Table> : <div className="p-5"><EmptyCard icon={ListChecks} title="No answers yet" description={data.editable ? "Add the first answer farmers can pick." : "This list has no answers."} /></div>}
    </TablePanel>

    {dialog?.kind === "rename" && <RenameDialog list={data} onClose={() => setDialog(null)} onSaved={setData} />}
    {(dialog?.kind === "add" || dialog?.kind === "edit") && <AnswerDialog list={data} answer={dialog.kind === "edit" ? dialog.answer : null}
      onClose={() => setDialog(null)} onSaved={setData} />}
    {deactivating && <ConfirmationAlertDialog open onOpenChange={(open) => { if (!open) setDeactivating(null); }}
      title={`Deactivate ${deactivating.label.en}?`} confirmLabel="Deactivate" destructive
      description="Farmers will no longer be able to pick it. Records that already use it keep it, and you can reactivate it at any time."
      onConfirm={async () => { await change(`/options/${deactivating.uuid}`, "PATCH", { active: false }, `${deactivating.label.en} deactivated.`); setDeactivating(null); }} />}
  </DashboardPage>;
}

function Problems({ messages }: { messages: string[] }) {
  if (!messages.length) return null;
  return <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
    <ul className="ml-4 list-disc">{messages.map((message) => <li key={message}>{message}</li>)}</ul>
  </div>;
}

function AnswerDialog({ list, answer, onClose, onSaved }: { list: OptionList; answer: OptionAnswer | null; onClose: () => void; onSaved: (list: OptionList) => void }) {
  const [en, setEn] = useState(answer?.label.en ?? "");
  const [sw, setSw] = useState(answer?.label.sw ?? "");
  const [extra, setExtra] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problems, setProblems] = useState<string[]>([]);
  const needsExtra = !answer && list.extraField;

  async function submit() {
    const found: Record<string, string> = {};
    if (!en.trim()) found.en = "Enter the answer in English.";
    if (needsExtra && !extra) found.extra = `Choose a ${list.extraField!.label.toLowerCase()}.`;
    setErrors(found);
    setProblems([]);
    if (Object.keys(found).length) return false;
    try {
      const body = { en: en.trim(), sw: sw.trim() || null, ...(needsExtra ? { extra } : {}) };
      onSaved(await sendTo<OptionList>(OPTIONS_API, `/${list.uuid}/options${answer ? `/${answer.uuid}` : ""}`, answer ? "PATCH" : "POST", body));
      toast.success(answer ? "Answer updated." : `${en.trim()} added.`);
      return true;
    } catch (e) {
      setProblems(e instanceof SetupError ? e.messages : ["The answer could not be saved."]);
      return false;
    }
  }

  return <FormDialog open onOpenChange={(open) => { if (!open) onClose(); }} title={answer ? "Edit answer" : `Add answer to ${list.name.en}`}
    description={list.source === "old_app" ? "This is also saved to the old app, so both apps show the same answer." : "Farmers can pick it after their next sync."}
    submitLabel={answer ? "Save answer" : "Add answer"} onSubmit={submit}>
    <Problems messages={problems} />
    <Field>
      <FieldLabel htmlFor="answer-en" required>Answer (English)</FieldLabel>
      <Input id="answer-en" autoFocus value={en} aria-invalid={Boolean(errors.en)} onChange={(e) => setEn(e.target.value)} />
      <FieldError>{errors.en}</FieldError>
    </Field>
    <Field>
      <FieldLabel htmlFor="answer-sw">Answer (Swahili)</FieldLabel>
      <Input id="answer-sw" value={sw} onChange={(e) => setSw(e.target.value)} />
      <FieldDescription>Shown to farmers using the app in Swahili. English is used when this is empty.</FieldDescription>
    </Field>
    {needsExtra && <Field>
      <FieldLabel required>{list.extraField!.label}</FieldLabel>
      <FormSelect value={extra} onValueChange={setExtra} placeholder={`Choose a ${list.extraField!.label.toLowerCase()}`} options={list.extraField!.choices} />
      <FieldError>{errors.extra}</FieldError>
    </Field>}
  </FormDialog>;
}

function RenameDialog({ list, onClose, onSaved }: { list: OptionList; onClose: () => void; onSaved: (list: OptionList) => void }) {
  const [en, setEn] = useState(list.name.en);
  const [sw, setSw] = useState(list.name.sw ?? "");
  const [problems, setProblems] = useState<string[]>([]);

  async function submit() {
    if (!en.trim()) { setProblems(["Enter the list name."]); return false; }
    try {
      onSaved(await sendTo<OptionList>(OPTIONS_API, `/${list.uuid}`, "PATCH", { name: { en: en.trim(), sw: sw.trim() || null } }));
      toast.success("List renamed.");
      return true;
    } catch (e) {
      setProblems(e instanceof SetupError ? e.messages : ["The list could not be renamed."]);
      return false;
    }
  }

  return <FormDialog open onOpenChange={(open) => { if (!open) onClose(); }} title="Rename option list" submitLabel="Save name" onSubmit={submit}>
    <Problems messages={problems} />
    <Field>
      <FieldLabel htmlFor="rename-en" required>List name (English)</FieldLabel>
      <Input id="rename-en" value={en} onChange={(e) => setEn(e.target.value)} />
    </Field>
    <Field>
      <FieldLabel htmlFor="rename-sw">List name (Swahili)</FieldLabel>
      <Input id="rename-sw" value={sw} onChange={(e) => setSw(e.target.value)} />
    </Field>
  </FormDialog>;
}
