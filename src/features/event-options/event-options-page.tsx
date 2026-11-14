"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Database, History, ListChecks, Lock, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardPage, DashboardStatCard, DashboardStatsGrid } from "@/components/ui/dashboard";
import { EmptyCard } from "@/components/ui/empty-card";
import { Field, FieldDescription, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { SetupError, sendTo, useAdminResource } from "@/features/animal-setup/animal-setup-api";
import { OPTIONS_HREF, SOURCE_LABELS, type ListSource, type OptionList, type OptionListSummary } from "./types";

export const OPTIONS_API = "/api/admin/blueprints/event-options";

const SOURCE_ICONS = { old_app: History, custom: Sparkles, system: Lock } as const;

/** Every answer list used by event choice fields. */
export function EventOptionsPage() {
  const { data, error, reload } = useAdminResource<OptionListSummary[]>(OPTIONS_API, "");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<"all" | ListSource>("all");
  const [creating, setCreating] = useState(false);
  const term = search.trim().toLowerCase();
  const rows = (data ?? []).filter((list) => (source === "all" || list.source === source)
    && [list.name.en, list.name.sw ?? "", list.code].some((text) => text.toLowerCase().includes(term)));
  const count = (kind: ListSource) => data?.filter((list) => list.source === kind).length ?? 0;

  return <DashboardPage>
    <DashboardHeader parent="Animal Setup" parentHref="/dashboard/blueprints" title="Event Field Options"
      description="The answers farmers pick from when they record an event, such as diseases, medicines, birth types and animal stages."
      actions={<Button onClick={() => setCreating(true)}><Plus />Create option list</Button>} />

    <DashboardStatsGrid>
      <DashboardStatCard label="Option lists" value={data?.length ?? 0} note="All answer lists" icon={ListChecks} loading={!data} />
      <DashboardStatCard label="From old app" value={count("old_app")} note="Kept in sync with the old app" icon={History} loading={!data} />
      <DashboardStatCard label="Custom" value={count("custom")} note="Created for custom events" icon={Sparkles} loading={!data} />
      <DashboardStatCard label="System" value={count("system")} note="Read-only platform statuses" icon={Lock} loading={!data} />
    </DashboardStatsGrid>

    {error ? <EmptyCard icon={Database} title="Could not load option lists" description={error} action={<Button onClick={reload}>Try again</Button>} />
      : !data ? <Skeleton className="h-96 w-full" />
        : <TablePanel>
          <TableToolbar>
            <div className="relative min-w-0 flex-1 lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" aria-label="Search option lists" placeholder="Search option lists…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="lg:ml-auto">
              <FormSelect size="sm" value={source} onValueChange={(value) => setSource(value as typeof source)} triggerClassName="h-8 min-w-40"
                options={[{ value: "all", label: "All sources" }, ...(["old_app", "custom", "system"] as const).map((value) => ({ value, label: SOURCE_LABELS[value] }))]} />
            </div>
          </TableToolbar>
          {rows.length ? <Table>
            <TableHeader><TableRow>
              <TableHead>Option list</TableHead><TableHead>Source</TableHead><TableHead>Answers</TableHead><TableHead>Used in</TableHead>
              <TableHead className="text-right"><span className="sr-only">Open</span></TableHead>
            </TableRow></TableHeader>
            <TableBody>{rows.map((list) => {
              const Icon = SOURCE_ICONS[list.source];
              return <TableRow key={list.uuid}>
                <TableCell>
                  <Link href={`${OPTIONS_HREF}/${list.uuid}`} className="font-medium hover:underline">{list.name.en}</Link>
                  {list.name.sw && <p className="text-xs text-muted-foreground">{list.name.sw}</p>}
                </TableCell>
                <TableCell><Badge variant={list.source === "custom" ? "secondary" : "outline"}><Icon />{SOURCE_LABELS[list.source]}</Badge></TableCell>
                <TableCell className="tabular-nums">{list.optionsCount}</TableCell>
                <TableCell className="text-muted-foreground">{list.usedIn ? `${list.usedIn} event${list.usedIn === 1 ? "" : "s"}` : "Not used yet"}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm" asChild><Link href={`${OPTIONS_HREF}/${list.uuid}`}>Open<ChevronRight /></Link></Button></TableCell>
              </TableRow>;
            })}</TableBody>
          </Table> : <div className="p-5"><EmptyCard icon={ListChecks} title="No option lists found" description="Change the search or source filter." /></div>}
        </TablePanel>}
    {creating && <CreateListDialog open={creating} onOpenChange={setCreating} />}
  </DashboardPage>;
}

type Answer = { en: string; sw: string };

function CreateListDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [name, setName] = useState<Answer>({ en: "", sw: "" });
  const [answers, setAnswers] = useState<Answer[]>([{ en: "", sw: "" }, { en: "", sw: "" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  async function submit() {
    const filled = answers.filter((answer) => answer.en.trim() || answer.sw.trim());
    const found: Record<string, string> = {};
    if (!name.en.trim()) found.name = "Enter the list name.";
    if (!filled.length) found.answers = "Add at least one answer.";
    filled.forEach((answer) => { if (!answer.en.trim()) found.answers = "Every answer needs an English label."; });
    setErrors(found);
    setServerErrors([]);
    if (Object.keys(found).length) return false;
    try {
      const list = await sendTo<OptionList>(OPTIONS_API, "", "POST", { name, options: filled });
      toast.success("Option list created. Use it in a choice field of any event.");
      router.push(`${OPTIONS_HREF}/${list.uuid}`);
      return true;
    } catch (e) {
      setServerErrors(e instanceof SetupError ? e.messages : ["The list could not be created."]);
      return false;
    }
  }

  return <FormDialog open={open} onOpenChange={onOpenChange} size="lg" title="Create option list"
    description="A list of answers farmers can pick from, for example Hoof problems: Cracked, Overgrown, Infected."
    submitLabel="Create list" onSubmit={submit}>
    {serverErrors.length > 0 && <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
      <ul className="ml-4 list-disc">{serverErrors.map((message) => <li key={message}>{message}</li>)}</ul>
    </div>}
    <FieldGrid>
      <Field>
        <FieldLabel htmlFor="list-name" required>List name (English)</FieldLabel>
        <Input id="list-name" value={name.en} aria-invalid={Boolean(errors.name)} placeholder="e.g. Hoof problems" onChange={(e) => setName({ ...name, en: e.target.value })} />
        <FieldError>{errors.name}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="list-name-sw">List name (Swahili)</FieldLabel>
        <Input id="list-name-sw" value={name.sw} placeholder="e.g. Matatizo ya kwato" onChange={(e) => setName({ ...name, sw: e.target.value })} />
      </Field>
    </FieldGrid>
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Answers</h3>
          <FieldDescription>Shown to farmers in this order. You can reorder them later.</FieldDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setAnswers([...answers, { en: "", sw: "" }])}><Plus />Add answer</Button>
      </div>
      {answers.map((answer, index) => <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input aria-label={`Answer ${index + 1} in English`} placeholder={`Answer ${index + 1} (English)`} value={answer.en}
          onChange={(e) => setAnswers(answers.map((item, i) => (i === index ? { ...item, en: e.target.value } : item)))} />
        <Input aria-label={`Answer ${index + 1} in Swahili`} placeholder="Swahili (optional)" value={answer.sw}
          onChange={(e) => setAnswers(answers.map((item, i) => (i === index ? { ...item, sw: e.target.value } : item)))} />
        <Button type="button" variant="ghost" size="icon" aria-label={`Remove answer ${index + 1}`} disabled={answers.length === 1}
          onClick={() => setAnswers(answers.filter((_, i) => i !== index))}><Trash2 /></Button>
      </div>)}
      <FieldError>{errors.answers}</FieldError>
    </section>
  </FormDialog>;
}
