"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Check, Loader2, LogOut, Mail, Phone, RefreshCw, Save, ShieldCheck, ShieldAlert, Trash2, UserRound } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { EmptyCard } from "@/components/ui/empty-card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import { formatRecordDate } from "@/lib/resource-table";
import { profileValues, validateProfile, type AccountProfile, type DeletionCheck, type ProfileValues } from "./types";

const fields = [
  { key: "firstName", label: "First name", icon: UserRound, type: "text", autoComplete: "given-name", placeholder: "First name" },
  { key: "lastName", label: "Last name", icon: UserRound, type: "text", autoComplete: "family-name", placeholder: "Last name" },
  { key: "email", label: "Email address", icon: Mail, type: "email", autoComplete: "email", placeholder: "you@example.com" },
  { key: "phone", label: "Phone number", icon: Phone, type: "tel", autoComplete: "tel", placeholder: "+255 712 345 678" },
] as const;
const footerClass = "flex flex-col gap-3 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between [.border-t]:pt-4";

export function ProfileDashboard({ embedded = false }: { embedded?: boolean }) {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [error, setError] = useState<string>();
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(undefined);
    async function load() {
      try {
        const response = await authenticatedFetch("/api/admin/account/profile", { cache: "no-store", signal: controller.signal });
        const payload = await response.json();
        if (!response.ok || !payload.data?.id) throw new Error(payload.message ?? "Your profile could not be loaded.");
        if (!controller.signal.aborted) setProfile(payload.data);
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Your profile could not be loaded.");
      }
    }
    void load();
    return () => controller.abort();
  }, [revision]);

  return <div className="mx-auto max-w-4xl">
    {!embedded && <DashboardHeader title="My profile" description="Manage your personal details and your Tag & Seal account." />}
    <div className={embedded ? undefined : "mt-6"}>
      {error ? <Card><div role="alert"><EmptyCard icon={RefreshCw} title="Could not load your profile" description={error} action={<Button variant="outline" onClick={() => setRevision((value) => value + 1)}>Try again</Button>} /></div></Card>
        : profile ? <ProfileEditor initialProfile={profile} />
        : <div role="status" aria-label="Loading your profile" className="space-y-6"><Skeleton className="h-96 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div>}
    </div>
  </div>;
}

export function ProfileEditor({ initialProfile }: { initialProfile: AccountProfile }) {
  const { session, updateUser, signOut } = useAuthSession();
  const [profile, setProfile] = useState(initialProfile);
  const [values, setValues] = useState(() => profileValues(initialProfile));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string>();
  const [blocked, setBlocked] = useState<DeletionCheck | null>(null);
  const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim() || profile.username;
  const initials = fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const dirty = fields.some(({ key }) => values[key] !== profile[key]);
  const busy = saving || checking || deleting || signingOut;
  const roleLabel = profile.platformRole === "superAdmin" ? "Super administrator" : "Administrator";

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy || !dirty) return;
    const found = validateProfile(values);
    setErrors(found);
    setSaveError(undefined);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const response = await authenticatedFetch("/api/admin/account/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]))),
      });
      const payload = await response.json();
      if (!response.ok) {
        setErrors(Object.fromEntries(Object.entries(payload.errors ?? {}).map(([key, value]) => [key, String((value as string[])[0])])));
        throw new Error(payload.message ?? "Your changes could not be saved. Please try again.");
      }
      const next: AccountProfile = payload.data;
      setProfile(next);
      setValues(profileValues(next));
      updateUser({ ...session?.user, id: next.id, username: next.username, email: next.email, role: next.role, platformRole: next.platformRole, status: next.status, firstname: next.firstName, surname: next.lastName, phone1: next.phone });
      setSaved(true);
      toast.success("Profile updated.");
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Your changes could not be saved. Please try again.");
    } finally { setSaving(false); }
  }

  async function checkDeletion() {
    if (busy) return;
    setChecking(true);
    setDeleteError(undefined);
    try {
      const response = await authenticatedFetch("/api/admin/account/deletion-check", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not check account deletion. Please try again.");
      const check: DeletionCheck = payload.data;
      if (check.canDelete) { setConfirmation(""); setDeleteOpen(true); }
      else setBlocked(check);
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : "Could not check account deletion. Please try again.");
    } finally { setChecking(false); }
  }

  async function deleteAccount() {
    if (confirmation !== "delete" || busy) return;
    setDeleting(true);
    setDeleteError(undefined);
    try {
      const response = await authenticatedFetch("/api/admin/account/profile", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation }),
      });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setBlocked({ canDelete: false, code: payload.code, message: payload.message });
          setDeleteOpen(false);
          return;
        }
        throw new Error(payload.message ?? "Your account could not be deleted. Please try again.");
      }
      setDeleteOpen(false);
      toast.success("Your account has been deleted.");
      await signOut();
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : "Your account could not be deleted. Please try again.");
    } finally { setDeleting(false); }
  }

  return <div className="space-y-6">
    <Card className="overflow-hidden border-border/60 pb-0 shadow-xs">
      <CardHeader><h2 className="text-lg font-semibold tracking-tight">Personal information</h2><CardDescription>Your name and contact details, kept up to date.</CardDescription></CardHeader>
      <form onSubmit={save} noValidate>
        <CardContent className="space-y-6 pb-6">
          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full border-2 border-background bg-primary text-base font-bold text-primary-foreground shadow-sm">{initials}</span>
            <div className="min-w-0 flex-1 space-y-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold">{fullName}</h3><Badge variant="secondary" className="text-[11px]">{roleLabel}</Badge></div><p className="truncate text-xs text-muted-foreground">{values.email || "No email set"}</p></div>
          </div>
          <fieldset disabled={busy} className="grid min-w-0 gap-5 sm:grid-cols-2">
            <legend className="sr-only">Edit personal information</legend>
            {fields.map(({ key, label, icon: Icon, ...props }) => <Field key={key}>
              <FieldLabel htmlFor={`profile-${key}`} required>{label}</FieldLabel>
              <div className="relative"><Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input {...props} id={`profile-${key}`} required value={values[key]} maxLength={key === "phone" ? 50 : 255} readOnly={key === "phone" && profile.phoneReadOnly} aria-invalid={Boolean(errors[key]) || undefined} aria-describedby={errors[key] ? `profile-${key}-error` : key === "phone" ? "profile-phone-help" : undefined} className="pl-10 read-only:bg-muted/40" onChange={(event) => { setValues((current) => ({ ...current, [key]: event.target.value })); setErrors((current) => ({ ...current, [key]: "" })); setSaved(false); }} /></div>
              <FieldError id={`profile-${key}-error`}>{errors[key]}</FieldError>
              {key === "phone" && <FieldDescription id="profile-phone-help">{profile.phoneReadOnly ? "This is your verified sign-in number. Changing it requires phone verification." : "Include the country code. Tanzania: +255."}</FieldDescription>}
            </Field>)}
          </fieldset>
          <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3.5 text-xs text-muted-foreground"><ShieldAlert className="mt-0.5 size-4 shrink-0" /><p className="leading-relaxed">Your role and permissions are managed separately. Editing your profile does not change your access.</p></div>
          {saveError && <p role="alert" className="text-sm text-danger">{saveError}</p>}
        </CardContent>
        <CardFooter className={footerClass}>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground" role="status">{saved ? <><Check className="size-3.5 text-success" />All changes saved.</> : dirty ? "You have unsaved changes." : "Your profile is up to date."}</p>
          <div className="flex w-full gap-2 sm:w-auto">{dirty && <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => { setValues(profileValues(profile)); setErrors({}); setSaveError(undefined); }}>Cancel</Button>}<Button type="submit" size="sm" disabled={!dirty || busy} className="flex-1 sm:flex-none">{saving ? <Loader2 className="animate-spin" /> : <Save />}{saving ? "Saving…" : "Save profile"}</Button></div>
        </CardFooter>
      </form>
    </Card>

    <Card className="border-border/60 shadow-xs">
      <CardHeader><h2 className="text-lg font-semibold tracking-tight">Account role & access</h2><CardDescription>Your current role and permissions in Tag & Seal.</CardDescription></CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3 rounded-xl border border-border/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2.5"><span className="rounded-md bg-primary/10 p-2 text-primary"><ShieldCheck className="size-4" /></span><div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Platform role</p><p className="text-sm font-semibold">{roleLabel}</p></div></div><Badge variant="outline" className={profile.status === "active" ? "border-success/30 bg-success/5 text-success" : "text-muted-foreground"}><span className="mr-1.5 size-1.5 rounded-full bg-current" />{profile.status === "active" ? "Active account" : "Inactive account"}</Badge></div>
          <p className="text-xs leading-relaxed text-muted-foreground sm:pl-11">{profile.platformRole === "superAdmin" ? "Full platform access, including administrator permissions and system configuration." : "Access is limited to the permissions assigned to your account."}</p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-3">{[["Username", profile.username], ["Account type", profile.role.replace(/([a-z])([A-Z])/g, "$1 $2")], ["Joined", formatRecordDate(profile.createdAt)]].map(([label, value]) => <div key={label} className="rounded-lg bg-muted/40 p-3"><dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium capitalize">{value}</dd></div>)}</dl>
        <div className="space-y-2"><p className="text-xs font-medium text-muted-foreground">Granted permissions</p><div className="flex flex-wrap gap-2">{profile.platformRole === "superAdmin" ? <Badge variant="secondary">Full platform access</Badge> : profile.permissions.length ? profile.permissions.map((permission) => <Badge key={permission} variant="outline" className="font-normal">{permission.replace(/[._]/g, " ")}</Badge>) : <p className="text-xs text-muted-foreground">No additional permissions assigned.</p>}</div></div>
      </CardContent>
    </Card>

    <Card className="overflow-hidden border-border/60 pb-0 shadow-xs">
      <CardHeader><h2 className="text-lg font-semibold tracking-tight">Current session</h2><CardDescription>Signed in to the Tag & Seal administration dashboard.</CardDescription></CardHeader>
      <CardFooter className={footerClass}><p className="text-xs text-muted-foreground">Sign out when you finish using this device.</p><Button variant="outline" size="sm" disabled={busy} className="w-full sm:w-auto" onClick={() => setConfirmSignOut(true)}><LogOut />{signingOut ? "Signing out…" : "Sign out"}</Button></CardFooter>
    </Card>

    <ConfirmationAlertDialog
      open={confirmSignOut}
      onOpenChange={(open) => { if (!signingOut) setConfirmSignOut(open); }}
      icon={<LogOut />}
      destructive
      title="Sign out?"
      description="You will need to sign in again to use the Tag & Seal administration dashboard."
      confirmLabel={signingOut ? "Signing out…" : "Sign out"}
      cancelLabel="Cancel"
      onConfirm={async () => {
        setSigningOut(true);
        try {
          await signOut();
        } catch {
          toast.error("Could not sign out. Please try again.");
          setSigningOut(false);
          setConfirmSignOut(false);
        }
      }}
    />

    <Card className="overflow-hidden border-danger/30 bg-danger/5 pb-0 shadow-xs">
      <CardHeader><h2 className="text-lg font-semibold tracking-tight text-danger">Delete account</h2><CardDescription>Permanently remove your sign-in account and revoke all its sessions. Linked operational records must be reviewed before deletion.</CardDescription>{deleteError && !deleteOpen && <p role="alert" className="text-sm text-danger">{deleteError}</p>}</CardHeader>
      <CardFooter className={`${footerClass} border-danger/20 bg-danger/5`}><p className="text-xs text-muted-foreground">Account deletion cannot be undone.</p><Button variant="destructive" size="sm" disabled={busy} onClick={() => void checkDeletion()} className="w-full sm:w-auto">{checking ? <Loader2 className="animate-spin" /> : <Trash2 />}{checking ? "Checking account…" : "Delete account"}</Button></CardFooter>
    </Card>

    <AlertDialog open={deleteOpen} onOpenChange={(open) => { if (!deleting) setDeleteOpen(open); }}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogMedia className="bg-danger/10 text-danger"><Trash2 /></AlertDialogMedia><AlertDialogTitle>Permanently delete your account?</AlertDialogTitle><AlertDialogDescription>Your access will be revoked on all devices. You will be signed out immediately, and this action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
        <Field><FieldLabel htmlFor="delete-profile-confirmation">Type <span className="font-mono text-danger">delete</span> to confirm</FieldLabel><Input id="delete-profile-confirmation" autoComplete="off" spellCheck={false} value={confirmation} disabled={deleting} onChange={(event) => setConfirmation(event.target.value)} placeholder="delete" className="font-mono" />{deleteError && <FieldError>{deleteError}</FieldError>}</Field>
        <AlertDialogFooter><AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={confirmation !== "delete" || busy} onClick={(event) => { event.preventDefault(); void deleteAccount(); }}>{deleting ? "Deleting…" : "Delete my account"}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={Boolean(blocked)} onOpenChange={(open) => { if (!open) setBlocked(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia className="bg-warning/10 text-warning"><ShieldAlert /></AlertDialogMedia><AlertDialogTitle>Account deletion is unavailable</AlertDialogTitle><AlertDialogDescription>{blocked?.message}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Close</AlertDialogCancel>{profile.platformRole === "superAdmin" && blocked?.code === "lastSuperAdmin" && <AlertDialogAction asChild><Link href="/dashboard/people/user-accounts">Manage administrators</Link></AlertDialogAction>}</AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
