"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type Permission = { code: string; name: string };
type PlatformRole = "superAdmin" | "admin" | "appUser";
type Account = { id: number; username: string; role: string; platformRole: PlatformRole; status: string; permissions: string[] };
type PermissionData = { actor: { id: number; platformRole: PlatformRole }; users: Account[]; permissions: Permission[] };

export function PlatformPermissionsPage() {
  const [data, setData] = useState<PermissionData | null>(null);
  const [accountId, setAccountId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [platformRole, setPlatformRole] = useState<PlatformRole>("appUser");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/platform-permissions", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Permissions could not be loaded.");
        setData(payload.data);
      })
      .catch((error: Error) => { if (error.name !== "AbortError") setMessage(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  function choose(value: string) {
    setAccountId(value);
    const user = data?.users.find((account) => String(account.id) === value);
    setSelected(user?.permissions ?? []);
    setPlatformRole(user?.platformRole ?? "appUser");
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/platform-permissions/${accountId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ permissions: selected, platformRole }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Permissions could not be updated.");
      setData((current) => current && ({ ...current, users: current.users.map((user) => String(user.id) === accountId ? { ...user, permissions: selected, platformRole } : user) }));
      setMessage("Permissions updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Permissions could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform permissions</CardTitle>
        <CardDescription>Select an account and choose its platform access. Feature and farm access are managed separately.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? <p>Loading permissions…</p> : data && <>
          <label className="block space-y-2 text-sm font-medium">
            <span>Account</span>
            <select className="w-full rounded-md border bg-background px-3 py-2" value={accountId} onChange={(event) => choose(event.target.value)}>
              <option value="">Select an account</option>
              {data.users.map((user) => <option key={user.id} value={user.id}>{user.username} · {user.role} · {user.status}</option>)}
            </select>
          </label>
          {accountId && <>
            <label className="block space-y-2 text-sm font-medium">
              <span>Platform role</span>
              <select className="w-full rounded-md border bg-background px-3 py-2 disabled:opacity-60" value={platformRole} disabled={data.actor.platformRole !== "superAdmin" || String(data.actor.id) === accountId} onChange={(event) => setPlatformRole(event.target.value as PlatformRole)}>
                <option value="appUser">App user</option>
                <option value="admin">Admin</option>
                <option value="superAdmin">SuperAdmin</option>
              </select>
            </label>
            {String(data.actor.id) === accountId && <p className="text-sm text-muted-foreground">You cannot change your own access.</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              {data.permissions.map((permission) => <label key={permission.code} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3 text-sm">
                <Checkbox disabled={String(data.actor.id) === accountId || (permission.code === "permissions.manage" && data.actor.platformRole !== "superAdmin")} checked={selected.includes(permission.code)} onCheckedChange={(checked) => setSelected((current) => checked === true ? [...current, permission.code] : current.filter((code) => code !== permission.code))} />
                <span><span className="block font-medium">{permission.name}</span><span className="text-muted-foreground">{permission.code}</span></span>
              </label>)}
            </div>
            <Button disabled={saving || String(data.actor.id) === accountId} onClick={save}>{saving ? "Saving…" : "Save permissions"}</Button>
          </>}
        </>}
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}
