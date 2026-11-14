"use client";

import { useState } from "react";
import { Eye, MoreVertical, Pencil, PhoneOff, RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { RecordPagination } from "@/components/ui/record-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableToolbar } from "@/components/ui/table-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { updateAccountPhone, type DuplicateAccount, type DuplicatePhone, type PhoneRecord } from "./duplicate-phones-api";

const PAGE_SIZE = 5;

type Editing = { account: DuplicateAccount; record: PhoneRecord };

/** One numbered card per phone number that cannot sign in, listing the accounts that hold it. */
export function DuplicatePhonesPanel({ groups, error, onReload, onChanged, onView }: {
  groups: DuplicatePhone[] | null;
  error: string;
  onReload: () => void;
  onChanged: (groups: DuplicatePhone[]) => void;
  onView: (userId: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Editing | null>(null);

  const term = query.trim().toLowerCase();
  const matches = (groups ?? []).filter((group) => !term || [group.phone, ...group.accounts.flatMap((account) => [
    account.name, account.username, ...account.records.map((record) => record.value),
  ])].some((text) => text.toLowerCase().includes(term)));
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const from = (current - 1) * PAGE_SIZE;
  const visible = matches.slice(from, from + PAGE_SIZE);

  return <>
    <TableToolbar>
      <div className="relative min-w-0 flex-1 lg:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="pl-9" placeholder="Search phone, name or username…" />
      </div>
      <p className="text-sm text-muted-foreground lg:ml-auto">
        These numbers cannot sign in to the app. Keep each number on one account only.
      </p>
    </TableToolbar>

    {error ? (
      <div className="p-4">
        <EmptyCard icon={PhoneOff} title="Could not load duplicate phone numbers" description={error}
          action={<Button variant="outline" size="sm" onClick={onReload}><RefreshCw />Try again</Button>} />
      </div>
    ) : !groups ? (
      <div className="space-y-4 p-5">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    ) : !matches.length ? (
      <div className="p-4">
        <EmptyCard icon={PhoneOff} title={term ? "No matching phone numbers" : "No duplicate phone numbers"}
          description={term ? "Try a different search." : "Every phone number belongs to one account, so everyone can sign in to the app."} />
      </div>
    ) : (
      <div className="space-y-4 p-5">
        {visible.map((group, index) => (
          <section key={group.phone} className="overflow-hidden rounded-xl border">
            <header className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-3">
              <h3 className="text-sm font-semibold tabular-nums">{from + index + 1}. {group.phone}</h3>
              <Badge variant="secondary">
                {group.reason === "shared" ? `Shared by ${group.accounts.length} accounts` : "Login number is different"}
              </Badge>
            </header>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone number</TableHead>
                  <TableHead>Full name</TableHead>
                  <TableHead>Saved as</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.accounts.map((account) => (
                  <TableRow key={account.userId}>
                    <TableCell className="font-medium tabular-nums">{group.phone}</TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.username}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {account.records.map((record) => <span key={record.source} className="flex items-center gap-1.5 text-sm">
                          <Badge variant="secondary">{record.label}</Badge>
                          <span className="tabular-nums text-muted-foreground">{record.value}</span>
                        </span>)}
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={account.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{account.lastActiveAt ? formatDate(account.lastActiveAt) : "Never"}</TableCell>
                    <TableCell className="text-muted-foreground">{account.createdAt ? formatDate(account.createdAt) : "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${account.username}`}><MoreVertical /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => onView(account.userId)}><Eye />View details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {account.records.map((record) => (
                            <DropdownMenuItem key={record.source} onSelect={() => setEditing({ account, record })}>
                              <Pencil />Update {record.label.toLowerCase()}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        ))}
      </div>
    )}

    {groups && !error ? (
      <RecordPagination from={matches.length ? from + 1 : 0} to={from + visible.length} total={matches.length} page={current} pageCount={pageCount} onPageChange={setPage} />
    ) : null}

    {editing && <EditPhoneDialog editing={editing} onClose={() => setEditing(null)} onSaved={onChanged} />}
  </>;
}

function EditPhoneDialog({ editing, onClose, onSaved }: { editing: Editing; onClose: () => void; onSaved: (groups: DuplicatePhone[]) => void }) {
  const { account, record } = editing;
  const canRemove = !(record.source === "profile" && account.role === "farmer");
  const [phone, setPhone] = useState(record.value);
  const [remove, setRemove] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!remove && !phone.trim()) { setError("Enter the new phone number."); return false; }
    setError("");
    try {
      onSaved(await updateAccountPhone(account.userId, record.source, remove ? null : phone.trim()));
      toast.success(remove ? `${record.label} removed from ${account.name}.` : `${record.label} of ${account.name} updated.`);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "The phone number could not be saved.");
      return false;
    }
  }

  return <FormDialog open size="md" onOpenChange={(open) => { if (!open) onClose(); }} title={`Update ${record.label.toLowerCase()}`}
    description={`${account.name} (${account.username})`} submitLabel={remove ? "Remove number" : "Save number"} onSubmit={submit}>
    <Field>
      <FieldLabel htmlFor="duplicate-phone" required={!remove}>Phone number</FieldLabel>
      <Input id="duplicate-phone" value={phone} disabled={remove} aria-invalid={Boolean(error)} placeholder="e.g. 0712345678" onChange={(e) => setPhone(e.target.value)} />
      <FieldDescription>
        {record.source === "login"
          ? "The number this person signs in to the app with. They keep their PIN."
          : "The phone number saved on this person's profile."}
      </FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
    {canRemove && <label className="flex items-start gap-2 text-sm">
      <Checkbox checked={remove} onCheckedChange={(checked) => setRemove(checked === true)} className="mt-0.5" />
      <span>
        Remove this number from the account
        <span className="block text-xs text-muted-foreground">
          {record.source === "login"
            ? "They will verify a phone number by SMS and set a new PIN the next time they sign in."
            : "The profile will have no phone number."}
        </span>
      </span>
    </label>}
  </FormDialog>;
}

function formatDate(value: string) {
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
